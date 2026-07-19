import { CheckCircle2, Circle, ListChecks, Network } from 'lucide-react';
import type { Job } from '../data';
import type { User } from '../services/userService';
import { getApplicationReadiness, getJobIntelligence } from '../services/careerIntelligenceService';
import JobXCareerSignal from './JobXCareerSignal';

interface JobIntelligencePanelProps {
  job: Job;
  user: User;
  variant?: 'match' | 'readiness';
}

export default function JobIntelligencePanel({ job, user, variant = 'match' }: JobIntelligencePanelProps) {
  const intelligence = getJobIntelligence(job, user);
  const readiness = getApplicationReadiness(job, user);
  const isReadiness = variant === 'readiness';
  const score = isReadiness ? readiness.score : intelligence.score;
  const label = isReadiness ? readiness.label : intelligence.label;

  return (
    <section className="rounded-2xl border border-blue-100 bg-[#eef4ff]/60 p-4 sm:p-5 dark:border-blue-900/70 dark:bg-blue-950/30" aria-label={isReadiness ? 'Application readiness' : 'Job match explanation'}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#155eef] shadow-sm dark:bg-slate-900 dark:text-blue-200">
            <JobXCareerSignal className="h-4.5 w-4.5" />
          </span>
          <div>
            <p className="flex items-center gap-1.5 text-sm font-extrabold text-slate-900 dark:text-white">{isReadiness ? <ListChecks aria-hidden="true" className="h-4 w-4 text-[#155eef]" /> : <Network aria-hidden="true" className="h-4 w-4 text-[#155eef]" />}{isReadiness ? 'Application readiness' : 'Your fit, explained'}</p>
            <p className="mt-0.5 text-xs leading-5 text-slate-600 dark:text-slate-300">{label} · based only on the profile information you choose to show.</p>
          </div>
        </div>
        <span className="shrink-0 text-xl font-extrabold tracking-[-0.04em] text-[#155eef] tabular-nums">{score}%</span>
      </div>

      {isReadiness ? (
        <div className="mt-4 space-y-2.5">
          {readiness.checklist.map((item) => (
            <div key={item.label} className="flex items-start gap-2 text-sm">
              {item.complete ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> : <Circle className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />}
              <div><p className="font-bold text-slate-800 dark:text-slate-100">{item.label}</p><p className="mt-0.5 text-xs leading-5 text-slate-600 dark:text-slate-300">{item.detail}</p></div>
            </div>
          ))}
          <p className="mt-3 rounded-xl border border-blue-100 bg-white/75 px-3 py-2.5 text-xs font-medium leading-5 text-slate-700 dark:border-blue-900/70 dark:bg-slate-900/70 dark:text-slate-200">Next: {readiness.nextAction}</p>
        </div>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-[0.65rem] font-extrabold uppercase tracking-[0.08em] text-slate-500">You already show</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {intelligence.matchedSkills.length ? intelligence.matchedSkills.slice(0, 4).map((match) => (
                <span key={match.jobSkill} className="rounded-md bg-white px-2 py-1 text-xs font-bold text-emerald-700 shadow-sm dark:bg-slate-900 dark:text-emerald-300">{match.jobSkill}</span>
              )) : <span className="text-xs leading-5 text-slate-600 dark:text-slate-300">No direct role skills are visible yet.</span>}
            </div>
          </div>
          <div>
            <p className="text-[0.65rem] font-extrabold uppercase tracking-[0.08em] text-slate-500">Build next</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {intelligence.missingSkills.slice(0, 3).map((skill) => (
                <span key={skill} className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-bold text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">{skill}</span>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
