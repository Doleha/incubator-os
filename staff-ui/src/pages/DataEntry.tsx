import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

type DataTab = 'compliance' | 'board_members' | 'budget' | 'mentors' | 'grants';

export default function DataEntry() {
  const [tab, setTab] = useState<DataTab>('compliance');

  const tabs: { key: DataTab; label: string }[] = [
    { key: 'compliance', label: 'Compliance Items' },
    { key: 'board_members', label: 'Board Members' },
    { key: 'budget', label: 'Budget Line Items' },
    { key: 'mentors', label: 'Mentors' },
    { key: 'grants', label: 'Grants' },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Data Entry</h2>
      <p className="text-sm text-gray-500">
        Seed domain data that your agents need to operate. Agents cannot create these records from scratch — staff does.
      </p>

      <div className="flex gap-1 border-b border-gray-200">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === t.key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'compliance' && <ComplianceForm />}
      {tab === 'board_members' && <BoardMembersForm />}
      {tab === 'budget' && <BudgetForm />}
      {tab === 'mentors' && <MentorsForm />}
      {tab === 'grants' && <GrantsForm />}
    </div>
  );
}

function ComplianceForm() {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [form, setForm] = useState({
    title: '', type: 'irs_990', due_date: '', recurrence: 'annual', description: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadItems(); }, []);

  async function loadItems() {
    const { data } = await supabase.from('compliance_items').select('id, title, type, due_date, recurrence').order('due_date');
    setItems(data ?? []);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await supabase.from('compliance_items').insert({ ...form, status: 'pending' });
    setForm({ title: '', type: 'irs_990', due_date: '', recurrence: 'annual', description: '' });
    await loadItems();
    setSaving(false);
  }

  return (
    <div className="space-y-6">
      <form onSubmit={save} className="bg-white rounded-lg border border-gray-200 p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Title" required>
            <input className={inputCls} required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
          </Field>
          <Field label="Type" required>
            <select className={inputCls} value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
              {['irs_990','state_filing','grant_report','board_meeting','policy_renewal','audit','insurance','other'].map(v => (
                <option key={v} value={v}>{v.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </Field>
          <Field label="Due Date" required>
            <input type="date" className={inputCls} required value={form.due_date} onChange={e => setForm(p => ({ ...p, due_date: e.target.value }))} />
          </Field>
          <Field label="Recurrence">
            <select className={inputCls} value={form.recurrence} onChange={e => setForm(p => ({ ...p, recurrence: e.target.value }))}>
              {['annual','quarterly','monthly','one_time'].map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </Field>
        </div>
        <Field label="Description">
          <textarea className={inputCls} rows={2} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
        </Field>
        <button type="submit" disabled={saving} className={btnCls}>
          {saving ? 'Saving…' : 'Add Compliance Item'}
        </button>
      </form>
      <RecordTable headers={['Title', 'Type', 'Due Date', 'Recurrence']} rows={items.map(i => [String(i.title), String(i.type), String(i.due_date), String(i.recurrence)])} />
    </div>
  );
}

function BoardMembersForm() {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', role: 'member', committee: '', term_start: '', term_end: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadItems(); }, []);
  async function loadItems() {
    const { data } = await supabase.from('board_members').select('id, first_name, last_name, email, role, term_end').order('last_name');
    setItems(data ?? []);
  }
  async function save(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    await supabase.from('board_members').insert({ ...form, status: 'active' });
    setForm({ first_name: '', last_name: '', email: '', role: 'member', committee: '', term_start: '', term_end: '' });
    await loadItems(); setSaving(false);
  }

  return (
    <div className="space-y-6">
      <form onSubmit={save} className="bg-white rounded-lg border border-gray-200 p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="First Name" required><input className={inputCls} required value={form.first_name} onChange={e => setForm(p => ({ ...p, first_name: e.target.value }))} /></Field>
          <Field label="Last Name" required><input className={inputCls} required value={form.last_name} onChange={e => setForm(p => ({ ...p, last_name: e.target.value }))} /></Field>
          <Field label="Email" required><input type="email" className={inputCls} required value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} /></Field>
          <Field label="Role" required>
            <select className={inputCls} value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
              {['chair','vice_chair','treasurer','secretary','member'].map(v => <option key={v} value={v}>{v.replace(/_/g, ' ')}</option>)}
            </select>
          </Field>
          <Field label="Term Start"><input type="date" className={inputCls} value={form.term_start} onChange={e => setForm(p => ({ ...p, term_start: e.target.value }))} /></Field>
          <Field label="Term End"><input type="date" className={inputCls} value={form.term_end} onChange={e => setForm(p => ({ ...p, term_end: e.target.value }))} /></Field>
        </div>
        <button type="submit" disabled={saving} className={btnCls}>{saving ? 'Saving…' : 'Add Board Member'}</button>
      </form>
      <RecordTable headers={['Name', 'Email', 'Role', 'Term End']} rows={items.map(i => [`${i.first_name} ${i.last_name}`, String(i.email), String(i.role), String(i.term_end ?? '—')])} />
    </div>
  );
}

function BudgetForm() {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [form, setForm] = useState({ fiscal_year: new Date().getFullYear(), quarter: '', category: '', line_item: '', budgeted_usd: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadItems(); }, []);
  async function loadItems() {
    const { data } = await supabase.from('budget_items').select('id, fiscal_year, category, line_item, budgeted_usd').order('fiscal_year', { ascending: false });
    setItems(data ?? []);
  }
  async function save(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    await supabase.from('budget_items').insert({ ...form, quarter: form.quarter ? parseInt(form.quarter) : null, budgeted_usd: parseInt(form.budgeted_usd) });
    setForm({ fiscal_year: new Date().getFullYear(), quarter: '', category: '', line_item: '', budgeted_usd: '' });
    await loadItems(); setSaving(false);
  }

  return (
    <div className="space-y-6">
      <form onSubmit={save} className="bg-white rounded-lg border border-gray-200 p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Fiscal Year" required><input type="number" className={inputCls} required value={form.fiscal_year} onChange={e => setForm(p => ({ ...p, fiscal_year: parseInt(e.target.value) }))} /></Field>
          <Field label="Quarter"><select className={inputCls} value={form.quarter} onChange={e => setForm(p => ({ ...p, quarter: e.target.value }))}><option value="">Any</option><option value="1">Q1</option><option value="2">Q2</option><option value="3">Q3</option><option value="4">Q4</option></select></Field>
          <Field label="Category" required><input className={inputCls} required value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} /></Field>
          <Field label="Line Item" required><input className={inputCls} required value={form.line_item} onChange={e => setForm(p => ({ ...p, line_item: e.target.value }))} /></Field>
          <Field label="Budgeted USD" required><input type="number" className={inputCls} required value={form.budgeted_usd} onChange={e => setForm(p => ({ ...p, budgeted_usd: e.target.value }))} /></Field>
        </div>
        <button type="submit" disabled={saving} className={btnCls}>{saving ? 'Saving…' : 'Add Budget Item'}</button>
      </form>
      <RecordTable headers={['Year', 'Category', 'Line Item', 'Budgeted']} rows={items.map(i => [String(i.fiscal_year), String(i.category), String(i.line_item), `$${Number(i.budgeted_usd).toLocaleString()}`])} />
    </div>
  );
}

function MentorsForm() {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', expertise: '', program_type: 'both', availability: 'medium', bio: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadItems(); }, []);
  async function loadItems() {
    const { data } = await supabase.from('mentors').select('id, first_name, last_name, email, program_type, availability').order('last_name');
    setItems(data ?? []);
  }
  async function save(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    const expertise = form.expertise.split(',').map(s => s.trim()).filter(Boolean);
    await supabase.from('mentors').insert({ ...form, expertise, active: true });
    setForm({ first_name: '', last_name: '', email: '', expertise: '', program_type: 'both', availability: 'medium', bio: '' });
    await loadItems(); setSaving(false);
  }

  return (
    <div className="space-y-6">
      <form onSubmit={save} className="bg-white rounded-lg border border-gray-200 p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="First Name" required><input className={inputCls} required value={form.first_name} onChange={e => setForm(p => ({ ...p, first_name: e.target.value }))} /></Field>
          <Field label="Last Name" required><input className={inputCls} required value={form.last_name} onChange={e => setForm(p => ({ ...p, last_name: e.target.value }))} /></Field>
          <Field label="Email" required><input type="email" className={inputCls} required value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} /></Field>
          <Field label="Expertise (comma-separated)" required><input className={inputCls} required value={form.expertise} onChange={e => setForm(p => ({ ...p, expertise: e.target.value }))} /></Field>
          <Field label="Program Type"><select className={inputCls} value={form.program_type} onChange={e => setForm(p => ({ ...p, program_type: e.target.value }))}><option value="incubator">Incubator</option><option value="accelerator">Accelerator</option><option value="both">Both</option></select></Field>
          <Field label="Availability"><select className={inputCls} value={form.availability} onChange={e => setForm(p => ({ ...p, availability: e.target.value }))}><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select></Field>
        </div>
        <Field label="Bio"><textarea className={inputCls} rows={2} value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} /></Field>
        <button type="submit" disabled={saving} className={btnCls}>{saving ? 'Saving…' : 'Add Mentor'}</button>
      </form>
      <RecordTable headers={['Name', 'Email', 'Program', 'Availability']} rows={items.map(i => [`${i.first_name} ${i.last_name}`, String(i.email), String(i.program_type), String(i.availability)])} />
    </div>
  );
}

function GrantsForm() {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [form, setForm] = useState({ funder: '', title: '', amount_usd: '', deadline: '', requirements: '', source_url: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadItems(); }, []);
  async function loadItems() {
    const { data } = await supabase.from('grants').select('id, funder, title, amount_usd, deadline, status').order('deadline', { ascending: true });
    setItems(data ?? []);
  }
  async function save(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    await supabase.from('grants').insert({ ...form, amount_usd: form.amount_usd ? parseInt(form.amount_usd) : null, status: 'researching' });
    setForm({ funder: '', title: '', amount_usd: '', deadline: '', requirements: '', source_url: '' });
    await loadItems(); setSaving(false);
  }

  return (
    <div className="space-y-6">
      <form onSubmit={save} className="bg-white rounded-lg border border-gray-200 p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Funder" required><input className={inputCls} required value={form.funder} onChange={e => setForm(p => ({ ...p, funder: e.target.value }))} /></Field>
          <Field label="Title" required><input className={inputCls} required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} /></Field>
          <Field label="Amount (USD)"><input type="number" className={inputCls} value={form.amount_usd} onChange={e => setForm(p => ({ ...p, amount_usd: e.target.value }))} /></Field>
          <Field label="Deadline"><input type="date" className={inputCls} value={form.deadline} onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))} /></Field>
          <Field label="Source URL"><input type="url" className={inputCls} value={form.source_url} onChange={e => setForm(p => ({ ...p, source_url: e.target.value }))} /></Field>
        </div>
        <Field label="Requirements"><textarea className={inputCls} rows={2} value={form.requirements} onChange={e => setForm(p => ({ ...p, requirements: e.target.value }))} /></Field>
        <button type="submit" disabled={saving} className={btnCls}>{saving ? 'Saving…' : 'Add Grant Opportunity'}</button>
      </form>
      <RecordTable headers={['Funder', 'Title', 'Amount', 'Deadline', 'Status']} rows={items.map(i => [String(i.funder), String(i.title), i.amount_usd ? `$${Number(i.amount_usd).toLocaleString()}` : '—', String(i.deadline ?? '—'), String(i.status)])} />
    </div>
  );
}

const inputCls = 'w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';
const btnCls = 'px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors disabled:opacity-50';

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

function RecordTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  if (rows.length === 0) return <p className="text-gray-400 text-sm text-center py-4">No records yet.</p>;
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>{headers.map(h => <th key={h} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-gray-50">
              {row.map((cell, j) => <td key={j} className="px-4 py-2 text-gray-700">{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
