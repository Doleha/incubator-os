# Database Reference

This document describes every table available to you. Query using the `query_database` tool with SELECT statements. All write operations go through `write_decision`, `log_event`, or specialized tools.

---

## Phase 1 Tables

### cohorts
Incubator and accelerator cohort groups.

| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| name | TEXT | Cohort name (e.g., "Incubator 2024 Cohort 1") |
| type | TEXT | 'incubator' or 'accelerator' |
| start_date | DATE | Program start |
| end_date | DATE | Program end |
| status | TEXT | 'forming', 'active', 'completed' |
| created_at | TIMESTAMPTZ | Record creation |

### founders
Individual founders enrolled or applying to programs.

| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| first_name | TEXT | |
| last_name | TEXT | |
| email | TEXT | Unique |
| phone | TEXT | WhatsApp-compatible |
| path | TEXT | 'incubator' or 'accelerator' — assigned after intake |
| status | TEXT | 'pending', 'active', 'graduated', 'withdrawn', 'rejected' |
| cohort_id | UUID | References cohorts.id |
| readiness_score | INTEGER | 0-100, scored by Intake Coordinator |
| at_risk | BOOLEAN | Flagged by Program Manager |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

### ventures
The startup or social enterprise each founder is building.

| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| founder_id | UUID | References founders.id |
| name | TEXT | Venture name |
| sector | TEXT | Industry or sector |
| stage | TEXT | 'idea', 'validation', 'mvp', 'growth' |
| description | TEXT | Venture description |
| readiness_score | INTEGER | 0-100 |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

### milestones
Program milestones assigned to ventures.

| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| venture_id | UUID | References ventures.id |
| title | TEXT | Milestone name |
| description | TEXT | What must be achieved |
| due_date | DATE | Deadline |
| status | TEXT | 'pending', 'in_progress', 'completed', 'overdue' |
| approved_by | TEXT | Agent or staff who approved |
| approved_at | TIMESTAMPTZ | |
| created_at | TIMESTAMPTZ | |

### mentors
Mentors available for matching with founders.

| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| first_name | TEXT | |
| last_name | TEXT | |
| email | TEXT | Unique |
| expertise | TEXT[] | Array of expertise areas |
| program_type | TEXT | 'incubator', 'accelerator', 'both' |
| bio | TEXT | Background description |
| availability | TEXT | 'high', 'medium', 'low' |
| active | BOOLEAN | Currently available |
| created_at | TIMESTAMPTZ | |

### matches
Mentor-founder pairings.

| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| founder_id | UUID | References founders.id |
| mentor_id | UUID | References mentors.id |
| program_type | TEXT | 'incubator' or 'accelerator' |
| status | TEXT | 'proposed', 'active', 'completed', 'terminated' |
| session_count | INTEGER | Total sessions completed |
| match_reason | TEXT | Why this pairing was made |
| created_at | TIMESTAMPTZ | |

### sessions
Individual mentoring sessions within a match.

| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| match_id | UUID | References matches.id |
| scheduled_at | TIMESTAMPTZ | Planned session time |
| completed_at | TIMESTAMPTZ | When actually completed |
| notes_ai | TEXT | Notes captured by agent |
| notes_human | TEXT | Notes added by staff |
| outcome | TEXT | 'productive', 'needs_followup', 'missed', 'cancelled' |
| created_at | TIMESTAMPTZ | |

### decisions
Human approval queue. All agent recommendations requiring staff action.

| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| entity_type | TEXT | What this decision is about (e.g., 'founder', 'hire') |
| entity_id | UUID | ID of the relevant entity |
| department | TEXT | Which department generated this |
| agent_role | TEXT | Which agent role created this |
| recommendation | TEXT | What the agent recommends |
| reasoning | TEXT | Why — must be entity-specific |
| data | JSONB | Supporting data |
| status | TEXT | 'pending', 'approved', 'rejected' |
| decided_by | TEXT | 'staff' or staff member name |
| decided_at | TIMESTAMPTZ | When decision was made |
| created_at | TIMESTAMPTZ | |

### events_log
Append-only audit log and report store.

| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| type | TEXT | Event type: 'report', 'quality_report', 'board_packet', 'schedule_backoff', 'schedule_reset', etc. |
| entity_type | TEXT | What this event is about |
| entity_id | UUID | Relevant entity |
| payload | JSONB | Event data |
| created_by | TEXT | Agent ID or system component |
| created_at | TIMESTAMPTZ | |

