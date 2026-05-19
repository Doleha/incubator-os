import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

type Alumni = {
  id: string;
  graduation_date: string;
  program_type: string | null;
  current_status: string | null;
  venture_outcome: string | null;
  revenue_range: string | null;
  employees_count: number | null;
  is_success_story: boolean;
  founders: { first_name: string; last_name: string } | null;
};

type Filter = 'all' | 'success_stories' | 'active' | 'scaling';

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  scaling: 'bg-blue-100 text-blue-800',
  pivoted: 'bg-amber-100 text-amber-800',
  closed: 'bg-red-100 text-red-700',
  lost_touch: 'bg-gray-100 text-gray-600',
};

export default function AlumniNetwork() {
  const [alumni, setAlumni] = useState<Alumni[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadAlumni(); }, []);

  async function loadAlumni() {
    setLoading(true);
    const { data } = await supabase
      .from('alumni')
      .select('id, graduation_date, program_type, current_status, venture_outcome, revenue_range, employees_count, is_success_story, founders(first_name, last_name)')
      .order('graduation_date', { ascending: false });
    setAlumni((data as unknown as Alumni[]) ?? []);
    setLoading(false);
  }

  const filtered = alumni.filter(a => {
    if (filter === 'success_stories') return a.is_success_story;
    if (filter === 'active') return a.current_status === 'active';
    if (filter === 'scaling') return a.current_status === 'scaling';
    return true;
  });

  if (loading) return <div className="text-gray-500 py-8 text-center">Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Alumni Network</h2>
        <div className="flex gap-1">
          {([
            { key: 'all', label: 'All' },
            { key: 'success_stories', label: '⭐ Success Stories' },
            { key: 'active', label: 'Active' },
            { key: 'scaling', label: 'Scaling' },
          ] as { key: Filter; label: string }[]).map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1 text-sm rounded-full font-medium transition-colors ${
                filter === f.key ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 && (
        <p className="text-gray-400 text-center py-12">No alumni match this filter.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(a => (
          <div key={a.id} className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-medium text-gray-900">
                  {a.founders ? `${a.founders.first_name} ${a.founders.last_name}` : 'Unknown'}
                  {a.is_success_story && <span className="ml-1 text-amber-500">⭐</span>}
                </p>
                <p className="text-xs text-gray-400">
                  Graduated {new Date(a.graduation_date).toLocaleDateString()}
                  {a.program_type && ` · ${a.program_type}`}
                </p>
              </div>
              {a.current_status && (
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[a.current_status] ?? 'bg-gray-100 text-gray-600'}`}>
                  {a.current_status.replace('_', ' ')}
                </span>
              )}
            </div>

            {a.venture_outcome && (
              <p className="text-sm text-gray-700 mb-2">{a.venture_outcome}</p>
            )}

            <div className="flex gap-4 text-xs text-gray-500">
              {a.revenue_range && <span>Revenue: {a.revenue_range}</span>}
              {a.employees_count != null && <span>{a.employees_count} employees</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
