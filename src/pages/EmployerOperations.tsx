import { useMemo, useState, type ReactNode } from 'react';
import { ArrowLeft, BarChart3, BriefcaseBusiness, Check, CircleDollarSign, CreditCard, Plus, Radio, ReceiptText, Search, Send, Trophy, Users } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const weekly = [38, 54, 47, 72, 65, 83, 76, 91];
const purchases = [
  { id: 'INV-2408', item: 'Growth hiring pack', date: '24 Jul 2026', credits: 500, amount: '$149', status: 'Paid' },
  { id: 'INV-2311', item: 'Challenge promotion', date: '11 Jul 2026', credits: 120, amount: '$49', status: 'Paid' },
  { id: 'INV-2194', item: 'Talent discovery pack', date: '28 Jun 2026', credits: 250, amount: '$89', status: 'Paid' },
];

export default function EmployerOperations() {
  const path = useLocation().pathname;
  if (path.endsWith('/credits')) return <Credits />;
  if (path.endsWith('/rates')) return <Rates />;
  if (path.endsWith('/purchases')) return <Purchases />;
  if (path.endsWith('/analytics')) return <Analytics />;
  if (path.endsWith('/job-feed')) return <JobFeed />;
  return <Challenges />;
}

function Shell({ eyebrow, title, copy, children }: { eyebrow: string; title: string; copy: string; children: ReactNode }) {
  return <main className="product-page -mx-4 min-h-[calc(100vh-4rem)] px-4 py-7 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"><div className="product-shell max-w-7xl">
    <Link to="/employer" className="product-button-secondary"><ArrowLeft className="h-4 w-4" />Back to dashboard</Link>
    <header className="mt-6 border-b border-slate-200 pb-7"><p className="product-eyebrow">{eyebrow}</p><h1 className="product-title mt-3 text-4xl font-black">{title}</h1><p className="product-copy mt-2">{copy}</p></header>
    <div className="mt-6">{children}</div>
  </div></main>;
}

function Credits() {
  const [balance, setBalance] = useState(240);
  const [notice, setNotice] = useState('');
  const packs = [{ name: 'Starter', credits: 100, price: '$39' }, { name: 'Growth', credits: 500, price: '$149', popular: true }, { name: 'Scale', credits: 1200, price: '$299' }];
  const buy = (credits: number, name: string) => { setBalance((value) => value + credits); setNotice(`${name} added successfully. Your new balance is ${balance + credits} credits.`); };
  return <Shell eyebrow="Billing center" title="Credits & packages" copy="Fund job promotion, talent discovery, messages, and challenge campaigns from one transparent balance.">
    {notice && <div className="mb-4 rounded-xl border border-lime-300 bg-lime-50 p-4 text-sm font-bold text-[#24451c]"><Check className="mr-2 inline h-4 w-4" />{notice}</div>}
    <section className="rounded-2xl bg-[#12213a] p-6 text-white"><p className="text-sm font-bold text-slate-300">Available balance</p><div className="mt-2 flex items-end gap-2"><strong className="text-5xl font-black">{balance}</strong><span className="pb-1 text-slate-300">credits</span></div></section>
    <div className="mt-5 grid gap-4 md:grid-cols-3">{packs.map((pack) => <article key={pack.name} className={`product-surface p-6 ${pack.popular ? 'ring-2 ring-[#b7ff3c]' : ''}`}><div className="flex justify-between"><h2 className="text-xl font-black">{pack.name}</h2>{pack.popular && <span className="rounded-full bg-[#b7ff3c] px-2 py-1 text-[0.65rem] font-black text-[#12213a]">BEST VALUE</span>}</div><p className="mt-6 text-4xl font-black">{pack.credits}</p><p className="text-sm text-slate-500">recruiting credits</p><p className="mt-5 text-2xl font-black">{pack.price}</p><button onClick={() => buy(pack.credits, pack.name)} className="product-button-primary mt-5 w-full"><CreditCard className="h-4 w-4" />Purchase pack</button></article>)}</div>
  </Shell>;
}

