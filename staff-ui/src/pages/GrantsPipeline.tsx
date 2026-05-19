import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

type Grant = {
  id: string;
  funder: string;
  title: string;
  amount_usd: number | null;
  deadline: string | null;
  status: string;
  notes: string | null;
};

const STATUS_ORDER = ['researching', 'drafting', 'submitted', 'awarded', 'rejected', 'archived'];
const STATUS_COLORS: Record<string, string> = {
  researching: 'bg-gray-100 text-gray-700',
  drafting: 'bg-blue-100 text-blue-800',
  submitted: 'bg-amber-100 text-amber-800',
  awarded: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-700',
  archived: 'bg-gray-50 text-gray-400',
};

function deadlineUrgency(deadline: string | null) {
  if (!deadline) return '';
  const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000);
  if (days < 0) return 'text-red-600 font-bold';
  if (days <= 14) return 'text-red-600 font-semibold';
  if (days <= 30) return 'text-amber-600';
  return 'text-gray-600';
}

export default function GrantsPipeline() {
  const [grants, setGrants] = useState<Grant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGrants();
  }, []);

  async function loadGrants() {
    setLoading(true);
    const { data } = await supabase
      .from('grants')
      .select('id, funder, title, amount_usd, deadline, status, notes')
      .not('status', 'eq', 'archived')
      .order('deadline', { ascending: true, nullsFirst: false });
    setGrants((data as Grant[]) ?? []);
    setLoading(false);
  }

  const byStatus = STATUS_ORDER.reduce((acc, s) => {
    acc[s] = grants.filter(g => g.status === s);
    return acc;
  }, {} as Record<string, Grant[]>);

  if (loading) return <div className="text-gray-500 py-8 text-center">Loading...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Grants Pipeline</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {STATUS_ORDER.filter(s => s !== 'archived').map(status => (
          <div key={status} className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[status]}`}>
                {status}
              </span>
              <span className="text-xs text-gray-400">{byStatus[status].length}</span>
            </div>

            <div className="space-y-2">
              {byStatus[status].map(g => (
                <div key={g.id} className="border border-gray-100 rounded p-3 hover:border-gray-300 transition-colors">
                  <p className="text-sm font-medium text-gray-900 leading-tight">{g.title}</p>
                  <p className="text-xs text-gray-500">{g.funder}</p>
                  {g.amount_usd && (
                    <p className="text-xs text-green-700 font-medium mt-1">
                      ${g.amount_usd.toLocaleString()}
                    </p>
                  )}
                  {g.deadline && (
                    <p className={`text-xs mt-1 ${deadlineUrgency(g.deadline)}`}>
                      Due {new Date(g.deadline).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))}
              {byStatus[status].length === 0 && (
                <p className="text-xs text-gray-400 text-center py-2">—</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
