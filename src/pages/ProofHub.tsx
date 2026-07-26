import { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Award, BadgeCheck, Check, ChevronRight, Clock3, Code2, FileUp, FlaskConical, Link2, Medal, Search, ShieldCheck, Sparkles, Target, Trophy, Users, X } from 'lucide-react';
import { getCareerPassport } from '../services/careerIntelligenceService';
import { PROOF_OPPORTUNITIES, proofService, type ProofCertificate, type ProofOpportunity, type ProofProgress } from '../services/proofService';
import { useStore } from '../store/StoreProvider';

type Filter = 'All' | 'Beginner' | 'Intermediate' | 'Advanced';
const difficultyTone = {
  Beginner: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  Intermediate: 'bg-amber-50 text-amber-700 border-amber-100',
  Advanced: 'bg-violet-50 text-violet-700 border-violet-100',
};

const employerGradients = ['from-blue-700 to-indigo-500', 'from-violet-700 to-fuchsia-500', 'from-cyan-700 to-blue-500', 'from-emerald-700 to-teal-500', 'from-slate-800 to-blue-700'];

function EmployerLogo({ item, large = false }: { item: ProofOpportunity; large?: boolean }) {
  const tone = employerGradients[item.employer.charCodeAt(0) % employerGradients.length];
  return <span className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br ${tone} text-white shadow-lg ring-1 ring-black/5 ${large ? 'h-16 w-16 text-base' : 'h-11 w-11 text-xs'}`}><span className="absolute -right-2 -top-2 h-7 w-7 rounded-full bg-white/15" /><strong className="relative tracking-[-0.04em]">{item.employerInitials}</strong><BadgeCheck className="absolute bottom-1 right-1 h-3 w-3 text-blue-100" /></span>;
}

function ProofCard({ item, progress, onStart, onComplete }: {
  key?: string; item: ProofOpportunity; progress: ProofProgress; onStart: (item: ProofOpportunity) => void; onComplete: (item: ProofOpportunity) => void;
}) {
  const completed = progress.completedIds.includes(item.id);
  const inProgress = progress.inProgressIds.includes(item.id);
  return (
    <motion.article layout className="group product-surface overflow-hidden p-5 transition hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(15,23,42,0.09)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <EmployerLogo item={item} />
          <div><p className="text-xs font-bold text-slate-500">{item.employer}</p><span className={'mt-1 inline-flex rounded-full border px-2 py-0.5 text-[0.65rem] font-extrabold ' + difficultyTone[item.difficulty]}>{item.difficulty}</span></div>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-black text-[#155eef]">+{item.points} pts</span>
      </div>
      <h2 className="mt-5 text-lg font-extrabold tracking-[-0.03em] text-slate-950 dark:text-white">{item.title}</h2>
      <p className="mt-2 min-h-12 text-sm leading-6 text-slate-500 dark:text-slate-400">{item.description}</p>
      <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-slate-500">
        <span className="rounded-lg bg-slate-100 px-2 py-1 dark:bg-slate-800">{item.skill}</span>
        <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 dark:bg-slate-800"><Clock3 className="h-3 w-3" />{item.duration}</span>
        <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 dark:bg-slate-800"><Users className="h-3 w-3" />{item.participants.toLocaleString()}</span>
      </div>
      <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
        <span className="text-xs font-bold text-slate-400">{item.deadline}</span>
        {completed ? <button onClick={() => onComplete(item)} className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-extrabold text-emerald-700 hover:bg-emerald-100"><Award className="h-4 w-4" /> View certificate</button>
          : inProgress ? <button onClick={() => onStart(item)} className="product-focus inline-flex items-center gap-1.5 rounded-xl bg-[#155eef] px-3 py-2 text-sm font-extrabold text-white hover:bg-[#0c3e9e]">Continue {item.type} <ArrowRight className="h-4 w-4" /></button>
            : <button onClick={() => onStart(item)} className="product-focus inline-flex items-center gap-1.5 rounded-xl bg-[#12213a] px-3 py-2 text-sm font-extrabold text-white hover:bg-[#1d3353]">Start {item.type} <ChevronRight className="h-4 w-4" /></button>}
      </div>
    </motion.article>
  );
}

function WorkModal({ item, certificate, onClose, onSubmit }: {
  item: ProofOpportunity;
  certificate?: ProofCertificate;
  onClose: () => void;
  onSubmit: (summary: string) => void;
}) {
  const [summary, setSummary] = useState('');
  const [workUrl, setWorkUrl] = useState('');
  const [answer, setAnswer] = useState('');
  const isTest = item.type === 'test';
  const canSubmit = isTest ? answer.trim().length >= 40 : summary.trim().length >= 40 && workUrl.trim().length >= 8;

  return <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#071426]/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="proof-dialog-title">
    <motion.div initial={{ opacity: 0, y: 18, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] bg-white shadow-[0_35px_100px_rgba(0,0,0,0.35)]">
      {certificate ? <div className="p-6 sm:p-9">
        <div className="flex items-start justify-between"><div className="flex items-center gap-4"><EmployerLogo item={item} large /><div><p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#155eef]">{isTest ? 'Employer-issued credential' : 'JobX-issued credential'}</p><p className="mt-1 text-sm font-bold text-slate-500">{certificate.employer}</p></div></div><button onClick={onClose} aria-label="Close certificate" className="rounded-full bg-slate-100 p-2 text-slate-500"><X className="h-5 w-5" /></button></div>
        <div className="mt-8 rounded-[1.5rem] border-2 border-[#155eef]/15 bg-[radial-gradient(circle_at_top_right,rgba(21,94,239,0.12),transparent_40%),linear-gradient(135deg,#fff,#f8fbff)] p-6 text-center sm:p-9">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#155eef] text-white shadow-xl shadow-blue-500/25"><Award className="h-8 w-8" /></span>
          <p className="mt-5 text-xs font-black uppercase tracking-[0.22em] text-[#155eef]">Certificate of verified work</p>
          <h2 id="proof-dialog-title" className="mt-3 text-2xl font-black tracking-[-0.04em] text-slate-950">{certificate.title}</h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-500">Awarded to <strong className="text-slate-800">Alex Rivera</strong> for completing a verified {item.type} demonstrating capability in <strong className="text-slate-800">{certificate.skill}</strong>.</p>
          <div className="mx-auto mt-6 grid max-w-md grid-cols-2 gap-3 text-left"><div className="rounded-xl bg-white p-3 shadow-sm"><p className="text-[0.65rem] font-bold uppercase text-slate-400">Issued</p><p className="mt-1 text-sm font-extrabold text-slate-800">{new Date(certificate.issuedAt).toLocaleDateString()}</p></div><div className="rounded-xl bg-white p-3 shadow-sm"><p className="text-[0.65rem] font-bold uppercase text-slate-400">Proof awarded</p><p className="mt-1 text-sm font-extrabold text-[#155eef]">+{certificate.points} points</p></div></div>
          <p className="mt-6 font-mono text-[0.68rem] font-bold tracking-wider text-slate-400">{certificate.credentialId}</p>
        </div>
        <button onClick={onClose} className="mt-5 w-full rounded-xl bg-[#12213a] px-4 py-3 text-sm font-extrabold text-white">Done</button>
      </div> : <>
        <div className="border-b border-slate-100 p-6 sm:px-8">
          <div className="flex items-start justify-between gap-4"><div className="flex items-center gap-4"><EmployerLogo item={item} large /><div><p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#155eef]">{item.employer} · {item.type}</p><h2 id="proof-dialog-title" className="mt-1 text-xl font-black tracking-[-0.035em] text-slate-950">{item.title}</h2></div></div><button onClick={onClose} aria-label="Close submission form" className="rounded-full bg-slate-100 p-2 text-slate-500"><X className="h-5 w-5" /></button></div>
        </div>
        <form onSubmit={(event) => { event.preventDefault(); if (canSubmit) onSubmit(isTest ? answer : summary); }} className="p-6 sm:p-8">
          <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4"><p className="text-xs font-extrabold uppercase tracking-[0.1em] text-[#155eef]">Brief</p><p className="mt-2 text-sm leading-6 text-slate-700">{item.description}</p><div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-slate-500"><span>{item.skill}</span><span>•</span><span>{item.duration}</span><span>•</span><span>+{item.points} verified points</span></div></div>
          {isTest ? <div className="mt-6"><label className="text-sm font-extrabold text-slate-800" htmlFor="test-answer">Assessment response</label><p className="mt-1 text-xs leading-5 text-slate-500">Explain your approach, the trade-offs you considered, and how you would validate the result.</p><textarea id="test-answer" value={answer} onChange={(event) => setAnswer(event.target.value)} rows={8} placeholder="Write your structured response here…" className="mt-3 w-full rounded-xl border border-slate-200 p-4 text-sm leading-6 outline-none focus:border-[#155eef] focus:ring-4 focus:ring-blue-100" /></div>
            : <><div className="mt-6"><label className="text-sm font-extrabold text-slate-800" htmlFor="submission-summary">What did you create?</label><textarea id="submission-summary" value={summary} onChange={(event) => setSummary(event.target.value)} rows={5} placeholder="Describe your approach, decisions, and measurable outcome…" className="mt-2 w-full rounded-xl border border-slate-200 p-4 text-sm leading-6 outline-none focus:border-[#155eef] focus:ring-4 focus:ring-blue-100" /></div><div className="mt-5"><label className="text-sm font-extrabold text-slate-800" htmlFor="work-url">Work or repository link</label><div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-200 px-3 focus-within:border-[#155eef] focus-within:ring-4 focus-within:ring-blue-100"><Link2 className="h-4 w-4 text-slate-400" /><input id="work-url" value={workUrl} onChange={(event) => setWorkUrl(event.target.value)} placeholder="https://…" className="min-h-12 flex-1 bg-transparent text-sm outline-none" /></div></div><div className="mt-4 flex items-center gap-3 rounded-xl border border-dashed border-slate-300 p-4 text-sm font-semibold text-slate-500"><FileUp className="h-5 w-5 text-[#155eef]" />Supporting files can be attached after initial review</div></>}
          <div className="mt-7 flex items-center justify-between gap-4 border-t border-slate-100 pt-5"><p className="max-w-sm text-xs leading-5 text-slate-500"><ShieldCheck className="mr-1 inline h-3.5 w-3.5 text-[#155eef]" />Submission is reviewed and verified by {item.employer}.</p><button type="submit" disabled={!canSubmit} className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#155eef] px-5 py-3 text-sm font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-40">Submit for review <ArrowRight className="h-4 w-4" /></button></div>
        </form>
      </>}
    </motion.div>
  </div>;
}

export default function ProofHub() {
  const location = useLocation();
  const store = useStore();
  const isTests = location.pathname === '/tests';
  const [filter, setFilter] = useState<Filter>('All');
  const [query, setQuery] = useState('');
  const [progress, setProgress] = useState(() => proofService.getProgress());
  const [showEarned, setShowEarned] = useState<string | null>(null);
  const [activeItem, setActiveItem] = useState<ProofOpportunity | null>(null);
  const [activeCertificate, setActiveCertificate] = useState<ProofCertificate | undefined>();
  const passport = getCareerPassport(store.user);
  const points = proofService.getEarnedPoints(progress);
  const items = useMemo(() => PROOF_OPPORTUNITIES.filter((item) => {
    const q = query.trim().toLowerCase();
    return (isTests ? item.type === 'test' : item.type !== 'test') && (filter === 'All' || item.difficulty === filter) && (!q || `${item.title} ${item.employer} ${item.skill}`.toLowerCase().includes(q));
  }), [filter, isTests, query]);

  const openWork = (item: ProofOpportunity) => {
    setProgress(proofService.start(item.id));
    setActiveCertificate(undefined);
    setActiveItem(item);
  };
  const openCertificate = (item: ProofOpportunity) => {
    setActiveCertificate(proofService.getCertificate(item.id, progress));
    setActiveItem(item);
  };
  const handleComplete = (summary: string) => {
    if (!activeItem) return;
    const updated = proofService.complete(activeItem.id, summary);
    setProgress(updated);
    setActiveCertificate(proofService.getCertificate(activeItem.id, updated));
    setShowEarned(`${activeItem.title} added +${activeItem.points} proof points to your Career Passport.`);
    window.setTimeout(() => setShowEarned(null), 4000);
  };

  return (
    <div className="w-full pb-10">
      {showEarned && <div role="status" className="fixed right-5 top-20 z-[60] max-w-sm rounded-2xl border border-emerald-200 bg-white p-4 text-sm font-bold text-emerald-800 shadow-2xl"><span className="flex gap-2"><BadgeCheck className="h-5 w-5 shrink-0" />{showEarned}</span></div>}
      {activeItem && <WorkModal item={activeItem} certificate={activeCertificate} onClose={() => { setActiveItem(null); setActiveCertificate(undefined); }} onSubmit={handleComplete} />}
      <section className="relative overflow-hidden rounded-[2rem] bg-[#12213a] px-5 py-7 text-white sm:px-8 lg:px-10 lg:py-10">
        <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[#155eef]/45 blur-3xl" />
        <div className="relative grid gap-8 lg:grid-cols-[1fr_22rem] lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.12em] text-blue-200">{isTests ? <FlaskConical className="h-4 w-4" /> : <Target className="h-4 w-4" />} Proof, not purchases</span>
            <h1 className="mt-5 max-w-3xl text-3xl font-black tracking-[-0.05em] sm:text-4xl">{isTests ? 'Skill tests that show how you think.' : 'Build proof through JobX projects.'}</h1>
            <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-slate-300 sm:text-base">{isTests ? 'Complete practical employer assessments. Results become verified evidence in your Career Passport.' : 'Solve projects created by JobX and contribute to open challenges. Every finished outcome strengthens your Career Passport.'}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/projects" className={'product-focus rounded-xl px-4 py-2.5 text-sm font-extrabold ' + (!isTests ? 'bg-white text-[#12213a]' : 'border border-white/20 bg-white/10 text-white')}>JobX projects</Link>
              <Link to="/community-projects" className="product-focus rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-extrabold text-white">Community projects</Link>
              <Link to="/tests" className={'product-focus rounded-xl px-4 py-2.5 text-sm font-extrabold ' + (isTests ? 'bg-white text-[#12213a]' : 'border border-white/20 bg-white/10 text-white')}>Skill tests</Link>
            </div>
          </div>
          <div className="rounded-[1.5rem] border border-white/15 bg-white/[0.08] p-5 backdrop-blur">
            <div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.12em] text-blue-200">Career Passport</p><p className="mt-1 text-sm text-white/70">Earned verification</p></div><ShieldCheck className="h-7 w-7 text-blue-200" /></div>
            <div className="mt-5 flex items-end justify-between"><strong className="text-4xl font-black tracking-[-0.06em]">{passport.score}%</strong><span className="text-sm font-bold text-blue-200">{points} proof points</span></div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-blue-400 transition-all" style={{ width: `${passport.score}%` }} /></div>
            <p className="mt-3 text-xs leading-5 text-slate-300">Verification cannot be bought. It grows from completed work and meaningful contributions.</p>
          </div>
        </div>
      </section>
      <section className="mt-5 grid gap-3 sm:grid-cols-3">
        {[{ icon: Trophy, label: 'Proof points earned', value: points }, { icon: BadgeCheck, label: 'Verified outcomes', value: progress.completedIds.length }, { icon: Sparkles, label: 'In progress', value: progress.inProgressIds.length }].map((metric) => <article key={metric.label} className="product-surface flex items-center gap-4 p-4"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-[#155eef]"><metric.icon className="h-5 w-5" /></span><div><p className="text-2xl font-black text-slate-950 dark:text-white">{metric.value}</p><p className="text-xs font-bold text-slate-500">{metric.label}</p></div></article>)}
      </section>
      <section className="mt-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div><p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#155eef]">{isTests ? 'Assessment library' : 'Project board'}</p><h2 className="mt-1 text-2xl font-extrabold tracking-[-0.04em] text-slate-950 dark:text-white">{isTests ? 'Employer skill tests' : 'Projects & challenges by JobX'}</h2></div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm"><Search className="h-4 w-4 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search projects or skills" className="w-full bg-transparent text-sm outline-none sm:w-52" /></label>
            <div className="flex gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1">{(['All', 'Beginner', 'Intermediate', 'Advanced'] as Filter[]).map((item) => <button key={item} onClick={() => setFilter(item)} className={'rounded-lg px-3 py-2 text-xs font-bold ' + (filter === item ? 'bg-[#12213a] text-white' : 'text-slate-500 hover:bg-slate-50')}>{item}</button>)}</div>
          </div>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{items.map((item) => <ProofCard key={item.id} item={item} progress={progress} onStart={openWork} onComplete={openCertificate} />)}</div>
        {!items.length && <div className="product-surface mt-5 py-14 text-center"><Code2 className="mx-auto h-8 w-8 text-slate-300" /><p className="mt-3 font-bold text-slate-700">No opportunities match that search.</p></div>}
      </section>
      <section className="mt-8 flex flex-col gap-4 rounded-[1.5rem] border border-blue-100 bg-blue-50/70 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3"><Medal className="mt-0.5 h-6 w-6 shrink-0 text-[#155eef]" /><div><h2 className="font-extrabold text-slate-950">Your work stays yours</h2><p className="mt-1 text-sm leading-6 text-slate-600">Employers see the verified skill, contribution, and outcome—not a badge you paid for.</p></div></div>
        <Link to="/profile" className="product-focus inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#155eef] px-4 py-2.5 text-sm font-extrabold text-white">View Career Passport <ArrowRight className="h-4 w-4" /></Link>
      </section>
    </div>
  );
}
