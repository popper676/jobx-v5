import { useMemo, useState, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight, BarChart3, BriefcaseBusiness, CalendarDays, Check, CheckCircle2, ChevronRight, ClipboardCheck, EyeOff, Mail, Megaphone, MessageSquareText, Plus, Search, Send, Trash2, Trophy, Users, Video, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SAMPLE_CANDIDATES } from '../data/marketplaceSamples';

type View = 'groups' | 'challenge' | 'results' | 'interviews';
type Status = 'Accepted to group' | 'Qualified' | 'Removed';
type Member = (typeof SAMPLE_CANDIDATES)[number] & { status: Status; score: number; correctness: number; contribution: number; completion: number };
type Challenge = { title: string; deadline: string; state: 'Draft' | 'Active'; submissions: number };

const initialMembers: Member[] = SAMPLE_CANDIDATES.slice(0, 64).map((candidate, index) => {
  const correctness = 58 + (index * 11) % 41;
  const contribution = 54 + (index * 13) % 45;
  const completion = index % 9 === 0 ? 70 : 100;
  return { ...candidate, status: 'Accepted to group', correctness, contribution, completion, score: Math.round(correctness * .5 + contribution * .3 + completion * .2) };
});

const viewMeta: Record<View, { number: number; label: string; detail: string }> = {
  groups: { number: 1, label: 'Position groups', detail: 'Organize accepted applicants' },
  challenge: { number: 2, label: 'Optional challenge', detail: 'Assign work inside a group' },
  results: { number: 3, label: 'Private results', detail: 'Visible only to your team' },
  interviews: { number: 4, label: 'Interview session', detail: 'Contact qualified candidates' },
};

