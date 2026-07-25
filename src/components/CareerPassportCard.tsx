import { ArrowRight, BadgeCheck, BriefcaseBusiness, Route, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Job } from '../data';
import type { User } from '../services/userService';
import { getCareerPassport } from '../services/careerIntelligenceService';

interface CareerPassportCardProps {
  user: User;
  jobs?: Job[];
  compact?: boolean;
  onUpdateProfile?: () => void;
}

export default function CareerPassportCard({ user, jobs, compact = false, onUpdateProfile }: CareerPassportCardProps) {
  const passport = getCareerPassport(user, jobs);
  const incompleteSections = passport.sections.filter((section) => !section.complete);

  return (
    <section className="product-surface overflow-hidden p-5 sm:p-6" aria-labelledby="career-passport-title">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <BriefcaseBusiness aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-slate-500 dark:text-slate-400" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Career Passport</p>
            <h2 id="career-passport-title" className="mt-1 text-lg font-bold tracking-[-0.025em] text-slate-900 dark:text-white">Verified career signal</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{passport.targetRole} · {passport.level} profile</p>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className="flex items-center justify-end gap-1 text-xl font-bold tracking-[-0.04em] text-slate-900 dark:text-white"><TrendingUp aria-hidden="true" className="h-4 w-4 text-[#155eef]" />{passport.score}%</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Passport strength</p>
        </div>
      </div>

      <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div className="h-full rounded-full bg-[#014BAA] transition-[width] duration-500" style={{ width: `${passport.score}%` }} />
      </div>
      <div className="mt-3 flex items-center justify-between gap-3 text-xs font-semibold text-slate-500">
        <span>{passport.profileScore}% profile foundation</span>
        <span className="text-[#155eef]">{passport.proofPoints} earned proof points</span>
      </div>

      {!compact && (
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Current strengths</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {passport.strengths.length ? passport.strengths.map((strength) => (
                <span key={strength} className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">{strength}</span>
              )) : <span className="text-sm text-slate-500">Add skills to make your strengths visible.</span>}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Skills to build</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {passport.growthFocus.slice(0, 3).map((skill) => (
                <span key={skill} className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">{skill}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-800">
        {incompleteSections.length ? (
          <p className="flex items-start gap-2 text-sm leading-5 text-slate-600 dark:text-slate-300">
            <Route className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
            {passport.recommendations[0] || incompleteSections[0].detail}
          </p>
        ) : (
          <p className="flex items-start gap-2 text-sm leading-5 text-slate-600 dark:text-slate-300">
            <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            Your career foundation is ready to support more precise job matches.
          </p>
        )}
        {onUpdateProfile ? (
          <button
            type="button"
            onClick={onUpdateProfile}
            className="product-focus mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#155eef] hover:text-[#0c3e9e]"
          >
            Update profile <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <div className="mt-4 flex flex-wrap gap-4">
            <Link to="/missions" className="product-focus inline-flex items-center gap-1.5 text-sm font-semibold text-[#155eef] hover:text-[#0c3e9e]">Earn verification <ArrowRight className="h-4 w-4" /></Link>
            <Link to="/profile?edit=true" className="product-focus inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800">Update profile</Link>
          </div>
        )}
      </div>
    </section>
  );
}
