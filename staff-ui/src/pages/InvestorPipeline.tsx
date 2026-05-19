import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

type Investor = {
  id: string;
  first_name: string;
  last_name: string;
  firm: string | null;
  focus_areas: string[];
  stage_preference: string[];
  check_size_min_usd: number | null;
  check_size_max_usd: number | null;
  status: string;
  last_contact_at: string | null;
  investor_introductions: {
    status: string;
    founders: { first_name: string; last_name: string } | null;
  }[];
};

const INTRO_STATUS_COLORS: Record<string, string> = {
  proposed: 'bg-gray-100 text-gray-600',
  made: 'bg-blue-100 text-blue-800',
  meeting_scheduled: 'bg-amber-100 text-amber-800',
  passed: 'bg-red-100 text-red-700',
  invested: 'bg-green-100 text-green-800',
};

export default function InvestorPipeline() {
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadInvestors(); }, []);

  async function loadInvestors() {
    setLoading(true);
    const { data } = await supabase
      .from('investors')
      .select('id, first_name, last_name, firm, focus_areas, stage_preference, check_size_min_usd, check_size_max_usd, status, last_contact_at, investor_introductions(status, founders(first_name, last_name))')
      .eq('status', 'active')
      .order('last_name');
    setInvestors((data as unknown as Investor[]) ?? []);
    setLoading(false);
  }

  function formatCheckSize(min: number | null, max: number | null) {
    if (!min && !max) return null;
    const fmt = (n: number) => n >= 1000000 ? `$${n / 1000000}M` : `$${n / 1000}K`;
    if (min && max) return `${fmt(min)} – ${fmt(max)}`;
    if (min) return `${fmt(min)}+`;
    return `up to ${fmt(max!)}`;
  }

  if (loading) return <div className="text-gray-500 py-8 text-center">Loading...</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Investor Pipeline</h2>

      {investors.length === 0 && (
        <p className="text-gray-400 text-center py-12">No investors in database yet.</p>
      )}

      <div className="space-y-2">
        {investors.map(inv => (
          <div key={inv.id} className="bg-white rounded-lg border border-gray-200">
            <button
              className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors"
              onClick={() => setExpanded(expanded === inv.id ? null : inv.id)}
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-gray-900">
                    {inv.first_name} {inv.last_name}
                    {inv.firm && <span className="text-gray-500 font-normal"> · {inv.firm}</span>}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {inv.focus_areas?.slice(0, 3).map(f => (
                      <span key={f} className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">{f}</span>
                    ))}
                    {formatCheckSize(inv.check_size_min_usd, inv.check_size_max_usd) && (
                      <span className="text-xs text-green-700 font-medium">
                        {formatCheckSize(inv.check_size_min_usd, inv.check_size_max_usd)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  <span className="text-xs text-gray-400">
                    {inv.investor_introductions?.length ?? 0} intros
                  </span>
                  <span className="text-gray-400">{expanded === inv.id ? '▲' : '▼'}</span>
                </div>
              </div>
            </button>

            {expanded === inv.id && (
              <div className="px-4 pb-4 border-t border-gray-100 pt-3">
                {inv.investor_introductions?.length === 0 ? (
                  <p className="text-xs text-gray-400">No introductions yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {inv.investor_introductions?.map((intro, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${INTRO_STATUS_COLORS[intro.status] ?? 'bg-gray-100 text-gray-600'}`}>
                          {intro.status.replace('_', ' ')}
                        </span>
                        <span className="text-sm text-gray-800">
                          {intro.founders ? `${intro.founders.first_name} ${intro.founders.last_name}` : 'Unknown founder'}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
