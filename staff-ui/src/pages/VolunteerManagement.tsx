import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

type Volunteer = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  skills: string[];
  availability: string | null;
  hours_per_week: number | null;
  status: string;
  volunteer_assignments: { role: string; department: string | null; status: string }[];
};

export default function VolunteerManagement() {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadVolunteers(); }, []);

  async function loadVolunteers() {
    setLoading(true);
    const { data } = await supabase
      .from('volunteers')
      .select('id, first_name, last_name, email, skills, availability, hours_per_week, status, volunteer_assignments(role, department, status)')
      .eq('status', 'active')
      .order('last_name');
    setVolunteers((data as Volunteer[]) ?? []);
    setLoading(false);
  }

  const AVAIL_COLORS: Record<string, string> = {
    weekdays: 'bg-blue-100 text-blue-800',
    weekends: 'bg-green-100 text-green-800',
    evenings: 'bg-purple-100 text-purple-800',
    flexible: 'bg-amber-100 text-amber-800',
  };

  if (loading) return <div className="text-gray-500 py-8 text-center">Loading...</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Volunteer Management</h2>

      {volunteers.length === 0 && (
        <p className="text-gray-400 text-center py-12">No active volunteers.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {volunteers.map(v => (
          <div key={v.id} className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-medium text-gray-900">{v.first_name} {v.last_name}</p>
                <p className="text-xs text-gray-400">{v.email}</p>
              </div>
              <div className="flex items-center gap-2">
                {v.availability && (
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${AVAIL_COLORS[v.availability] ?? 'bg-gray-100 text-gray-600'}`}>
                    {v.availability}
                  </span>
                )}
                {v.hours_per_week && (
                  <span className="text-xs text-gray-500">{v.hours_per_week}h/wk</span>
                )}
              </div>
            </div>

            {v.skills?.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {v.skills.map(s => (
                  <span key={s} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{s}</span>
                ))}
              </div>
            )}

            {v.volunteer_assignments?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-1">Assignments</p>
                <ul className="space-y-0.5">
                  {v.volunteer_assignments.filter(a => a.status === 'active').map((a, i) => (
                    <li key={i} className="text-xs text-gray-700">
                      {a.role}{a.department ? ` — ${a.department}` : ''}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
