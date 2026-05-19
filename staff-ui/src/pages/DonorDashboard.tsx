import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

type Donor = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  giving_tier: string | null;
  status: string;
  total_given_usd: number;
  last_gift_at: string | null;
};

type Filter = 'all' | 'active' | 'lapsed' | 'major';

const TIER_COLORS: Record<string, string> = {
  friend: 'bg-gray-100 text-gray-700',
  supporter: 'bg-blue-100 text-blue-800',
  champion: 'bg-purple-100 text-purple-800',
  major: 'bg-amber-100 text-amber-800',
  board: 'bg-green-100 text-green-800',
};

export default function DonorDashboard() {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadDonors(); }, []);

  async function loadDonors() {
    setLoading(true);
    const { data } = await supabase
      .from('donors')
      .select('id, first_name, last_name, email, giving_tier, status, total_given_usd, last_gift_at')
      .order('total_given_usd', { ascending: false });
    setDonors((data as Donor[]) ?? []);
    setLoading(false);
  }

  const filtered = donors.filter(d => {
    if (filter === 'active') return d.status === 'active';
    if (filter === 'lapsed') return d.status === 'lapsed';
    if (filter === 'major') return d.giving_tier === 'major' || d.giving_tier === 'board';
    return true;
  });

  const totalGiven = donors.reduce((sum, d) => sum + (d.total_given_usd ?? 0), 0);
  const activeCount = donors.filter(d => d.status === 'active').length;
  const majorCount = donors.filter(d => d.giving_tier === 'major' || d.giving_tier === 'board').length;

  if (loading) return <div className="text-gray-500 py-8 text-center">Loading...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Donor Dashboard</h2>

      <div className="grid grid-cols-3 gap-4">
        <SummaryCard label="Total Raised" value={`$${totalGiven.toLocaleString()}`} />
        <SummaryCard label="Active Donors" value={String(activeCount)} />
        <SummaryCard label="Major Donors" value={String(majorCount)} />
      </div>

      <div className="flex gap-1">
        {(['all', 'active', 'lapsed', 'major'] as Filter[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 text-sm rounded-full font-medium transition-colors ${
              filter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f === 'major' ? 'Major Donors' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map(d => (
          <div key={d.id} className="bg-white rounded-lg border border-gray-200 px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">{d.first_name} {d.last_name}</p>
              <p className="text-xs text-gray-400">{d.email}</p>
            </div>
            <div className="flex items-center gap-3">
              {d.giving_tier && (
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${TIER_COLORS[d.giving_tier] ?? 'bg-gray-100 text-gray-600'}`}>
                  {d.giving_tier}
                </span>
              )}
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">${d.total_given_usd.toLocaleString()}</p>
                {d.last_gift_at && (
                  <p className="text-xs text-gray-400">last {new Date(d.last_gift_at).toLocaleDateString()}</p>
                )}
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-gray-400 text-center py-8">No donors match this filter.</p>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