export default function EmployerInterviewCenter() {
  const [members, setMembers] = useState(initialMembers);
  const roles = useMemo(() => [...new Set(initialMembers.map((member) => String(member.title)))], []);
  const [role, setRole] = useState(roles[0]);
  const [view, setView] = useState<View>('groups');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [challenges, setChallenges] = useState<Record<string, Challenge>>({
    [roles[0]]: { title: 'Accessible performance dashboard', deadline: '5 Aug 2026', state: 'Active', submissions: 6 },
    [roles[1]]: { title: 'Checkout usability redesign', deadline: '7 Aug 2026', state: 'Active', submissions: 5 },
  });
  const [notice, setNotice] = useState('');
  const [messageCandidate, setMessageCandidate] = useState<Member | null>(null);
  const [message, setMessage] = useState('');
  const roleMembers = members.filter((member) => String(member.title) === role && member.status !== 'Removed' && `${member.name} ${member.location}`.toLowerCase().includes(query.toLowerCase()));
  const qualified = roleMembers.filter((member) => member.status === 'Qualified');
  const currentChallenge = challenges[role];

  const selectAll = () => setSelected(new Set(selected.size === roleMembers.length ? [] : roleMembers.map((member) => member.id)));
  const toggle = (id: string) => setSelected((current) => { const next = new Set(current); next.has(id) ? next.delete(id) : next.add(id); return next; });
  const updateSelected = (status: Status) => {
    if (!selected.size) return;
    setMembers((current) => current.map((member) => selected.has(member.id) ? { ...member, status } : member));
    setNotice(status === 'Qualified' ? `${selected.size} candidate${selected.size > 1 ? 's' : ''} moved to interviews.` : `${selected.size} candidate${selected.size > 1 ? 's' : ''} removed from the ${role} group.`);
    setSelected(new Set());
    if (status === 'Qualified') setView('interviews');
  };
  const changeRole = (nextRole: string) => { setRole(nextRole); setSelected(new Set()); setNotice(''); };

  return <main className="product-page -mx-4 min-h-[calc(100vh-4rem)] px-4 py-7 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"><div className="product-shell max-w-[1500px]">
    <Link to="/employer" className="product-button-secondary"><ArrowLeft className="h-4 w-4" />Back to dashboard</Link>
    <header className="mt-6 grid gap-6 rounded-3xl bg-[#12213a] p-7 text-white lg:grid-cols-[1fr_auto] lg:items-end">
      <div><p className="product-eyebrow text-[#b7ff3c]">Candidate group workflow</p><h1 className="mt-3 text-4xl font-black tracking-[-.04em] sm:text-5xl">Assessment & Interview Center</h1><p className="mt-3 max-w-3xl leading-7 text-slate-300">Review applications first, organize accepted candidates by position, optionally assign a group challenge, privately review results, and move only qualified candidates to interviews.</p></div>
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-xs font-black uppercase tracking-wider text-[#b7ff3c]">Current workspace</p><strong className="mt-2 block text-lg">{role}</strong><p className="mt-1 text-sm text-slate-300">{roleMembers.length} candidates in group · {qualified.length} qualified</p></div>
    </header>

    <section className="mt-5 grid gap-2 md:grid-cols-4">{(Object.keys(viewMeta) as View[]).map((key) => { const item = viewMeta[key]; const active = view === key; return <button key={key} onClick={() => setView(key)} className={`relative flex items-center gap-3 rounded-2xl border p-4 text-left transition ${active ? 'border-[#173b67] bg-[#173b67] text-white shadow-lg' : 'border-slate-200 bg-white hover:-translate-y-0.5 hover:border-[#173b67]'}`}><span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-black ${active ? 'bg-[#b7ff3c] text-[#12213a]' : 'bg-slate-100 text-slate-500'}`}>{item.number}</span><span><strong className="block text-sm">{item.label}</strong><small className={active ? 'text-slate-300' : 'text-slate-500'}>{item.detail}</small></span>{item.number < 4 && <ChevronRight className="absolute -right-3 z-10 hidden h-5 w-5 text-[#b7ff3c] md:block" />}</button>; })}</section>

    {notice && <div className="mt-5 flex items-center gap-2 rounded-xl border border-lime-200 bg-lime-50 p-4 text-sm font-bold text-green-800"><CheckCircle2 className="h-4 w-4" />{notice}</div>}

    <div className="mt-5 grid items-start gap-5 lg:grid-cols-[19rem_minmax(0,1fr)]">
      <PositionGroups roles={roles} members={members} activeRole={role} onChange={changeRole} challenges={challenges} />
      <section className="min-w-0">
        <StepHelp view={view} role={role} count={roleMembers.length} />
        {view === 'groups' && <GroupWorkspace role={role} members={roleMembers} query={query} setQuery={setQuery} selected={selected} toggle={toggle} selectAll={selectAll} remove={() => updateSelected('Removed')} goChallenge={() => setView('challenge')} />}
        {view === 'challenge' && <ChallengeWorkspace role={role} memberCount={roleMembers.length} challenge={currentChallenge} save={(challenge) => { setChallenges((current) => ({ ...current, [role]: challenge })); setNotice(`Challenge published to the ${role} group.`); }} goResults={() => setView('results')} />}
        {view === 'results' && <ResultsWorkspace role={role} members={roleMembers} challenge={currentChallenge} selected={selected} toggle={toggle} selectAll={selectAll} qualify={() => updateSelected('Qualified')} remove={() => updateSelected('Removed')} />}
        {view === 'interviews' && <InterviewWorkspace role={role} members={qualified} openMessage={(candidate) => { setMessageCandidate(candidate); setMessage(`Congratulations ${candidate.name}. You have qualified for the next interview stage for our ${role} position.`); }} />}
      </section>
    </div>
    {messageCandidate && <MessageModal candidate={messageCandidate} value={message} setValue={setMessage} close={() => setMessageCandidate(null)} send={() => { setNotice(`Interview announcement sent to ${messageCandidate.name}.`); setMessageCandidate(null); }} />}
  </div></main>;
}

function PositionGroups({ roles, members, activeRole, onChange, challenges }: { roles: string[]; members: Member[]; activeRole: string; onChange: (role: string) => void; challenges: Record<string, Challenge> }) {
  return <aside className="product-surface overflow-hidden lg:sticky lg:top-24"><div className="border-b border-slate-100 p-5"><p className="product-eyebrow">Positions</p><h2 className="mt-2 font-black">Candidate groups</h2><p className="mt-1 text-xs leading-5 text-slate-500">Choose one position to manage its accepted candidates.</p></div><div className="max-h-[720px] divide-y divide-slate-100 overflow-y-auto">{roles.map((item) => { const group = members.filter((member) => String(member.title) === item && member.status !== 'Removed'); const qualified = group.filter((member) => member.status === 'Qualified').length; return <button key={item} onClick={() => onChange(item)} className={`w-full p-4 text-left transition ${activeRole === item ? 'bg-[#edf2f7] shadow-[inset_4px_0_0_#173b67]' : 'hover:bg-slate-50'}`}><div className="flex items-start gap-3"><span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${activeRole === item ? 'bg-[#173b67] text-white' : 'bg-slate-100 text-slate-500'}`}><BriefcaseBusiness className="h-4 w-4" /></span><span className="min-w-0 flex-1"><strong className="block truncate text-sm">{item}</strong><small className="mt-1 block font-bold text-slate-500">{group.length} in group · {qualified} qualified</small><span className={`mt-2 inline-flex rounded-full px-2 py-1 text-[.6rem] font-black ${challenges[item] ? 'bg-lime-50 text-green-700' : 'bg-slate-100 text-slate-500'}`}>{challenges[item] ? 'Challenge active' : 'No challenge'}</span></span></div></button>; })}</div></aside>;
}

