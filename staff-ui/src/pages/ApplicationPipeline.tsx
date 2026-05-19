import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

type Lead = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  venture_name: string | null;
  sector: string | null;
  source: string | null;
  stage: string | null;
  created_at: string;
};

const STAGE_ORDER = ['identified', 'contacted', 'interested', 'applied'];
const STAGE_COLORS: Record<string, string> = {
  identified: 'bg-gray-100 text-gray-700',
  contacted: 'bg-blue-100 text-blue-800',
  interested: 'bg-amber-100 text-amber-800',
  applied: 'bg-green-100 text-green-800',
};

export default function ApplicationPipeline() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadLeads(); }, []);

  async function loadLeads() {
    setLoading(true);
    const { data } = await supabase
      .from('application_leads')
      .select('id, first_name, last_name, email, venture_name, sector, source, stage, created_at')
      .order('created_at', { ascending: false });
    setLeads((data as Lead[]) ?? []);
    setLoading(false);
  }

  const byStage = STAGE_ORDER.reduce((acc, s) => {
    acc[s] = leads.filter(l => l.stage === s);
    return acc;
  }, {} as Record<string, Lead[]>);

  const health = leads.length === 0 ? null : {
    applied: byStage['applied'].length,
    interested: byStage['interested'].length,
    ratio: byStage['applied'].length / Math.max(leads.length, 1),
  };

  if (loading) return <div className="text-gray-500 py-8 text-center">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Application Pipeline</h2>
        {health && (
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            health.ratio >= 0.3 ? 'bg-green-100 text-green-800' :
            health.ratio >= 0.1 ? 'bg-amber-100 text-amber-800' :
            'bg-red-100 text-red-800'
          }`}>
            {Math.round(health.ratio * 100)}% conversion to applied
          </div>
        )}
      </div>

      <div className="grid grid-cols-4 gap-4">
        {STAGE_ORDER.map(stage => (
          <div key={stage} className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STAGE_COLORS[stage]}`}>
                {stage}
              </span>
              <span className="text-xs text-gray-400">{byStage[stage].length}</span>
            </div>

            <div className="space-y-2">
              {byStage[stage].map(lead => (
                <div key={lead.id} className="text-xs border border-gray-100 rounded p-2 hover:border-gray-300">
                  <p className="font-medium text-gray-900 truncate">
                    {lead.venture_name ?? (`${lead.first_name ?? ''} ${lead.last_name ?? ''}`.trim() || 'Unknown')}
                  </p>
                  {lead.sector && <p className="text-gray-500">{lead.sector}</p>}
                  {lead.source && <p className="text-gray-400">via {lead.source}</p>}
                </div>
              ))}
              {byStage[stage].length === 0 && (
                <p className="text-xs text-gray-400 text-center py-2">—</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {leads.length === 0 && (
        <p className="text-gray-400 text-center py-8">
          No leads yet. They appear here when the Intake Coordinator identifies prospects.
        </p>
      )}
    </div>
  );
}
