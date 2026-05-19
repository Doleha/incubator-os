import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

type Report = {
  id: string;
  type: string;
  payload: { title?: string; content?: string; body?: string } | null;
  created_by: string | null;
  created_at: string;
};

// Extracts a displayable text string from a report payload
function reportText(payload: Report['payload']): string {
  if (!payload) return 'No content.';
  return payload.content ?? payload.body ?? JSON.stringify(payload, null, 2);
}

export default function Reports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [selected, setSelected] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  async function loadReports() {
    setLoading(true);
    const { data } = await supabase
      .from('events_log')
      .select('id, type, payload, created_by, created_at')
      .in('type', ['report', 'quality_report', 'board_packet'])
      .order('created_at', { ascending: false });
    setReports((data as Report[]) ?? []);
    setLoading(false);
  }

  function typeLabel(type: string) {
    if (type === 'quality_report') return 'Quality Report';
    if (type === 'board_packet') return 'Board Packet';
    return 'Report';
  }

  function typeColor(type: string) {
    if (type === 'board_packet') return 'bg-purple-100 text-purple-800';
    if (type === 'quality_report') return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-700';
  }

  if (loading) return <div className="text-gray-500 py-8 text-center">Loading...</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Reports</h2>

      {reports.length === 0 && (
        <p className="text-gray-400 text-center py-12">No reports generated yet.</p>
      )}

      <div className="space-y-2">
        {reports.map(r => (
          <button
            key={r.id}
            onClick={() => setSelected(r)}
            className="w-full text-left bg-white rounded-lg border border-gray-200 px-4 py-3 hover:border-blue-300 hover:shadow-sm transition-all"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeColor(r.type)}`}>
                  {typeLabel(r.type)}
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {r.payload?.title ?? `${typeLabel(r.type)} — ${new Date(r.created_at).toLocaleDateString()}`}
                </span>
              </div>
              <span className="text-xs text-gray-400 shrink-0">
                {new Date(r.created_at).toLocaleString()}
              </span>
            </div>
            {r.created_by && (
              <p className="text-xs text-gray-400 mt-1">by {r.created_by}</p>
            )}
          </button>
        ))}
      </div>

      {selected && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[80vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeColor(selected.type)}`}>
                  {typeLabel(selected.type)}
                </span>
                <span className="font-semibold text-gray-900">
                  {selected.payload?.title ?? new Date(selected.created_at).toLocaleString()}
                </span>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="overflow-y-auto p-4">
              <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans">
                {reportText(selected.payload)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
