import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, BadgeCheck, BellRing, Bookmark, BookmarkCheck, BriefcaseBusiness,
  CheckCircle2, Clock3, MapPin, Search, ShieldCheck, SlidersHorizontal, Sparkles, Target,
} from 'lucide-react';
import { MOCK_JOBS, type Job } from '../data';
import { useStore } from '../store/StoreProvider';
import JobFilterPanel from '../components/JobFilterPanel';
import UserAvatar from '../components/UserAvatar';
import { getCareerPassport, getJobIntelligence } from '../services/careerIntelligenceService';
import { createEmptyJobFilters, filterJobs, toggleFilterValue, type JobFilters } from '../services/jobFilterService';
import { getJobTrustProfile, isTrustedJob } from '../services/trustService';
import { SAMPLE_CANDIDATES, SAMPLE_EMPLOYERS } from '../data/marketplaceSamples';
import EmployerProfileLink from '../components/EmployerProfileLink';

function CompanyLogo({ job, size = 'md' }: { job: Job; size?: 'sm' | 'md' }) {
  return <EmployerProfileLink job={job}><span className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-[1.35rem] text-white shadow-lg ring-1 ring-black/5 ${job.logoColor} ${size === 'md' ? 'h-20 w-20 text-xl' : 'h-12 w-12 text-sm'}`}><span className="absolute -right-3 -top-3 h-10 w-10 rounded-full bg-white/15" /><strong className="relative">{job.logoInitials}</strong>{isTrustedJob(job) && <BadgeCheck className="absolute bottom-2 right-2 h-4 w-4 text-white" />}</span></EmployerProfileLink>;
}

function FeaturedJobCard({ job, saved, applied, onSave, onApply }: { key?: string; job: Job; saved: boolean; applied: boolean; onSave: () => void; onApply: () => void }) {
  const store = useStore();
  const intelligence = getJobIntelligence(job, store.user);
  const trust = getJobTrustProfile(job);
  return <article className="group rounded-[1.75rem] border border-white/80 bg-white p-5 shadow-[0_14px_45px_rgba(40,72,120,0.08)] transition hover:-translate-y-1 hover:shadow-[0_22px_55px_rgba(40,72,120,0.13)] sm:p-6">
    <div className="flex items-start gap-4 sm:gap-5">
      <CompanyLogo job={job} />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div><p className="text-sm font-extrabold text-[#168bd0]">{job.company}</p><h2 className="mt-1 text-xl font-black tracking-[-0.035em] text-slate-950">{job.title}</h2></div>
          <div className="flex items-center gap-2"><span className="hidden items-center gap-1.5 text-xs font-bold text-slate-400 sm:inline-flex"><Clock3 className="h-4 w-4 text-[#168bd0]" />{job.postedAt}</span><button onClick={onSave} aria-label={saved ? `Unsave ${job.title}` : `Save ${job.title}`} className="rounded-xl border border-slate-200 p-2 text-slate-400 hover:border-blue-200 hover:bg-blue-50 hover:text-[#155eef]">{saved ? <BookmarkCheck className="h-5 w-5 text-[#155eef]" /> : <Bookmark className="h-5 w-5" />}</button></div>
        </div>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">{job.description}</p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="rounded-lg bg-[#eef4ff] px-3 py-1.5 text-xs font-extrabold text-[#155eef]">{job.skillsRequired[0]}</span>
          <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-extrabold text-slate-600">{job.type}</span>
          <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-extrabold text-slate-600">{job.experience}</span>
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-extrabold text-slate-600"><MapPin className="h-3.5 w-3.5" />{job.location}</span>
        </div>
        <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2 text-xs font-extrabold"><span className="rounded-full bg-blue-50 px-2.5 py-1 text-[#155eef]">{intelligence.score}% match</span>{trust.companyVerified && <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700"><ShieldCheck className="h-3.5 w-3.5" />Verified employer</span>}<span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-500">{trust.responseRate}% on time</span></div>
          <div className="flex shrink-0 items-center gap-2">
            <Link to={`/jobs/${job.id}`} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-sm font-extrabold text-slate-600 hover:border-blue-200 hover:text-[#155eef]">View role</Link>
            <button onClick={onApply} disabled={applied} className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-extrabold ${applied ? 'cursor-default bg-emerald-50 text-emerald-700' : 'bg-[#155eef] text-white hover:bg-[#0c3e9e]'}`}>{applied ? <><CheckCircle2 className="h-4 w-4" />Applied</> : <>Apply <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></>}</button>
          </div>
        </div>
      </div>
    </div>
  </article>;
}