function Rates() {
  const groups = [
    { name: 'Talent discovery', rows: [['Open full candidate profile', '2'], ['Send direct message', '3'], ['Export candidate report', '5']] },
    { name: 'Job promotion', rows: [['Feature a role for 7 days', '40'], ['Priority job-feed placement', '25'], ['Targeted candidate alert', '15']] },
    { name: 'Challenges & events', rows: [['Publish a challenge', '30'], ['Promote a hackathon', '75'], ['Issue verified certificate', '4']] },
  ];
  return <Shell eyebrow="Transparent usage" title="Activity rates" copy="Every credit action is grouped by recruiting activity so teams can forecast spend.">
    <div className="grid gap-4 lg:grid-cols-3">{groups.map((group, index) => <section key={group.name} className="product-surface overflow-hidden"><div className="border-b border-slate-100 p-5"><BarChart3 className="h-5 w-5 text-[#173b67]" /><h2 className="mt-3 text-lg font-black">{group.name}</h2><div className="mt-4 flex h-20 items-end gap-2">{weekly.slice(index, index + 5).map((value, i) => <span key={i} className="flex-1 rounded-t bg-[#173b67]" style={{ height: `${value}%` }} />)}</div></div><div className="divide-y divide-slate-100">{group.rows.map(([label, rate]) => <div key={label} className="flex justify-between gap-4 p-4 text-sm"><span className="font-semibold text-slate-600">{label}</span><strong>{rate} credits</strong></div>)}</div></section>)}</div>
  </Shell>;
}

function Purchases() {
  const [query, setQuery] = useState('');
  const rows = purchases.filter((item) => `${item.id} ${item.item}`.toLowerCase().includes(query.toLowerCase()));
  return <Shell eyebrow="Billing records" title="Purchase history" copy="Search invoices, review completed purchases, and access an auditable credit record.">
    <section className="product-surface overflow-hidden"><div className="border-b border-slate-100 p-5"><label className="relative block max-w-md"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search invoice or package" className="min-h-11 w-full rounded-xl border border-slate-200 pl-10 pr-3 text-sm font-semibold" /></label></div><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500"><tr>{['Invoice','Package','Date','Credits','Amount','Status'].map((h) => <th key={h} className="px-5 py-3">{h}</th>)}</tr></thead><tbody>{rows.map((item) => <tr key={item.id} className="border-t border-slate-100"><td className="px-5 py-4 font-black text-[#173b67]">{item.id}</td><td className="px-5 font-bold">{item.item}</td><td className="px-5 text-slate-500">{item.date}</td><td className="px-5">{item.credits}</td><td className="px-5 font-black">{item.amount}</td><td className="px-5"><span className="rounded-full bg-lime-50 px-2 py-1 font-bold text-green-700">{item.status}</span></td></tr>)}</tbody></table></div></section>
  </Shell>;
}

