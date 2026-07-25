import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Check,
  ChevronRight,
  CircleCheckBig,
  Clock3,
  Code2,
  DollarSign,
  Globe2,
  Layers3,
  MapPin,
  Menu,
  MessageCircleMore,
  Play,
  Quote,
  Search,
  ShieldCheck,
  Star,
  TrendingUp,
  Users,
  X,
  Zap,
} from 'lucide-react';
import BrandLogo from '../components/BrandLogo';

const proofPoints = [
  { value: '92%', label: 'find salary transparency useful' },
  { value: '4.8×', label: 'stronger signal from proof of work' },
  { value: '< 7 days', label: 'typical employer response window' },
];

const journeySteps = [
  {
    number: '01',
    title: 'Build your signal',
    copy: 'Turn projects, skills and real outcomes into a profile that speaks before your résumé does.',
    icon: Layers3,
  },
  {
    number: '02',
    title: 'Find the right fit',
    copy: 'See salary, team context and skill match upfront—then apply to roles that actually make sense.',
    icon: Search,
  },
  {
    number: '03',
    title: 'Never get ghosted',
    copy: 'Follow each application from sent to decision with clear status changes and response deadlines.',
    icon: Zap,
  },
];

const companies = ['LUMEN', 'NORTHSTAR', 'WAVELAB', 'MONO', 'ORBIT', 'ARC'];