export default function Jobs() {
  const store = useStore();
  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [filters, setFilters] = useState<JobFilters>(createEmptyJobFilters);
  const [trustOnly, setTrustOnly] = useState(false);
  const [alertCreated, setAlertCreated] = useState(false);
  const [applicationNotice, setApplicationNotice] = useState('');
  const passport = getCareerPassport(store.user);

  const jobs = useMemo(() => {
    const q = submittedQuery.trim().toLowerCase();
    const matched = MOCK_JOBS.filter((job) => !q || `${job.title} ${job.company} ${job.location} ${job.skillsRequired.join(' ')}`.toLowerCase().includes(q));
    const filtered = filterJobs(matched, filters);
    return trustOnly ? filtered.filter(isTrustedJob) : filtered;
  }, [filters, submittedQuery, trustOnly]);

  const savedJobs = MOCK_JOBS.filter((job) => store.savedJobs.some((saved) => saved.jobId === job.id));
  const toggleSave = (jobId: string) => store.savedJobs.some((saved) => saved.jobId === jobId) ? store.unsaveJob(jobId) : store.saveJob(jobId);
  const toggleQuick = (kind: 'Remote' | 'Full-time') => setFilters((current) => kind === 'Remote'
    ? { ...current, workplaces: toggleFilterValue(current.workplaces, 'Remote') }
    : { ...current, types: toggleFilterValue(current.types, 'Full-time') });
  const remoteActive = filters.workplaces.includes('Remote');
  const fullTimeActive = filters.types.includes('Full-time');

  const applyToJob = (job: Job) => {
    const result = store.applyToJob(job.id);
    setApplicationNotice(result.success ? `Application sent to ${job.company}. Track it from the Tracker page.` : result.error || 'Unable to apply.');
  };

  return <div className="-mx-4 -mt-6 min-h-[calc(100vh-4rem)] bg-white px-4 pb-12 pt-8 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
    <div className="mx-auto w-full max-w-7xl">
      <section className="rounded-[2rem] border border-slate-200 bg-[#f8fbff] p-5 shadow-[0_20px_70px_rgba(40,90,150,0.06)] sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#155eef] shadow-sm"><BriefcaseBusiness className="h-5 w-5" /></span><div><p className="text-xs font-black uppercase tracking-[0.16em] text-[#155eef]">Job opportunities</p><p className="text-sm font-semibold text-slate-500">Transparent roles from response-aware employers</p></div></div><div className="flex items-center gap-2 text-xs font-extrabold"><span className="rounded-full bg-white px-3 py-1.5 text-[#155eef] shadow-sm">{SAMPLE_EMPLOYERS.length}+ employers</span><span className="rounded-full bg-white px-3 py-1.5 text-violet-700 shadow-sm">{SAMPLE_CANDIDATES.length}+ candidates</span></div></div>
        <h1 className="mt-6 text-3xl font-black tracking-[-0.05em] text-slate-950 sm:text-5xl">Seeking new job opportunities?</h1>
        <form onSubmit={(event) => { event.preventDefault(); setSubmittedQuery(query); }} className="mt-6 flex rounded-2xl border border-white bg-white p-2 shadow-[0_14px_40px_rgba(50,90,140,0.12)]">
          <label className="flex min-w-0 flex-1 items-center gap-3 px-3"><Search className="h-5 w-5 shrink-0 text-slate-400" /><span className="sr-only">Search by job title, company, or skill</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by job title, company, location, or skill" className="min-h-12 min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none placeholder:text-slate-400 sm:text-base" /></label>
          <button type="submit" className="inline-flex h-12 w-14 items-center justify-center rounded-xl bg-[#082c58] text-white shadow-lg hover:bg-[#0d3d75]" aria-label="Search jobs"><Search className="h-5 w-5" /></button>
        </form>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="mr-1 inline-flex items-center gap-1.5 text-xs font-bold text-slate-500"><SlidersHorizontal className="h-4 w-4" />Quick filters</span>
          <button onClick={() => setFilters(createEmptyJobFilters())} className="rounded-full bg-[#155eef] px-3 py-1.5 text-xs font-extrabold text-white">All</button>
          <button onClick={() => toggleQuick('Remote')} className={`rounded-full border px-3 py-1.5 text-xs font-extrabold ${remoteActive ? 'border-[#155eef] bg-[#155eef] text-white' : 'border-white bg-white/70 text-slate-600'}`}>Remote</button>
          <button onClick={() => toggleQuick('Full-time')} className={`rounded-full border px-3 py-1.5 text-xs font-extrabold ${fullTimeActive ? 'border-[#155eef] bg-[#155eef] text-white' : 'border-white bg-white/70 text-slate-600'}`}>Full-time</button>
          <button onClick={() => setTrustOnly((current) => !current)} className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-extrabold ${trustOnly ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-emerald-200 bg-white/70 text-emerald-700'}`}><ShieldCheck className="h-3.5 w-3.5" />Trusted only</button>
        </div>
        <JobFilterPanel filters={filters} onChange={setFilters} onClear={() => setFilters(createEmptyJobFilters())} matchingJobs={jobs.length} />
      </section>

      <div className="mt-7 grid gap-6 lg:grid-cols-[minmax(0,1fr)_21rem] lg:items-start">
        <main>
          {applicationNotice && <div role="status" className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800"><span>{applicationNotice}</span><Link to="/applications" className="shrink-0 underline">Open Tracker</Link></div>}
          <div className="flex items-end justify-between gap-4 px-1"><div><p className="text-xs font-black uppercase tracking-[0.14em] text-[#155eef]">Curated for you</p><h2 className="mt-1 text-2xl font-black tracking-[-0.04em] text-slate-950">Featured jobs</h2><p className="mt-1 text-sm font-semibold text-slate-500">{jobs.length} role{jobs.length === 1 ? '' : 's'} {jobs.length === 1 ? 'matches' : 'match'} your search</p></div>{submittedQuery && <button onClick={() => { setQuery(''); setSubmittedQuery(''); }} className="text-sm font-extrabold text-[#155eef]">See all <ArrowRight className="ml-1 inline h-4 w-4" /></button>}</div>
          <div className="mt-5 space-y-4">{jobs.map((job) => <FeaturedJobCard key={job.id} job={job} saved={store.savedJobs.some((saved) => saved.jobId === job.id)} applied={store.appliedJobs.some((applied) => applied.jobId === job.id)} onSave={() => toggleSave(job.id)} onApply={() => applyToJob(job)} />)}</div>
          {!jobs.length && <div className="mt-5 rounded-[1.75rem] bg-white p-12 text-center shadow-sm"><Search className="mx-auto h-8 w-8 text-slate-300" /><h2 className="mt-3 font-black text-slate-800">No matching roles</h2><p className="mt-1 text-sm text-slate-500">Try a broader search or remove a filter.</p></div>}
        </main>

        <aside className="space-y-5 lg:sticky lg:top-24">
          <section className="rounded-[1.75rem] border border-white bg-white p-5 shadow-[0_16px_45px_rgba(40,72,120,0.1)]">
            <div className="flex items-center gap-3"><UserAvatar src={store.user.avatar} name={store.user.name} size="md" /><div><h2 className="font-black text-slate-900">{store.user.name}</h2><Link to="/profile" className="text-xs font-extrabold text-[#168bd0]">View profile</Link></div></div>
            <div className="mt-5 flex items-end justify-between"><div><p className="text-sm font-extrabold text-slate-800">Complete my profile</p><p className="mt-1 text-xs text-slate-500">Stronger profiles unlock better matches</p></div><strong className="text-xl font-black text-[#155eef]">{passport.profileScore}%</strong></div>
            <div className="mt-3 grid grid-cols-5 gap-1.5">{[20, 40, 60, 80, 100].map((step) => <span key={step} className={`h-2 rounded-full ${passport.profileScore >= step ? 'bg-[#1e9cf0]' : 'bg-blue-100'}`} />)}</div>
            <p className="mt-5 flex items-center gap-2 text-xs font-semibold text-slate-500"><Target className="h-4 w-4 text-[#168bd0]" />Next: add proof-backed skills</p>
            <Link to="/studio?from=profile" className="mt-4 flex min-h-11 items-center justify-between rounded-xl bg-gradient-to-r from-[#168bd0] to-[#218df4] px-4 text-sm font-extrabold text-white shadow-lg shadow-blue-500/20">Complete profile <ArrowRight className="h-4 w-4" /></Link>
          </section>

          <section className="rounded-[1.75rem] border border-white bg-white p-5 shadow-[0_16px_45px_rgba(40,72,120,0.1)]">
            <div className="flex items-start justify-between"><div><h2 className="text-lg font-black tracking-[-0.03em] text-slate-900">Never miss a job opportunity</h2><button onClick={() => setAlertCreated(true)} className="mt-3 text-sm font-extrabold text-[#168bd0]">{alertCreated ? 'Job alert created ✓' : 'Create job alert'}</button></div><span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-500"><BellRing className="h-7 w-7" /></span></div>
          </section>

          <section className="overflow-hidden rounded-[1.75rem] border border-white bg-white shadow-[0_16px_45px_rgba(40,72,120,0.1)]">
            <div className="border-b border-slate-100 p-5"><h2 className="text-lg font-black tracking-[-0.03em] text-slate-900">Don’t forget to apply</h2><p className="mt-1 text-sm font-extrabold text-[#168bd0]">My saved jobs · {savedJobs.length}</p></div>
            {savedJobs.length ? <div className="divide-y divide-slate-100">{savedJobs.slice(0, 4).map((job) => <Link key={job.id} to={`/jobs/${job.id}`} className="flex items-center gap-3 p-4 hover:bg-blue-50/50"><CompanyLogo job={job} size="sm" /><div className="min-w-0"><p className="truncate text-sm font-black text-slate-800">{job.title}</p><p className="mt-0.5 truncate text-xs font-bold text-[#168bd0]">{job.company}</p><p className="mt-1 flex items-center gap-1 text-[0.7rem] text-slate-500"><MapPin className="h-3 w-3" />{job.location}</p></div></Link>)}</div>
              : <div className="p-7 text-center"><Bookmark className="mx-auto h-7 w-7 text-slate-300" /><p className="mt-2 text-sm font-bold text-slate-500">Save roles to review later</p></div>}
          </section>

          <section className="rounded-[1.75rem] bg-[#082c58] p-5 text-white shadow-xl"><Sparkles className="h-5 w-5 text-blue-200" /><h2 className="mt-3 font-black">Build proof before applying</h2><p className="mt-1 text-xs leading-5 text-blue-100/80">JobX missions can strengthen your Career Passport and help employers see what you can do.</p><Link to="/projects" className="mt-4 inline-flex items-center gap-1.5 text-sm font-extrabold text-white">Explore projects <ArrowRight className="h-4 w-4" /></Link></section>
        </aside>
      </div>
    </div>
  </div>;
}
