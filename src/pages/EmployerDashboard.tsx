import { useState } from 'react';
import {
  ArrowRight,
  BarChart3,
  Briefcase,
  CheckCircle2,
  CircleDollarSign,
  Folder,
  History,
  Landmark,
  LayoutList,
  Mail,
  Radio,
  Search,
  ShoppingCart,
  SlidersHorizontal,
  UserCog,
  Plus,
  RefreshCw,
  ShieldCheck,
  Users,
  Video,
  XCircle,
  Trophy,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store/StoreProvider';
import DeadlineCountdown from '../components/DeadlineCountdown';
import UserAvatar from '../components/UserAvatar';
import { antiGhostingService } from '../services/antiGhostingService';
import EmptyState from '../components/employer/EmptyState';
import FloatingActionButton from '../components/employer/FloatingActionButton';

const MOCK_STATS = {
  activeJobs: 3,
  totalApplicants: 47,
  interviewsScheduled: 5,
  profileViews: 128,
};

const CHART_DATA = [
  { day: 'Mon', value: 4, previous: 3, interviews: 1 },
  { day: 'Tue', value: 7, previous: 5, interviews: 1 },
  { day: 'Wed', value: 12, previous: 8, interviews: 2 },
  { day: 'Thu', value: 9, previous: 7, interviews: 1 },
  { day: 'Fri', value: 6, previous: 8, interviews: 2 },
  { day: 'Sat', value: 3, previous: 2, interviews: 0 },
  { day: 'Sun', value: 6, previous: 4, interviews: 1 },
];

const MAX_BAR = 12;
const WEEKLY_APPLICANTS = CHART_DATA.reduce((sum, item) => sum + item.value, 0);
const PREVIOUS_WEEK_APPLICANTS = CHART_DATA.reduce((sum, item) => sum + item.previous, 0);
const WEEKLY_CHANGE = Math.round(((WEEKLY_APPLICANTS - PREVIOUS_WEEK_APPLICANTS) / PREVIOUS_WEEK_APPLICANTS) * 100);

export default function EmployerDashboard() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { applications, respondToApplication } = useStore();
  const navigate = useNavigate();

  const responseRate = antiGhostingService.getCompanyResponseRate('company_1');
  const pendingApps = applications
    .filter((application) => (
      application.companyId === 'company_1'
      && !application.employerResponded
      && application.status !== 'Expired'
    ))
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

  const refreshData = () => {
    setIsRefreshing(true);
    window.setTimeout(() => setIsRefreshing(false), 500);
  };

  const metrics = [
    {
      label: 'Active roles',
      value: MOCK_STATS.activeJobs,
      detail: 'Hiring now',
      icon: Briefcase,
    },
    {
      label: 'Awaiting a reply',
      value: pendingApps.length,
      detail: 'Inside the 7-day response window',
      icon: Users,
    },
    {
      label: 'Employer verification',
      value: `${responseRate}%`,
      detail: 'Replies sent on time',
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8F3F0]/80 pb-14">
      <header className="bg-transparent px-4 pt-6 sm:px-6 lg:px-8">
        <div className="relative mx-auto flex max-w-7xl flex-col gap-7 overflow-hidden rounded-[2rem] bg-[#12213a] px-6 py-7 text-white shadow-[0_24px_70px_rgba(18,33,58,0.20)] sm:px-8 lg:flex-row lg:items-end lg:justify-between lg:px-10 lg:py-9">
          <div className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full bg-[#214f91] opacity-70 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-1/3 h-32 w-96 bg-[#f3a6be]/10 blur-3xl" />
          <div className="relative">
            <Link to="/employer/settings" className="group mb-7 inline-flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 p-2.5 pr-4 shadow-lg backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:border-[#b7ff3c]/60 hover:bg-white/15">
              <span className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-white text-sm font-black tracking-wide text-[#12213a] shadow-sm">
                TC
                <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#12213a] bg-[#b7ff3c] text-[#12213a]"><ShieldCheck className="h-3 w-3" /></span>
              </span>
              <span>
                <span className="flex items-center gap-2"><strong className="text-base font-black text-white">TechCorp Inc.</strong><span className="rounded-full bg-[#b7ff3c] px-2 py-0.5 text-[0.62rem] font-black uppercase tracking-wide text-[#12213a]">Verified</span></span>
                <span className="mt-0.5 block text-xs font-semibold text-slate-300">Software & Technology · Remote-first</span>
              </span>
            </Link>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#b7ff3c]">
              TechCorp recruiting workspace
            </p>
            <h1 className="mt-2 text-4xl font-black tracking-[-0.04em] text-white sm:text-5xl">
              Build your strongest team.
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">
              {pendingApps.length > 0
                ? `${pendingApps.length} candidate${pendingApps.length === 1 ? '' : 's'} need a response. Keep every hiring decision clear, timely, and evidence-led.`
                : 'Your response queue is all caught up.'}
            </p>
            <div className="mt-5 flex flex-wrap gap-4 text-xs font-bold text-slate-300"><span><strong className="mr-1 text-lg text-white">{MOCK_STATS.activeJobs}</strong> active roles</span><span className="h-6 w-px bg-white/15" /><span><strong className="mr-1 text-lg text-[#b7ff3c]">{responseRate}%</strong> response health</span><span className="h-6 w-px bg-white/15" /><span><strong className="mr-1 text-lg text-white">{WEEKLY_APPLICANTS}</strong> applicants this week</span></div>
          </div>

          <div className="relative flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={refreshData}
              disabled={isRefreshing}
              aria-busy={isRefreshing}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 text-sm font-bold text-white backdrop-blur transition duration-300 hover:-translate-y-0.5 hover:bg-white/15 disabled:cursor-wait disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing' : 'Refresh'}
            </button>
            <Link
              to="/applicants"
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/15 bg-white px-4 text-sm font-bold text-[#173b67] shadow-lg transition duration-300 hover:-translate-y-0.5 hover:bg-slate-50"
            >
              Response inbox
              {pendingApps.length > 0 && (
                <span className="rounded-md bg-white px-1.5 py-0.5 text-xs tabular-nums shadow-sm">
                  {pendingApps.length}
                </span>
              )}
            </Link>
            <button
              type="button"
              onClick={() => navigate('/post-job')}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#b7ff3c] px-5 text-sm font-black text-[#12213a] shadow-[0_10px_25px_rgba(183,255,60,0.18)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#c5ff65]"
            >
              <Plus className="h-4 w-4" />
              Post a job
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="grid items-start gap-6 lg:grid-cols-[15rem_minmax(0,1fr)]">
          <EmployerDashboardSidebar />
          <div className="min-w-0">
        <section aria-label="Hiring metrics" className="grid gap-3 sm:grid-cols-3">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <div key={metric.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-[#014BAA]">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
                    {metric.value}
                  </span>
                </div>
                <p className="mt-4 text-sm font-semibold text-slate-800">{metric.label}</p>
                <p className="mt-0.5 text-xs text-slate-500">{metric.detail}</p>
              </div>
            );
          })}
        </section>

        <div className="mt-6 space-y-6">
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-base font-bold text-slate-900">Candidates awaiting a reply</p>
                <p className="mt-0.5 text-xs text-slate-500">Replying quickly helps candidates trust your company.</p>
              </div>
              <Link
                to="/applicants"
                className="inline-flex items-center gap-1 self-start text-sm font-semibold text-[#014BAA] hover:text-[#013b86] sm:self-auto"
              >
                View inbox <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {pendingApps.length === 0 ? (
              <div className="px-5">
                <EmptyState
                  icon={CheckCircle2}
                  title="No replies waiting"
                  description="Every active application has received a response."
                />
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {pendingApps.slice(0, 4).map((application) => (
                  <article
                    key={application.id}
                    className="flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-slate-50/70 sm:flex-row sm:items-center"
                  >
                    <UserAvatar
                      src={application.candidateAvatar}
                      name={application.candidateName}
                      size="md"
                      className="shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900">{application.candidateName}</p>
                      <p className="mt-0.5 truncate text-xs text-slate-500">{application.jobTitle}</p>
                    </div>
                    <DeadlineCountdown
                      deadline={application.deadline}
                      status={application.status}
                      employerResponded={application.employerResponded}
                    />
                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        onClick={() => respondToApplication(application.id, 'accepted')}
                        className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg bg-[#014BAA] px-3 text-xs font-semibold text-white transition-colors hover:bg-[#013b86]"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Accept
                      </button>
                      <button
                        type="button"
                        onClick={() => respondToApplication(application.id, 'rejected')}
                        className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-50"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        Reject
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section id="weekly-applications" className="scroll-mt-24 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" aria-labelledby="weekly-applications-title">
            <div className="flex flex-col gap-5 border-b border-slate-100 p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">
              <div><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#edf2f7] text-[#173b67]"><BarChart3 className="h-5 w-5" /></span><div><p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Candidate acquisition</p><h2 id="weekly-applications-title" className="mt-0.5 text-xl font-bold text-slate-900">Applications this week</h2></div></div><p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">Daily application volume compared with last week, with interview conversions for hiring context.</p></div>
              <div className="grid grid-cols-3 gap-5 text-right"><div><p className="text-2xl font-black text-slate-900">{WEEKLY_APPLICANTS}</p><p className="text-[0.68rem] font-bold text-slate-400">Applications</p></div><div><p className="text-2xl font-black text-[#24451c]">+{WEEKLY_CHANGE}%</p><p className="text-[0.68rem] font-bold text-slate-400">vs last week</p></div><div><p className="text-2xl font-black text-slate-900">{MOCK_STATS.interviewsScheduled}</p><p className="text-[0.68rem] font-bold text-slate-400">Interviews</p></div></div>
            </div>

            <div className="p-5 sm:p-6">
              <div className="flex flex-wrap items-center gap-5 text-xs font-bold text-slate-500"><span className="inline-flex items-center gap-2"><i className="h-3 w-3 rounded-sm bg-[#173b67]" />This week</span><span className="inline-flex items-center gap-2"><i className="h-3 w-3 rounded-sm bg-[#f7c8d9]" />Last week</span><span className="inline-flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-[#b7ff3c] ring-2 ring-[#173b67]" />Interviews</span></div>
              <div className="mt-6 grid grid-cols-[2rem_minmax(0,1fr)] gap-3">
                <div className="flex h-72 flex-col justify-between pb-7 text-right text-[0.68rem] font-semibold text-slate-400">{[12, 9, 6, 3, 0].map((tick) => <span key={tick}>{tick}</span>)}</div>
                <div>
                  <div className="relative grid h-72 grid-cols-7 items-end gap-3 border-b border-slate-200 bg-[linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[length:100%_25%]" role="img" aria-label={`${WEEKLY_APPLICANTS} applications this week, up ${WEEKLY_CHANGE}% from ${PREVIOUS_WEEK_APPLICANTS} last week`}>
                    {CHART_DATA.map((item) => (
                      <div key={item.day} className="relative flex h-full items-end justify-center gap-1">
                        <div className="group relative w-[32%] max-w-10 rounded-t-md bg-[#f7c8d9] transition hover:bg-[#efaec6]" style={{ height: `${item.previous / MAX_BAR * 88}%` }} title={`${item.day}: ${item.previous} last week`}><span className="absolute -top-5 left-1/2 hidden -translate-x-1/2 text-[0.65rem] font-bold text-slate-500 group-hover:block">{item.previous}</span></div>
                        <div className="group relative w-[38%] max-w-12 rounded-t-md bg-[#173b67] transition hover:bg-[#0b2545]" style={{ height: `${item.value / MAX_BAR * 88}%` }} title={`${item.day}: ${item.value} applications`}><span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-black text-[#173b67]">{item.value}</span></div>
                        {item.interviews > 0 && <span className="absolute left-[72%] z-10 h-3 w-3 -translate-x-1/2 rounded-full border-2 border-[#173b67] bg-[#b7ff3c] shadow-sm" style={{ bottom: `${item.interviews / MAX_BAR * 88}%` }} title={`${item.interviews} interviews`} />}
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 grid grid-cols-7 gap-3">{CHART_DATA.map((item) => <span key={item.day} className="text-center text-xs font-bold text-slate-500">{item.day}</span>)}</div>
                </div>
              </div>
              <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm text-slate-500"><strong className="text-slate-800">Wednesday is your strongest sourcing day.</strong> It generated 26% of this week’s candidates.</p><Link to="/applicants" className="inline-flex items-center gap-1 text-sm font-bold text-[#173b67]">Review candidate funnel <ArrowRight className="h-4 w-4" /></Link></div>
            </div>
          </section>

        </div>

        <div className="mt-6 flex justify-end">
          <Link to="/my-posts" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#014BAA] hover:text-[#013b86]">
            Manage all job posts <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
          </div>
        </div>
      </main>

      <FloatingActionButton />
    </div>
  );
}

const EMPLOYER_SHORTCUTS = [
  { label: 'My company', href: '/employer/settings', icon: Landmark },
  { label: 'My jobs', href: '/my-posts', icon: Briefcase },
  { label: 'Candidate folders', href: '/employer/candidates', icon: Folder },
  { label: 'Messages', href: '/messages', icon: Mail },
  { label: 'Interview center', href: '/employer/interviews', icon: Video },
  { label: 'Hiring analytics', href: '/employer/analytics', icon: BarChart3 },
  { label: 'Challenges & hackathons', href: '/employer/challenges', icon: Trophy },
];

function EmployerDashboardSidebar() {
  return (
    <aside className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:sticky lg:top-24" aria-label="Employer shortcuts">
      <div className="border-b border-slate-100 bg-[#12213a] p-5 text-white">
        <p className="text-[0.65rem] font-black uppercase tracking-[0.14em] text-[#b7ff3c]">Employer workspace</p>
        <h2 className="mt-1 text-lg font-black">Quick tools</h2>
        <p className="mt-1 text-xs leading-5 text-slate-300">Hiring operations in one place.</p>
      </div>
      <nav className="divide-y divide-slate-100">
        {EMPLOYER_SHORTCUTS.map(({ label, href, icon: Icon }) => (
          <Link key={label} to={href} className="group flex min-h-11 items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-[#fcf0f5] hover:text-[#173b67]">
            <Icon className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:text-[#173b67]" />
            <span>{label}</span>
            <ArrowRight className="ml-auto h-3.5 w-3.5 text-slate-300 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
          </Link>
        ))}
      </nav>
    </aside>
  );
}