function StepHelp({ view, role, count }: { view: View; role: string; count: number }) {
  const copy = {
    groups: `These ${count} applicants were accepted after application review. They are now organized inside the ${role} group.`,
    challenge: 'Challenges are optional. Assign one practical challenge only when your team needs more evidence before interviews.',
    results: 'Challenge scores are private. Candidates cannot see rankings, internal notes, or qualification decisions.',
    interviews: 'Only qualified candidates appear here. Send announcements, schedule sessions, and continue the conversation.',
  }[view];
  return <div className="mb-4 flex items-start gap-3 rounded-2xl border border-blue-100 bg-[#f4f8ff] p-4"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#173b67] text-white">{viewMeta[view].number}</span><div><strong className="text-sm">{viewMeta[view].label}: {role}</strong><p className="mt-1 text-xs leading-5 text-slate-600">{copy}</p></div></div>;
}

function GroupWorkspace({ role, members, query, setQuery, selected, toggle, selectAll, remove, goChallenge }: { role: string; members: Member[]; query: string; setQuery: (value: string) => void; selected: Set<string>; toggle: (id: string) => void; selectAll: () => void; remove: () => void; goChallenge: () => void }) {
  return <section className="product-surface overflow-hidden"><WorkspaceHeader eyebrow="Accepted application group" title={`${role} candidates`} detail={`${members.length} candidates accepted from application review`} action={<button onClick={goChallenge} className="product-button-primary"><Trophy className="h-4 w-4" />Create group challenge</button>} /><Toolbar query={query} setQuery={setQuery} selected={selected.size} total={members.length} selectAll={selectAll} remove={remove} /><MemberTable members={members} selected={selected} toggle={toggle} showScore={false} /></section>;
}

