import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

type BoardMember = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  committee: string | null;
  term_end: string | null;
  status: string;
};

type Meeting = {
  id: string;
  meeting_date: string;
  type: string;
  quorum_met: boolean | null;
  action_items: unknown[];
  notes: string | null;
};

function termUrgency(termEnd: string | null) {
  if (!termEnd) return '';
  const days = Math.ceil((new Date(termEnd).getTime() - Date.now()) / 86400000);
  if (days <= 90) return 'text-red-600 font-semibold';
  return 'text-gray-500';
}

export default function BoardManagement() {
  const [members, setMembers] = useState<BoardMember[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([loadMembers(), loadMeetings()]).finally(() => setLoading(false));
  }, []);

  async function loadMembers() {
    const { data } = await supabase
      .from('board_members')
      .select('id, first_name, last_name, email, role, committee, term_end, status')
      .eq('status', 'active')
      .order('role');
    setMembers((data as BoardMember[]) ?? []);
  }

  async function loadMeetings() {
    const { data } = await supabase
      .from('board_meetings')
      .select('id, meeting_date, type, quorum_met, action_items, notes')
      .order('meeting_date', { ascending: false })
      .limit(10);
    setMeetings((data as Meeting[]) ?? []);
  }

  if (loading) return <div className="text-gray-500 py-8 text-center">Loading...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Board Members</h2>
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Committee</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Term End</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {members.map(m => (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{m.first_name} {m.last_name}</p>
                    <p className="text-xs text-gray-400">{m.email}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-700 capitalize">{m.role.replace(/_/g, ' ')}</td>
                  <td className="px-4 py-3 text-gray-500">{m.committee ?? '—'}</td>
                  <td className={`px-4 py-3 ${termUrgency(m.term_end)}`}>
                    {m.term_end ? new Date(m.term_end).toLocaleDateString() : '—'}
                    {m.term_end && Math.ceil((new Date(m.term_end).getTime() - Date.now()) / 86400000) <= 90 && (
                      <span className="ml-1 text-red-500 text-xs">⚠ expiring</span>
                    )}
                  </td>
                </tr>
              ))}
              {members.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">No board members. Add them in Data Entry.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Meetings</h3>
        <div className="space-y-3">
          {meetings.map(m => (
            <div key={m.id} className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">
                    {new Date(m.meeting_date).toLocaleDateString()}
                  </span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full capitalize">
                    {m.type}
                  </span>
                  {m.quorum_met === false && (
                    <span className="text-xs text-red-600 font-medium">No Quorum</span>
                  )}
                  {m.quorum_met === true && (
                    <span className="text-xs text-green-600">Quorum ✓</span>
                  )}
                </div>
              </div>
              {Array.isArray(m.action_items) && m.action_items.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-600 mb-1">Action Items</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    {m.action_items.map((item, i) => (
                      <li key={i} className="text-xs text-gray-700">
                        {typeof item === 'string' ? item : JSON.stringify(item)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
          {meetings.length === 0 && (
            <p className="text-gray-400 text-center py-8">No meetings recorded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