export default function Landing() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const goToSignUp = () => navigate('/signup');

  return (
    <div className="min-h-screen overflow-hidden bg-[#F8F3F0] text-slate-950">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 text-slate-950 shadow-[0_10px_40px_rgba(15,23,42,0.035)] backdrop-blur-2xl">
        <div className="mx-auto flex h-[4.75rem] w-[min(100%-2rem,78rem)] items-center justify-between">
          <button onClick={() => navigate('/landing')} className="product-focus inline-flex items-center gap-2.5 rounded-xl" aria-label="JobX home">
            <BrandLogo className="h-10 w-10" />
          </button>

          <nav className="hidden items-center gap-8 md:flex" aria-label="Marketing navigation">
            <a href="#features" className="product-focus rounded-md text-sm font-semibold text-slate-600 transition hover:text-slate-950">Why JobX</a>
            <a href="#how-it-works" className="product-focus rounded-md text-sm font-semibold text-slate-600 transition hover:text-slate-950">How it works</a>
            <a href="#for-teams" className="product-focus rounded-md text-sm font-semibold text-slate-600 transition hover:text-slate-950">For teams</a>
          </nav>

          <div className="hidden items-center gap-3 sm:flex">
            <button onClick={() => navigate('/signin')} className="product-focus rounded-xl px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-blue-50 hover:text-[#014BAA]">Sign in</button>
            <button onClick={goToSignUp} className="product-focus inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#014BAA] px-4 py-2.5 text-sm font-extrabold text-white shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5 hover:bg-[#013b86]">
              Join JobX <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <button onClick={() => setMenuOpen((open) => !open)} aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} className="product-focus rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-700 sm:hidden">
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {menuOpen && (
          <nav className="mx-auto grid w-[min(100%-2rem,78rem)] gap-1 border-t border-slate-200 py-3 sm:hidden" aria-label="Mobile marketing navigation">
            {[
              ['Why JobX', '#features'],
              ['How it works', '#how-it-works'],
              ['For teams', '#for-teams'],
            ].map(([label, href]) => (
              <a key={href} href={href} onClick={() => setMenuOpen(false)} className="rounded-xl px-3 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-100">{label}</a>
            ))}
            <button onClick={() => navigate('/signin')} className="rounded-xl px-3 py-2.5 text-left text-sm font-bold text-slate-700 transition hover:bg-slate-100">Sign in</button>
            <button onClick={goToSignUp} className="mt-1 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#014BAA] px-4 text-sm font-extrabold text-white">Create account <ArrowRight className="h-4 w-4" /></button>
          </nav>
        )}
      </header>

      <main>
        <section className="relative isolate overflow-hidden bg-[linear-gradient(180deg,#ffffff_0%,#F8F3F0_100%)] text-slate-950">
          <div aria-hidden="true" className="absolute inset-0 opacity-60 [background-image:linear-gradient(rgba(1,75,170,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(1,75,170,0.035)_1px,transparent_1px)] [background-size:72px_72px]" />
          <div aria-hidden="true" className="absolute -left-40 top-16 h-[32rem] w-[32rem] rounded-full bg-blue-200/45 blur-[110px]" />
          <div aria-hidden="true" className="absolute -right-32 top-0 h-[34rem] w-[34rem] rounded-full bg-blue-100/70 blur-[120px]" />
          <div aria-hidden="true" className="absolute bottom-0 left-1/2 h-48 w-[54rem] -translate-x-1/2 rounded-full bg-[#014BAA]/10 blur-[100px]" />

          <div className="relative mx-auto grid min-h-[calc(100vh-4.75rem)] w-[min(100%-2rem,78rem)] items-center gap-14 py-16 lg:grid-cols-[minmax(0,1.02fr)_minmax(28rem,0.98fr)] lg:gap-14 lg:py-20">
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-3 py-1.5 text-xs font-bold text-[#014BAA] shadow-sm backdrop-blur-xl">
                <span className="landing-pulse-dot" aria-hidden="true" />
                The career workspace built for outcomes
                <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
              </div>

              <h1 className="mt-7 max-w-[44rem] text-[3.25rem] font-extrabold leading-[0.96] tracking-[-0.067em] sm:text-[4.5rem] lg:text-[5.35rem]">
                Your work should
                <span className="relative block bg-gradient-to-r from-[#014BAA] via-[#155eef] to-[#3b82f6] bg-clip-text pb-3 text-transparent">
                  open doors.
                  <svg aria-hidden="true" viewBox="0 0 420 24" preserveAspectRatio="none" className="absolute -bottom-0.5 left-1 h-3 w-[82%] text-[#014BAA]/25 sm:h-4">
                    <motion.path d="M4 15 C 92 4, 224 5, 416 13" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 0.9, delay: 0.65 }} />
                  </svg>
                </span>
              </h1>
              <p className="mt-6 max-w-xl text-base font-medium leading-7 text-slate-600 sm:text-lg sm:leading-8">
                JobX puts skills before résumés, salary before guesswork and a real response before the application black hole.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <button onClick={goToSignUp} className="product-focus group inline-flex min-h-13 items-center justify-center gap-2 rounded-2xl bg-[#014BAA] px-6 py-3.5 text-sm font-extrabold text-white shadow-[0_16px_40px_rgba(1,75,170,0.22)] transition hover:-translate-y-1 hover:bg-[#013b86] hover:shadow-[0_20px_48px_rgba(1,75,170,0.3)]">
                  Find your next move <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
                <a href="#how-it-works" className="product-focus inline-flex min-h-13 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-extrabold text-slate-900 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:bg-blue-50">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#014BAA] text-white"><Play className="ml-0.5 h-3 w-3 fill-current" /></span>
                  See how it works
                </a>
              </div>

              <div className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-4 border-t border-slate-200 pt-6">
                <div className="flex -space-x-2">
                  {['MC', 'AR', 'SK', 'JL'].map((initials, index) => (
                    <span key={initials} className={`flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#F8F3F0] text-[0.65rem] font-extrabold text-white ${['bg-[#014BAA]', 'bg-[#2563eb]', 'bg-[#475569]', 'bg-[#60a5fa]'][index]}`}>{initials}</span>
                  ))}
                </div>
                <div>
                  <div className="flex gap-0.5 text-amber-300">{Array.from({ length: 5 }).map((_, index) => <Star key={index} className="h-3.5 w-3.5 fill-current" />)}</div>
                  <p className="mt-1 text-xs font-semibold text-slate-500"><span className="text-slate-950">12,000+</span> people building career momentum</p>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 24, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.65, delay: 0.08 }} className="relative mx-auto w-full max-w-[37rem] lg:max-w-none">
              <div className="absolute -inset-5 rounded-[2.5rem] bg-blue-300/25 blur-2xl" />
              <div className="landing-dashboard-frame landing-shine relative overflow-hidden rounded-[2rem] border border-white bg-white/65 p-3 shadow-[0_32px_90px_rgba(15,23,42,0.16)] backdrop-blur-2xl sm:p-4">
                <div className="mb-3 flex items-center justify-between px-2 py-1">
                  <div className="flex gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-rose-400" /><span className="h-2.5 w-2.5 rounded-full bg-amber-300" /><span className="h-2.5 w-2.5 rounded-full bg-emerald-400" /></div>
                  <div className="flex items-center gap-1.5 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-slate-500"><ShieldCheck className="h-3.5 w-3.5 text-[#014BAA]" /> Profile completion</div>
                </div>

                <div className="overflow-hidden rounded-[1.4rem] bg-[#f8fafc] text-slate-950 shadow-2xl">
                  <div className="relative overflow-hidden bg-gradient-to-br from-[#eef4ff] via-white to-[#F8F3F0] px-5 pb-5 pt-6 sm:px-6">
                    <div aria-hidden="true" className="absolute -right-16 -top-20 h-52 w-52 rounded-full bg-blue-300/35 blur-3xl" />
                    <div className="relative flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#014BAA] to-[#3b82f6] text-base font-black text-white shadow-lg shadow-blue-500/20">MK<span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-[#014BAA]"><BadgeCheck className="h-3 w-3" /></span></div>
                        <div><p className="text-base font-extrabold tracking-[-0.03em]">Maya Kim</p><p className="mt-0.5 text-xs font-semibold text-slate-500">Product Designer · Singapore</p></div>
                      </div>
                      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[0.65rem] font-extrabold text-emerald-700">OPEN TO WORK</span>
                    </div>

                    <div className="relative mt-6 rounded-2xl border border-white/80 bg-white/80 p-4 shadow-sm backdrop-blur-xl">
                      <div className="flex items-end justify-between"><div><p className="text-[0.65rem] font-extrabold uppercase tracking-[0.13em] text-slate-400">Profile completion</p><p className="mt-1 text-sm font-extrabold">Your profile is nearly complete</p></div><p className="text-2xl font-black tracking-[-0.06em] text-[#155eef]">94<span className="text-xs">%</span></p></div>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100"><motion.div initial={{ width: 0 }} animate={{ width: '94%' }} transition={{ duration: 1.1, delay: 0.5 }} className="h-full rounded-full bg-gradient-to-r from-[#014BAA] to-[#60a5fa]" /></div>
                      <div className="mt-3 flex flex-wrap gap-2"><span className="rounded-lg bg-blue-50 px-2 py-1 text-[0.65rem] font-bold text-blue-700">Product strategy</span><span className="rounded-lg bg-blue-50 px-2 py-1 text-[0.65rem] font-bold text-blue-700">Figma</span><span className="rounded-lg bg-blue-50 px-2 py-1 text-[0.65rem] font-bold text-blue-700">Design systems</span></div>
                    </div>
                  </div>

                  <div className="grid gap-3 p-4 sm:grid-cols-[1fr_0.82fr] sm:p-5">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <div className="flex items-center justify-between"><div className="flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#0f172a] text-[0.65rem] font-black text-white">NS</span><div><p className="text-xs font-extrabold">Northstar Labs</p><p className="text-[0.65rem] font-medium text-slate-400">Lead Product Designer</p></div></div><span className="text-[0.65rem] font-extrabold text-emerald-600">IN REVIEW</span></div>
                      <div className="mt-5 flex items-center">
                        {['done', 'active', 'next'].map((state, index) => <div key={state} className="contents"><span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${state === 'done' ? 'bg-[#155eef] text-white' : state === 'active' ? 'border-2 border-[#155eef] bg-white' : 'border-2 border-slate-200 bg-white'}`}>{state === 'done' ? <Check className="h-3 w-3" /> : state === 'active' ? <span className="h-1.5 w-1.5 rounded-full bg-[#155eef]" /> : null}</span>{index < 2 && <span className={`h-0.5 flex-1 ${index === 0 ? 'bg-[#155eef]' : 'bg-slate-200'}`} />}</div>)}
                      </div>
                      <div className="mt-3 flex justify-between text-[0.6rem] font-bold text-slate-400"><span>Applied</span><span className="text-[#155eef]">Review</span><span>Decision</span></div>
                      <div className="mt-4 flex items-center justify-between rounded-xl bg-amber-50 px-3 py-2"><span className="flex items-center gap-1.5 text-[0.65rem] font-bold text-amber-800"><Clock3 className="h-3.5 w-3.5" /> Response due</span><span className="text-[0.65rem] font-extrabold text-amber-900">2 days</span></div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-1">
                      <div className="rounded-2xl bg-[#12213a] p-4 text-white"><div className="flex items-center justify-between"><span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10"><TrendingUp className="h-4 w-4 text-blue-200" /></span><span className="text-[0.6rem] font-bold text-emerald-300">+12%</span></div><p className="mt-4 text-2xl font-black tracking-[-0.06em]">27</p><p className="mt-0.5 text-[0.65rem] font-semibold text-slate-400">Profile views this week</p></div>
                      <div className="rounded-2xl border border-slate-200 bg-white p-4"><div className="flex items-center gap-2 text-[0.65rem] font-extrabold text-slate-500"><DollarSign className="h-4 w-4 text-[#155eef]" /> Salary clarity</div><p className="mt-3 text-sm font-black tracking-[-0.04em]">$135k–$160k</p><p className="mt-1 text-[0.6rem] font-semibold text-slate-400">Visible before applying</p></div>
                    </div>
                  </div>
                </div>
              </div>

              <motion.div animate={{ y: [0, 7, 0] }} transition={{ duration: 4.6, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }} className="absolute -left-7 bottom-[15%] hidden items-center gap-3 rounded-2xl border border-blue-100 bg-white/95 p-3 text-slate-950 shadow-[0_18px_48px_rgba(15,23,42,0.16)] backdrop-blur-xl lg:flex">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-[#014BAA]"><Search className="h-4 w-4" /></span>
                <div><p className="text-[0.62rem] font-black uppercase tracking-[0.12em] text-[#014BAA]">Just for you</p><p className="mt-0.5 text-xs font-extrabold">3 new high-fit roles</p></div>
              </motion.div>

              <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} className="absolute -right-3 top-[23%] hidden rounded-2xl border border-blue-100 bg-white px-3 py-2.5 text-slate-950 shadow-2xl sm:flex sm:items-center sm:gap-2.5 lg:-right-8">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700"><CircleCheckBig className="h-4 w-4" /></span><div><p className="text-[0.65rem] font-black uppercase tracking-wide text-emerald-600">Update</p><p className="text-xs font-extrabold">Interview unlocked</p></div>
              </motion.div>
            </motion.div>
          </div>

          <div className="relative border-t border-slate-200 bg-white/65">
            <div className="mx-auto flex w-[min(100%-2rem,78rem)] flex-col gap-5 py-6 md:flex-row md:items-center md:justify-between">
              <p className="text-[0.65rem] font-extrabold uppercase tracking-[0.18em] text-slate-500">Teams building better hiring with JobX</p>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 sm:gap-x-9">{companies.map((company) => <span key={company} className="landing-logo-chip text-xs font-black tracking-[0.12em] text-slate-400 transition-colors hover:text-slate-700">{company}</span>)}</div>
            </div>
          </div>
        </section>

        <section id="features" className="relative py-20 sm:py-28">
          <div aria-hidden="true" className="absolute left-1/2 top-12 h-64 w-[48rem] -translate-x-1/2 rounded-full bg-blue-200/30 blur-[100px]" />
          <div className="relative mx-auto w-[min(100%-2rem,78rem)]">
            <div className="mx-auto max-w-3xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-[0.68rem] font-extrabold uppercase tracking-[0.13em] text-blue-700"><TrendingUp className="h-3.5 w-3.5" /> A better way to move forward</span>
              <h2 className="mt-5 text-4xl font-extrabold leading-[1.02] tracking-[-0.058em] text-slate-950 sm:text-6xl">Everything that matters.<br /><span className="text-slate-400">Nothing that wastes your time.</span></h2>
              <p className="mx-auto mt-5 max-w-2xl text-base font-medium leading-7 text-slate-600">Built around the moments that make or break a career move—from discovery to the final decision.</p>
            </div>

            <div className="mt-14 grid gap-4 lg:grid-cols-12">
              <article className="landing-polish-card group relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] sm:p-8 lg:col-span-7">
                <div aria-hidden="true" className="absolute -right-24 -top-28 h-72 w-72 rounded-full bg-blue-100 blur-3xl transition group-hover:bg-blue-200" />
                <div className="relative max-w-md"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#155eef] text-white shadow-lg shadow-blue-500/20"><BarChart3 className="h-5 w-5" /></span><h3 className="mt-8 text-2xl font-extrabold tracking-[-0.045em] text-slate-950">The application tracker that actually tells you something.</h3><p className="mt-3 text-sm font-medium leading-6 text-slate-600">Live stages, response commitments and the next action—visible in one calm, accountable timeline.</p></div>
                <div className="relative mt-9 rounded-[1.4rem] border border-slate-200 bg-slate-50 p-4 sm:p-5">
                  <div className="mb-5 flex items-center justify-between"><div><p className="text-xs font-extrabold text-slate-950">Your active applications</p><p className="mt-1 text-[0.65rem] font-semibold text-slate-400">3 applications · all on track</p></div><span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[0.65rem] font-extrabold text-emerald-700">100% responses</span></div>
                  <div className="space-y-2.5">{[
                    ['NL', 'Northstar Labs', 'Interview', 'Tomorrow', 'bg-[#0f172a]'],
                    ['WX', 'Wave X', 'In review', '2 days', 'bg-[#014BAA]'],
                    ['MO', 'Mono Studio', 'Applied', '5 days', 'bg-[#60a5fa]'],
                  ].map(([initials, company, status, due, color]) => <div key={company} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3"><span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[0.65rem] font-black text-white ${color}`}>{initials}</span><div className="min-w-0 flex-1"><p className="truncate text-xs font-extrabold text-slate-900">{company}</p><p className="mt-0.5 text-[0.65rem] font-semibold text-slate-400">{status}</p></div><span className="text-[0.65rem] font-extrabold text-[#155eef]">{due}</span></div>)}
                  </div>
                </div>
              </article>

              <article className="landing-polish-card relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#12213a] via-[#123669] to-[#014BAA] p-6 text-white shadow-[0_24px_70px_rgba(15,23,42,0.18)] sm:p-8 lg:col-span-5">
                <div aria-hidden="true" className="absolute -right-20 top-10 h-56 w-56 rounded-full bg-blue-400/25 blur-3xl" />
                <span className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-blue-200 ring-1 ring-white/15"><Code2 className="h-5 w-5" /></span>
                <h3 className="relative mt-8 text-2xl font-extrabold tracking-[-0.045em]">Proof beats buzzwords.</h3>
                <p className="relative mt-3 text-sm font-medium leading-6 text-slate-300">Show the projects behind your skills and let your actual work lead the conversation.</p>
                <div className="relative mt-9 rounded-[1.4rem] border border-white/10 bg-white/[0.07] p-4 backdrop-blur-xl">
                  <div className="flex items-center justify-between"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#014BAA]"><Globe2 className="h-5 w-5" /></span><div><p className="text-xs font-extrabold">Fintech design system</p><p className="mt-0.5 text-[0.65rem] font-medium text-slate-400">Case study · 8 min read</p></div></div><BadgeCheck className="h-5 w-5 text-blue-200" /></div>
                  <div className="mt-5 grid grid-cols-3 gap-2"><div className="h-20 rounded-xl bg-gradient-to-br from-blue-300/80 to-blue-600/40" /><div className="h-20 rounded-xl bg-gradient-to-br from-blue-400/70 to-[#014BAA]/50" /><div className="h-20 rounded-xl bg-gradient-to-br from-slate-300/70 to-slate-600/40" /></div>
                  <div className="mt-4 flex gap-2"><span className="rounded-lg bg-white/10 px-2 py-1 text-[0.62rem] font-bold text-blue-100">UX Research</span><span className="rounded-lg bg-white/10 px-2 py-1 text-[0.62rem] font-bold text-blue-100">Systems</span><span className="rounded-lg bg-white/10 px-2 py-1 text-[0.62rem] font-bold text-blue-100">Figma</span></div>
                </div>
              </article>

              <article className="landing-polish-card relative overflow-hidden rounded-[2rem] border border-slate-200 bg-[#F8F3F0] p-6 sm:p-8 lg:col-span-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#014BAA] text-white shadow-lg shadow-blue-500/20"><DollarSign className="h-5 w-5" /></span>
                <h3 className="mt-8 text-2xl font-extrabold tracking-[-0.045em] text-slate-950">Know your worth before you apply.</h3>
                <p className="mt-3 text-sm font-medium leading-6 text-slate-600">Every role starts with a real salary range. No awkward reveal at the finish line.</p>
                <div className="mt-8 rounded-2xl border border-blue-100 bg-white/80 p-4"><p className="text-[0.65rem] font-extrabold uppercase tracking-[0.12em] text-[#014BAA]">Market range</p><p className="mt-2 text-3xl font-black tracking-[-0.06em] text-slate-950">$120k–$148k</p><div className="mt-4 h-2 rounded-full bg-blue-100"><div className="ml-[18%] h-2 w-[58%] rounded-full bg-gradient-to-r from-[#014BAA] to-[#60a5fa]" /></div><div className="mt-2 flex justify-between text-[0.6rem] font-bold text-slate-400"><span>$90k</span><span>$170k</span></div></div>
              </article>

              <article className="landing-polish-card relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 sm:p-8 lg:col-span-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#014BAA] text-white shadow-lg shadow-blue-500/20"><Layers3 className="h-5 w-5" /></span>
                <h3 className="mt-8 text-2xl font-extrabold tracking-[-0.045em] text-slate-950">Know your next best move.</h3>
                <p className="mt-3 text-sm font-medium leading-6 text-slate-600">Turn your skill gaps and target roles into a focused, practical career roadmap.</p>
                <div className="mt-8 rounded-2xl bg-gradient-to-br from-[#eef4ff] to-[#F8F3F0] p-4"><div className="flex items-center justify-between"><span className="text-[0.65rem] font-black uppercase tracking-[0.12em] text-[#014BAA]">Career roadmap</span><span className="rounded-full bg-white px-2 py-1 text-[0.6rem] font-extrabold text-emerald-700">3 actions ready</span></div><div className="mt-4 space-y-2">{['Strengthen TypeScript proof', 'Add one measurable outcome', 'Target 92% match roles'].map((item, index) => <div key={item} className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-50 text-[0.6rem] text-[#014BAA]">{index + 1}</span>{item}</div>)}</div></div>
              </article>

              <article className="landing-polish-card relative overflow-hidden rounded-[2rem] border border-blue-100 bg-blue-50 p-6 sm:p-8 lg:col-span-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#014BAA] text-white shadow-lg shadow-blue-500/20"><MessageCircleMore className="h-5 w-5" /></span>
                <h3 className="mt-8 text-2xl font-extrabold tracking-[-0.045em] text-slate-950">Humans on both sides.</h3>
                <p className="mt-3 text-sm font-medium leading-6 text-slate-600">Connect directly, ask better questions and keep each conversation attached to real context.</p>
                <div className="mt-8 space-y-2.5"><div className="mr-8 rounded-2xl rounded-bl-md bg-white px-3 py-2.5 text-xs font-semibold text-slate-600 shadow-sm">Your case study really stood out. Open to a quick chat?</div><div className="ml-8 rounded-2xl rounded-br-md bg-[#014BAA] px-3 py-2.5 text-xs font-semibold text-white">Absolutely—Thursday works perfectly ✨</div></div>
              </article>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="bg-white py-20 sm:py-28">
          <div className="mx-auto w-[min(100%-2rem,78rem)]">
            <div className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20">
              <div className="lg:sticky lg:top-28 lg:self-start">
                <span className="text-[0.68rem] font-extrabold uppercase tracking-[0.15em] text-[#155eef]">Your next chapter, simplified</span>
                <h2 className="mt-5 text-4xl font-extrabold leading-[1.02] tracking-[-0.058em] text-slate-950 sm:text-6xl">Less waiting.<br /><span className="text-slate-400">More momentum.</span></h2>
                <p className="mt-5 max-w-md text-base font-medium leading-7 text-slate-600">Three focused steps turn a scattered job search into a clear path forward.</p>
                <button onClick={goToSignUp} className="product-focus group mt-8 inline-flex items-center gap-2 text-sm font-extrabold text-[#155eef]">Build your profile <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></button>
              </div>

              <div className="relative">
                <div aria-hidden="true" className="absolute bottom-12 left-6 top-12 w-px bg-gradient-to-b from-blue-200 via-blue-100 to-transparent sm:left-8" />
                {journeySteps.map(({ number, title, copy, icon: Icon }, index) => (
                  <motion.article key={number} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.35 }} transition={{ delay: index * 0.08 }} className="relative grid grid-cols-[3rem_1fr] gap-4 border-b border-slate-200 py-8 first:pt-0 last:border-0 sm:grid-cols-[4rem_1fr] sm:gap-6 sm:py-10">
                    <span className="relative z-10 flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-200 bg-blue-50 text-[#155eef] shadow-sm sm:h-16 sm:w-16"><Icon className="h-5 w-5 sm:h-6 sm:w-6" /></span>
                    <div><span className="text-[0.65rem] font-black uppercase tracking-[0.16em] text-[#155eef]">Step {number}</span><h3 className="mt-2 text-2xl font-extrabold tracking-[-0.045em] text-slate-950 sm:text-3xl">{title}</h3><p className="mt-3 max-w-xl text-sm font-medium leading-6 text-slate-600 sm:text-base sm:leading-7">{copy}</p></div>
                  </motion.article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-[#12213a] py-20 text-white sm:py-28">
          <div aria-hidden="true" className="absolute -left-28 -top-36 h-96 w-96 rounded-full bg-[#014BAA]/35 blur-[100px]" />
          <Quote aria-hidden="true" className="absolute -bottom-24 -right-8 h-96 w-96 text-white/[0.025]" />
          <div className="relative mx-auto w-[min(100%-2rem,78rem)]">
            <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-20">
              <div>
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-blue-200 ring-1 ring-white/15"><Quote className="h-5 w-5" /></span>
                <blockquote className="mt-8 max-w-4xl text-3xl font-extrabold leading-[1.15] tracking-[-0.05em] sm:text-5xl">“For the first time, applying didn’t feel like throwing my work into a black hole.”</blockquote>
                <div className="mt-8 flex items-center gap-3"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#014BAA] text-sm font-black">JL</span><div><p className="text-sm font-extrabold">Jamie Lee</p><p className="mt-1 text-xs font-semibold text-slate-400">Frontend Engineer · Hired in 18 days</p></div></div>
              </div>
              <div className="grid grid-cols-3 gap-3 lg:grid-cols-1">
                {proofPoints.map(({ value, label }) => <div key={value} className="rounded-2xl border border-white/10 bg-white/[0.055] p-4 backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-blue-300/30 hover:bg-white/[0.085] sm:p-5"><p className="text-2xl font-black tracking-[-0.06em] text-white sm:text-3xl">{value}</p><p className="mt-2 text-[0.65rem] font-semibold leading-4 text-slate-400 sm:text-xs">{label}</p></div>)}
              </div>
            </div>
          </div>
        </section>

        <section id="for-teams" className="px-4 py-16 sm:py-24">
          <div className="landing-shine relative mx-auto w-full max-w-[78rem] overflow-hidden rounded-[2.25rem] bg-[#12213a] px-6 py-12 text-white shadow-[0_30px_100px_rgba(15,23,42,0.2)] sm:px-10 sm:py-16 lg:px-16">
            <div aria-hidden="true" className="absolute -left-20 -top-28 h-80 w-80 rounded-full bg-[#014BAA]/45 blur-3xl" />
            <div aria-hidden="true" className="absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-blue-400/20 blur-3xl" />
            <div aria-hidden="true" className="absolute inset-0 opacity-30 [background-image:radial-gradient(rgba(255,255,255,0.45)_1px,transparent_1px)] [background-size:18px_18px]" />
            <div className="relative grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
              <div className="max-w-3xl"><span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[0.68rem] font-extrabold uppercase tracking-[0.14em] backdrop-blur"><Users className="h-3.5 w-3.5" /> For people and teams</span><h2 className="mt-6 text-4xl font-extrabold leading-[1.02] tracking-[-0.06em] sm:text-6xl">Ready to make your next move count?</h2><p className="mt-5 max-w-xl text-sm font-semibold leading-6 text-blue-100 sm:text-base sm:leading-7">Find work that sees your potential—or build a hiring process people will remember for the right reasons.</p></div>
              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col"><button onClick={goToSignUp} className="product-focus group inline-flex min-h-13 items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-sm font-extrabold text-[#12213a] shadow-xl transition hover:-translate-y-1"><span>Join as a job seeker</span><ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></button><button onClick={goToSignUp} className="product-focus inline-flex min-h-13 items-center justify-center gap-2 rounded-2xl border border-white/25 bg-white/10 px-6 py-3.5 text-sm font-extrabold text-white backdrop-blur transition hover:-translate-y-1 hover:bg-white/15">Start hiring <ChevronRight className="h-4 w-4" /></button></div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white py-9">
        <div className="mx-auto flex w-[min(100%-2rem,78rem)] flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <BrandLogo className="h-9 w-9" wordmarkClassName="text-lg font-black tracking-[-0.055em] text-slate-950" />
          <p className="text-xs font-semibold text-slate-500">Skills first. Clarity always. Better careers for everyone.</p>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500"><MapPin className="h-3.5 w-3.5 text-[#155eef]" /> Built for talent everywhere</div>
        </div>
      </footer>
    </div>
  );
}
