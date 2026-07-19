import { useState } from 'react';
import {
  ArrowRight,
  BarChart3,
  Briefcase,
  CalendarCheck,
  CheckCircle2,
  Eye,
  Plus,
  RefreshCw,
  ShieldCheck,
  Users,
  XCircle,
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
  { day: 'Mon', value: 4 },
  { day: 'Tue', value: 7 },
  { day: 'Wed', value: 12 },
  { day: 'Thu', value: 9 },
  { day: 'Fri', value: 6 },
  { day: 'Sat', value: 3 },
  { day: 'Sun', value: 6 },
];

const MAX_BAR = Math.max(...CHART_DATA.map((item) => item.value));
const WEEKLY_APPLICANTS = CHART_DATA.reduce((sum, item) => sum + item.value, 0);

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

  const responseGuidance = responseRate >= 80
    ? 'Your team is keeping a strong response promise.'
    : responseRate >= 50
      ? 'A few timely replies will strengthen candidate trust.'
      : 'Prioritise the response queue to rebuild candidate trust.';

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
      label: 'Applications this week',
      value: WEEKLY_APPLICANTS,
      detail: 'Across all open roles',
      icon: Users,
    },
    {
      label: 'Interviews scheduled',
      value: MOCK_STATS.interviewsScheduled,
      detail: 'Keep the momentum going',
      icon: CalendarCheck,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8F3F0]/80 pb-14">
      <header className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-6 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:px-8">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#014BAA]">
              Recruiting workspace
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Hiring overview
            </h1>
            <p className="mt-1.5 text-sm text-slate-500">
              {pendingApps.length > 0
                ? `${pendingApps.length} candidate${pendingApps.length === 1 ? '' : 's'} waiting for a response.`
                : 'Your response queue is all caught up.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={refreshData}
              disabled={isRefreshing}
              aria-busy={isRefreshing}
              className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-600 transition-colors hover:border-blue-200 hover:text-[#014BAA] disabled:cursor-wait disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing' : 'Refresh'}
            </button>
            <Link
              to="/applicants"
              className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3.5 text-sm font-semibold text-[#014BAA] transition-colors hover:border-blue-200 hover:bg-blue-100/70"
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
              className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#014BAA] px-4 text-sm font-semibold text-white shadow-sm shadow-blue-900/15 transition-colors hover:bg-[#013b86]"
            >
              <Plus className="h-4 w-4" />
              Post a job
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
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

        <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(19rem,0.8fr)]">
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

          <aside className="grid gap-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-base font-bold text-slate-900">Applications this week</p>
                  <p className="mt-0.5 text-xs text-slate-500">{WEEKLY_APPLICANTS} new applications received</p>
                </div>
                <BarChart3 className="h-5 w-5 text-[#014BAA]" aria-hidden="true" />
              </div>

              <div
                className="mt-6 grid h-40 grid-cols-7 items-end gap-2 border-b border-slate-100 bg-[linear-gradient(to_bottom,transparent_24%,#f1f5f9_25%,transparent_26%,transparent_49%,#f1f5f9_50%,transparent_51%,transparent_74%,#f1f5f9_75%,transparent_76%)] px-1"
                role="img"
                aria-label={`Weekly application chart, ${WEEKLY_APPLICANTS} applications in total`}
              >
                {CHART_DATA.map((item) => {
                  const height = Math.max(12, Math.round((item.value / MAX_BAR) * 100));
                  return (
                    <div key={item.day} className="flex h-full min-w-0 flex-col items-center justify-end gap-1.5">
                      <span className="text-[10px] font-bold tabular-nums text-slate-500">{item.value}</span>
                      <div
                        className="w-full max-w-7 rounded-t-md bg-[#014BAA] transition-colors hover:bg-[#013b86]"
                        style={{ height: `${height}%` }}
                        title={`${item.day}: ${item.value} applications`}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="mt-2 grid grid-cols-7 gap-2 px-1">
                {CHART_DATA.map((item) => (
                  <span key={item.day} className="text-center text-[10px] font-medium text-slate-400">{item.day}</span>
                ))}
              </div>
              <Link to="/analytics" className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-[#014BAA] hover:text-[#013b86]">
                View analytics <ArrowRight className="h-4 w-4" />
              </Link>
            </section>

            <section className="rounded-2xl border border-blue-100 bg-[#F4F8FF] p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-white text-[#014BAA] shadow-sm">
                  <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                </div>
                <span className="text-2xl font-bold tracking-tight text-[#014BAA] tabular-nums">{responseRate}%</span>
              </div>
              <p className="mt-4 text-sm font-bold text-slate-900">Response promise</p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-blue-100">
                <div className="h-full rounded-full bg-[#014BAA]" style={{ width: `${responseRate}%` }} />
              </div>
              <p className="mt-3 text-xs leading-5 text-slate-600">{responseGuidance}</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">Measured by replies sent within 7 days.</p>
            </section>

            <section className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
              <div>
                <p className="text-sm font-bold text-slate-900">Your employer profile</p>
                <p className="mt-0.5 text-xs text-slate-500">{MOCK_STATS.profileViews} views this week</p>
              </div>
              <Eye className="h-5 w-5 text-slate-400" aria-hidden="true" />
            </section>
          </aside>
        </div>

        <div className="mt-6 flex justify-end">
          <Link to="/my-posts" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#014BAA] hover:text-[#013b86]">
            Manage all job posts <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </main>

      <FloatingActionButton />
    </div>
  );
}