### agent_performance
Written by local_llm adapter after every agent run.

| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| agent_id | TEXT | Paperclip agent ID |
| run_id | TEXT | Unique run identifier |
| auto_score | INTEGER | 0-100, automated structural score |
| fields_complete | BOOLEAN | Required output fields present |
| reasoning_present | BOOLEAN | Reasoning language detected |
| entities_count | INTEGER | Number of entities processed |
| flags | TEXT[] | Issues: 'json_parse_error', 'reasoning_absent', 'output_too_short', 'generic_reasoning', 'preflight_skipped' |
| input_tokens | INTEGER | Tokens in |
| output_tokens | INTEGER | Tokens out |
| created_at | TIMESTAMPTZ | |

---

## Phase 2 Tables

### grants
Grant opportunities being tracked and pursued.

| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| funder | TEXT | Granting organization name |
| title | TEXT | Grant program name |
| amount_usd | INTEGER | Award amount |
| deadline | DATE | Application deadline |
| report_due_date | DATE | When grant report is due |
| status | TEXT | 'researching', 'drafting', 'submitted', 'awarded', 'rejected', 'archived' |
| requirements | TEXT | Key eligibility and requirements |
| notes | TEXT | Research notes |
| source_url | TEXT | Where grant was found |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

### budget_items
Budget line items by fiscal year and quarter.

| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| fiscal_year | INTEGER | e.g., 2024 |
| quarter | INTEGER | 1-4 |
| category | TEXT | Budget category |
| line_item | TEXT | Specific line item name |
| budgeted_usd | INTEGER | Planned amount |
| actual_usd | INTEGER | Actual spend |
| notes | TEXT | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

### communications
Drafts and sent communications.

| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| type | TEXT | 'newsletter', 'social_post', 'announcement', 'donor_update', 'press_release', 'founder_message' |
| title | TEXT | |
| content | TEXT | Full content |
| target_audience | TEXT | Who this is for |
| status | TEXT | 'draft', 'approved', 'rejected', 'sent' |
| approved_by | TEXT | |
| approved_at | TIMESTAMPTZ | |
| sent_at | TIMESTAMPTZ | |
| created_at | TIMESTAMPTZ | |

### donors
Individual donors to the organization.

| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| first_name | TEXT | |
| last_name | TEXT | |
| email | TEXT | Unique |
| phone | TEXT | |
| giving_tier | TEXT | 'friend', 'supporter', 'champion', 'major', 'board' |
| status | TEXT | 'active', 'lapsed', 'inactive' |
| first_gift_at | DATE | |
| last_gift_at | DATE | |
| total_given_usd | INTEGER | Cumulative giving |
| notes | TEXT | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

### donor_gifts
Individual gift transactions.

| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| donor_id | UUID | References donors.id |
| amount_usd | INTEGER | Gift amount |
| gift_date | DATE | When received |
| gift_type | TEXT | 'one_time', 'recurring', 'major', 'in_kind' |
| campaign | TEXT | Which campaign or appeal |
| acknowledged | BOOLEAN | Thank-you sent |
| created_at | TIMESTAMPTZ | |

### corporate_sponsors
Corporate sponsor relationships.

| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| company_name | TEXT | |
| contact_name | TEXT | Primary contact |
| contact_email | TEXT | |
| sponsorship_level | TEXT | 'bronze', 'silver', 'gold', 'platinum', 'title' |
| amount_usd | INTEGER | Sponsorship value |
| benefits_agreed | TEXT | What sponsor receives |
| benefits_delivered | TEXT | What has been delivered |
| status | TEXT | 'prospecting', 'active', 'renewal', 'lapsed', 'inactive' |
| contract_start | DATE | |
| contract_end | DATE | |
| notes | TEXT | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

### compliance_items
Regulatory and governance compliance tracking.

| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| title | TEXT | What needs to be done |
| type | TEXT | 'irs_990', 'state_filing', 'grant_report', 'board_meeting', 'policy_renewal', 'audit', 'insurance', 'other' |
| due_date | DATE | Deadline |
| description | TEXT | Details |
| status | TEXT | 'pending', 'in_progress', 'completed', 'overdue' |
| assigned_to | TEXT | Responsible party |
| notes | TEXT | |
| recurrence | TEXT | 'annual', 'quarterly', 'monthly', 'one_time' |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

