import { useState, type ReactNode } from 'react';
import { ArrowLeft, BarChart3, Bot, Check, ClipboardList, Copy, Scale, Sparkles, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

type ToolKey = 'interview' | 'plan' | 'calibration' | 'offer';

const tools: { key: ToolKey; title: string; detail: string; icon: ReactNode }[] = [
  { key: 'interview', title: 'Interview kit builder', detail: 'Generate structured, role-specific questions.', icon: <ClipboardList /> },
  { key: 'plan', title: 'Hiring plan analyst', detail: 'Model stages, capacity, and response deadlines.', icon: <BarChart3 /> },
  { key: 'calibration', title: 'Panel calibration coach', detail: 'Create shared scoring standards and reduce inconsistent interviews.', icon: <Scale /> },
  { key: 'offer', title: 'Offer readiness planner', detail: 'Check approvals, closing risks, and a fair offer process.', icon: <Users /> },
];

export default function EmployerAITools() {
  const [active, setActive] = useState<ToolKey>('interview');
  return <main className="product-page -mx-4 min-h-[calc(100vh-4rem)] px-4 py-7 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"><div className="product-shell max-w-[1450px]">
    <Link to="/employer" className="product-button-secondary"><ArrowLeft className="h-4 w-4" />Back to dashboard</Link>
    <header className="mt-6 overflow-hidden rounded-3xl bg-[#12213a] p-7 text-white sm:p-9"><div className="flex flex-wrap items-start justify-between gap-6"><div className="max-w-3xl"><p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-[#b7ff3c]"><Sparkles className="h-4 w-4" />Employer intelligence suite</p><h1 className="mt-4 text-4xl font-black tracking-[-0.04em] sm:text-5xl">AI Tools for better hiring decisions</h1><p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">Turn role requirements and verified candidate evidence into consistent, explainable hiring workflows. AI supports decisions—your recruiting team stays accountable.</p></div><span className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/10 ring-1 ring-white/20"><Bot className="h-9 w-9 text-[#b7ff3c]" /></span></div><div className="mt-7 flex flex-wrap gap-3 text-xs font-bold text-slate-200"><span className="rounded-full bg-white/10 px-3 py-2">Evidence-aware</span><span className="rounded-full bg-white/10 px-3 py-2">Role-specific</span><span className="rounded-full bg-white/10 px-3 py-2">Human-reviewed</span><span className="rounded-full bg-white/10 px-3 py-2">No automatic rejection</span></div></header>

    <section className="mt-6 grid gap-4 md:grid-cols-2">{tools.map((tool, index) => <button key={tool.key} onClick={() => setActive(tool.key)} className={`product-surface product-card-interactive p-6 text-left ${active === tool.key ? 'ring-2 ring-[#173b67]' : ''} ${index < 2 ? 'min-h-52 border-t-4 border-t-[#b7ff3c]' : ''}`}><span className={`flex h-12 w-12 items-center justify-center rounded-xl [&>svg]:h-6 [&>svg]:w-6 ${active === tool.key ? 'bg-[#173b67] text-[#b7ff3c]' : 'bg-[#edf2f7] text-[#173b67]'}`}>{tool.icon}</span><div className="mt-5 flex items-center gap-2"><strong className="block text-lg text-slate-900">{tool.title}</strong>{index < 2 && <span className="rounded-full bg-lime-50 px-2 py-1 text-[.62rem] font-black text-green-700">CORE AI TOOL</span>}</div><small className="mt-2 block max-w-lg text-sm leading-6 text-slate-500">{tool.detail}</small></button>)}</section>
    <section className="product-surface mt-6 overflow-hidden">{active === 'interview' && <InterviewKit />}{active === 'plan' && <HiringPlan />}{active === 'calibration' && <PanelCalibration />}{active === 'offer' && <OfferReadiness />}</section>
  </div></main>;
}

function Header({ icon, title, copy }: { icon: ReactNode; title: string; copy: string }) {
  return <div className="border-b border-slate-100 p-6"><div className="flex items-start gap-4"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fcf0f5] text-[#173b67] [&>svg]:h-5 [&>svg]:w-5">{icon}</span><div><h2 className="text-xl font-black text-slate-950">{title}</h2><p className="mt-1 text-sm text-slate-500">{copy}</p></div></div></div>;
}

function Output({ children }: { children: ReactNode }) {
  const [copied, setCopied] = useState(false);
  return <div className="relative rounded-2xl border border-slate-200 bg-slate-50 p-5"><button onClick={() => { navigator.clipboard?.writeText(typeof children === 'string' ? children : 'AI hiring recommendation'); setCopied(true); }} className="absolute right-3 top-3 rounded-lg bg-white p-2 text-slate-500 shadow-sm">{copied ? <Check className="h-4 w-4 text-green-700" /> : <Copy className="h-4 w-4" />}</button><div className="pr-10 text-sm leading-7 text-slate-700">{children}</div></div>;
}

function InterviewKit() {
  const [role, setRole] = useState('Product Designer');
  const [level, setLevel] = useState('Senior');
  const [generated, setGenerated] = useState(false);
  return <><Header icon={<ClipboardList />} title="Structured interview kit builder" copy="Generate consistent questions, evidence prompts, and scoring anchors." /><div className="grid gap-6 p-6 lg:grid-cols-[0.7fr_1.3fr]"><div><Field label="Role"><input value={role} onChange={(e) => setRole(e.target.value)} /></Field><Field label="Seniority"><select value={level} onChange={(e) => setLevel(e.target.value)}><option>Entry</option><option>Mid-level</option><option>Senior</option><option>Lead</option></select></Field><button onClick={() => setGenerated(true)} className="product-button-primary"><Sparkles className="h-4 w-4" />Build interview kit</button></div>{generated ? <Output><strong className="block text-lg text-slate-950">{level} {role} · 45-minute structured interview</strong><ol className="mt-3 list-decimal space-y-3 pl-5"><li>Describe a difficult decision where user needs and business constraints conflicted. What evidence guided you?</li><li>Walk through a project that changed after research. What did you personally contribute?</li><li>How do you measure whether a shipped solution worked?</li><li>Review a realistic work sample and identify the first three questions you would investigate.</li></ol><p className="mt-4"><strong>Scoring anchors:</strong> 1 = vague/no evidence, 3 = clear process and contribution, 5 = measurable impact, tradeoffs, and reflection.</p></Output> : <Empty text="Choose a role and seniority to generate a standardized interview kit." />}</div></>;
}

function HiringPlan() {
  const [roles, setRoles] = useState(4);
  const [applicants, setApplicants] = useState(180);
  const recruiters = Math.max(1, Math.ceil(applicants / 90));
  return <><Header icon={<BarChart3 />} title="Hiring plan analyst" copy="Estimate review capacity and build a response-safe recruiting plan." /><div className="grid gap-6 p-6 lg:grid-cols-[0.7fr_1.3fr]"><div><Field label="Open positions"><input type="number" value={roles} onChange={(e) => setRoles(Number(e.target.value))} /></Field><Field label="Expected applicants"><input type="number" value={applicants} onChange={(e) => setApplicants(Number(e.target.value))} /></Field></div><Output><strong className="block text-lg text-slate-950">Recommended operating plan</strong><div className="mt-4 grid grid-cols-3 gap-3 text-center"><Stat value={recruiters} label="Reviewers" /><Stat value={Math.ceil(applicants / Math.max(1, roles))} label="Applicants / role" /><Stat value={5} label="Day response SLA" /></div><ul className="mt-5 list-disc space-y-2 pl-5"><li>Assign one accountable hiring lead per role.</li><li>Review new applications in daily batches of {Math.ceil(applicants / 10)}.</li><li>Use structured scorecards before interviews begin.</li><li>Send candidate updates by day five to protect employer verification.</li></ul></Output></div></>;
}

function PanelCalibration() {
  const [role, setRole] = useState('Senior React Engineer');
  const [panelSize, setPanelSize] = useState(4);
  const [generated, setGenerated] = useState(false);
  return <><Header icon={<Scale />} title="Panel calibration coach" copy="Give every interviewer the same evidence standard before meeting candidates." /><div className="grid gap-6 p-6 lg:grid-cols-[.7fr_1.3fr]"><div><Field label="Position"><input value={role} onChange={(event) => setRole(event.target.value)} /></Field><Field label="Interview panel size"><input type="number" min="2" max="8" value={panelSize} onChange={(event) => setPanelSize(Number(event.target.value))} /></Field><button onClick={() => setGenerated(true)} className="product-button-primary"><Sparkles className="h-4 w-4" />Create calibration guide</button></div>{generated ? <Output><strong className="block text-lg text-slate-950">{role} · {panelSize}-person panel guide</strong><ul className="mt-4 list-disc space-y-2 pl-5"><li>Score mission evidence, technical judgment, collaboration, and reflection separately.</li><li>Each interviewer records evidence before discussing the candidate.</li><li>Use a shared 1–5 rubric: 1 lacks evidence, 3 meets the role standard, 5 shows repeatable high impact.</li><li>Flag disagreements of two or more points for a structured calibration review.</li></ul><p className="mt-4"><strong>Decision rule:</strong> document observable evidence and job relevance; never infer protected or personal characteristics.</p></Output> : <Empty text="Add the role and panel size to create a shared evidence rubric." />}</div></>;
}

function OfferReadiness() {
  const [role, setRole] = useState('Product Designer');
  const [salary, setSalary] = useState(145000);
  const [risk, setRisk] = useState('Competing offer');
  return <><Header icon={<Users />} title="Offer readiness planner" copy="Prepare an accountable, consistent closing process before making an offer." /><div className="grid gap-6 p-6 lg:grid-cols-[.7fr_1.3fr]"><div><Field label="Position"><input value={role} onChange={(event) => setRole(event.target.value)} /></Field><Field label="Proposed annual salary"><input type="number" value={salary} onChange={(event) => setSalary(Number(event.target.value))} /></Field><Field label="Primary closing risk"><select value={risk} onChange={(event) => setRisk(event.target.value)}><option>Competing offer</option><option>Compensation alignment</option><option>Start date</option><option>Remote-work expectations</option></select></Field></div><Output><strong className="block text-lg text-slate-950">{role} offer readiness</strong><div className="mt-4 grid grid-cols-3 gap-3 text-center"><Stat value={Math.round(salary / 1000)} label="Salary · $K" /><Stat value={3} label="Approvals" /><Stat value={2} label="Day follow-up" /></div><ul className="mt-5 list-disc space-y-2 pl-5"><li>Confirm compensation band, hiring-manager approval, and intended start date.</li><li>Address the candidate’s primary risk: {risk.toLowerCase()}.</li><li>Share the complete package consistently, including benefits and working model.</li><li>Schedule a decision follow-up within two business days without pressuring the candidate.</li></ul></Output></div></>;
}

function Field({ label, children }: { label: string; children: ReactNode }) { return <label className="mb-4 block"><span className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-500">{label}</span><div className="[&>input]:min-h-11 [&>input]:w-full [&>input]:rounded-xl [&>input]:border [&>input]:border-slate-200 [&>input]:px-3 [&>textarea]:w-full [&>textarea]:rounded-xl [&>textarea]:border [&>textarea]:border-slate-200 [&>textarea]:p-3 [&>select]:min-h-11 [&>select]:w-full [&>select]:rounded-xl [&>select]:border [&>select]:border-slate-200 [&>select]:bg-white [&>select]:px-3 [&>*]:text-sm [&>*]:font-semibold [&>*]:outline-none">{children}</div></label>; }
function Empty({ text }: { text: string }) { return <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center"><Bot className="h-9 w-9 text-slate-300" /><p className="mt-4 max-w-sm text-sm text-slate-500">{text}</p></div>; }
function Stat({ value, label }: { value: number; label: string }) { return <div className="rounded-xl bg-white p-3"><strong className="block text-2xl text-[#173b67]">{value}</strong><small className="text-slate-500">{label}</small></div>; }
