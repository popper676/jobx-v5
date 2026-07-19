import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronRight,
  Clock3,
  DollarSign,
  MapPin,
  Network,
  Search,
  Send,
  ShieldCheck,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { MOCK_JOBS, Job } from '../data';
import { useStore } from '../store/StoreProvider';
import JobFilterPanel from '../components/JobFilterPanel';
import JobIntelligencePanel from '../components/JobIntelligencePanel';
import JobXIconTile from '../components/JobXIconTile';
import JobXCareerSignal from '../components/JobXCareerSignal';
import JobTrustSignals from '../components/JobTrustSignals';
import {
  describeCareerSearchIntent,
  getJobIntelligence,
  parseCareerSearchIntent,
  searchJobsWithCareerIntent,
} from '../services/careerIntelligenceService';
import {
  createEmptyJobFilters,
  filterJobs,
  getActiveJobFilterCount,
  toggleFilterValue,
  type JobFilters,
} from '../services/jobFilterService';
import { isTrustedJob } from '../services/trustService';

export default function Jobs() {
  const store = useStore();
  const [keywordInput, setKeywordInput] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [filters, setFilters] = useState<JobFilters>(createEmptyJobFilters);
  const [trustOnly, setTrustOnly] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(MOCK_JOBS[0] ?? null);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const careerSearchResults = useMemo(
    () => searchJobsWithCareerIntent(keyword, store.user, MOCK_JOBS),
    [keyword, store.user],
  );
  const searchIntentLabel = useMemo(
    () => describeCareerSearchIntent(parseCareerSearchIntent(keyword)),
    [keyword],
  );
  const filteredJobs = useMemo(() => {
    const normalizedLocation = location.trim().toLowerCase();
    const jobsMatchingLocation = careerSearchResults.map(({ job }) => job).filter((job) => (
      !normalizedLocation || job.location.toLowerCase().includes(normalizedLocation) || job.workplaceType.toLowerCase().includes(normalizedLocation)
    ));
    const jobsMatchingFilters = filterJobs(jobsMatchingLocation, filters);
    return trustOnly ? jobsMatchingFilters.filter(isTrustedJob) : jobsMatchingFilters;
  }, [careerSearchResults, filters, location, trustOnly]);

  useEffect(() => {
    setSelectedJob((current) => filteredJobs.find((job) => job.id === current?.id) ?? filteredJobs[0] ?? null);
  }, [filteredJobs]);

  const applySearch = () => {
    setKeyword(keywordInput);
    setLocation(locationInput);
  };

  const resetFilters = () => {
    setKeywordInput('');
    setLocationInput('');
    setKeyword('');
    setLocation('');
    setFilters(createEmptyJobFilters());
    setTrustOnly(false);
  };

  const isSaved = (jobId: string) => store.savedJobs.some((savedJob) => savedJob.jobId === jobId);
  const isApplied = (jobId: string) => store.appliedJobs.some((appliedJob) => appliedJob.jobId === jobId);
  const activeFilterCount = getActiveJobFilterCount(filters);
  const hasActiveFilters = Boolean(keyword || location || keywordInput || locationInput || activeFilterCount || trustOnly);

  const toggleQuickFilter = (filter: 'Remote' | 'Full-time') => {
    if (filter === 'Remote') {
      setFilters((current) => ({ ...current, workplaces: toggleFilterValue(current.workplaces, 'Remote') }));
      return;
    }
    setFilters((current) => ({ ...current, types: toggleFilterValue(current.types, 'Full-time') }));
  };

  const isQuickFilterActive = (filter: 'Remote' | 'Full-time') => (
    filter === 'Remote' ? filters.workplaces.includes('Remote') : filters.types.includes('Full-time')
  );
  const selectedJobIntelligence = selectedJob ? getJobIntelligence(selectedJob, store.user) : null;

  const toggleSave = (jobId: string) => {
    if (isSaved(jobId)) store.unsaveJob(jobId);
    else store.saveJob(jobId);
  };

  const applyToSelectedJob = () => {
    if (!selectedJob) return;
    const result = store.applyToJob(selectedJob.id);
    setNotice(result.success
      ? { type: 'success', message: 'Application sent. You can follow every update in your tracker.' }
      : { type: 'error', message: result.error || 'We could not submit your application. Please try again.' });
  };

  return (
    <div className="product-page min-h-[calc(100vh-4rem)] pb-10">
      <section className="border-b border-slate-200 bg-white/75 py-8 dark:border-slate-800 dark:bg-slate-950/35 sm:py-10">
        <div className="product-shell">
          <div className="mt-1 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-start gap-3.5 sm:gap-4">
              <JobXIconTile icon={BriefcaseBusiness} size="lg" />
              <div>
                <span className="product-eyebrow">Opportunities with clarity</span>
                <h1 className="product-title mt-2 text-4xl font-extrabold sm:text-5xl">Find work that respects your time.</h1>
                <p className="product-copy mt-2 text-sm sm:text-base">Roles, response commitments and your next step—without the guesswork.</p>
              </div>
            </div>
            <div className="inline-flex items-center gap-2 self-start rounded-full bg-[#eef4ff] px-3 py-1.5 text-xs font-extrabold text-[#0c3e9e] dark:bg-blue-950/60 dark:text-blue-200"><ShieldCheck className="h-4 w-4" /> Response-aware jobs</div>
          </div>

          <form onSubmit={(event) => { event.preventDefault(); applySearch(); }} className="product-surface mt-7 grid gap-3 p-3 md:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)_auto]">
            <label className="group flex min-h-12 items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 transition-colors focus-within:border-[#155eef] focus-within:ring-4 focus-within:ring-blue-100/70 dark:border-slate-700 dark:bg-slate-900 dark:focus-within:ring-blue-950">
              <Search className="h-5 w-5 shrink-0 text-slate-400 transition-colors group-focus-within:text-[#155eef]" /><span className="sr-only">Search by role, company, or skill</span><input value={keywordInput} onChange={(event) => setKeywordInput(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400 dark:text-white" placeholder="Try: remote senior React roles" />
            </label>
            <label className="group flex min-h-12 items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 transition-colors focus-within:border-[#155eef] focus-within:ring-4 focus-within:ring-blue-100/70 dark:border-slate-700 dark:bg-slate-900 dark:focus-within:ring-blue-950">
              <MapPin className="h-5 w-5 shrink-0 text-slate-400 transition-colors group-focus-within:text-[#155eef]" /><span className="sr-only">Search by location</span><input value={locationInput} onChange={(event) => setLocationInput(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400 dark:text-white" placeholder="City, country or remote" />
            </label>
            <button type="submit" className="product-button-primary product-focus px-5">Search roles <ArrowRight className="h-4 w-4" /></button>
          </form>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="mr-1 inline-flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400"><SlidersHorizontal className="h-4 w-4" /> Filter</span>
            <button onClick={() => setFilters(createEmptyJobFilters())} aria-pressed={activeFilterCount === 0} className={`product-focus rounded-full px-3 py-1.5 text-xs font-extrabold transition-colors ${activeFilterCount === 0 ? 'bg-[#014BAA] text-white' : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'}`}>All</button>
            {(['Remote', 'Full-time'] as const).map((filter) => <button key={filter} onClick={() => toggleQuickFilter(filter)} aria-pressed={isQuickFilterActive(filter)} className={`product-focus rounded-full px-3 py-1.5 text-xs font-extrabold transition-colors ${isQuickFilterActive(filter) ? 'bg-[#014BAA] text-white' : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'}`}>{filter}</button>)}
            <button onClick={() => setTrustOnly((current) => !current)} aria-pressed={trustOnly} className={`product-focus inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-extrabold transition-colors ${trustOnly ? 'bg-emerald-600 text-white' : 'border border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50 dark:border-emerald-900 dark:bg-slate-900 dark:text-emerald-300'}`}><ShieldCheck className="h-3.5 w-3.5" />Trusted only</button>
            {hasActiveFilters && <button onClick={resetFilters} className="product-focus ml-1 inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-bold text-[#155eef] hover:bg-blue-50 dark:hover:bg-blue-950/50"><X className="h-3.5 w-3.5" /> Clear filters</button>}
            {searchIntentLabel && <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-[#eef4ff] px-3 py-1.5 text-xs font-bold text-[#0c3e9e] dark:bg-blue-950/60 dark:text-blue-200"><JobXCareerSignal className="h-3.5 w-3.5" /> Interpreting: {searchIntentLabel}</span>}
          </div>
          <JobFilterPanel
            filters={filters}
            onChange={setFilters}
            onClear={() => setFilters(createEmptyJobFilters())}
            matchingJobs={filteredJobs.length}
          />
        </div>
      </section>

      <div className="product-shell mt-6 grid gap-5 lg:grid-cols-[minmax(18.5rem,0.8fr)_minmax(0,1.2fr)] lg:items-start">
        <section aria-label="Job search results" className="product-surface overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800"><div><p className="text-sm font-extrabold text-slate-900 dark:text-white">{filteredJobs.length} role{filteredJobs.length === 1 ? '' : 's'} found</p><p className="mt-0.5 text-xs font-medium text-slate-500 dark:text-slate-400">Best matches for your profile</p></div><JobXIconTile icon={Network} size="sm" /></div>
          {filteredJobs.length ? <div className="max-h-[39rem] divide-y divide-slate-100 overflow-y-auto dark:divide-slate-800">{filteredJobs.map((job) => {
            const isSelected = selectedJob?.id === job.id;
            const intelligence = getJobIntelligence(job, store.user);
            return <button key={job.id} onClick={() => { setSelectedJob(job); setNotice(null); }} className={`product-focus w-full border-l-[3px] px-5 py-4 text-left transition-colors ${isSelected ? 'border-l-[#155eef] bg-[#eef4ff]/75 dark:bg-blue-950/35' : 'border-l-transparent hover:bg-slate-50 dark:hover:bg-slate-900/50'}`}>
              <div className="flex items-start gap-3"><span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold text-white shadow-sm ${job.logoColor}`}>{job.logoInitials}</span><span className="min-w-0 flex-1"><span className="flex items-start justify-between gap-3"><span className={`truncate text-sm font-extrabold tracking-[-0.02em] ${isSelected ? 'text-[#0c3e9e] dark:text-blue-200' : 'text-slate-900 dark:text-white'}`}>{job.title}</span><span className="whitespace-nowrap text-xs font-extrabold text-[#155eef]">{intelligence.score}%</span></span><span className="mt-0.5 block truncate text-xs font-semibold text-slate-500 dark:text-slate-400">{job.company} · {intelligence.label}</span><span className="mt-2 flex flex-wrap gap-x-2 text-xs text-slate-500 dark:text-slate-400"><span>{job.location}</span><span>·</span><span>{job.workplaceType}</span><span>·</span><span>{job.postedAt}</span></span></span></div>
            </button>;
          })}</div> : <div className="px-6 py-16 text-center"><span className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-[#eef4ff] text-[#155eef] dark:bg-blue-950/60"><Search className="h-5 w-5" /></span><h2 className="mt-4 text-sm font-extrabold text-slate-900 dark:text-white">No roles match that search</h2><p className="product-copy mt-1 text-sm">Try removing a filter or using a broader skill.</p><button onClick={resetFilters} className="product-focus mt-4 text-sm font-extrabold text-[#155eef] hover:underline">Reset search</button></div>}
        </section>

        <section aria-live="polite" className="product-surface min-h-[30rem] overflow-hidden lg:sticky lg:top-20">
          {selectedJob ? <>
            <div className="border-b border-slate-100 p-5 sm:p-7 dark:border-slate-800"><div className="flex items-start justify-between gap-4"><div className="flex min-w-0 items-center gap-4"><span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-lg font-extrabold text-white shadow-sm ${selectedJob.logoColor}`}>{selectedJob.logoInitials}</span><div className="min-w-0"><p className="text-sm font-extrabold text-slate-900 dark:text-white">{selectedJob.company}</p><h2 className="mt-1 text-2xl font-extrabold tracking-[-0.04em] text-slate-900 dark:text-white sm:text-3xl">{selectedJob.title}</h2></div></div><button onClick={() => toggleSave(selectedJob.id)} aria-label={isSaved(selectedJob.id) ? `Unsave ${selectedJob.title}` : `Save ${selectedJob.title}`} className="product-focus rounded-xl border border-slate-200 p-2.5 text-slate-500 transition-colors hover:border-blue-200 hover:bg-[#eef4ff] hover:text-[#155eef] dark:border-slate-700 dark:hover:bg-blue-950/50">{isSaved(selectedJob.id) ? <BookmarkCheck className="h-5 w-5 text-[#155eef]" /> : <Bookmark className="h-5 w-5" />}</button></div>
              <div className="mt-6 flex flex-wrap gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300"><span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1.5 dark:bg-slate-800"><MapPin className="h-4 w-4 text-[#155eef]" />{selectedJob.location} · {selectedJob.workplaceType}</span><span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1.5 dark:bg-slate-800"><Clock3 className="h-4 w-4 text-[#155eef]" />{selectedJob.type}</span><span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1.5 dark:bg-slate-800"><DollarSign className="h-4 w-4 text-[#155eef]" />{selectedJob.salary}</span></div>
              <div className="mt-5"><span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-[#eef4ff] px-3 py-1.5 text-xs font-extrabold text-[#0c3e9e] dark:bg-blue-950/60 dark:text-blue-200"><Network aria-hidden="true" className="h-3.5 w-3.5" />{selectedJobIntelligence?.score}% · {selectedJobIntelligence?.label}</span><JobTrustSignals job={selectedJob} /></div>
            </div>

            <div className="space-y-6 p-5 sm:p-7"><JobTrustSignals job={selectedJob} variant="full" /><JobIntelligencePanel job={selectedJob} user={store.user} /><div><h3 className="text-sm font-extrabold uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400">The role</h3><p className="product-copy mt-3 text-sm">{selectedJob.description}</p></div><div><h3 className="text-sm font-extrabold uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400">What you will bring</h3><ul className="mt-3 grid gap-2 sm:grid-cols-2">{selectedJob.requirements.slice(0, 4).map((requirement) => <li key={requirement} className="flex items-start gap-2 text-sm leading-5 text-slate-700 dark:text-slate-300"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#155eef]" />{requirement}</li>)}</ul></div><div className="flex flex-wrap gap-1.5">{selectedJob.skillsRequired.slice(0, 6).map((skill) => <span key={skill} className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">{skill}</span>)}</div>
              {notice && <div role="status" className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm font-semibold ${notice.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200' : 'border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200'}`}><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /><span>{notice.message}{notice.type === 'success' && <Link to="/applications" className="ml-1 underline underline-offset-2">Open tracker</Link>}</span></div>}
              <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row dark:border-slate-800"><button onClick={applyToSelectedJob} disabled={isApplied(selectedJob.id)} className={`product-focus inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl px-5 text-sm font-extrabold transition-colors ${isApplied(selectedJob.id) ? 'cursor-default bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200' : 'bg-[#155eef] text-white shadow-lg shadow-blue-600/15 hover:bg-[#0c3e9e]'}`}>{isApplied(selectedJob.id) ? <><CheckCircle2 className="h-4 w-4" /> Applied</> : <><Send className="h-4 w-4" /> Apply to this role</>}</button><Link to={`/jobs/${selectedJob.id}`} className="product-button-secondary product-focus px-5">Full role <ChevronRight className="h-4 w-4" /></Link></div>
            </div>
          </> : <div className="flex min-h-[30rem] flex-col items-center justify-center px-6 text-center"><BriefcaseBusiness className="h-10 w-10 text-slate-300" /><h2 className="mt-4 text-lg font-extrabold text-slate-900 dark:text-white">Choose a role to review</h2><p className="product-copy mt-1 text-sm">Your selected job will appear here.</p></div>}
        </section>
      </div>
    </div>
  );
}
