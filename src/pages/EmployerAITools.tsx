import { useMemo, useState, type ReactNode } from 'react';
import { ArrowLeft, BarChart3, Bot, BriefcaseBusiness, Check, ClipboardList, Copy, FileSearch, MessageSquareText, Send, Sparkles, Target, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SAMPLE_CANDIDATES } from '../data/marketplaceSamples';

type ToolKey = 'job' | 'shortlist' | 'interview' | 'outreach' | 'plan';

const tools: { key: ToolKey; title: string; detail: string; icon: ReactNode }[] = [
  { key: 'job', title: 'Job description copilot', detail: 'Clarify requirements and remove biased language.', icon: <BriefcaseBusiness /> },
  { key: 'shortlist', title: 'Candidate shortlist', detail: 'Compare evidence and explain candidate fit.', icon: <FileSearch /> },
  { key: 'interview', title: 'Interview kit builder', detail: 'Generate structured, role-specific questions.', icon: <ClipboardList /> },
  { key: 'outreach', title: 'Candidate outreach', detail: 'Write professional personalized messages.', icon: <MessageSquareText /> },
  { key: 'plan', title: 'Hiring plan analyst', detail: 'Model stages, capacity, and response deadlines.', icon: <BarChart3 /> },
];

export default function EmployerAITools() {
  const [active, setActive] = useState<ToolKey>('job');
  return <main className="product-page -mx-4 min-h-[calc(100vh-4rem)] px-4 py-7 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"><div className="product-shell max-w-[1450px]">
    <Link to="/employer" className="product-button-secondary"><ArrowLeft className="h-4 w-4" />Back to dashboard</Link>
    <header className="mt-6 overflow-hidden rounded-3xl bg-[#12213a] p-7 text-white sm:p-9"><div className="flex flex-wrap items-start justify-between gap-6"><div className="max-w-3xl"><p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-[#b7ff3c]"><Sparkles className="h-4 w-4" />Employer intelligence suite</p><h1 className="mt-4 text-4xl font-black tracking-[-0.04em] sm:text-5xl">AI Tools for better hiring decisions</h1><p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">Turn role requirements and verified candidate evidence into consistent, explainable hiring workflows. AI supports decisions—your recruiting team stays accountable.</p></div><span className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/10 ring-1 ring-white/20"><Bot className="h-9 w-9 text-[#b7ff3c]" /></span></div><div className="mt-7 flex flex-wrap gap-3 text-xs font-bold text-slate-200"><span className="rounded-full bg-white/10 px-3 py-2">Evidence-aware</span><span className="rounded-full bg-white/10 px-3 py-2">Role-specific</span><span className="rounded-full bg-white/10 px-3 py-2">Human-reviewed</span><span className="rounded-full bg-white/10 px-3 py-2">No automatic rejection</span></div></header>

    <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{tools.map((tool) => <button key={tool.key} onClick={() => setActive(tool.key)} className={`product-surface product-card-interactive p-4 text-left ${active === tool.key ? 'ring-2 ring-[#173b67]' : ''}`}><span className={`flex h-10 w-10 items-center justify-center rounded-xl [&>svg]:h-5 [&>svg]:w-5 ${active === tool.key ? 'bg-[#173b67] text-[#b7ff3c]' : 'bg-[#edf2f7] text-[#173b67]'}`}>{tool.icon}</span><strong className="mt-4 block text-sm text-slate-900">{tool.title}</strong><small className="mt-1 block leading-5 text-slate-500">{tool.detail}</small></button>)}</section>
    <section className="product-surface mt-6 overflow-hidden">{active === 'job' && <JobCopilot />}{active === 'shortlist' && <Shortlist />}{active === 'interview' && <InterviewKit />}{active === 'outreach' && <Outreach />}{active === 'plan' && <HiringPlan />}</section>
  </div></main>;
}

function Header({ icon, title, copy }: { icon: ReactNode; title: string; copy: string }) {
  return <div className="border-b border-slate-100 p-6"><div className="flex items-start gap-4"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fcf0f5] text-[#173b67] [&>svg]:h-5 [&>svg]:w-5">{icon}</span><div><h2 className="text-xl font-black text-slate-950">{title}</h2><p className="mt-1 text-sm text-slate-500">{copy}</p></div></div></div>;
}

function Output({ children }: { children: ReactNode }) {
  const [copied, setCopied] = useState(false);
  return <div className="relative rounded-2xl border border-slate-200 bg-slate-50 p-5"><button onClick={() => { navigator.clipboard?.writeText(typeof children === 'string' ? children : 'AI hiring recommendation'); setCopied(true); }} className="absolute right-3 top-3 rounded-lg bg-white p-2 text-slate-500 shadow-sm">{copied ? <Check className="h-4 w-4 text-green-700" /> : <Copy className="h-4 w-4" />}</button><div className="pr-10 text-sm leading-7 text-slate-700">{children}</div></div>;
}

function JobCopilot() {
  const [role, setRole] = useState('Senior React Engineer');
  const [description, setDescription] = useState('We need a rockstar developer with 10 years of React experience who can work under pressure and own everything.');
  const [generated, setGenerated] = useState(false);
  return <><Header icon={<BriefcaseBusiness />} title="Job description copilot" copy="Create a clear, inclusive, outcome-based role description." /><div className="grid gap-6 p-6 lg:grid-cols-2"><div><Field label="Role title"><input value={role} onChange={(e) => setRole(e.target.value)} /></Field><Field label="Current description"><textarea rows={8} value={description} onChange={(e) => setDescription(e.target.value)} /></Field><button onClick={() => setGenerated(true)} className="product-button-primary"><Sparkles className="h-4 w-4" />Improve description</button></div><div><p className="mb-3 text-xs font-black uppercase tracking-wider text-slate-500">AI recommendation</p>{generated ? <Output><strong className="block text-lg text-slate-950">{role}</strong><p className="mt-3">Lead the delivery of accessible, reliable product experiences using React and TypeScript. You will partner with product, design, and platform teams to improve performance, testing, and maintainability.</p><p className="mt-3"><strong>Success in the first 90 days:</strong> ship one customer-facing improvement, document frontend architecture, and establish measurable quality baselines.</p><p className="mt-3"><strong>Core evidence:</strong> production React work, thoughtful technical decisions, collaboration, and measurable delivery outcomes.</p></Output> : <Empty text="Add the role context, then generate an improved description." />}</div></div></>;
}

function Shortlist() {
  const [role, setRole] = useState('Frontend Engineer');
  const candidates = useMemo(() => SAMPLE_CANDIDATES.filter((candidate) => candidate.title === role).slice(0, 5), [role]);
  const roles = [...new Set(SAMPLE_CANDIDATES.map((candidate) => candidate.title))];
  return <><Header icon={<Target />} title="Evidence-based candidate shortlist" copy="Rank relevant profiles with transparent reasons—not hidden automatic rejection." /><div className="p-6"><div className="max-w-sm"><Field label="Position"><select value={role} onChange={(e) => setRole(e.target.value)}>{roles.map((item) => <option key={item}>{item}</option>)}</select></Field></div><div className="mt-3 grid gap-3 lg:grid-cols-5">{candidates.map((candidate, index) => <Link to={`/employer/candidates/${candidate.id}`} key={candidate.id} className="rounded-2xl border border-slate-200 p-4 transition hover:border-[#173b67]"><div className="flex items-center justify-between"><span className="text-xs font-black text-slate-400">#{index + 1}</span><strong className="text-[#173b67]">{candidate.matchScore}%</strong></div><h3 className="mt-4 font-black text-slate-900">{candidate.name}</h3><p className="mt-1 text-xs text-slate-500">{candidate.location}</p><div className="mt-3 flex flex-wrap gap-1">{candidate.skills.map((skill) => <span key={skill} className="rounded bg-slate-100 px-1.5 py-1 text-[0.62rem] font-bold">{skill}</span>)}</div><p className="mt-4 text-xs leading-5 text-slate-500">Strong verified evidence in {candidate.skills.slice(0, 2).join(' and ')}.</p></Link>)}</div><p className="mt-4 rounded-xl bg-amber-50 p-3 text-xs font-semibold text-amber-900">Review reminder: match scores support comparison but must not be used as the sole hiring decision.</p></div></>;
}

function InterviewKit() {
  const [role, setRole] = useState('Product Designer');
  const [level, setLevel] = useState('Senior');
  const [generated, setGenerated] = useState(false);
  return <><Header icon={<ClipboardList />} title="Structured interview kit builder" copy="Generate consistent questions, evidence prompts, and scoring anchors." /><div className="grid gap-6 p-6 lg:grid-cols-[0.7fr_1.3fr]"><div><Field label="Role"><input value={role} onChange={(e) => setRole(e.target.value)} /></Field><Field label="Seniority"><select value={level} onChange={(e) => setLevel(e.target.value)}><option>Entry</option><option>Mid-level</option><option>Senior</option><option>Lead</option></select></Field><button onClick={() => setGenerated(true)} className="product-button-primary"><Sparkles className="h-4 w-4" />Build interview kit</button></div>{generated ? <Output><strong className="block text-lg text-slate-950">{level} {role} · 45-minute structured interview</strong><ol className="mt-3 list-decimal space-y-3 pl-5"><li>Describe a difficult decision where user needs and business constraints conflicted. What evidence guided you?</li><li>Walk through a project that changed after research. What did you personally contribute?</li><li>How do you measure whether a shipped solution worked?</li><li>Review a realistic work sample and identify the first three questions you would investigate.</li></ol><p className="mt-4"><strong>Scoring anchors:</strong> 1 = vague/no evidence, 3 = clear process and contribution, 5 = measurable impact, tradeoffs, and reflection.</p></Output> : <Empty text="Choose a role and seniority to generate a standardized interview kit." />}</div></>;
}

function Outreach() {
  const [candidate, setCandidate] = useState(SAMPLE_CANDIDATES[0].name);
  const [role, setRole] = useState('Senior Frontend Engineer');
  const [tone, setTone] = useState('Warm and professional');
  const [generated, setGenerated] = useState(false);
  return <><Header icon={<MessageSquareText />} title="Candidate outreach writer" copy="Create respectful, role-specific outreach using verified profile evidence." /><div className="grid gap-6 p-6 lg:grid-cols-2"><div><Field label="Candidate"><select value={candidate} onChange={(e) => setCandidate(e.target.value)}>{SAMPLE_CANDIDATES.slice(0, 30).map((item) => <option key={item.id}>{item.name}</option>)}</select></Field><Field label="Role"><input value={role} onChange={(e) => setRole(e.target.value)} /></Field><Field label="Tone"><select value={tone} onChange={(e) => setTone(e.target.value)}><option>Warm and professional</option><option>Concise</option><option>Formal</option></select></Field><button onClick={() => setGenerated(true)} className="product-button-primary"><Send className="h-4 w-4" />Draft outreach</button></div>{generated ? <Output><p>Hi {candidate},</p><p className="mt-3">Your verified project evidence and collaborative work stood out to our hiring team. We’re hiring a {role}, and your experience appears relevant to the outcomes this position will own.</p><p className="mt-3">Would you be open to a short conversation about the team, expectations, and interview process? We commit to a clear update within five business days after each stage.</p><p className="mt-3">Best,<br />TechCorp Talent Team</p></Output> : <Empty text="Select a candidate and role to draft a personalized message." />}</div></>;
}

function HiringPlan() {
  const [roles, setRoles] = useState(4);
  const [applicants, setApplicants] = useState(180);
  const recruiters = Math.max(1, Math.ceil(applicants / 90));
  return <><Header icon={<BarChart3 />} title="Hiring plan analyst" copy="Estimate review capacity and build a response-safe recruiting plan." /><div className="grid gap-6 p-6 lg:grid-cols-[0.7fr_1.3fr]"><div><Field label="Open positions"><input type="number" value={roles} onChange={(e) => setRoles(Number(e.target.value))} /></Field><Field label="Expected applicants"><input type="number" value={applicants} onChange={(e) => setApplicants(Number(e.target.value))} /></Field></div><Output><strong className="block text-lg text-slate-950">Recommended operating plan</strong><div className="mt-4 grid grid-cols-3 gap-3 text-center"><Stat value={recruiters} label="Reviewers" /><Stat value={Math.ceil(applicants / Math.max(1, roles))} label="Applicants / role" /><Stat value={5} label="Day response SLA" /></div><ul className="mt-5 list-disc space-y-2 pl-5"><li>Assign one accountable hiring lead per role.</li><li>Review new applications in daily batches of {Math.ceil(applicants / 10)}.</li><li>Use structured scorecards before interviews begin.</li><li>Send candidate updates by day five to protect employer verification.</li></ul></Output></div></>;
}

function Field({ label, children }: { label: string; children: ReactNode }) { return <label className="mb-4 block"><span className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-500">{label}</span><div className="[&>input]:min-h-11 [&>input]:w-full [&>input]:rounded-xl [&>input]:border [&>input]:border-slate-200 [&>input]:px-3 [&>textarea]:w-full [&>textarea]:rounded-xl [&>textarea]:border [&>textarea]:border-slate-200 [&>textarea]:p-3 [&>select]:min-h-11 [&>select]:w-full [&>select]:rounded-xl [&>select]:border [&>select]:border-slate-200 [&>select]:bg-white [&>select]:px-3 [&>*]:text-sm [&>*]:font-semibold [&>*]:outline-none">{children}</div></label>; }
function Empty({ text }: { text: string }) { return <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center"><Bot className="h-9 w-9 text-slate-300" /><p className="mt-4 max-w-sm text-sm text-slate-500">{text}</p></div>; }
function Stat({ value, label }: { value: number; label: string }) { return <div className="rounded-xl bg-white p-3"><strong className="block text-2xl text-[#173b67]">{value}</strong><small className="text-slate-500">{label}</small></div>; }
