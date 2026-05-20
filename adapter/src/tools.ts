import type { Pool } from 'pg';
import type { paperclipClient as PaperclipClient } from './paperclip-client.js';
import { validateDecisionArgs, DecisionValidationError } from './schema.js';

// SQL SELECT-only enforcement — prevents agents from mutating data via query_database.
// Write operations go through dedicated tools (write_decision, log_event) only.
const SQL_READONLY_PATTERN = /^\s*SELECT\b/i;

function assertSelectOnly(sql: string): void {
  if (!SQL_READONLY_PATTERN.test(sql)) {
    throw new Error(
      `query_database only accepts SELECT statements. ` +
      `Received: "${sql.substring(0, 60)}...". ` +
      `Use write_decision or log_event for write operations.`
    );
  }
}

export const TOOL_DEFINITIONS = [
  {
    name: 'request_hire',
    description: 'Request Board approval to hire a new team member. Include the role, capabilities, heartbeat interval, budget, and a substantive rationale explaining why the hire is needed.',
    parameters: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        role: { type: 'string' },
        capabilities: { type: 'string' },
        instructionsPath: { type: 'string' },
        heartbeatIntervalSec: { type: 'number' },
        budgetMonthlyCents: { type: 'number' },
        rationale: { type: 'string' },
      },
      required: ['name', 'role', 'capabilities', 'instructionsPath',
                 'heartbeatIntervalSec', 'budgetMonthlyCents', 'rationale'],
    },
  },
  {
    name: 'create_task',
    description: 'Assign a task to another agent in the organization.',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        assigneeAgentId: { type: 'string' },
        priority: { type: 'string', enum: ['urgent', 'high', 'medium', 'low'] },
      },
      required: ['title', 'description'],
    },
  },
  {
    name: 'write_decision',
    description: 'Write a recommendation to the decisions table for human staff approval.',
    parameters: {
      type: 'object',
      properties: {
        entityType: { type: 'string' },
        entityId: { type: 'string' },
        department: { type: 'string' },
        recommendation: { type: 'string' },
        reasoning: { type: 'string' },
        data: { type: 'object' },
      },
      required: ['entityType', 'department', 'recommendation', 'reasoning'],
    },
  },
  {
    name: 'query_database',
    description: 'Query the organization database with a SELECT statement. Returns rows as JSON. READ-ONLY — only SELECT statements are permitted.',
    parameters: {
      type: 'object',
      properties: {
        sql: { type: 'string', description: 'Must be a SELECT statement.' },
        params: { type: 'array', description: 'Parameterized query values ($1, $2, ...)' },
      },
      required: ['sql'],
    },
  },
  {
    name: 'log_event',
    description: 'Write to the events_log audit table.',
    parameters: {
      type: 'object',
      properties: {
        type: { type: 'string' },
        entityType: { type: 'string' },
        entityId: { type: 'string' },
        payload: { type: 'object' },
      },
      required: ['type'],
    },
  },
  {
    name: 'create_goal',
    description: "Create a goal in Paperclip's goal hierarchy.",
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        level: { type: 'string', enum: ['company', 'team', 'agent'] },
        parentId: { type: 'string' },
      },
      required: ['title', 'level'],
    },
  },
];

// executeToolCall — called by adapter for every tool call the LLM makes.
export async function executeToolCall(
  toolName: string,
  args: Record<string, unknown>,
  db: Pool,
  paperclip: typeof PaperclipClient,
  companyId: string,
  agentId: string,
): Promise<unknown> {
  switch (toolName) {

    case 'query_database': {
      const sql = args.sql as string;
      const params = (args.params as unknown[]) ?? [];
      assertSelectOnly(sql);
      const result = await db.query(sql, params);
      return { rows: result.rows, rowCount: result.rowCount };
    }

    case 'write_decision': {
      try {
        validateDecisionArgs(args);
      } catch (err) {
        if (err instanceof DecisionValidationError) {
          return { error: err.message, flag: 'schema_validation_failed' };
        }
        throw err;
      }
      const result = await db.query(
        `INSERT INTO decisions
         (entity_type, entity_id, department, agent_role, recommendation, reasoning, data)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id`,
        [
          args.entityType,
          args.entityId ?? null,
          args.department,
          agentId,
          args.recommendation,
          args.reasoning,
          args.data ? JSON.stringify(args.data) : null,
        ]
      );
      return { success: true, decisionId: result.rows[0].id };
    }

    case 'log_event': {
      await db.query(
        `INSERT INTO events_log (type, entity_type, entity_id, payload, created_by)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          args.type,
          args.entityType ?? null,
          args.entityId ?? null,
          args.payload ? JSON.stringify(args.payload) : null,
          agentId,
        ]
      );
      return { success: true };
    }

    case 'request_hire': {
      await paperclip.requestHire(companyId, agentId, {
        name: args.name,
        role: args.role,
        capabilities: args.capabilities,
        adapterType: 'local_llm',
        adapterConfig: {
          instructionsFilePath: args.instructionsPath,
          preflightCheck: null,
          dynamicSchedule: {
            baseIntervalSec: args.heartbeatIntervalSec,
            maxIntervalSec: (args.heartbeatIntervalSec as number) * 8,
            backoffMultiplier: 2,
            backoffAfterEmptyRuns: 3,
          },
        },
        runtimeConfig: {
          schedule: { enabled: true, intervalSec: args.heartbeatIntervalSec, maxConcurrentRuns: 1 },
          contextMode: 'fat',
        },
        budgetMonthlyCents: args.budgetMonthlyCents,
        rationale: args.rationale,
      });
      return { success: true, message: `Hire request submitted for ${args.name}. Awaiting Board approval.` };
    }

    case 'create_task': {
      const result = await paperclip.createTask(companyId, {
        title: args.title,
        description: args.description,
        assigneeId: args.assigneeAgentId ?? null,
        priority: args.priority ?? 'medium',
        requestedByAgentId: agentId,
      });
      return { success: true, taskId: (result.data as Record<string, unknown>)?.id };
    }

    case 'create_goal': {
      const result = await paperclip.createGoal(companyId, {
        title: args.title,
        description: args.description ?? null,
        level: args.level,
        parentId: args.parentId ?? null,
        ownedByAgentId: agentId,
      });
      return { success: true, goalId: (result.data as Record<string, unknown>)?.id };
    }

    default:
      return { error: `Unknown tool: ${toolName}` };
  }
}
