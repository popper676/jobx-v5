import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowRight,
  BadgeCheck,
  Bookmark,
  BriefcaseBusiness,
  FileText,
  Star,
  Target,
  TrendingUp,
  Trophy,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { MOCK_JOBS } from '../data';
import { useStore } from '../store/StoreProvider';
import JobCard from '../components/JobCard';
import UserAvatar from '../components/UserAvatar';
import { getCareerPassport, getCareerRecommendations } from '../services/careerIntelligenceService';

type DashboardTab = 'recommended' | 'saved' | 'applied';

const tabMeta: Record<DashboardTab, { label: string; description: string; icon: typeof Star }> = {
  recommended: {
    label: 'Best matches',
    description: 'Ranked by your skills, experience, and career direction.',
    icon: Star,
  },
  saved: {
    label: 'Saved',
    description: 'The opportunities you want to review before applying.',
    icon: Bookmark,
  },
  applied: {
    label: 'Applied',
    description: 'Roles already moving through your application tracker.',
    icon: FileText,
  },
};

export default function Dashboard() {
  const store = useStore();
  const [activeTab, setActiveTab] = useState<DashboardTab>('recommended');

  const recommendations = getCareerRecommendations(store.user).slice(0, 4);
  const recommendedJobs = recommendations.map((recommendation) => recommendation.job);
  const savedJobs = MOCK_JOBS.filter((job) => store.savedJobs.some((savedJob) => savedJob.jobId === job.id));
  const appliedJobs = MOCK_JOBS.filter((job) => store.appliedJobs.some((appliedJob) => appliedJob.jobId === job.id));
  const passport = getCareerPassport(store.user, MOCK_JOBS);
  const firstName = store.user.name.trim().split(/ +/)[0] || 'there';
  const bestMatch = recommendations[0]?.intelligence.score || 0;

  const tabJobs = activeTab === 'recommended'
    ? recommendedJobs
    : activeTab === 'saved'
      ? savedJobs
      : appliedJobs;

  const counts: Record<DashboardTab, number> = {
    recommended: recommendedJobs.length,
    saved: savedJobs.length,
    applied: appliedJobs.length,
  };

  return (
    <div className="w-full pb-8">
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative isolate overflow-hidden rounded-[2rem] bg-[#12213a] px-5 py-6 text-white shadow-[0_24px_70px_rgba(15,23,42,0.16)] sm:px-8 sm:py-8 lg:px-10"
        aria-labelledby="workspace-title"
      >
        <div aria-hidden="true" className="absolute -right-20 -top-28 h-80 w-80 rounded-full bg-[#155eef]/45 blur-3xl" />
        <div aria-hidden="true" className="absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-blue-300/20 blur-3xl" />
        <div aria-hidden="true" className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(rgba(255,255,255,0.35)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.35)_1px,transparent_1px)] [background-size:48px_48px]" />

        <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_21rem] lg:items-center">
          <div>
            <div className="flex items-center gap-3">
              <UserAvatar src={store.user.avatar} name={store.user.name} size="md" className="h-11 w-11 border-2 border-white/25 shadow-lg" />
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-blue-200">Your career workspace</p>
                <p className="mt-0.5 text-sm font-semibold text-white/65">{store.user.title}</p>
              </div>
            </div>

            <h1 id="workspace-title" className="mt-7 max-w-2xl text-3xl font-extrabold leading-tight tracking-[-0.05em] sm:text-4xl">
              Welcome back, {firstName}.
              <span className="block text-blue-200">Your next move is getting clearer.</span>
            </h1>
            <p className="mt-4 max-w-xl text-sm font-medium leading-6 text-slate-300 sm:text-base">
              Focus on high-fit roles, strengthen the proof behind your skills, and keep every application moving.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link to="/jobs" className="product-focus inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-extrabold text-[#12213a] shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-50">
                Explore opportunities <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/profile?edit=true" className="product-focus inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-bold text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/15">
                <BadgeCheck className="h-4 w-4 text-blue-200" /> Strengthen my profile
              </Link>
              <Link to="/projects" className="product-focus inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-blue-300/30 bg-blue-400/15 px-4 py-2.5 text-sm font-bold text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-blue-400/25">
                <Trophy className="h-4 w-4 text-blue-200" /> Projects & tests
              </Link>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-white/15 bg-white/[0.08] p-5 shadow-2xl backdrop-blur-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-200">Career pulse</p>
                <p className="mt-2 text-sm font-semibold text-white/70">{firstName}'s profile is building momentum.</p>
              </div>
              <UserAvatar src={store.user.avatar} name={store.user.name} size="md" className="h-11 w-11 border-2 border-white/20 shadow-lg" />
            </div>

            <div className="mt-6 flex items-center gap-5">
              <div
                className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-full"
                style={{ background: 'conic-gradient(#60a5fa ' + (passport.score * 3.6) + 'deg, rgba(255,255,255,0.12) 0deg)' }}
                aria-label={passport.score + '% profile completion'}
              >
                <div className="flex h-[4.7rem] w-[4.7rem] flex-col items-center justify-center rounded-full bg-[#172b49]">
                  <span className="text-2xl font-black tracking-[-0.05em]">{passport.score}%</span>
                  <span className="text-[0.58rem] font-bold uppercase tracking-wider text-slate-400">strength</span>
                </div>
              </div>
              <div className="min-w-0 flex-1 space-y-3">
                <div className="flex items-center justify-between gap-3 text-sm"><span className="text-slate-300">Best match</span><strong>{bestMatch}%</strong></div>
                <div className="h-px bg-white/10" />
                <div className="flex items-center justify-between gap-3 text-sm"><span className="text-slate-300">Applications</span><strong>{store.appliedJobs.length}</strong></div>
                <div className="h-px bg-white/10" />
                <div className="flex items-center justify-between gap-3 text-sm"><span className="text-slate-300">Proof points</span><strong>{passport.proofPoints}</strong></div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      <section className="mt-5 grid gap-3 sm:grid-cols-3" aria-label="Workspace overview">
        {[
          { label: 'Matches ready', value: recommendedJobs.length, detail: 'Curated for your direction', icon: Target, tone: 'text-[#155eef] bg-blue-50' },
          { label: 'Applications', value: store.appliedJobs.length, detail: 'Track every employer update', icon: BriefcaseBusiness, tone: 'text-violet-700 bg-violet-50' },
          { label: 'Passport strength', value: passport.score + '%', detail: passport.completedProofs + ' verified outcomes', icon: BadgeCheck, tone: 'text-emerald-700 bg-emerald-50' },
        ].map((metric, index) => (
          <motion.article
            key={metric.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 + index * 0.05 }}
            className="product-surface flex items-center gap-4 p-4 sm:p-5"
          >
            <span className={'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ' + metric.tone}><metric.icon className="h-5 w-5" /></span>
            <div className="min-w-0">
              <p className="text-2xl font-black tracking-[-0.04em] text-slate-900 dark:text-white">{metric.value}</p>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{metric.label}</p>
              <p className="mt-0.5 truncate text-[0.7rem] font-medium text-slate-400">{metric.detail}</p>
            </div>
          </motion.article>
        ))}
      </section>

      <div className="mt-8">
        <section aria-labelledby="opportunities-title">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#155eef]">Opportunity desk</p>
              <h2 id="opportunities-title" className="mt-1 text-2xl font-extrabold tracking-[-0.04em] text-slate-950 dark:text-white">{tabMeta[activeTab].label}</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{tabMeta[activeTab].description}</p>
            </div>
            <Link to="/jobs" className="product-focus inline-flex items-center gap-1.5 self-start rounded-lg text-sm font-bold text-[#155eef] hover:text-[#0c3e9e]">
              View all jobs <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div role="tablist" aria-label="Opportunity filters" className="mt-5 flex max-w-full gap-1 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            {(Object.keys(tabMeta) as DashboardTab[]).map((tab) => {
              const Icon = tabMeta[tab].icon;
              const selected = activeTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setActiveTab(tab)}
                  className={'product-focus inline-flex min-w-fit flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold transition-all ' + (selected ? 'bg-[#12213a] text-white shadow-md dark:bg-[#155eef]' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-white')}
                >
                  <Icon className="h-4 w-4" />
                  {tabMeta[tab].label}
                  <span className={'rounded-full px-1.5 py-0.5 text-[0.65rem] ' + (selected ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-500 dark:bg-slate-800')}>{counts[tab]}</span>
                </button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              className="mt-4 flex flex-col gap-4"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              {tabJobs.map((job, index) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: index * 0.04 }}
                >
                  <JobCard job={job} />
                </motion.div>
              ))}

              {tabJobs.length === 0 && (
                <div className="product-surface border-dashed px-6 py-14 text-center">
                  <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
                    {activeTab === 'saved' ? <Bookmark className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                  </span>
                  <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">{activeTab === 'saved' ? 'No saved roles yet' : 'No applications yet'}</h3>
                  <p className="mt-1 text-sm text-slate-500">Browse transparent, high-fit opportunities to get started.</p>
                  <Link to="/jobs" className="product-focus mt-5 inline-flex items-center gap-1.5 rounded-xl bg-[#155eef] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#0c3e9e]">
                    Browse jobs <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </section>

      </div>
    </div>
  );
}