function Analytics() {
  const positions = [
    { role: 'Senior React Engineer', team: 'Engineering', applications: 86, mission: 54, qualified: 31, interviews: 14, hires: 4, response: 96, days: 18 },
    { role: 'Backend Engineer', team: 'Engineering', applications: 74, mission: 48, qualified: 27, interviews: 11, hires: 3, response: 92, days: 21 },
    { role: 'DevOps Engineer', team: 'Engineering', applications: 42, mission: 29, qualified: 16, interviews: 8, hires: 2, response: 89, days: 25 },
    { role: 'Product Designer', team: 'Product & Design', applications: 68, mission: 45, qualified: 24, interviews: 9, hires: 2, response: 94, days: 20 },
    { role: 'UX Researcher', team: 'Product & Design', applications: 39, mission: 26, qualified: 13, interviews: 6, hires: 1, response: 87, days: 28 },
    { role: 'Product Manager', team: 'Product & Design', applications: 57, mission: 34, qualified: 18, interviews: 8, hires: 2, response: 91, days: 23 },
    { role: 'Data Analyst', team: 'Data', applications: 61, mission: 41, qualified: 22, interviews: 9, hires: 2, response: 93, days: 19 },
    { role: 'Data Engineer', team: 'Data', applications: 46, mission: 31, qualified: 17, interviews: 7, hires: 1, response: 85, days: 29 },
    { role: 'Growth Marketing Lead', team: 'Marketing', applications: 44, mission: 28, qualified: 14, interviews: 6, hires: 1, response: 90, days: 24 },
    { role: 'Content Strategist', team: 'Marketing', applications: 35, mission: 21, qualified: 11, interviews: 5, hires: 1, response: 88, days: 26 },
    { role: 'Customer Success Manager', team: 'Operations', applications: 52, mission: 33, qualified: 19, interviews: 8, hires: 2, response: 95, days: 17 },
    { role: 'Project Manager', team: 'Operations', applications: 49, mission: 30, qualified: 16, interviews: 7, hires: 1, response: 86, days: 27 },
  ];
  const [team, setTeam] = useState('All positions');
  const [query, setQuery] = useState('');
  const teams = ['All positions', ...new Set(positions.map((item) => item.team))];
  const visible = positions.filter((item) => (team === 'All positions' || item.team === team) && item.role.toLowerCase().includes(query.toLowerCase()));
  const totals = visible.reduce((sum, item) => ({ applications: sum.applications + item.applications, qualified: sum.qualified + item.qualified, interviews: sum.interviews + item.interviews, hires: sum.hires + item.hires }), { applications: 0, qualified: 0, interviews: 0, hires: 0 });
  const stats = [['Applications',totals.applications,'+18%'],['Qualified',totals.qualified,'+12%'],['Interviews',totals.interviews,'+9%'],['Hires',totals.hires,'+4%']];
  return <Shell eyebrow="Hiring intelligence" title="Hiring analysis" copy="Understand pipeline health, conversion, response performance, and demand by role.">
    <section className="product-surface mb-5 p-4"><div className="grid gap-3 md:grid-cols-[1fr_17rem]"><label className="relative"><Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search every hiring position" className="min-h-11 w-full rounded-xl border border-slate-200 pl-10 pr-3 text-sm font-semibold outline-none" /></label><select value={team} onChange={(event) => setTeam(event.target.value)} className="min-h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold">{teams.map((item) => <option key={item}>{item}</option>)}</select></div><div className="mt-3 flex gap-2 overflow-x-auto">{teams.map((item) => <button key={item} onClick={() => setTeam(item)} className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-black ${team === item ? 'bg-[#173b67] text-white' : 'bg-slate-100 text-slate-600'}`}>{item}</button>)}</div></section>
    <div className="grid gap-3 sm:grid-cols-4">{stats.map(([label,value,trend]) => <article key={label} className="product-surface p-5"><p className="text-xs font-bold text-slate-500">{label}</p><strong className="mt-2 block text-3xl font-black">{value}</strong><span className="text-xs font-black text-green-700">{trend} this month</span></article>)}</div>
    <div className="mt-5 grid gap-5 lg:grid-cols-[1.5fr_1fr]"><section className="product-surface p-6"><h2 className="text-xl font-black">Applicant volume</h2><p className="text-sm text-slate-500">Eight-week qualified pipeline across {visible.length} positions</p><div className="mt-8 flex h-64 items-end gap-3 border-b border-slate-200">{weekly.map((value,i) => <div key={i} className="flex flex-1 flex-col items-center gap-2"><strong className="text-xs">{value}</strong><span className="w-full rounded-t-lg bg-[#173b67]" style={{ height: `${value * 2}px` }} /><small className="text-slate-400">W{i+1}</small></div>)}</div></section><section className="product-surface p-6"><h2 className="text-xl font-black">Team conversion</h2><p className="text-sm text-slate-500">Application to mission-qualified rate</p>{teams.slice(1).map((name) => { const rows = positions.filter((item) => item.team === name); const score = Math.round(rows.reduce((sum, item) => sum + item.qualified, 0) / rows.reduce((sum, item) => sum + item.applications, 0) * 100); return <div key={name} className="mt-6"><div className="flex justify-between text-sm font-bold"><span>{name}</span><span>{score}%</span></div><div className="mt-2 h-2 rounded-full bg-slate-100"><div className="h-full rounded-full bg-[#b7ff3c]" style={{ width: `${score}%` }} /></div></div>; })}</section></div>
    <section className="product-surface mt-5 overflow-hidden"><div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-100 p-5"><div><p className="product-eyebrow">All hiring positions</p><h2 className="mt-2 text-xl font-black">Position performance</h2><p className="mt-1 text-sm text-slate-500">Compare demand, challenge results, interviews, hiring speed, and employer response health.</p></div><span className="rounded-full bg-lime-50 px-3 py-1.5 text-xs font-black text-green-700">{visible.length} positions analyzed</span></div><div className="overflow-x-auto"><table className="w-full min-w-[1000px] text-left text-sm"><thead className="bg-slate-50 text-[.68rem] uppercase tracking-wider text-slate-500"><tr>{['Position','Applications','Mission submitted','Qualified','Interviews','Hires','Conversion','Response health','Time to hire'].map((heading) => <th key={heading} className="px-4 py-3">{heading}</th>)}</tr></thead><tbody>{visible.map((item) => { const conversion = Math.round(item.hires / item.applications * 100); return <tr key={item.role} className="border-t border-slate-100"><td className="px-4 py-4"><strong className="block">{item.role}</strong><span className="text-xs font-bold text-slate-500">{item.team}</span></td><td className="px-4 font-black">{item.applications}</td><td className="px-4">{item.mission}</td><td className="px-4">{item.qualified}</td><td className="px-4">{item.interviews}</td><td className="px-4 font-black text-[#173b67]">{item.hires}</td><td className="px-4"><span className="font-black">{conversion}%</span><div className="mt-1 h-1.5 w-20 rounded bg-slate-100"><div className="h-full rounded bg-[#b7ff3c]" style={{ width: `${Math.min(conversion * 10, 100)}%` }} /></div></td><td className="px-4"><span className={`rounded-full px-2.5 py-1 text-xs font-black ${item.response >= 90 ? 'bg-lime-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>{item.response}% on time</span></td><td className="px-4 font-bold">{item.days} days</td></tr>; })}</tbody></table></div></section>
    <div className="mt-5 grid gap-5 lg:grid-cols-3"><Insight title="Strongest pipeline" value="Senior React Engineer" detail="31 qualified candidates and 4 hires from 86 applications." /><Insight title="Response risk" value="Data Engineer" detail="85% on-time response. Prioritize the 7-day applicant promise." /><Insight title="Fastest hiring cycle" value="Customer Success Manager" detail="17-day average time to hire with 95% response health." /></div>
  </Shell>;
}

function Insight({ title, value, detail }: { title: string; value: string; detail: string }) { return <article className="product-surface border-t-4 border-t-[#b7ff3c] p-5"><p className="text-xs font-black uppercase tracking-wider text-slate-500">{title}</p><h3 className="mt-2 text-lg font-black">{value}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{detail}</p></article>; }

function JobFeed() {
  const [channels, setChannels] = useState({ careers: true, partner: true, social: false, alerts: true });
  const toggle = (key: keyof typeof channels) => setChannels((value) => ({ ...value, [key]: !value[key] }));
  return <Shell eyebrow="Distribution" title="Job feed" copy="Control where active roles are published and preview the live recruiting feed.">
    <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]"><section className="product-surface p-6"><h2 className="text-xl font-black">Publishing channels</h2>{Object.entries(channels).map(([key,value]) => <button key={key} onClick={() => toggle(key as keyof typeof channels)} className="mt-4 flex w-full items-center justify-between rounded-xl border border-slate-200 p-4 text-left"><span className="font-bold capitalize">{key === 'partner' ? 'Partner networks' : key === 'alerts' ? 'Candidate alerts' : `${key} feed`}</span><span className={`h-6 w-11 rounded-full p-1 ${value ? 'bg-[#173b67]' : 'bg-slate-200'}`}><span className={`block h-4 w-4 rounded-full bg-white transition ${value ? 'translate-x-5' : ''}`} /></span></button>)}</section><section className="product-surface overflow-hidden"><div className="border-b border-slate-100 p-6"><h2 className="text-xl font-black">Live feed preview</h2></div>{['Senior React Engineer','Product Designer','Data Platform Engineer','Growth Marketing Lead'].map((role,i) => <div key={role} className="flex items-center gap-4 border-b border-slate-100 p-5"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#edf2f7] text-[#173b67]"><BriefcaseBusiness className="h-5 w-5" /></span><div className="flex-1"><h3 className="font-black">{role}</h3><p className="text-xs text-slate-500">{i % 2 ? 'Remote' : 'Hybrid'} · Published to {Object.values(channels).filter(Boolean).length} channels</p></div><span className="rounded-full bg-lime-50 px-2 py-1 text-xs font-black text-green-700">Live</span></div>)}</section></div>
  </Shell>;
}