function ChallengeWorkspace({ role, memberCount, challenge, save, goResults }: { role: string; memberCount: number; challenge?: Challenge; save: (challenge: Challenge) => void; goResults: () => void }) {
  const [title, setTitle] = useState(challenge?.title || '');
  const [deadline, setDeadline] = useState(challenge?.deadline || '10 Aug 2026');
  return <div className="grid gap-5 xl:grid-cols-[.85fr_1.15fr]"><section className="product-surface p-6"><p className="product-eyebrow">Optional evidence step</p><h2 className="mt-2 text-xl font-black">Assign a challenge to this group</h2><p className="mt-2 text-sm leading-6 text-slate-500">All {memberCount} accepted {role} candidates will receive the same instructions and deadline.</p><Field label="Challenge title"><input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Build an accessible dashboard" /></Field><Field label="Submission deadline"><input value={deadline} onChange={(event) => setDeadline(event.target.value)} /></Field><div className="rounded-xl bg-slate-50 p-4 text-xs leading-5 text-slate-600"><strong className="block text-slate-900">Private scoring model</strong>Correctness 50% · Contribution 30% · Completion 20%</div><button disabled={!title.trim()} onClick={() => save({ title, deadline, state: 'Active', submissions: 0 })} className="product-button-primary mt-5 w-full disabled:opacity-40"><Megaphone className="h-4 w-4" />Publish to {role} group</button></section><section className="product-surface p-6"><p className="product-eyebrow">Group challenge status</p>{challenge ? <><div className="mt-4 rounded-2xl bg-[#12213a] p-5 text-white"><div className="flex items-start justify-between gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-[#b7ff3c]"><Trophy className="h-5 w-5" /></span><span className="rounded-full bg-[#b7ff3c] px-2.5 py-1 text-xs font-black text-[#12213a]">ACTIVE</span></div><h3 className="mt-5 text-xl font-black">{challenge.title}</h3><p className="mt-2 text-sm text-slate-300">{role} · Due {challenge.deadline}</p></div><div className="mt-4 grid grid-cols-3 gap-3"><Mini value={memberCount} label="Assigned" /><Mini value={challenge.submissions} label="Submitted" /><Mini value={memberCount - challenge.submissions} label="Waiting" /></div><button onClick={goResults} className="product-button-secondary mt-5 w-full">Open private results <ArrowRight className="h-4 w-4" /></button></> : <EmptyState icon={<Trophy />} title="No challenge assigned" detail="You can skip this step and interview candidates directly, or publish a role-specific challenge when more evidence is needed." />}</section></div>;
}

function ResultsWorkspace({ role, members, challenge, selected, toggle, selectAll, qualify, remove }: { role: string; members: Member[]; challenge?: Challenge; selected: Set<string>; toggle: (id: string) => void; selectAll: () => void; qualify: () => void; remove: () => void }) {
  const ranked = [...members].sort((a, b) => b.score - a.score);
  return <section className="product-surface overflow-hidden"><WorkspaceHeader eyebrow="Internal team view" title={`${role} private results`} detail={challenge ? challenge.title : 'No challenge assigned — review using application evidence'} action={<span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-2 text-xs font-black text-slate-600"><EyeOff className="h-4 w-4" />Hidden from candidates</span>} /><div className="grid gap-3 border-b border-slate-100 p-5 sm:grid-cols-4"><Mini value={ranked.length} label="Group members" /><Mini value={`${Math.round(ranked.reduce((sum, member) => sum + member.score, 0) / Math.max(ranked.length, 1))}%`} label="Average score" /><Mini value={ranked.filter((member) => member.score >= 80).length} label="Recommended" /><Mini value={ranked.filter((member) => member.status === 'Qualified').length} label="Qualified" /></div><div className="sticky top-0 z-10 flex flex-wrap items-center gap-2 border-b border-slate-100 bg-white p-4"><button onClick={selectAll} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-black">{selected.size === ranked.length ? 'Clear selection' : 'Select all visible'}</button><span className="text-xs font-bold text-slate-500">{selected.size} selected</span><div className="ml-auto flex gap-2"><button disabled={!selected.size} onClick={remove} className="rounded-lg border border-pink-200 px-3 py-2 text-xs font-black text-pink-700 disabled:opacity-40"><Trash2 className="mr-1 inline h-3.5 w-3.5" />Remove from group</button><button disabled={!selected.size} onClick={qualify} className="rounded-lg bg-[#173b67] px-3 py-2 text-xs font-black text-white disabled:opacity-40"><Check className="mr-1 inline h-3.5 w-3.5" />Qualify for interview</button></div></div><MemberTable members={ranked} selected={selected} toggle={toggle} showScore /></section>;
}

function InterviewWorkspace({ role, members, openMessage }: { role: string; members: Member[]; openMessage: (member: Member) => void }) {
  return <section className="product-surface overflow-hidden"><WorkspaceHeader eyebrow="Qualified candidates only" title={`${role} interview queue`} detail={`${members.length} candidates selected by your hiring team`} action={<Link to="/messages" className="product-button-secondary"><MessageSquareText className="h-4 w-4" />Open all messages</Link>} />{members.length ? <div className="grid gap-4 p-5 md:grid-cols-2">{members.map((member) => <article key={member.id} className="rounded-2xl border border-slate-200 p-5"><div className="flex items-start gap-3"><Avatar member={member} /><div className="min-w-0 flex-1"><h3 className="font-black">{member.name}</h3><p className="text-xs font-bold text-slate-500">{member.location}</p></div><strong className="text-[#173b67]">{member.score}%</strong></div><div className="mt-4 flex gap-2"><button onClick={() => openMessage(member)} className="product-button-primary flex-1"><Mail className="h-4 w-4" />Send announcement</button><button className="product-button-secondary px-3"><CalendarDays className="h-4 w-4" /></button></div></article>)}</div> : <EmptyState icon={<Video />} title="No candidates qualified yet" detail="Open Private results, select the strongest candidates, and choose “Qualify for interview.” They will appear here automatically." />}</section>;
}

function MemberTable({ members, selected, toggle, showScore }: { members: Member[]; selected: Set<string>; toggle: (id: string) => void; showScore: boolean }) {
  return <div className="max-h-[620px] overflow-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="sticky top-0 bg-slate-50 text-[.67rem] uppercase tracking-wider text-slate-500"><tr><th className="w-12 px-4 py-3">Select</th><th className="px-4">Candidate</th><th className="px-4">Location</th>{showScore && <><th className="px-4">Correctness</th><th className="px-4">Contribution</th><th className="px-4">Overall</th></>}<th className="px-4">Status</th></tr></thead><tbody>{members.map((member) => <tr key={member.id} className={`border-t border-slate-100 ${selected.has(member.id) ? 'bg-blue-50/60' : ''}`}><td className="px-4 py-4"><input type="checkbox" checked={selected.has(member.id)} onChange={() => toggle(member.id)} className="h-4 w-4 accent-[#173b67]" /></td><td className="px-4"><div className="flex items-center gap-3"><Avatar member={member} /><div><strong className="block">{member.name}</strong><small className="font-bold text-slate-500">{member.skills.slice(0, 2).join(' · ')}</small></div></div></td><td className="px-4 text-slate-500">{member.location}</td>{showScore && <><td className="px-4 font-bold">{member.correctness}%</td><td className="px-4 font-bold">{member.contribution}%</td><td className="px-4"><strong className="text-lg text-[#173b67]">{member.score}%</strong></td></>}<td className="px-4"><span className={`rounded-full px-2.5 py-1 text-xs font-black ${member.status === 'Qualified' ? 'bg-lime-50 text-green-700' : 'bg-blue-50 text-[#173b67]'}`}>{member.status}</span></td></tr>)}</tbody></table></div>;
}

function Toolbar({ query, setQuery, selected, total, selectAll, remove }: { query: string; setQuery: (value: string) => void; selected: number; total: number; selectAll: () => void; remove: () => void }) {
  return <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-4"><label className="relative min-w-64 flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search this position group" className="min-h-10 w-full rounded-xl border border-slate-200 pl-9 pr-3 text-sm font-semibold outline-none" /></label><button onClick={selectAll} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-black">{selected === total ? 'Clear selection' : 'Select all'}</button><button disabled={!selected} onClick={remove} className="rounded-lg border border-pink-200 px-3 py-2 text-xs font-black text-pink-700 disabled:opacity-40"><Trash2 className="mr-1 inline h-3.5 w-3.5" />Remove selected</button></div>;
}

function WorkspaceHeader({ eyebrow, title, detail, action }: { eyebrow: string; title: string; detail: string; action: ReactNode }) { return <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 p-5"><div><p className="product-eyebrow">{eyebrow}</p><h2 className="mt-2 text-xl font-black">{title}</h2><p className="mt-1 text-sm text-slate-500">{detail}</p></div>{action}</header>; }
function Mini({ value, label }: { value: string | number; label: string }) { return <div className="rounded-xl bg-slate-50 p-3 text-center"><strong className="block text-lg text-[#173b67]">{value}</strong><span className="text-[.65rem] font-bold text-slate-500">{label}</span></div>; }
function Avatar({ member }: { member: Member }) { return <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#173b67] text-xs font-black text-white">{member.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}</span>; }
function EmptyState({ icon, title, detail }: { icon: ReactNode; title: string; detail: string }) { return <div className="flex min-h-72 flex-col items-center justify-center p-8 text-center"><span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 [&>svg]:h-6 [&>svg]:w-6">{icon}</span><h3 className="mt-4 font-black">{title}</h3><p className="mt-2 max-w-md text-sm leading-6 text-slate-500">{detail}</p></div>; }
function Field({ label, children }: { label: string; children: ReactNode }) { return <label className="mt-4 block"><span className="text-xs font-black uppercase tracking-wider text-slate-500">{label}</span><div className="mt-2 [&>input]:min-h-11 [&>input]:w-full [&>input]:rounded-xl [&>input]:border [&>input]:border-slate-200 [&>input]:px-3 [&>input]:text-sm [&>input]:font-semibold [&>input]:outline-none">{children}</div></label>; }
function MessageModal({ candidate, value, setValue, close, send }: { candidate: Member; value: string; setValue: (value: string) => void; close: () => void; send: () => void }) { return <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#12213a]/45 p-4 sm:items-center"><section className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl"><header className="flex items-center gap-3 border-b border-slate-100 p-5"><Avatar member={candidate} /><div className="flex-1"><p className="product-eyebrow">Interview announcement</p><h2 className="font-black">{candidate.name}</h2></div><button onClick={close}><X className="h-5 w-5" /></button></header><div className="p-5"><textarea value={value} onChange={(event) => setValue(event.target.value)} className="min-h-36 w-full resize-none rounded-xl border border-slate-200 p-3 text-sm leading-6 outline-none" /><div className="mt-4 flex justify-end gap-2"><button onClick={close} className="product-button-secondary">Cancel</button><button disabled={!value.trim()} onClick={send} className="product-button-primary disabled:opacity-40"><Send className="h-4 w-4" />Send to candidate</button></div></div></section></div>; }
