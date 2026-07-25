import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight, BadgeCheck, BriefcaseBusiness, CalendarDays, CheckCircle2, Clock3, FileText, ShieldCheck, XCircle } from 'lucide-react';
import { useStore } from '../store/StoreProvider';
import { antiGhostingService } from '../services/antiGhostingService';
import { Application, ApplicantStatus } from '../types';

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function statusPresentation(status: ApplicantStatus): { label: string; className: string; icon: React.ReactNode } {
  switch (status) {
    case 'Shortlisted': return { label: 'Shortlisted', className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-900', icon: <CheckCircle2 className="h-3.5 w-3.5" /> };
    case 'Phone Screen': return { label: 'Phone screen', className: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-200 dark:border-blue-900', icon: <Clock3 className="h-3.5 w-3.5" /> };
    case 'Interview': return { label: 'Interview', className: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-200 dark:border-violet-900', icon: <CheckCircle2 className="h-3.5 w-3.5" /> };
    case 'Offer': return { label: 'Offer', className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-900', icon: <CheckCircle2 className="h-3.5 w-3.5" /> };
    case 'Hired': return { label: 'Hired', className: 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-100 dark:border-emerald-800', icon: <CheckCircle2 className="h-3.5 w-3.5" /> };
    case 'On Hold': return { label: 'On hold', className: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700', icon: <Clock3 className="h-3.5 w-3.5" /> };
    case 'Rejected': return { label: 'Not selected', className: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-200 dark:border-red-900', icon: <XCircle className="h-3.5 w-3.5" /> };
    case 'Expired': return { label: 'Response window missed', className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-900', icon: <AlertTriangle className="h-3.5 w-3.5" /> };
    case 'Viewed': return { label: 'Viewed', className: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700', icon: <Clock3 className="h-3.5 w-3.5" /> };
    default: return { label: 'Awaiting employer response', className: 'bg-[#eef4ff] text-[#0c3e9e] border-blue-200 dark:bg-blue-950/60 dark:text-blue-200 dark:border-blue-900', icon: <Clock3 className="h-3.5 w-3.5" /> };
  }
}

function responseCopy(application: Application): string {
  const onTime = application.employerResponded && (!application.respondedAt || new Date(application.respondedAt).getTime() <= new Date(application.deadline).getTime());
  if (application.status === 'Shortlisted') return onTime ? 'The employer responded within their JobX response window.' : 'The employer responded after the JobX response window.';
  if (['Phone Screen', 'Interview', 'Offer', 'Hired', 'On Hold'].includes(application.status)) {
    return `The employer moved your application to ${application.status}.`;
  }
  if (application.status === 'Rejected') return onTime ? 'The employer closed this application with an on-time update.' : 'The employer closed this application after the response window.';
  if (application.status === 'Expired') return 'JobX recorded that the employer did not respond before the promised deadline.';
  const days = Math.max(1, Math.ceil((new Date(application.deadline).getTime() - Date.now()) / 86_400_000));
  return `The employer’s next update is expected within ${days} ${days === 1 ? 'day' : 'days'}.`;
}

function responseCommitmentDays(application: Application): number {
  const duration = new Date(application.deadline).getTime() - new Date(application.appliedAt).getTime();
  return Math.max(1, Math.round(duration / 86_400_000));
}

export default function ApplicationsPage() {
  const { applications, user } = useStore();
  const candidateApplications = useMemo(() => applications.filter((application) => application.candidateId === user.id).sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime()), [applications, user.id]);
  const respondedCount = candidateApplications.filter((application) => application.employerResponded).length;

  return (
    <div className="product-page min-h-[calc(100vh-4rem)] py-7 sm:py-10">
      <div className="product-shell max-w-6xl">
        <section className="grid gap-6 border-b border-slate-200 pb-8 dark:border-slate-800 md:grid-cols-[1fr_auto] md:items-end">
          <div><span className="product-eyebrow">Your application tracker</span><h1 className="product-title mt-4 text-4xl font-extrabold sm:text-5xl">Every application, out in the open.</h1><p className="product-copy mt-3 max-w-2xl text-sm sm:text-base">Follow the status, response deadline and next decision for each role—all in one clear view.</p></div>
          <div className="grid grid-cols-2 divide-x divide-slate-200 rounded-xl border border-slate-200 bg-white px-2 py-3 text-center shadow-sm dark:divide-slate-700 dark:border-slate-700 dark:bg-slate-900"><div className="px-4"><p className="text-2xl font-extrabold tracking-[-0.04em] text-slate-900 dark:text-white">{candidateApplications.length}</p><p className="mt-0.5 text-[0.65rem] font-extrabold uppercase tracking-[0.08em] text-slate-500">Applications</p></div><div className="px-4"><p className="text-2xl font-extrabold tracking-[-0.04em] text-[#155eef]">{respondedCount}</p><p className="mt-0.5 text-[0.65rem] font-extrabold uppercase tracking-[0.08em] text-slate-500">Responses</p></div></div>
        </section>

        <section className="mt-6 space-y-4" aria-label="Your applications">
          {candidateApplications.length === 0 ? <div className="product-surface border-dashed px-6 py-16 text-center"><span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#eef4ff] text-[#155eef] dark:bg-blue-950/60"><FileText className="h-6 w-6" /></span><h2 className="mt-4 text-lg font-extrabold text-slate-900 dark:text-white">No applications yet</h2><p className="product-copy mt-1 text-sm">When you apply to a JobX role, its outcome will appear here.</p><Link to="/jobs" className="product-button-primary product-focus mt-5">Explore roles <ArrowRight className="h-4 w-4" /></Link></div> : candidateApplications.map((application) => <ApplicationCard key={application.id} application={application} />)}
        </section>
      </div>
    </div>
  );
}

const ApplicationCard: React.FC<{ application: Application }> = ({ application }) => {
  const status = statusPresentation(application.status);
  const responseRate = antiGhostingService.getCompanyResponseRate(application.companyId);
  const commitmentDays = responseCommitmentDays(application);
  const companyInitials = (application.companyName || 'Employer').split(/\s+/).map((word) => word[0]).join('').slice(0, 2).toUpperCase();
  const pipelineStage = getPipelineStage(application);
  const pipeline = [
    { label: 'Applied', detail: formatDate(application.appliedAt) },
    { label: 'Application review', detail: pipelineStage > 1 ? 'Review completed' : 'Employer reviewing' },
    { label: 'Employer response', detail: application.respondedAt ? formatDate(application.respondedAt) : `Due ${formatDate(application.deadline)}` },
    { label: 'Interview', detail: ['Phone Screen', 'Interview'].includes(application.status) ? application.status : pipelineStage > 3 ? 'Completed' : 'Pending' },
    { label: 'Final decision', detail: ['Offer', 'Hired', 'Rejected'].includes(application.status) ? application.status : 'Pending' },
  ];

  return (
    <article className="product-surface product-card-interactive overflow-hidden border-slate-200 p-5 sm:p-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <span className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-[#12213a] to-[#155eef] text-xs font-black text-white shadow-lg"><span className="absolute -right-2 -top-2 h-7 w-7 rounded-full bg-white/15" />{companyInitials}<BadgeCheck className="absolute bottom-1 right-1 h-3 w-3 text-blue-100" /></span>
          <div><p className="text-xs font-extrabold uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400">{application.companyName || 'Employer'}</p><h2 className="mt-1 text-xl font-extrabold tracking-[-0.035em] text-slate-900 dark:text-white">{application.jobTitle}</h2><p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-slate-400"><CalendarDays className="h-3.5 w-3.5" />Applied {formatDate(application.appliedAt)}</p></div>
        </div>
        <span className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-extrabold ${status.className}`}>{status.icon}{status.label}</span>
      </div>
      <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5 dark:border-slate-700 dark:bg-slate-900/60" aria-label={`Application progress: ${pipeline[pipelineStage].label}`}>
        <div className="mb-3 flex items-center justify-between gap-3 px-1">
          <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.12em] text-slate-500">Application journey</p>
          <p className="text-xs font-bold text-[#155eef]">Stage {pipelineStage + 1} of {pipeline.length}</p>
        </div>
        <div className="flex min-w-[760px]" role="list">
          {pipeline.map((step, index) => (
            <PipelineStep
              key={step.label}
              index={index}
              label={step.label}
              detail={step.detail}
              state={index < pipelineStage ? 'completed' : index === pipelineStage ? 'current' : 'upcoming'}
              terminal={application.status === 'Expired' && index === pipelineStage ? 'expired' : application.status === 'Rejected' && index === pipelineStage ? 'rejected' : undefined}
            />
          ))}
        </div>
      </div>
      <div className="mt-5 grid gap-3 border-t border-slate-100 pt-5 sm:grid-cols-3 dark:border-slate-800"><Metric icon={<Clock3 className="h-4 w-4" />} label={`${commitmentDays}-day expiry window`} value={formatDate(application.deadline)} /><Metric icon={<ShieldCheck className="h-4 w-4" />} label="Employer verification" value={`${responseRate}% response trust`} /><Metric icon={<BriefcaseBusiness className="h-4 w-4" />} label="Your profile match" value={`${application.matchScore}%`} /></div>
      <p className="mt-5 flex items-start gap-2 text-sm leading-5 text-slate-600 dark:text-slate-300"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#155eef]" />{responseCopy(application)}</p>
    </article>
  );
};

function getPipelineStage(application: Application): number {
  if (['Offer', 'Hired', 'Rejected'].includes(application.status)) return 4;
  if (['Phone Screen', 'Interview'].includes(application.status)) return 3;
  if (application.employerResponded || ['Shortlisted', 'On Hold', 'Expired'].includes(application.status)) return 2;
  return 1;
}

const PipelineStep: React.FC<{
  index: number;
  label: string;
  detail: string;
  state: 'completed' | 'current' | 'upcoming';
  terminal?: 'expired' | 'rejected';
}> = ({ index, label, detail, state, terminal }) => {
  const tones = terminal === 'expired'
    ? 'from-amber-500 to-orange-500 text-white'
    : terminal === 'rejected'
      ? 'from-rose-600 to-red-500 text-white'
      : state === 'completed'
        ? 'from-[#123f8c] to-[#155eef] text-white'
        : state === 'current'
          ? 'from-[#155eef] to-[#5b6df8] text-white shadow-[0_8px_24px_rgba(21,94,239,0.25)]'
          : 'from-slate-200 to-slate-100 text-slate-500 dark:from-slate-700 dark:to-slate-800 dark:text-slate-300';

  return (
    <div
      role="listitem"
      aria-current={state === 'current' ? 'step' : undefined}
      className={`relative -ml-2 flex min-h-[5.7rem] flex-1 items-center bg-gradient-to-r py-3 pl-8 pr-5 first:ml-0 first:pl-5 ${tones}`}
      style={{ clipPath: index === 0 ? 'polygon(0 0, calc(100% - 18px) 0, 100% 50%, calc(100% - 18px) 100%, 0 100%)' : 'polygon(0 0, calc(100% - 18px) 0, 100% 50%, calc(100% - 18px) 100%, 0 100%, 18px 50%)' }}
    >
      <span className={`mr-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-black ${state === 'upcoming' ? 'border-slate-400/50 bg-white/60 text-slate-500 dark:bg-slate-900/50 dark:text-slate-300' : 'border-white/70 bg-white/15 text-white'}`}>
        {state === 'completed' ? <CheckCircle2 className="h-5 w-5" /> : index + 1}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[0.68rem] font-black uppercase tracking-[0.055em]">{label}</span>
        <span className={`mt-1 block truncate text-[0.66rem] font-semibold ${state === 'upcoming' ? 'opacity-75' : 'text-white/80'}`}>{detail}</span>
      </span>
      {state === 'current' && <span className="absolute right-5 top-2 h-2 w-2 animate-pulse rounded-full bg-white shadow-[0_0_0_4px_rgba(255,255,255,0.2)]" />}
    </div>
  );
};

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-800/70"><div className="flex items-center gap-2 text-[#155eef]">{icon}<p className="text-[0.65rem] font-extrabold uppercase tracking-[0.08em] text-slate-500">{label}</p></div><p className="mt-2 text-sm font-extrabold text-slate-900 dark:text-white">{value}</p></div>;
}