### alumni
Graduated founders and their post-program status.

| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| founder_id | UUID | References founders.id |
| graduation_date | DATE | |
| cohort_id | UUID | References cohorts.id |
| program_type | TEXT | 'incubator' or 'accelerator' |
| current_status | TEXT | 'active', 'scaling', 'pivoted', 'closed', 'lost_touch' |
| venture_outcome | TEXT | Free-text description |
| revenue_range | TEXT | e.g., '$100k-$500k' |
| employees_count | INTEGER | Current headcount |
| is_success_story | BOOLEAN | Feature-worthy outcome |
| last_contact_at | TIMESTAMPTZ | Last touchpoint |
| notes | TEXT | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

### board_members
Organization board of directors.

| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| first_name | TEXT | |
| last_name | TEXT | |
| email | TEXT | Unique |
| role | TEXT | 'chair', 'vice_chair', 'treasurer', 'secretary', 'member' |
| committee | TEXT | Committee assignment |
| term_start | DATE | |
| term_end | DATE | |
| status | TEXT | 'active', 'term_ending', 'inactive' |
| notes | TEXT | |
| created_at | TIMESTAMPTZ | |

### board_meetings
Board meeting records and action items.

| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| meeting_date | DATE | |
| type | TEXT | 'regular', 'special', 'annual', 'committee' |
| quorum_met | BOOLEAN | |
| action_items | JSONB | Array of action items |
| minutes_url | TEXT | Link to meeting minutes |
| notes | TEXT | |
| created_at | TIMESTAMPTZ | |

### volunteers
Volunteer roster.

| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| first_name | TEXT | |
| last_name | TEXT | |
| email | TEXT | Unique |
| phone | TEXT | |
| skills | TEXT[] | Array of skill areas |
| availability | TEXT | 'weekdays', 'weekends', 'evenings', 'flexible' |
| hours_per_week | INTEGER | |
| status | TEXT | 'active', 'inactive', 'pending' |
| joined_at | DATE | |
| notes | TEXT | |
| created_at | TIMESTAMPTZ | |

### volunteer_assignments
Volunteer role assignments.

| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| volunteer_id | UUID | References volunteers.id |
| role | TEXT | Assignment role |
| department | TEXT | Which department |
| start_date | DATE | |
| end_date | DATE | |
| hours_committed | INTEGER | |
| status | TEXT | 'active', 'completed', 'cancelled' |
| notes | TEXT | |
| created_at | TIMESTAMPTZ | |

### quality_assessments
Semantic quality evaluations by QA Manager.

| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| performance_id | UUID | References agent_performance.id |
| agent_id | TEXT | Which agent was evaluated |
| run_id | TEXT | Which run |
| semantic_score | INTEGER | 0-100, QA Manager's judgment |
| reasoning_specific | BOOLEAN | Is reasoning entity-specific? |
| output_actionable | BOOLEAN | Can staff act on this? |
| findings | TEXT | Specific evaluation notes |
| reviewed_by | TEXT | 'quality-assurance-manager' |
| created_at | TIMESTAMPTZ | |

### corrective_actions
Corrective action recommendations and tracking.

| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| agent_id | TEXT | Which agent |
| quality_assessment_id | UUID | References quality_assessments.id |
| root_cause | TEXT | 'instructions_quality', 'capacity_overload', 'data_quality', 'scope_too_wide', 'model_ceiling', 'unknown' |
| action_type | TEXT | 'update_instructions', 'hire_worker', 'reduce_scope', 'fix_data', 'split_role', 'pause_agent', 'escalate_human' |
| action_description | TEXT | What to do |
| suggested_instructions_update | TEXT | Proposed instructions change |
| severity | TEXT | 'minor', 'moderate', 'critical' |
| requires_approval | BOOLEAN | Board approval needed |
| escalation_level | TEXT | 'director', 'executive_director', 'board' |
| implemented_by | TEXT | Who implemented |
| implemented_at | TIMESTAMPTZ | |
| status | TEXT | 'pending', 'approved', 'implemented', 'verified', 'failed', 'escalated' |
| outcome | TEXT | 'improved', 'no_change', 'degraded' |
| verification_run_ids | TEXT[] | Run IDs used for verification |
| cycle_count | INTEGER | How many correction cycles |
| board_notified_at | TIMESTAMPTZ | |
| board_notification_summary | TEXT | What was sent to Board |
| created_at | TIMESTAMPTZ | |

