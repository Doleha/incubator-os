import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

type CorrectiveAction = {
  id: string;
  agent_id: string;
  root_cause: string;
  action_type: string;
  action_description: string;
  suggested_instructions_update: string | null;
  severity: 'minor' | 'moderate' | 'critical';
  escalation_level: 'director' | 'executive_director' | 'board';
  status: string;
  cycle_count: number;
  board_notification_summary: string | null;
  created_at: string;
};

const SEVERITY_COLORS = {
  critical: 'bg-red-100 text-red-800',
  moderate: 'bg-amber-100 text-amber-800',
  minor: 'bg-gray-100 text-gray-700',
};

const ROOT_CAUSE_LABELS: Record<string, string> = {
  instructions_quality: 'Instructions Quality',
  capacity_overload: 'Capacity Overload',
  data_quality: 'Data Quality',
  scope_too_wide: 'Scope Too Wide',
  model_ceiling: 'Model Ceiling',
  unknown: 'Unknown',
};

export default function CorrectiveActions() {
  const [actions, setActions] = useState<CorrectiveAction[]>([]);
  const [editing, setEditing] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActions();
  }, []);

  async function loadActions() {
    setLoading(true);
    const { data } = await supabase
      .from('corrective_actions')
      .select('*')
      .not('status', 'in', '("verified","failed")')
      .order('severity', { ascending: false })
      .order('created_at', { ascending: false });
    setActions((data as CorrectiveAction[]) ?? []);
    setLoading(false);
  }

  async function applyInstructionsUpdate(action: CorrectiveAction) {
    const updatedText = editing[action.id] ?? action.suggested_instructions_update ?? '';
    await supabase
      .from('corrective_actions')
      .update({ status: 'implemented', implemented_at: new Date().toISOString(), implemented_by: 'staff' })
      .eq('id', action.id);
    // TODO: write updated instructions file to disk — requires backend API or file system access
    // For now, log the intent to events_log so the Performance Analyst tracks it
    await supabase
      .from('events_log')
      .insert({
        type: 'instructions_update_applied',
        entity_type: 'corrective_action',
        entity_id: action.id,
        payload: { agent_id: action.agent_id, updated_text: updatedText },
        created_by: 'staff',
      });
    setActions(prev => prev.filter(a => a.id !== action.id));
    setEditing(prev => { const n = { ...prev }; delete n[action.id]; return n; });
  }

  const boardActions = actions.filter(a => a.escalation_level === 'board');
  const otherActions = actions.filter(a => a.escalation_level !== 'board');

  if (loading) return <div className="text-gray-500 py-8 text-center">Loading...</div>;

  function ActionCard({ action }: { action: CorrectiveAction }) {
    return (
      <div className={`bg-white rounded-lg border p-5 shadow-sm ${
        action.escalation_level === 'board' ? 'border-red-400' : 'border-gray-200'
      }`}>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex flex-wrap gap-2">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${SEVERITY_COLORS[action.severity]}`}>
              {action.severity}
            </span>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-medium">
              {ROOT_CAUSE_LABELS[action.root_cause] ?? action.root_cause}
            </span>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              cycle {action.cycle_count}
            </span>
          </div>
          <span className="text-xs text-gray-400 shrink-0">
            {new Date(action.created_at).toLocaleDateString()}
          </span>
        </div>

        <p className="text-sm font-semibold text-gray-900 mb-1">{action.agent_id}</p>
        <p className="text-sm text-gray-700 mb-3">{action.action_description}</p>

        {action.board_notification_summary && (
          <div className="bg-red-50 border border-red-200 rounded p-3 mb-3">
            <p className="text-xs font-semibold text-red-800 mb-1">Board Notification</p>
            <p className="text-xs text-red-700">{action.board_notification_summary}</p>
          </div>
        )}

        {action.action_type === 'update_instructions' && action.suggested_instructions_update && (
          <div className="mt-3">
            <p className="text-xs font-semibold text-gray-700 mb-1">Suggested Instructions Update</p>
            <textarea
              className="w-full border border-gray-300 rounded p-2 text-xs font-mono h-32 resize-y"
              value={editing[action.id] ?? action.suggested_instructions_update}
              onChange={e => setEditing(prev => ({ ...prev, [action.id]: e.target.value }))}
            />
            <button
              onClick={() => applyInstructionsUpdate(action)}
              className="mt-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded transition-colors"
            >
              Apply Instructions Update
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Corrective Actions</h2>

      {boardActions.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-red-700 uppercase tracking-wide mb-3">
            Board Escalations — Immediate Action Required
          </h3>
          <div className="space-y-3">
            {boardActions.map(a => <ActionCard key={a.id} action={a} />)}
          </div>
        </div>
      )}

      {otherActions.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Open Actions
          </h3>
          <div className="space-y-3">
            {otherActions.map(a => <ActionCard key={a.id} action={a} />)}
          </div>
        </div>
      )}

      {actions.length === 0 && (
        <p className="text-gray-400 text-center py-12">No open corrective actions.</p>
      )}
    </div>
  );
}
