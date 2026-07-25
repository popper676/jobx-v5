import { useMemo, useState, type ReactNode } from 'react';
import { ArrowLeft, CalendarDays, CheckCircle2, Clock3, Mail, MapPin, MessageSquare, Search, Send, Users, Video } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SAMPLE_CANDIDATES } from '../data/marketplaceSamples';

type InterviewStage = 'Accepted' | 'Screening' | 'Interview scheduled' | 'Final review';
type QueueCandidate = (typeof SAMPLE_CANDIDATES)[number] & { stage: InterviewStage; interviewAt?: string };

const stages: InterviewStage[] = ['Accepted', 'Screening', 'Interview scheduled', 'Final review'];
const initialCandidates: QueueCandidate[] = SAMPLE_CANDIDATES.slice(0, 48).map((candidate, index) => ({
  ...candidate,
  stage: stages[index % stages.length],
  interviewAt: index % 4 === 2 ? `2026-07-${28 + (index % 3)}T${String(9 + (index % 7)).padStart(2, '0')}:00` : undefined,
}));

export default function EmployerInterviewCenter() {
  const [candidates, setCandidates] = useState(initialCandidates);
  const [role, setRole] = useState('All accepted roles');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(initialCandidates[0].id);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Record<string, string[]>>({});
  const roles = ['All accepted roles', ...new Set(candidates.map((candidate) => candidate.title))];
  const visible = useMemo(() => candidates.filter((candidate) => (
    (role === 'All accepted roles' || candidate.title === role)
    && `${candidate.name} ${candidate.title} ${candidate.location}`.toLowerCase().includes(query.toLowerCase())
  )), [candidates, query, role]);
  const selected = candidates.find((candidate) => candidate.id === selectedId) || visible[0];

  const updateCandidate = (id: string, patch: Partial<QueueCandidate>) => {
    setCandidates((current) => current.map((candidate) => candidate.id === id ? { ...candidate, ...patch } : candidate));
  };
  const sendMessage = () => {
    if (!selected || !message.trim()) return;
    setMessages((current) => ({ ...current, [selected.id]: [...(current[selected.id] || []), message.trim()] }));
    setMessage('');
  };

  return <main className="product-page -mx-4 min-h-[calc(100vh-4rem)] px-4 py-7 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"><div className="product-shell max-w-[1500px]">
    <Link to="/employer" className="product-button-secondary"><ArrowLeft className="h-4 w-4" />Back to dashboard</Link>
    <header className="mt-6 border-b border-slate-200 pb-7"><p className="product-eyebrow">Post-acceptance workspace</p><h1 className="product-title mt-3 text-4xl font-black">Interview Center</h1><p className="product-copy mt-2">Manage accepted applicants in separate role queues, schedule interviews, and keep every candidate conversation attached to the correct position.</p></header>

    <section className="mt-6 grid gap-3 sm:grid-cols-4">
      <Metric icon={<Users />} value={candidates.length} label="Accepted candidates" />
      <Metric icon={<Video />} value={candidates.filter((candidate) => candidate.stage === 'Interview scheduled').length} label="Interviews scheduled" />
      <Metric icon={<Clock3 />} value={candidates.filter((candidate) => candidate.stage === 'Screening').length} label="In screening" />
      <Metric icon={<CheckCircle2 />} value={candidates.filter((candidate) => candidate.stage === 'Final review').length} label="Final reviews" />
    </section>

    <section className="product-surface mt-5 p-5"><div className="grid gap-3 md:grid-cols-[1fr_18rem]"><label className="relative"><Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search accepted candidate, role, or location" className="min-h-11 w-full rounded-xl border border-slate-200 pl-10 pr-3 text-sm font-semibold outline-none" /></label><select value={role} onChange={(event) => setRole(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold">{roles.map((item) => <option key={item}>{item}</option>)}</select></div>
      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">{roles.slice(1).map((item) => <button key={item} onClick={() => setRole(item)} className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-black ${role === item ? 'bg-[#173b67] text-white' : 'bg-slate-100 text-slate-600'}`}>{item} · {candidates.filter((candidate) => candidate.title === item).length}</button>)}</div>
    </section>

    <div className="mt-5 grid min-h-[650px] gap-5 lg:grid-cols-[minmax(22rem,0.8fr)_minmax(30rem,1.2fr)]">
      <section className="product-surface overflow-hidden"><div className="border-b border-slate-100 p-5"><h2 className="font-black text-slate-900">{role}</h2><p className="text-xs font-bold text-slate-500">{visible.length} candidates in this interview queue</p></div><div className="max-h-[720px] divide-y divide-slate-100 overflow-y-auto">{visible.map((candidate) => <button key={candidate.id} onClick={() => setSelectedId(candidate.id)} className={`flex w-full items-start gap-3 p-4 text-left transition hover:bg-slate-50 ${selected?.id === candidate.id ? 'bg-[#fcf0f5]' : ''}`}><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#173b67] text-xs font-black text-white">{candidate.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}</span><span className="min-w-0 flex-1"><strong className="block truncate text-sm text-slate-900">{candidate.name}</strong><small className="block truncate font-bold text-slate-500">{candidate.title}</small><span className="mt-2 inline-flex rounded-full bg-white px-2 py-1 text-[0.65rem] font-black text-[#173b67] ring-1 ring-slate-200">{candidate.stage}</span></span><strong className="text-sm text-[#173b67]">{candidate.matchScore}%</strong></button>)}</div></section>

      {selected && <section className="product-surface flex min-h-0 flex-col overflow-hidden">
        <div className="border-b border-slate-100 p-5"><div className="flex flex-wrap items-start gap-4"><span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#173b67] font-black text-white">{selected.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}</span><div className="min-w-0 flex-1"><h2 className="text-xl font-black text-slate-950">{selected.name}</h2><p className="font-bold text-[#173b67]">{selected.title}</p><p className="mt-1 flex items-center gap-1 text-xs text-slate-500"><MapPin className="h-3.5 w-3.5" />{selected.location} · {selected.matchScore}% match</p></div><Link to={`/employer/candidates/${selected.id}`} className="product-button-secondary text-xs">Full profile</Link></div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2"><label><span className="mb-1 block text-xs font-black text-slate-500">INTERVIEW STAGE</span><select value={selected.stage} onChange={(event) => updateCandidate(selected.id, { stage: event.target.value as InterviewStage })} className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold">{stages.map((stage) => <option key={stage}>{stage}</option>)}</select></label><label><span className="mb-1 block text-xs font-black text-slate-500">INTERVIEW DATE & TIME</span><input type="datetime-local" value={selected.interviewAt || ''} onChange={(event) => updateCandidate(selected.id, { interviewAt: event.target.value, stage: event.target.value ? 'Interview scheduled' : selected.stage })} className="min-h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-bold" /></label></div>
        </div>
        <div className="flex-1 bg-slate-50 p-5"><div className="mx-auto max-w-2xl space-y-4"><div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-white p-4 text-sm leading-6 text-slate-600 shadow-sm"><strong className="mb-1 block text-slate-900">{selected.name}</strong>Thank you for accepting my application. I’m available to discuss the {selected.title} role and the next steps.</div>{(messages[selected.id] || []).map((text, index) => <div key={index} className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-[#173b67] p-4 text-sm leading-6 text-white"><strong className="mb-1 block text-[#b7ff3c]">Recruiting team</strong>{text}</div>)}</div></div>
        <div className="border-t border-slate-100 bg-white p-4"><div className="mb-3 flex flex-wrap gap-2"><button onClick={() => setMessage(`We would like to invite you to interview for the ${selected.title} role.`)} className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600"><CalendarDays className="mr-1 inline h-3.5 w-3.5" />Interview invitation</button><button onClick={() => setMessage('Could you confirm your availability for the scheduled interview?')} className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600"><Mail className="mr-1 inline h-3.5 w-3.5" />Request availability</button></div><div className="flex gap-2"><textarea value={message} onChange={(event) => setMessage(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); sendMessage(); } }} placeholder={`Message ${selected.name} about the ${selected.title} role…`} className="min-h-12 flex-1 resize-none rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none" /><button onClick={sendMessage} className="product-button-primary self-stretch px-4" aria-label="Send message"><Send className="h-4 w-4" /></button></div></div>
      </section>}
    </div>
  </div></main>;
}

function Metric({ icon, value, label }: { icon: ReactNode; value: number; label: string }) {
  return <article className="product-surface flex items-center gap-4 p-5"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf2f7] text-[#173b67] [&>svg]:h-5 [&>svg]:w-5">{icon}</span><div><strong className="text-2xl font-black text-slate-950">{value}</strong><p className="text-xs font-bold text-slate-500">{label}</p></div></article>;
}
