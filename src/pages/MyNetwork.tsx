import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Bell, Bookmark, BriefcaseBusiness, Check, MapPin, MessageSquare, Search, UserPlus, Users, X } from 'lucide-react';
import { Link } from 'react-router-dom';

type Person = { id: number; name: string; title: string; company: string; location: string; mutual: number; initials: string; color: string };

const PEOPLE: Person[] = [
  ['Sarah Chen', 'Senior Frontend Engineer', 'Northstar Labs', 'Singapore', 12, 'SC', 'bg-cyan-600'],
  ['Marcus Rodriguez', 'Product Designer', 'Arc Studio', 'San Francisco, CA', 8, 'MR', 'bg-violet-600'],
  ['Amina Hassan', 'Data Analyst', 'Lumen Systems', 'Kuala Lumpur', 19, 'AH', 'bg-emerald-600'],
  ['Noah Williams', 'Backend Engineer', 'NexusHealth', 'Toronto', 6, 'NW', 'bg-orange-600'],
  ['Priya Patel', 'Technical Recruiter', 'TechFlow', 'Remote', 14, 'PP', 'bg-pink-600'],
  ['Daniel Kim', 'DevOps Engineer', 'Vertex Cloud', 'Sydney', 9, 'DK', 'bg-blue-600'],
  ['Sofia Garcia', 'Growth Marketer', 'Orbit Commerce', 'London', 11, 'SG', 'bg-rose-600'],
  ['Theo Wilson', 'Engineering Manager', 'Harbor Digital', 'Berlin', 17, 'TW', 'bg-slate-700'],
].map(([name, title, company, location, mutual, initials, color], index) => ({ id: index + 1, name, title, company, location, mutual, initials, color } as Person));

const JOB_TITLES = ['Software Engineer', 'Frontend Developer', 'Full Stack Engineer', 'React Engineer', 'Backend Developer', 'Cloud Engineer', 'Product Designer', 'Data Analyst', 'Mobile Developer', 'DevOps Engineer', 'QA Automation Engineer', 'UI Engineer', 'Platform Engineer', 'Solutions Engineer', 'Technical Product Manager', 'Security Analyst', 'Machine Learning Engineer', 'Web Developer'];
const COMPANIES = ['BioRender', 'Crossway Digital', 'Dutch Labs', 'TechFlow', 'Northstar Labs', 'Lumen Systems', 'Orbit Commerce', 'Arc Studio', 'NexusHealth'];
const HIRING_POSTS = JOB_TITLES.map((title, index) => ({
  id: index + 1, title, company: COMPANIES[index % COMPANIES.length], location: index % 3 === 0 ? 'United States · Remote' : index % 3 === 1 ? 'Kuala Lumpur · Hybrid' : 'Singapore · Remote',
  salary: `$${85 + index * 4}k–$${115 + index * 5}k`, time: index < 3 ? `${index + 1} day${index ? 's' : ''} ago` : `${Math.ceil((index + 1) / 3)} days ago`,
  initials: COMPANIES[index % COMPANIES.length].split(' ').map((part) => part[0]).join('').slice(0, 2),
}));

