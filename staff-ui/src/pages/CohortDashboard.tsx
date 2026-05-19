import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

type Founder = {
  id: string;
  first_name: string;
  last_name: string;
  path: string | null;
  readiness_score: number | null;
  at_risk: boolean;
  status: string;
  ventures: { name: string; stage: string | null }[];
};

type Milestone = {
  id: string;
  title: string;
  status: string;
  due_date: string | null;
};

type Filter = 'all' | 'incubator' | 'accelerator' | 'at_risk';

function readinessColor(score: number | null) {
  if (score === null) return 'text-gray-400';
  if (score <= 40) return 'text-red-600 font-semibold';
  if (score <= 65) return 'text-amber-600 font-semibold';
  return 'text-green-600 font-semibold';
}

function pathBadge(path: string | null) {
  if (path === 'incubator') return 'bg-green-100 text-green-800';
  if (path === 'accelerator') return 'bg-purple-100 text-purple-800';
  return 'bg-gray-100 text-gray-600';
}

export default function CohortDashboard() {
  const [founders, setFounders] = useState<Founder[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [milestones, setMilestones] = useState<Record<string, Milestone[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFounders();
  }, []);

  async function loadFounders() {
    setLoading(true);
    const { data } = await supabase
      .from('founders')
      .select('id, first_name, last_name, path, readiness_score, at_risk, status, ventures(name, stage)')
      .in('status', ['pending', 'active'])
      .order('created_at', { ascending: false });
    setFounders((data as Founder[]) ?? []);
    setLoading(false);
  }

  async function loadMilestones(founderId: string) {
    if (milestones[founderId]) return;
    const { data: ventures } = await supabase
      .from('ventures')
      .select('id')
      .eq('founder_id', founderId);
    if (!ventures?.length) return;
    const ventureIds = ventures.map(v => v.id);
    const { data } = await supabase
      .from('milestones')
      .select('id, title, status, due_date')
      .in('venture_id', ventureIds)
      .order('due_date', { ascending: true });
    setMilestones(prev => ({ ...prev, [founderId]: (data as Milestone[]) ?? [] }));
  }

  function toggleExpand(founderId: string) {
    if (expanded === founderId) {
      setExpanded(null);
    } else {
      setExpanded(founderId);
      loadMilestones(founderId);
    }
  }

  const filtered = founders.filter(f => {
    if (filter === 'incubator') return f.path === 'incubator';
    if (filter === 'accelerator') return f.path === 'accelerator';
    if (filter === 'at_risk') return f.at_risk;
    return true;
  });

  const filters: { key: Filter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'incubator', label: 'Incubator' },
    { key: 'accelerator', label: 'Accelerator' },
    { key: 'at_risk', label: 'At Risk' },
  ];

  if (loading) return <div className="text-gray-500 py-8 text-center">Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Cohort Dashboard</h2>
        <div className="flex gap-1">
          {filters.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1 text-sm rounded-full font-medium transition-colors ${
                filter === f.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Path</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Readiness</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stage</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(founder => (
              <>
                <tr
                  key={founder.id}
                  onClick={() => toggleExpand(founder.id)}
                  className="hover:bg-gray-50 cursor-pointer"
                >
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {founder.first_name} {founder.last_name}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${pathBadge(founder.path)}`}>
                      {founder.path ?? '—'}
                    </span>
                  </td>
                  <td className={`px-4 py-3 text-sm ${readinessColor(founder.readiness_score)}`}>
                    {founder.readiness_score ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {founder.ventures?.[0]?.stage ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {founder.at_risk && (
                      <span className="text-red-600 font-semibold">⚠ At Risk</span>
                    )}
                  </td>
                </tr>
                {expanded === founder.id && (
                  <tr key={`${founder.id}-milestones`}>
                    <td colSpan={5} className="px-4 py-3 bg-blue-50">
                      <p className="text-xs font-semibold text-blue-800 mb-2">Milestones</p>
                      {!milestones[founder.id] ? (
                        <p className="text-xs text-gray-500">Loading…</p>
                      ) : milestones[founder.id].length === 0 ? (
                        <p className="text-xs text-gray-500">No milestones recorded.</p>
                      ) : (
                        <ul className="space-y-1">
                          {milestones[founder.id].map(m => (
                            <li key={m.id} className="text-xs flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full shrink-0 ${
                                m.status === 'completed' ? 'bg-green-500' :
                                m.status === 'overdue' ? 'bg-red-500' :
                                m.status === 'in_progress' ? 'bg-yellow-400' : 'bg-gray-300'
                              }`} />
                              <span className="text-gray-800">{m.title}</span>
                              {m.due_date && (
                                <span className="text-gray-400">due {m.due_date}</span>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                    </td>
                  </tr>
                )}
              </>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  No founders match this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
