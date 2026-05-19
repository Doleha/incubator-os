import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

type ComplianceItem = {
  id: string;
  title: string;
  type: string;
  due_date: string;
  status: string;
  assigned_to: string | null;
  recurrence: string | null;
};

function urgencyClass(dueDate: string, status: string) {
  if (status === 'completed') return 'bg-green-50 border-green-200';
  const days = Math.ceil((new Date(dueDate).getTime() - Date.now()) / 86400000);
  if (days <= 14) return 'bg-red-50 border-red-300';
  if (days <= 30) return 'bg-amber-50 border-amber-300';
  return 'bg-white border-gray-200';
}

function daysLabel(dueDate: string) {
  const days = Math.ceil((new Date(dueDate).getTime() - Date.now()) / 86400000);
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return 'Due today';
  return `${days}d remaining`;
}

function daysColor(dueDate: string) {
  const days = Math.ceil((new Date(dueDate).getTime() - Date.now()) / 86400000);
  if (days < 0) return 'text-red-700 font-bold';
  if (days <= 14) return 'text-red-600 font-semibold';
  if (days <= 30) return 'text-amber-600';
  return 'text-gray-500';
}

export default function ComplianceDashboard() {
  const [items, setItems] = useState<ComplianceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadItems(); }, []);

  async function loadItems() {
    setLoading(true);
    const { data } = await supabase
      .from('compliance_items')
      .select('id, title, type, due_date, status, assigned_to, recurrence')
      .order('due_date', { ascending: true });
    setItems((data as ComplianceItem[]) ?? []);
    setLoading(false);
  }

  async function markComplete(id: string) {
    await supabase
      .from('compliance_items')
      .update({ status: 'completed', updated_at: new Date().toISOString() })
      .eq('id', id);
    setItems(prev => prev.map(i => i.id === id ? { ...i, status: 'completed' } : i));
  }

  if (loading) return <div className="text-gray-500 py-8 text-center">Loading...</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Compliance Dashboard</h2>

      {items.length === 0 && (
        <p className="text-gray-400 text-center py-12">No compliance items. Add them in Data Entry.</p>
      )}

      <div className="space-y-2">
        {items.map(item => (
          <div
            key={item.id}
            className={`rounded-lg border px-4 py-3 flex items-center justify-between gap-4 ${urgencyClass(item.due_date, item.status)}`}
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-medium text-gray-900">{item.title}</p>
                <span className="text-xs text-gray-500 bg-white/60 px-1.5 py-0.5 rounded">
                  {item.type.replace(/_/g, ' ')}
                </span>
                {item.recurrence && (
                  <span className="text-xs text-gray-400">{item.recurrence}</span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1">
                <span className={`text-xs ${daysColor(item.due_date)}`}>
                  {new Date(item.due_date).toLocaleDateString()} — {daysLabel(item.due_date)}
                </span>
                {item.assigned_to && (
                  <span className="text-xs text-gray-400">→ {item.assigned_to}</span>
                )}
              </div>
            </div>

            <div className="shrink-0">
              {item.status === 'completed' ? (
                <span className="text-xs text-green-700 font-medium">✓ Complete</span>
              ) : (
                <button
                  onClick={() => markComplete(item.id)}
                  className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded transition-colors"
                >
                  Mark Complete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
