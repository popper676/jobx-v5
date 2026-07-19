import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight, CheckCircle2, Clock3, FileText, ShieldCheck, XCircle } from 'lucide-react';
import { useStore } from '../store/StoreProvider';
import { antiGhostingService } from '../services/antiGhostingService';
import { Application, ApplicantStatus } from '../types';

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function statusPresentation(status: ApplicantStatus): { label: string; className: string; icon: React.ReactNode } {
  switch (status) {
    case 'Shortlisted': return { label: 'Shortlisted', className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-900', icon: <CheckCircle2 className="h-3.5 w-3.5" /> };
    case 'Rejected': return { label: 'Not selected', className: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-200 dark:border-red-900', icon: <XCircle className="h-3.5 w-3.5" /> };
    case 'Expired': return { label: 'Response window missed', className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-900', icon: <AlertTriangle className="h-3.5 w-3.5" /> };
    case 'Viewed': return { label: 'Viewed', className: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700', icon: <Clock3 className="h-3.5 w-3.5" /> };
    default: return { label: 'Awaiting employer response', className: 'bg-[#eef4ff] text-[#0c3e9e] border-blue-200 dark:bg-blue-950/60 dark:text-blue-200 dark:border-blue-900', icon: <Clock3 className="h-3.5 w-3.5" /> };
  }
}

function responseCopy(application: Application): string {
  const onTime = application.employerResponded && (!application.respondedAt || new Date(application.respondedAt).getTime() <= new Date(application.deadline).getTime());
  if (application.status === 'Shortlisted') return onTime ? 'The employer responded within their JobX response window.' : 'The employer responded after the JobX response window.';
  if (application.status === 'Rejected') return onTime ? 'The employer closed this application with an on-time update.' : 'The employer closed this application after the response window.';
  if (application.status === 'Expired') return 'JobX recorded that the employer did not respond before the promised deadline.';
  const days = Math.max(1, Math.ceil((new Date(application.deadline).getTime() - Date.now()) / 86_400_000));
  return `The employer’s next update is expected within ${days} ${days === 1 ? 'day' : 'days'}.`;
}

export default function ApplicationsPage() {
  const { applications, user } = useStore();
  const candidateApplications = useMemo(() => applications.filter((application) => application.candidateId === user.id).sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime()), [applications, user.id]);
  const respondedCount = candidateApplications.filter((application) => application.employerResponded).length;

  return (
    <div className="product-page min-h-[calc(100vh-4rem)] py-7 sm:py-10">
      <div className="product-shell max-w-5xl">
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
  const responded = application.employerResponded;
  const progressed = application.status === 'Shortlisted';

  return (
    <article className="product-surface product-card-interactive p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-extrabold uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400">{application.companyName || 'Employer'}</p><h2 className="mt-1 text-lg font-extrabold tracking-[-0.025em] text-slate-900 dark:text-white">{application.jobTitle}</h2><p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">Applied {formatDate(application.appliedAt)}</p></div><span className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-extrabold ${status.className}`}>{status.icon}{status.label}</span></div>
      <div className="mt-6 grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-4 dark:border-slate-700 dark:bg-slate-900/60"><ProgressStep label="Applied" completed /><span className={`h-px ${responded ? 'bg-[#155eef]' : 'border-t border-dashed border-slate-300 dark:border-slate-600'}`} /><ProgressStep label="Employer update" completed={responded} active={!responded} /><span className={`h-px ${progressed ? 'bg-[#155eef]' : 'border-t border-dashed border-slate-300 dark:border-slate-600'}`} /><ProgressStep label={progressed ? 'Shortlisted' : 'Next step'} completed={progressed} /></div>
      <div className="mt-5 grid gap-3 border-t border-slate-100 pt-5 sm:grid-cols-3 dark:border-slate-800"><Metric label="Response deadline" value={formatDate(application.deadline)} /><Metric label="Employer response rate" value={`${responseRate}% within 7 days`} /><Metric label="Your profile match" value={`${application.matchScore}%`} /></div>
      <p className="mt-5 flex items-start gap-2 text-sm leading-5 text-slate-600 dark:text-slate-300"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#155eef]" />{responseCopy(application)}</p>
    </article>
  );
};

function ProgressStep({ label, completed, active = false }: { label: string; completed?: boolean; active?: boolean }) {
  return <div className="min-w-0 text-center"><span className={`mx-auto flex h-6 w-6 items-center justify-center rounded-full text-white ${completed ? 'bg-[#155eef]' : active ? 'border-2 border-[#155eef] bg-white dark:bg-slate-900' : 'border-2 border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-900'}`}>{completed && <CheckCircle2 className="h-4 w-4" />}{active && <span className="h-2 w-2 rounded-full bg-[#155eef]" />}</span><p className={`mt-2 truncate text-[0.65rem] font-extrabold uppercase tracking-[0.04em] ${completed || active ? 'text-slate-700 dark:text-slate-200' : 'text-slate-400'}`}>{label}</p></div>;
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg bg-slate-50 px-3 py-3 dark:bg-slate-800/70"><p className="text-[0.65rem] font-extrabold uppercase tracking-[0.08em] text-slate-500">{label}</p><p className="mt-1 text-sm font-extrabold text-slate-900 dark:text-white">{value}</p></div>;
}