function Challenges() {
  const [items, setItems] = useState([
    { title: 'Frontend Performance Sprint', type: 'Hackathon', applicants: 84 },
    { title: 'Accessible Checkout Mission', type: 'Mission', applicants: 126 },
    { title: 'AI Customer Support Builder', type: 'Hackathon', applicants: 219 },
    { title: 'Zero-Downtime API Challenge', type: 'Skills test', applicants: 96 },
    { title: 'Sustainable Commerce Design Jam', type: 'Hackathon', applicants: 173 },
    { title: 'Product Analytics Investigation', type: 'Mission', applicants: 141 },
    { title: 'Cloud Security Capture the Flag', type: 'Hackathon', applicants: 288 },
    { title: 'Growth Experiment Blueprint', type: 'Mission', applicants: 112 },
    { title: 'Mobile Accessibility Audit', type: 'Skills test', applicants: 157 },
    { title: 'Real-time Collaboration Buildathon', type: 'Hackathon', applicants: 204 },
    { title: 'Data Storytelling Case Study', type: 'Mission', applicants: 91 },
    { title: 'Backend Reliability Simulation', type: 'Skills test', applicants: 134 },
  ]);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('Hackathon');
  const publish = () => { if (!title.trim()) return; setItems((value) => [{ title: title.trim(), type, applicants: 0 }, ...value]); setTitle(''); };
  return <Shell eyebrow="Proof-first hiring" title="Challenges & hackathons" copy="Publish practical missions so candidates can demonstrate skills and earn employer-issued verification.">
    <section className="product-surface p-6"><h2 className="text-xl font-black">Create a candidate challenge</h2><div className="mt-4 grid gap-3 md:grid-cols-[1fr_13rem_auto]"><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Challenge title" className="min-h-11 rounded-xl border border-slate-200 px-3 text-sm font-semibold" /><select value={type} onChange={(e) => setType(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 font-bold"><option>Hackathon</option><option>Mission</option><option>Skills test</option></select><button onClick={publish} className="product-button-primary"><Plus className="h-4 w-4" />Publish</button></div></section>
    <div className="mt-5 grid gap-4 md:grid-cols-2">{items.map((item) => <article key={item.title} className="product-surface p-5"><div className="flex items-start justify-between"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#12213a] text-[#b7ff3c]"><Trophy className="h-5 w-5" /></span><span className="rounded-full bg-[#fcf0f5] px-3 py-1 text-xs font-black text-[#173b67]">{item.type}</span></div><h2 className="mt-5 text-lg font-black">{item.title}</h2><p className="mt-2 text-sm text-slate-500">Candidates submit evidence, receive an employer review, and earn verified Career Passport points.</p><div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4"><span className="text-sm font-bold text-slate-500"><Users className="mr-1 inline h-4 w-4" />{item.applicants} participants</span><button className="text-sm font-black text-[#173b67]">Manage <Send className="inline h-4 w-4" /></button></div></article>)}</div>
  </Shell>;
}
