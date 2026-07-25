import React, { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, BookmarkCheck, Clock3, DollarSign, MapPin, Network, Users } from 'lucide-react';
import type { Job } from '../data';
import { useStore } from '../store/StoreProvider';
import UserAvatar from './UserAvatar';
import { getJobIntelligence } from '../services/careerIntelligenceService';
import JobTrustSignals from './JobTrustSignals';
import EmployerProfileLink from './EmployerProfileLink';

const JobCard: FC<{ job: Job; variant?: 'default' | 'compact' }> = ({ job, variant = 'default' }) => {
  const navigate = useNavigate();
  const store = useStore();
  const isSaved = store.savedJobs.some((savedJob) => savedJob.jobId === job.id);
  const intelligence = getJobIntelligence(job, store.user);
  const matchScore = intelligence.score;

  const openJob = () => navigate(`/jobs/${job.id}`);
  const toggleSave = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (isSaved) store.unsaveJob(job.id);
    else store.saveJob(job.id);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openJob();
    }
  };

  if (variant === 'compact') {
    return (
      <div role="link" tabIndex={0} onClick={openJob} onKeyDown={handleKeyDown} className="product-surface product-card-interactive product-focus cursor-pointer p-4">
        <div className="flex items-start gap-3">
          <EmployerProfileLink job={job}><span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold text-white shadow-sm ${job.logoColor}`}>{job.logoInitials}</span></EmployerProfileLink>
          <div className="min-w-0 flex-1"><h3 className="truncate text-sm font-extrabold tracking-[-0.02em] text-slate-900 dark:text-white">{job.title}</h3><p className="mt-0.5 truncate text-xs font-semibold text-slate-500 dark:text-slate-400">{job.company}</p><p className="mt-2 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400"><MapPin className="h-3.5 w-3.5" /> {job.location}<span className="mx-0.5">·</span>{job.postedAt}</p></div>
        </div>
      </div>
    );
  }

  return (
    <div role="link" tabIndex={0} onClick={openJob} onKeyDown={handleKeyDown} className="product-surface product-card-interactive product-focus relative cursor-pointer p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3.5">
          <EmployerProfileLink job={job}><span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-base font-extrabold text-white shadow-sm ${job.logoColor}`}>{job.logoInitials}</span></EmployerProfileLink>
          <div className="min-w-0"><h3 className="truncate text-lg font-extrabold tracking-[-0.03em] text-slate-900 dark:text-white">{job.title}</h3><p className="mt-0.5 truncate text-sm font-semibold text-slate-500 dark:text-slate-400">{job.company}</p></div>
        </div>
        <button type="button" aria-label={isSaved ? `Unsave ${job.title}` : `Save ${job.title}`} onClick={toggleSave} className="product-focus -mr-2 -mt-2 rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-[#155eef] dark:hover:bg-slate-800">
          {isSaved ? <BookmarkCheck className="h-5 w-5 text-[#155eef]" /> : <Bookmark className="h-5 w-5" />}
        </button>
      </div>

      <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-sm font-medium text-slate-600 dark:text-slate-300">
        <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4 text-[#155eef]" />{job.location} · {job.workplaceType}</span>
        <span className="inline-flex items-center gap-1.5"><Clock3 className="h-4 w-4 text-[#155eef]" />{job.type}</span>
        <span className="inline-flex items-center gap-1.5"><DollarSign className="h-4 w-4 text-[#155eef]" /><strong className="font-extrabold text-slate-800 dark:text-slate-100">{job.salary}</strong></span>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eef4ff] px-2.5 py-1 text-[0.7rem] font-extrabold text-[#0c3e9e] dark:bg-blue-950/60 dark:text-blue-200"><Network aria-hidden="true" className="h-3.5 w-3.5" />{matchScore}% · {intelligence.label}</span>
        {job.promoted && <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[0.7rem] font-extrabold text-amber-700 dark:bg-amber-950/40 dark:text-amber-200">Featured</span>}
      </div>
      <div className="mt-3"><JobTrustSignals job={job} /></div>

      <div className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-800">
        <div className="flex flex-wrap gap-1.5">{job.skillsRequired.slice(0, 3).map((skill) => <span key={skill} className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">{skill}</span>)}{job.skillsRequired.length > 3 && <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">+{job.skillsRequired.length - 3}</span>}</div>
        <div className="mt-4 flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400"><span className="inline-flex items-center gap-1.5"><Users className="h-3.5 w-3.5" />{job.applicants} applicants{job.recruiterName && <><span className="mx-0.5">·</span><UserAvatar name={job.recruiterName} size="xs" />{job.recruiterName.split(' ')[0]}</>}</span><span>Posted {job.postedAt}</span></div>
      </div>
    </div>
  );
};

export default JobCard;
