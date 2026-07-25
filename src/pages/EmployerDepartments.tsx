import { ArrowLeft, ArrowRight, BadgeCheck, Briefcase, CheckCircle2, Clock3, MapPin, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MOCK_JOBS } from '../data';

const departments = [
  { name: 'Engineering', roles: ['Senior React Engineer', 'Principal Software Engineer', 'DevOps Engineer'], color: '#173b67' },
  { name: 'Product & Design', roles: ['Product Designer', 'UX Researcher'], color: '#8b4d68' },
  { name: 'Data & Analytics', roles: ['Data Analyst', 'Data Scientist'], color: '#315f56' },
  { name: 'Growth & Marketing', roles: ['Marketing Manager', 'Growth Marketer'], color: '#805a28' },
];

const hired = [
  { name: 'Sarah Chen', role: 'Senior React Engineer', department: 'Engineering', hired: 'Jul 18, 2026' },
  { name: 'Marcus Rodriguez', role: 'Product Designer', department: 'Product & Design', hired: 'Jul 12, 2026' },
  { name: 'Priya Patel', role: 'Data Analyst', department: 'Data & Analytics', hired: 'Jun 29, 2026' },
];

export default function EmployerDepartments() {
  return <div className="product-page -mx-4 min-h-[calc(100vh-4rem)] px-4 py-7 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"><div className="product-shell max-w-7xl">
    <Link to="/employer" className="product-button-secondary"><ArrowLeft className="h-4 w-4" />Back to dashboard</Link>
    <header className="mt-6 border-b border-slate-200 pb-7"><p className="product-eyebrow">Hiring structure</p><h1 className="product-title mt-4 text-4xl font-black">Departments & required positions</h1><p className="product-copy mt-3">See every open position grouped by department, followed by a separate record of completed hires.</p></header>
    <section className="mt-6 grid gap-4 md:grid-cols-2">{departments.map((department) => { const roles = MOCK_JOBS.filter((job) => department.roles.includes(job.title)); return <article key={department.name} className="product-surface overflow-hidden"><div className="flex items-center justify-between border-b border-slate-100 p-5"><div className="flex items-center gap-3"><span className="h-10 w-2 rounded-full" style={{ background: department.color }} /><div><h2 className="text-lg font-black text-slate-900">{department.name}</h2><p className="text-xs font-bold text-slate-400">{roles.length} required position{roles.length === 1 ? '' : 's'}</p></div></div><Users className="h-5 w-5 text-slate-400" /></div><div className="divide-y divide-slate-100">{roles.length ? roles.map((job) => <Link key={job.id} to={`/jobs/${job.id}`} className="flex items-center gap-4 p-5 hover:bg-slate-50"><span className={`flex h-10 w-10 items-center justify-center rounded-xl text-xs font-black text-white ${job.logoColor}`}>{job.logoInitials}</span><div className="min-w-0 flex-1"><h3 className="truncate text-sm font-black text-slate-900">{job.title}</h3><p className="mt-1 flex items-center gap-1 text-xs text-slate-500"><MapPin className="h-3 w-3" />{job.location} · {job.type}</p></div><span className="rounded-full bg-[#f2ffd9] px-2.5 py-1 text-[0.68rem] font-black text-[#24451c]">Hiring</span></Link>) : <p className="p-5 text-sm text-slate-500">No open positions in this department.</p>}</div></article>; })}</section>
    <section className="product-surface mt-6 overflow-hidden"><div className="border-b border-slate-100 bg-[#12213a] p-5 text-white"><div className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-[#b7ff3c]" /><div><p className="text-xs font-black uppercase tracking-[0.12em] text-[#b7ff3c]">Completed recruitment</p><h2 className="mt-1 text-xl font-black">Hired positions</h2></div></div></div><div className="divide-y divide-slate-100">{hired.map((person) => <article key={person.name} className="grid gap-3 p-5 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-center"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#173b67] text-xs font-black text-white">{person.name.split(' ').map((part) => part[0]).join('')}</span><strong className="text-sm text-slate-900">{person.name}</strong></div><span className="text-sm font-bold text-slate-700">{person.role}</span><span className="text-sm text-slate-500">{person.department}</span><span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400"><Clock3 className="h-3.5 w-3.5" />{person.hired}</span></article>)}</div></section>
  </div></div>;
}