---

## Phase 3 Tables

### events
Organizational events.

| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| title | TEXT | Event name |
| type | TEXT | 'demo_day', 'workshop', 'networking', 'board_meeting', 'cohort_kickoff', 'graduation', 'fundraiser', 'community', 'other' |
| date | TIMESTAMPTZ | Event date/time |
| location | TEXT | Physical location |
| virtual_link | TEXT | Video conference link |
| description | TEXT | |
| rsvp_count | INTEGER | |
| capacity | INTEGER | Maximum attendance |
| logistics_checklist | JSONB | Checklist of logistics tasks |
| status | TEXT | 'planning', 'confirmed', 'completed', 'cancelled' |
| created_at | TIMESTAMPTZ | |

### partnerships
External organizational partnerships.

| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| org_name | TEXT | Partner organization |
| type | TEXT | 'university', 'government', 'nonprofit', 'foundation', 'ecosystem_org', 'media', 'other' |
| contact_name | TEXT | |
| contact_email | TEXT | |
| value_provided | TEXT | What the partnership provides |
| status | TEXT | 'prospecting', 'active', 'stale', 'inactive' |
| last_touchpoint_at | TIMESTAMPTZ | |
| notes | TEXT | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

### investors
Investor relationships for accelerator program.

| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| first_name | TEXT | |
| last_name | TEXT | |
| email | TEXT | Unique |
| firm | TEXT | Investment firm |
| title | TEXT | Position |
| focus_areas | TEXT[] | Investment focus areas |
| stage_preference | TEXT[] | Preferred startup stages |
| check_size_min_usd | INTEGER | Minimum check |
| check_size_max_usd | INTEGER | Maximum check |
| status | TEXT | 'active', 'inactive' |
| last_contact_at | TIMESTAMPTZ | |
| notes | TEXT | |
| created_at | TIMESTAMPTZ | |

### investor_introductions
Founder-investor introduction tracking.

| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| investor_id | UUID | References investors.id |
| founder_id | UUID | References founders.id |
| introduced_at | DATE | |
| status | TEXT | 'proposed', 'made', 'meeting_scheduled', 'passed', 'invested' |
| notes | TEXT | |
| created_at | TIMESTAMPTZ | |

### application_leads
Prospective founders in the top-of-funnel.

| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| first_name | TEXT | |
| last_name | TEXT | |
| email | TEXT | |
| phone | TEXT | |
| venture_name | TEXT | |
| sector | TEXT | |
| source | TEXT | Where lead came from |
| stage | TEXT | 'identified', 'contacted', 'interested', 'applied' |
| notes | TEXT | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

### program_feedback
Founder feedback and NPS surveys.

| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| founder_id | UUID | References founders.id |
| cohort_id | UUID | References cohorts.id |
| program_type | TEXT | 'incubator' or 'accelerator' |
| survey_type | TEXT | 'mid_program', 'end_program', 'quarterly', 'exit' |
| nps_score | INTEGER | 0-10 |
| strengths | TEXT | What worked well |
| improvements | TEXT | What to improve |
| mentor_rating | INTEGER | 1-5 |
| program_rating | INTEGER | 1-5 |
| would_recommend | BOOLEAN | |
| submitted_at | TIMESTAMPTZ | |

---

## Common Query Patterns

**Founders needing attention:**
```sql
SELECT f.*, v.name as venture_name, v.stage
FROM founders f
LEFT JOIN ventures v ON v.founder_id = f.id
WHERE f.at_risk = true AND f.status = 'active'
ORDER BY f.updated_at ASC
```

**Pending decisions by department:**
```sql
SELECT * FROM decisions
WHERE status = 'pending' AND department = 'incubator'
ORDER BY created_at ASC
```

**Recent agent performance:**
```sql
SELECT agent_id, AVG(auto_score) as avg_score, COUNT(*) as run_count
FROM agent_performance
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY agent_id
ORDER BY avg_score ASC
```

**Open compliance items by urgency:**
```sql
SELECT *, due_date - CURRENT_DATE as days_until_due
FROM compliance_items
WHERE status != 'completed'
ORDER BY due_date ASC
```

**Grant pipeline by status:**
```sql
SELECT status, COUNT(*) as count, SUM(amount_usd) as total_amount
FROM grants
GROUP BY status
ORDER BY status
```