export default function MyNetwork() {
  const [connections, setConnections] = useState(127);
  const [invites, setInvites] = useState(PEOPLE.slice(0, 3));
  const [connected, setConnected] = useState<number[]>([]);
  const [savedJobs, setSavedJobs] = useState<number[]>([]);
  const [query, setQuery] = useState('');
  const suggestions = useMemo(() => PEOPLE.filter((person) => !invites.some((invite) => invite.id === person.id) && `${person.name} ${person.title} ${person.company}`.toLowerCase().includes(query.toLowerCase())), [invites, query]);
  const accept = (person: Person) => { setInvites((current) => current.filter((item) => item.id !== person.id)); setConnections((value) => value + 1); };
  return <main className="product-page -mx-4 min-h-[calc(100vh-4rem)] px-4 py-6 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"><div className="product-shell max-w-[1450px]">
    <Link to="/dashboard" className="product-button-secondary"><ArrowLeft className="h-4 w-4" />Back to workspace</Link>
    <header className="mt-5 border-b border-slate-200 pb-6"><p className="product-eyebrow">Professional community</p><h1 className="product-title mt-3 text-4xl font-black">My Network</h1><p className="product-copy mt-2">Build trusted professional relationships, discover opportunities, and collaborate with people in your career direction.</p></header>
    <div className="mt-6 grid gap-6 lg:grid-cols-[19rem_minmax(0,1fr)]">
      <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
        <section className="product-surface overflow-hidden"><div className="h-20 bg-gradient-to-r from-[#12213a] to-[#173b67]" /><div className="-mt-10 px-5 pb-5"><img src="/assets/alex-rivera-ai-profile.png" alt="Alex Rivera" className="h-20 w-20 rounded-full border-4 border-white object-cover shadow-md" /><h2 className="mt-3 text-xl font-black text-slate-950">Alex Rivera</h2><p className="mt-1 text-sm font-bold text-slate-600">Full Stack Developer</p><p className="mt-2 flex items-center gap-1 text-xs text-slate-500"><MapPin className="h-3.5 w-3.5" />San Francisco, CA</p><Link to="/profile" className="mt-4 inline-flex text-sm font-black text-[#173b67]">View my profile <ArrowRight className="ml-1 h-4 w-4" /></Link></div></section>
        <section className="product-surface p-5"><h2 className="font-black text-slate-900">Network overview</h2><div className="mt-4 grid grid-cols-3 gap-2 text-center"><Stat value={connections} label="Connections" /><Stat value={invites.length} label="Invites" /><Stat value={43} label="Following" /></div><div className="mt-5 space-y-3 border-t border-slate-100 pt-4 text-sm font-bold text-slate-600"><div className="flex justify-between"><span>Profile views</span><strong className="text-[#173b67]">89</strong></div><div className="flex justify-between"><span>Post impressions</span><strong className="text-[#173b67]">1,284</strong></div><div className="flex justify-between"><span>Search appearances</span><strong className="text-[#173b67]">37</strong></div></div></section>
        <section className="rounded-2xl bg-[#12213a] p-5 text-white"><Users className="h-5 w-5 text-[#b7ff3c]" /><h2 className="mt-3 font-black">Your profile stays visible</h2><p className="mt-2 text-xs leading-5 text-slate-300">Your identity, career direction, and Career Passport remain beside your networking activity.</p></section>
      </aside>

      <div className="min-w-0 space-y-6">
        {invites.length > 0 && <section className="product-surface overflow-hidden"><div className="flex items-center justify-between border-b border-slate-100 p-5"><div><h2 className="text-lg font-black text-slate-900">Invitations received</h2><p className="text-xs font-bold text-slate-500">{invites.length} professionals want to connect</p></div><UserPlus className="h-5 w-5 text-[#173b67]" /></div><div className="divide-y divide-slate-100">{invites.map((person) => <div key={person.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center"><Avatar person={person} /><div className="min-w-0 flex-1"><h3 className="font-black">{person.name}</h3><p className="text-sm text-slate-600">{person.title} · {person.company}</p><p className="mt-1 text-xs text-slate-400">{person.mutual} mutual connections</p></div><div className="flex gap-2"><button onClick={() => setInvites((current) => current.filter((item) => item.id !== person.id))} className="product-button-secondary text-xs"><X className="h-4 w-4" />Ignore</button><button onClick={() => accept(person)} className="product-button-primary text-xs"><Check className="h-4 w-4" />Accept</button></div></div>)}</div></section>}

        <section className="product-surface overflow-hidden"><div className="border-b border-slate-100 p-5"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-lg font-black">People in your career network</h2><p className="text-xs font-bold text-slate-500">Suggested from shared skills, roles, and connections</p></div><label className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search people or roles" className="min-h-10 rounded-xl border border-slate-200 pl-9 pr-3 text-sm font-semibold" /></label></div></div><div className="grid gap-px bg-slate-100 sm:grid-cols-2 xl:grid-cols-3">{suggestions.map((person) => <article key={person.id} className="bg-white p-5"><Avatar person={person} /><h3 className="mt-3 font-black">{person.name}</h3><p className="mt-1 text-xs font-bold text-[#173b67]">{person.title}</p><p className="mt-1 text-xs text-slate-500">{person.company} · {person.location}</p><p className="mt-3 text-xs text-slate-400">{person.mutual} mutual connections</p><button onClick={() => setConnected((current) => current.includes(person.id) ? current : [...current, person.id])} className={`mt-4 w-full rounded-xl px-3 py-2 text-xs font-black ${connected.includes(person.id) ? 'bg-lime-50 text-green-700' : 'border border-[#173b67] text-[#173b67]'}`}>{connected.includes(person.id) ? <><Check className="mr-1 inline h-3.5 w-3.5" />Request sent</> : <><UserPlus className="mr-1 inline h-3.5 w-3.5" />Connect</>}</button></article>)}</div></section>

        <section className="product-surface overflow-hidden"><div className="flex items-center justify-between border-b border-slate-100 p-5"><div><p className="product-eyebrow">Hiring activity</p><h2 className="mt-2 text-xl font-black">More jobs from your network</h2><p className="mt-1 text-xs font-bold text-slate-500">{HIRING_POSTS.length} new opportunities shared by employers and connections</p></div><Bell className="h-5 w-5 text-[#173b67]" /></div><div className="divide-y divide-slate-100">{HIRING_POSTS.map((job) => <article key={job.id} className="flex items-start gap-4 p-5"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#173b67] text-xs font-black text-white">{job.initials}</span><div className="min-w-0 flex-1"><Link to="/jobs" className="font-black text-[#173b67] hover:underline">{job.title}</Link><p className="mt-1 text-sm font-semibold text-slate-600">{job.company} · {job.location}</p><p className="mt-1 text-xs text-slate-500">{job.salary} · {job.time}</p><div className="mt-3 flex flex-wrap gap-2"><span className="rounded-full bg-lime-50 px-2 py-1 text-[0.65rem] font-black text-green-700">Actively hiring</span><span className="rounded-full bg-slate-100 px-2 py-1 text-[0.65rem] font-bold text-slate-500">Response within 5 days</span></div></div><button onClick={() => setSavedJobs((current) => current.includes(job.id) ? current.filter((id) => id !== job.id) : [...current, job.id])} className={`rounded-xl border p-2 ${savedJobs.includes(job.id) ? 'border-[#173b67] bg-[#edf2f7] text-[#173b67]' : 'border-slate-200 text-slate-400'}`} aria-label="Save job"><Bookmark className={`h-5 w-5 ${savedJobs.includes(job.id) ? 'fill-current' : ''}`} /></button></article>)}</div></section>
      </div>
    </div>
  </div></main>;
}

function Avatar({ person }: { person: Person }) { return <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-xs font-black text-white ${person.color}`}>{person.initials}</span>; }
function Stat({ value, label }: { value: number; label: string }) { return <div><strong className="block text-xl font-black text-slate-950">{value}</strong><span className="text-[0.62rem] font-bold text-slate-500">{label}</span></div>; }
