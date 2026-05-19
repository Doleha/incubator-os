import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

type Decision = {
  id: string;
  entity_type: string;
  entity_id: string | null;
  department: string;
  agent_role: string;
  recommendation: string;
  reasoning: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
};

const DEPT_COLORS: Record<string, string> = {
  incubator: 'bg-green-100 text-green-800',
  accelerator: 'bg-purple-100 text-purple-800',
  finance: 'bg-yellow-100 text-yellow-800',
  marketing: 'bg-pink-100 text-pink-800',
  compliance: 'bg-red-100 text-red-800',
  development: 'bg-blue-100 text-blue-800',
};

function deptColor(dept: string) {
  return DEPT_COLORS[dept.toLowerCase()] ?? 'bg-gray-100 text-gray-700';
}

export default function DecisionQueue() {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDecisions();

    const channel = supabase
      .channel('decisions-pending')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'decisions',
        filter: 'status=eq.pending',
      }, () => loadDecisions())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  async function loadDecisions() {
    setLoading(true);
    const { data } = await supabase
      .from('decisions')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    setDecisions(data ?? []);
    setLoading(false);
  }

  async function decide(id: string, status: 'approved' | 'rejected') {
    await supabase
      .from('decisions')
      .update({ status, decided_by: 'staff', decided_at: new Date().toISOString() })
      .eq('id', id);
    setDecisions(prev => prev.filter(d => d.id !== id));
  }

  if (loading) return <div className="text-gray-500 py-8 text-center">Loading...</div>;

  if (decisions.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-4xl mb-3">✓</div>
        <p className="text-gray-500 text-lg">No pending decisions. Your agents are on it.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">
        Decision Queue <span className="text-gray-400 text-base font-normal">({decisions.length})</span>
      </h2>

      {decisions.map(d => (
        <div key={d.id} className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${deptColor(d.department)}`}>
                {d.department}
              </span>
              <span className="text-xs text-gray-500">{d.entity_type}</span>
              {d.entity_id && (
                <span className="text-xs text-gray-400 font-mono">{d.entity_id.slice(0, 8)}…</span>
              )}
            </div>
            <span className="text-xs text-gray-400 shrink-0">
              {new Date(d.created_at).toLocaleString()}
            </span>
          </div>

          <p className="text-gray-900 font-medium mb-2">{d.recommendation}</p>

          {d.reasoning && (
            <p className="text-sm text-gray-600 bg-gray-50 rounded p-3 mb-4">{d.reasoning}</p>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => decide(d.id, 'approved')}
              className="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded transition-colors"
            >
              Approve
            </button>
            <button
              onClick={() => decide(d.id, 'rejected')}
              className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded transition-colors"
            >
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
