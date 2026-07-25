import { BadgeCheck, Banknote, Clock3, Gauge, RefreshCcw, ShieldCheck } from 'lucide-react';
import type { Job } from '../data';
import { getJobTrustProfile } from '../services/trustService';

interface JobTrustSignalsProps {
  job: Job;
  variant?: 'compact' | 'full';
}

export default function JobTrustSignals({ job, variant = 'compact' }: JobTrustSignalsProps) {
  const trust = getJobTrustProfile(job);

  if (variant === 'compact') {
    return (
      <div className="flex flex-wrap items-center gap-1.5" aria-label={`Trust signals for ${job.company}`}>
        {trust.companyVerified && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[0.7rem] font-extrabold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200">
            <BadgeCheck className="h-3.5 w-3.5" />Verified company
          </span>
        )}
        <span className="inline-flex items-center gap-1 rounded-full bg-[#eef4ff] px-2.5 py-1 text-[0.7rem] font-extrabold text-[#0c3e9e] dark:bg-blue-950/60 dark:text-blue-200">
          <Clock3 className="h-3.5 w-3.5" />Answer in {trust.responseCommitmentDays} days
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[0.7rem] font-extrabold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          <Gauge className="h-3.5 w-3.5" />{trust.responseRate}% on time
        </span>
      </div>
    );
  }

  const metrics = [
    { icon: Clock3, label: 'Response contract', value: `${trust.responseCommitmentDays} days`, detail: 'A visible outcome is required' },
    { icon: Gauge, label: 'On-time responses', value: `${trust.responseRate}%`, detail: `${trust.medianResponseHours}h median response` },
    { icon: RefreshCcw, label: 'Hiring confirmed', value: trust.hiringConfirmed, detail: 'This role is actively maintained' },
    { icon: Banknote, label: 'Compensation', value: trust.salaryTransparent ? 'Disclosed' : 'Not disclosed', detail: trust.salaryTransparent ? job.salary : 'Ask before applying' },
  ];

  return (
    <section className="overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-[#f6f9ff] via-white to-emerald-50/45 shadow-sm dark:border-blue-900/70 dark:from-blue-950/35 dark:via-slate-900 dark:to-emerald-950/20" aria-labelledby={`trust-title-${job.id}`}>
      <div className="flex flex-col gap-4 border-b border-blue-100/80 px-5 py-5 sm:flex-row sm:items-center sm:justify-between dark:border-blue-900/70">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#155eef] text-white shadow-lg shadow-blue-600/15"><ShieldCheck className="h-5 w-5" /></span>
          <div>
            <h2 id={`trust-title-${job.id}`} className="text-3xl font-black leading-none tracking-[-0.055em] text-slate-950 dark:text-white sm:text-4xl">{job.title}</h2>
            <p className="mt-2 text-xs font-bold text-[#155eef] dark:text-blue-300">{job.company} · {job.location} · {job.type}</p>
            <h3 className="mt-4 text-lg font-extrabold tracking-[-0.025em] text-slate-900 dark:text-white">Real work deserves a real answer.</h3>
            <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-300">Job status, response history and salary clarity are visible before you apply.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start rounded-xl border border-emerald-200 bg-white px-3 py-2 text-emerald-700 shadow-sm dark:border-emerald-900 dark:bg-slate-900 dark:text-emerald-300">
          <BadgeCheck className="h-5 w-5" />
          <div><p className="text-xs font-extrabold">{trust.companyVerified ? 'Verified employer' : 'Verification pending'}</p><p className="text-[0.65rem] font-semibold text-emerald-600/75 dark:text-emerald-400/75">Trust score {trust.trustScore}/100</p></div>
        </div>
      </div>

      <div className="grid gap-px bg-blue-100/70 sm:grid-cols-2 lg:grid-cols-4 dark:bg-blue-900/50">
        {metrics.map(({ icon: Icon, label, value, detail }) => (
          <div key={label} className="bg-white/90 px-4 py-4 dark:bg-slate-900/95">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400"><Icon className="h-4 w-4 text-[#155eef]" />{label}</div>
            <p className="mt-2 text-lg font-extrabold tracking-[-0.025em] text-slate-900 dark:text-white">{value}</p>
            <p className="mt-0.5 truncate text-[0.7rem] font-medium text-slate-500 dark:text-slate-400" title={detail}>{detail}</p>
          </div>
        ))}
      </div>

      <div className="flex items-start gap-2 border-t border-blue-100/80 px-5 py-3 text-xs leading-5 text-slate-600 dark:border-blue-900/70 dark:text-slate-300">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#155eef]" />
        Missed commitments stay in the company response score, helping every candidate make a more informed choice.
      </div>
    </section>
  );
}
