import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search as SearchIcon, MapPin, Bookmark, BookmarkCheck, CheckCircle, ChevronDown,
  Briefcase, Building2, Clock, ListChecks, Star, Zap, Users, BadgeCheck,
  X, Bell, DollarSign, Globe, Layers, Hash, ExternalLink,
  AlertCircle
} from 'lucide-react';
import { MOCK_JOBS, Job } from '../data';
import { useStore } from '../store/StoreProvider';
import UserAvatar from '../components/UserAvatar';
import JobIntelligencePanel from '../components/JobIntelligencePanel';
import JobXCareerSignal from '../components/JobXCareerSignal';
import {
  describeCareerSearchIntent,
  getJobIntelligence,
  parseCareerSearchIntent,
  searchJobsWithCareerIntent,
} from '../services/careerIntelligenceService';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */
const EXPERIENCE_LEVELS = ['Entry Level', 'Mid Level', 'Senior', 'Executive'];
const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship'];
const WORKPLACE_TYPES = ['On-site', 'Hybrid', 'Remote'];
const DATE_POSTED_OPTIONS = ['Past 24 hours', 'Past week', 'Past month', 'Any time'];
const SALARY_RANGES = [
  { label: '$0 – $50k', min: 0, max: 50000 },
  { label: '$50k – $100k', min: 50000, max: 100000 },
  { label: '$100k – $150k', min: 100000, max: 150000 },
  { label: '$150k – $200k', min: 150000, max: 200000 },
  { label: '$200k+', min: 200000, max: Infinity },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
function getMatchColor(score: number): string {
  if (score >= 80) return 'bg-emerald-500';
  if (score >= 60) return 'bg-blue-500';
  if (score >= 40) return 'bg-amber-500';
  return 'bg-gray-400';
}

function daysAgo(postedDate: string): number {
  const now = new Date('2024-05-30').getTime();
  const posted = new Date(postedDate).getTime();
  return Math.floor((now - posted) / (1000 * 60 * 60 * 24));
}

/* ------------------------------------------------------------------ */
/*  FilterPill component — horizontal scrollable dropdown                */
/* ------------------------------------------------------------------ */
const FilterPill = ({
  label,
  active,
  activeLabel,
  open,
  onToggle,
  children,
}: {
  label: string;
  active: boolean;
  activeLabel?: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        if (open) onToggle();
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open, onToggle]);

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        onClick={onToggle}
        className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium transition-all border ${
          active || open
            ? 'bg-blue-50 text-blue-500 border-blue-200'
            : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
        }`}
      >
        {active && activeLabel ? activeLabel : label}
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-lg shadow-gray-200/50 border border-gray-200 z-50 overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  SalaryBar component                                                */
/* ------------------------------------------------------------------ */
const SalaryBar = ({ job }: { job: Job }) => {
  const min = job.salaryMin || 0;
  const max = job.salaryMax || min;
  const rangeMin = 50000;
  const rangeMax = 250000;
  const pct = Math.min(100, Math.max(0, ((max - rangeMin) / (rangeMax - rangeMin)) * 100));
  return (
    <div className="mt-3">
      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
        <span>Salary range</span>
        <span className="font-semibold text-gray-700">{job.salary}</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-400 to-indigo-600 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, delay: 0.2 }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
        <span>$50k</span>
        <span>$250k</span>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  JobListCard                                                        */
/* ------------------------------------------------------------------ */
const JobListCard = ({
  job, matchScore, matchLabel, isSelected, isSaved, isApplied, onClick, onToggleSave,
}: {
  job: Job;
  matchScore: number;
  matchLabel: string;
  isSelected: boolean;
  isSaved: boolean;
  isApplied: boolean;
  onClick: () => void;
  onToggleSave: (e: React.MouseEvent) => void;
}) => {
  const matchColor = getMatchColor(matchScore);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClick}
      className={`cursor-pointer border-b transition-colors relative ${
        isSelected ? 'bg-blue-50/60' : 'bg-white hover:bg-[#F8F3F0]/60'
      }`}
    >
      {/* Selected left accent */}
      {isSelected && (
        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#014BAA]" />
      )}

      <div className="px-4 py-4">
        {/* Top row: badges */}
        <div className="flex items-center gap-1.5 mb-2">
          {job.promoted && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-bold uppercase tracking-wide rounded border border-amber-200/60">
              <Zap className="w-3 h-3" /> Promoted
            </span>
          )}
          <span title={matchLabel} className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide rounded text-white ${matchColor}`}>
            <Star className="w-3 h-3" /> {matchScore}% match
          </span>
          {job.easyApply && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded border border-emerald-200/60">
              <CheckCircle className="w-3 h-3" /> Easy Apply
            </span>
          )}
          {isApplied && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold rounded border border-gray-200">
              <CheckCircle className="w-3 h-3" /> Applied
            </span>
          )}
        </div>

        {/* Title + company */}
        <div className="flex items-start gap-3">
          <div className={`w-11 h-11 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0 ${job.logoColor}`}>
            {job.logoInitials}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={`font-semibold text-[15px] mb-0.5 truncate ${isSelected ? 'text-[#014BAA]' : 'text-gray-900'}`}>
              {job.title}
            </h3>
            <p className="text-gray-700 text-[13px] font-medium">{job.company}</p>
            <div className="flex items-center gap-2 mt-1 text-[12px] text-gray-500">
              <span>{job.location}</span>
              <span className="text-gray-300">·</span>
              <span>{job.workplaceType}</span>
              <span className="text-gray-300">·</span>
              <span>{job.postedAt}</span>
            </div>
          </div>
          <button
            type="button"
            aria-label={isSaved ? `Unsave ${job.title}` : `Save ${job.title}`}
            onClick={onToggleSave}
            className={`shrink-0 p-1.5 rounded-full transition-colors ${isSaved ? 'text-[#014BAA]' : 'text-gray-400 hover:text-[#014BAA]'}`}
          >
            {isSaved ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
          </button>
        </div>

        {/* Bottom meta row */}
        <div className="flex items-center gap-3 mt-2.5">
          <span className="text-[12px] font-semibold text-[#014BAA]">{job.salary}</span>
          <span className="text-gray-300 text-[11px]">·</span>
          <span className="text-[12px] text-gray-500">{job.type}</span>
          <span className="text-gray-300 text-[11px]">·</span>
          <span className="text-[12px] text-gray-500 flex items-center gap-1">
            <Users className="w-3 h-3" /> {job.applicants} applicants
          </span>
          {job.connectionsAtCompany && job.connectionsAtCompany > 0 && (
            <>
              <span className="text-gray-300 text-[11px]">·</span>
              <span className="text-[12px] text-[#014BAA] font-medium flex items-center gap-1">
                <Users className="w-3 h-3" /> {job.connectionsAtCompany} connection{job.connectionsAtCompany > 1 ? 's' : ''}
              </span>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

/* ------------------------------------------------------------------ */
/*  Detail Section Helpers                                             */
/* ------------------------------------------------------------------ */
const Section = ({ title, icon, children, delay = 0 }: { title: string; icon: React.ReactNode; children: React.ReactNode; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.35 }}
    className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 sm:p-8 card-hover mb-6"
  >
    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
        {icon}
      </div>
      {title}
    </h3>
    {children}
  </motion.div>
);

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */
export default function Search() {
  const store = useStore();

  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialLocation = searchParams.get('loc') || '';

  const [query, setQuery] = useState(initialQuery);
  const [location, setLocation] = useState(initialLocation);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  /* Dropdown state */
  const [openDropdown, setOpenDropdown] = useState<'date' | 'experience' | 'jobType' | 'salary' | 'workplace' | null>(null);
  const [easyApplyOnly, setEasyApplyOnly] = useState(false);

  /* Filter selections */
  const [selectedExperience, setSelectedExperience] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedWorkplace, setSelectedWorkplace] = useState<string[]>([]);
  const [selectedSalary, setSelectedSalary] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('Any time');

  /* Saved searches */
  const [savedSearches, setSavedSearches] = useState<{ id: string; name: string; query: string; location: string; filters: string[] }[]>([
    { id: 'ss1', name: 'Remote React', query: 'react', location: '', filters: ['remote'] },
  ]);
  const [showSaveSearch, setShowSaveSearch] = useState(false);
  const [saveSearchName, setSaveSearchName] = useState('');

  const isSaved = (jobId: string) => store.savedJobs.some((s) => s.jobId === jobId);
  const isApplied = (jobId: string) => store.appliedJobs.some((a) => a.jobId === jobId);

  const toggleSave = (id: string) => {
    if (isSaved(id)) store.unsaveJob(id);
    else store.saveJob(id);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (location) params.append('loc', location);
    setSearchParams(params);
  };

  /* ---------- Filtering ---------- */
  const committedQuery = searchParams.get('q') || '';
  const searchIntent = useMemo(() => parseCareerSearchIntent(committedQuery), [committedQuery]);
  const searchIntentLabel = useMemo(() => describeCareerSearchIntent(searchIntent), [searchIntent]);
  const careerSearchResults = useMemo(
    () => searchJobsWithCareerIntent(committedQuery, store.user, MOCK_JOBS),
    [committedQuery, store.user],
  );
  const intelligenceByJobId = useMemo(
    () => new Map(careerSearchResults.map(({ job, intelligence }) => [job.id, intelligence])),
    [careerSearchResults],
  );
  const filteredJobs = useMemo(() => {
    let jobs = careerSearchResults.map(({ job }) => job);
    const loc = (searchParams.get('loc') || '').toLowerCase();

    if (loc) {
      jobs = jobs.filter((j) => j.location.toLowerCase().includes(loc) || j.workplaceType.toLowerCase().includes(loc));
    }

    /* Quick filters (now handled by pill dropdowns + easyApply toggle) */
    if (easyApplyOnly) jobs = jobs.filter((j) => j.easyApply);

    /* Advanced filters */
    if (selectedTypes.length) jobs = jobs.filter((j) => selectedTypes.includes(j.type));
    if (selectedExperience.length) jobs = jobs.filter((j) => selectedExperience.includes(j.experience));
    if (selectedWorkplace.length) jobs = jobs.filter((j) => selectedWorkplace.includes(j.workplaceType));

    if (selectedSalary) {
      const range = SALARY_RANGES.find((r) => r.label === selectedSalary);
      if (range) {
        jobs = jobs.filter((j) => {
          const min = j.salaryPeriod === 'hour' ? j.salaryMin * 2080 : j.salaryMin;
          const max = j.salaryPeriod === 'hour' ? j.salaryMax * 2080 : j.salaryMax;
          return min >= range.min && (range.max === Infinity || max <= range.max);
        });
      }
    }

    if (selectedDate !== 'Any time') {
      jobs = jobs.filter((j) => {
        const diff = daysAgo(j.postedDate);
        if (selectedDate === 'Past 24 hours') return diff <= 1;
        if (selectedDate === 'Past week') return diff <= 7;
        if (selectedDate === 'Past month') return diff <= 30;
        return true;
      });
    }

    return jobs;
  }, [careerSearchResults, searchParams, easyApplyOnly, selectedExperience, selectedTypes, selectedWorkplace, selectedSalary, selectedDate]);

  useEffect(() => {
    if (filteredJobs.length > 0 && (!selectedJobId || !filteredJobs.find((j) => j.id === selectedJobId))) {
      setSelectedJobId(filteredJobs[0].id);
    }
  }, [filteredJobs, selectedJobId]);

  const selectedJob = filteredJobs.find((j) => j.id === selectedJobId) || filteredJobs[0];
  const selectedJobIntelligence = selectedJob
    ? intelligenceByJobId.get(selectedJob.id) || getJobIntelligence(selectedJob, store.user)
    : null;

  const activeFilterCount =
    (easyApplyOnly ? 1 : 0) +
    selectedExperience.length +
    selectedTypes.length +
    selectedWorkplace.length +
    (selectedSalary ? 1 : 0) +
    (selectedDate !== 'Any time' ? 1 : 0);

  const clearAllFilters = () => {
    setEasyApplyOnly(false);
    setSelectedExperience([]);
    setSelectedTypes([]);
    setSelectedWorkplace([]);
    setSelectedSalary(null);
    setSelectedDate('Any time');
    setOpenDropdown(null);
    setQuery('');
    setLocation('');
    setSearchParams(new URLSearchParams());
  };

  const saveCurrentSearch = () => {
    if (!saveSearchName.trim()) return;
    setSavedSearches((prev) => [
      ...prev,
      { id: Math.random().toString(36).slice(2), name: saveSearchName, query, location, filters: [] },
    ]);
    setSaveSearchName('');
    setShowSaveSearch(false);
  };

  /* ---------- Render ---------- */
  return (
    <div className="bg-[#F8F3F0] flex flex-col min-h-[calc(100vh-64px)] overflow-hidden">

      {/* ===== Search bar ===== */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="bg-white border-b border-gray-200 z-10 px-4 py-4"
      >
        <div className="max-w-7xl mx-auto flex flex-col gap-3">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 flex items-center bg-[#F8F3F0] rounded-lg px-4 py-2.5 border border-gray-200 focus-within:border-[#014BAA] focus-within:ring-1 focus-within:ring-[#014BAA]/20 transition-all">
              <SearchIcon className="w-4 h-4 text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="Try: remote senior React roles"
                className="w-full bg-transparent border-none focus:ring-0 text-gray-900 placeholder-gray-400 ml-3 outline-none text-sm"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="flex-1 flex items-center bg-[#F8F3F0] rounded-lg px-4 py-2.5 border border-gray-200 focus-within:border-[#014BAA] focus-within:ring-1 focus-within:ring-[#014BAA]/20 transition-all">
              <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="City, state, or Remote"
                className="w-full bg-transparent border-none focus:ring-0 text-gray-900 placeholder-gray-400 ml-3 outline-none text-sm"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="gradient-primary text-white px-6 py-2.5 rounded-lg font-semibold text-sm shadow-sm flex items-center justify-center gap-2 shrink-0"
            >
              <SearchIcon className="w-4 h-4" /> Search
            </motion.button>
          </form>

          {searchIntentLabel && (
            <div className="flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50/70 px-3 py-2 text-xs text-blue-800">
              <JobXCareerSignal className="h-3.5 w-3.5 shrink-0 text-[#014BAA]" />
              <span>Career Intelligence is prioritizing <strong>{searchIntentLabel}</strong> using your visible profile evidence.</span>
            </div>
          )}

          {/* ===== Horizontal scrollable pill dropdown filters ===== */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1 flex-1">

              {/* Job Type pill */}
              <FilterPill
                label="Job type"
                active={selectedTypes.length > 0}
                activeLabel={selectedTypes.length > 0 ? `${selectedTypes.length} selected` : undefined}
                open={openDropdown === 'jobType'}
                onToggle={() => setOpenDropdown(openDropdown === 'jobType' ? null : 'jobType')}
              >
                <div className="p-2 space-y-1 min-w-[180px]">
                  {JOB_TYPES.map((t) => (
                    <button
                      key={t}
                      onClick={() =>
                        setSelectedTypes((prev) =>
                          prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
                        )
                      }
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${
                        selectedTypes.includes(t) ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700 hover:bg-[#F8F3F0]'
                      }`}
                    >
                      <span>{t}</span>
                      {selectedTypes.includes(t) && <CheckCircle className="w-4 h-4 text-blue-500" />}
                    </button>
                  ))}
                  {selectedTypes.length > 0 && (
                    <button
                      onClick={() => setSelectedTypes([])}
                      className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 font-medium mt-1"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </FilterPill>

              {/* Workplace pill */}
              <FilterPill
                label="Workplace"
                active={selectedWorkplace.length > 0}
                activeLabel={selectedWorkplace.length > 0 ? `${selectedWorkplace.length} selected` : undefined}
                open={openDropdown === 'workplace'}
                onToggle={() => setOpenDropdown(openDropdown === 'workplace' ? null : 'workplace')}
              >
                <div className="p-2 space-y-1 min-w-[180px]">
                  {WORKPLACE_TYPES.map((type) => (
                    <button
                      key={type}
                      onClick={() => setSelectedWorkplace((prev) => prev.includes(type) ? prev.filter((value) => value !== type) : [...prev, type])}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${selectedWorkplace.includes(type) ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700 hover:bg-[#F8F3F0]'}`}
                    >
                      <span>{type}</span>
                      {selectedWorkplace.includes(type) && <CheckCircle className="w-4 h-4 text-blue-500" />}
                    </button>
                  ))}
                  {selectedWorkplace.length > 0 && <button onClick={() => setSelectedWorkplace([])} className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 font-medium mt-1">Clear</button>}
                </div>
              </FilterPill>

              {/* Experience pill */}
              <FilterPill
                label="Experience"
                active={selectedExperience.length > 0}
                activeLabel={selectedExperience.length > 0 ? `${selectedExperience.length} selected` : undefined}
                open={openDropdown === 'experience'}
                onToggle={() => setOpenDropdown(openDropdown === 'experience' ? null : 'experience')}
              >
                <div className="p-2 space-y-1 min-w-[180px]">
                  {EXPERIENCE_LEVELS.map((level) => (
                    <button
                      key={level}
                      onClick={() => setSelectedExperience((prev) => prev.includes(level) ? prev.filter((value) => value !== level) : [...prev, level])}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${selectedExperience.includes(level) ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700 hover:bg-[#F8F3F0]'}`}
                    >
                      <span>{level}</span>
                      {selectedExperience.includes(level) && <CheckCircle className="w-4 h-4 text-blue-500" />}
                    </button>
                  ))}
                  {selectedExperience.length > 0 && <button onClick={() => setSelectedExperience([])} className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 font-medium mt-1">Clear</button>}
                </div>
              </FilterPill>

              {/* Salary pill */}
              <FilterPill
                label="Salary"
                active={selectedSalary !== null}
                activeLabel={selectedSalary ?? undefined}
                open={openDropdown === 'salary'}
                onToggle={() => setOpenDropdown(openDropdown === 'salary' ? null : 'salary')}
              >
                <div className="p-2 space-y-1 min-w-[180px]">
                  {SALARY_RANGES.map((r) => (
                    <button
                      key={r.label}
                      onClick={() => { setSelectedSalary(selectedSalary === r.label ? null : r.label); setOpenDropdown(null); }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${
                        selectedSalary === r.label ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700 hover:bg-[#F8F3F0]'
                      }`}
                    >
                      <span>{r.label}</span>
                      {selectedSalary === r.label && <CheckCircle className="w-4 h-4 text-blue-500" />}
                    </button>
                  ))}
                  {selectedSalary && (
                    <button
                      onClick={() => { setSelectedSalary(null); setOpenDropdown(null); }}
                      className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 font-medium mt-1"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </FilterPill>

              {/* Date Posted pill */}
              <FilterPill
                label="Date posted"
                active={selectedDate !== 'Any time'}
                activeLabel={selectedDate !== 'Any time' ? selectedDate : undefined}
                open={openDropdown === 'date'}
                onToggle={() => setOpenDropdown(openDropdown === 'date' ? null : 'date')}
              >
                <div className="p-2 space-y-1 min-w-[180px]">
                  {DATE_POSTED_OPTIONS.map((d) => (
                    <button
                      key={d}
                      onClick={() => { setSelectedDate(d); setOpenDropdown(null); }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedDate === d ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700 hover:bg-[#F8F3F0]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{d}</span>
                        {selectedDate === d && <CheckCircle className="w-4 h-4 text-blue-500" />}
                      </div>
                    </button>
                  ))}
                </div>
              </FilterPill>

              {/* Easy Apply toggle pill */}
              <button
                onClick={() => setEasyApplyOnly((v) => !v)}
                className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium transition-all border ${
                  easyApplyOnly
                    ? 'bg-blue-50 text-blue-500 border-blue-200'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                }`}
              >
                <CheckCircle className="w-3.5 h-3.5" />
                Easy Apply
              </button>

            </div>

            {/* Right side: Clear + Alert */}
            <div className="flex items-center gap-2 shrink-0">
              {activeFilterCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="text-[13px] text-[#014BAA] font-medium hover:underline px-2"
                >
                  Clear
                </button>
              )}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowSaveSearch(true)}
                className="flex items-center gap-1 px-3 py-2 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-600 hover:border-blue-300 hover:text-[#014BAA] transition-all"
              >
                <Bell className="w-3.5 h-3.5" /> Alert
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto w-full min-h-0 flex-1 flex flex-col md:flex-row overflow-hidden">

        {/* ===== LEFT: Job List ===== */}
        <div className="w-full md:w-[42%] flex flex-col border-r border-gray-200 bg-white">

          {/* Results header */}
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-[15px] font-bold text-gray-900">
                {filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'}
              </span>
              {(query || location || activeFilterCount > 0) && (
                <span className="text-sm text-gray-500">
                  for "{query || 'all'}" {location ? `in ${location}` : ''}
                </span>
              )}
            </div>
            <span className="text-xs text-gray-400 font-medium">Sorted by relevance</span>
          </div>

          {/* Job list */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {filteredJobs.length === 0 ? (
              <div className="p-8 text-center">
                <AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No jobs matched your criteria.</p>
                <p className="text-sm text-gray-400 mt-1">Try adjusting your filters or search terms.</p>
                <button onClick={clearAllFilters} className="mt-3 text-sm text-[#014BAA] font-medium hover:underline">
                  Clear all filters
                </button>
              </div>
            ) : (
              filteredJobs.map((job) => (
                <React.Fragment key={job.id}>
                  <JobListCard
                    job={job}
                    matchScore={intelligenceByJobId.get(job.id)?.score || getJobIntelligence(job, store.user).score}
                    matchLabel={intelligenceByJobId.get(job.id)?.label || getJobIntelligence(job, store.user).label}
                    isSelected={selectedJobId === job.id}
                    isSaved={isSaved(job.id)}
                    isApplied={isApplied(job.id)}
                    onClick={() => setSelectedJobId(job.id)}
                    onToggleSave={(e) => { e.stopPropagation(); toggleSave(job.id); }}
                  />
                </React.Fragment>
              ))
            )}
          </div>
        </div>

        {/* ===== RIGHT: Job Detail ===== */}
        <div className="hidden md:flex flex-col md:w-[58%] bg-gradient-to-br from-gray-50/80 to-blue-50/20 overflow-y-auto custom-scrollbar">
          <AnimatePresence mode="wait">
            {selectedJob ? (
              <motion.div
                key={selectedJob.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                className="p-8 max-w-3xl mx-auto w-full"
              >
                {/* Header */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 sm:p-8 relative overflow-hidden mb-6"
                >
                  <div className="absolute top-0 left-0 right-0 h-1 gradient-primary" />
                  <div className="flex items-start gap-4 mb-5">
                    <div
                      className={`w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-md shrink-0 ${selectedJob.logoColor}`}
                    >
                      {selectedJob.logoInitials}
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-extrabold text-gray-900 mb-1">{selectedJob.title}</h2>
                      <div className="flex items-center gap-2 text-gray-700 mb-0.5">
                        <span className="font-semibold">{selectedJob.company}</span>
                        {selectedJob.activelyRecruiting && (
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold uppercase rounded-full border border-blue-200">
                            Actively recruiting
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{selectedJob.location} · {selectedJob.workplaceType}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-5">
                    <span className="flex items-center gap-1.5 bg-[#F8F3F0] px-3 py-1.5 rounded-md text-gray-700 text-sm font-semibold">
                      <Briefcase className="w-4 h-4 text-[#014BAA]" /> {selectedJob.type}
                    </span>
                    <span className="flex items-center gap-1.5 bg-[#F8F3F0] px-3 py-1.5 rounded-md text-gray-700 text-sm font-semibold">
                      <Clock className="w-4 h-4 text-[#014BAA]" /> {selectedJob.experience}
                    </span>
                    <span className="flex items-center gap-1.5 bg-[#F8F3F0] px-3 py-1.5 rounded-md text-sm font-bold text-blue-700">
                      <DollarSign className="w-4 h-4 text-[#014BAA]" /> {selectedJob.salary}
                    </span>
                    <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-bold text-white ${getMatchColor(selectedJobIntelligence?.score || 0)}`}>
                      <Star className="w-4 h-4" /> {selectedJobIntelligence?.score}% {selectedJobIntelligence?.label}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => { if (!isApplied(selectedJob.id)) store.applyToJob(selectedJob.id); }}
                      className={`px-7 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                        isApplied(selectedJob.id)
                          ? 'bg-gray-100 text-gray-500 cursor-default'
                          : selectedJob.easyApply
                          ? 'gradient-primary text-white shadow-md shadow-blue-500/20 hover:shadow-lg'
                          : 'bg-purple-600 text-white shadow-md hover:shadow-lg'
                      }`}
                    >
                      {isApplied(selectedJob.id) ? (
                        <><CheckCircle className="w-4 h-4" /> Applied</>
                      ) : selectedJob.easyApply ? (
                        <><CheckCircle className="w-4 h-4" /> Easy Apply</>
                      ) : (
                        <><ExternalLink className="w-4 h-4" /> Apply on company site</>
                      )}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => toggleSave(selectedJob.id)}
                      className={`flex items-center gap-2 px-5 py-2.5 border-2 rounded-xl font-bold text-sm transition-all ${
                        isSaved(selectedJob.id)
                          ? 'border-blue-300 text-[#014BAA] bg-blue-50'
                          : 'border-gray-200 text-gray-700 hover:border-blue-300 hover:text-[#014BAA]'
                      }`}
                    >
                      {isSaved(selectedJob.id) ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                      {isSaved(selectedJob.id) ? 'Saved' : 'Save'}
                    </motion.button>
                  </div>

                  <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-4 h-4" /> {selectedJob.applicants} applicants
                    </span>
                    {selectedJob.connectionsAtCompany && selectedJob.connectionsAtCompany > 0 && (
                      <span className="flex items-center gap-1.5 text-[#014BAA] font-medium">
                        <Users className="w-4 h-4" /> {selectedJob.connectionsAtCompany} connection{selectedJob.connectionsAtCompany > 1 ? 's' : ''} work here
                      </span>
                    )}
                  </div>
                </motion.div>

                <div className="mb-6">
                  <JobIntelligencePanel job={selectedJob} user={store.user} />
                </div>

                {/* Description */}
                <Section title="About the Role" icon={<Hash className="w-4 h-4 text-white" />} delay={0.15}>
                  <p className="text-[15px] text-gray-700 leading-relaxed">{selectedJob.description}</p>
                </Section>

                {/* Company */}
                <Section title={`About ${selectedJob.company}`} icon={<Building2 className="w-4 h-4 text-white" />} delay={0.2}>
                  <p className="text-[15px] text-gray-700 leading-relaxed mb-4">{selectedJob.companyOverview}</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { icon: <Users className="w-4 h-4" />, label: 'Size', value: selectedJob.companySize },
                      { icon: <Layers className="w-4 h-4" />, label: 'Industry', value: selectedJob.companyIndustry },
                      { icon: <Globe className="w-4 h-4" />, label: 'Founded', value: selectedJob.companyFounded },
                      { icon: <MapPin className="w-4 h-4" />, label: 'HQ', value: selectedJob.location },
                    ].map((item) => (
                      <div key={item.label} className="flex items-start gap-2.5 p-3 bg-[#F8F3F0] rounded-lg">
                        <div className="text-[#014BAA] mt-0.5">{item.icon}</div>
                        <div>
                          <p className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">{item.label}</p>
                          <p className="text-sm font-semibold text-gray-900">{item.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {selectedJob.connectionsAtCompany && selectedJob.connectionsAtCompany > 0 && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#014BAA]" />
                      <span className="text-sm text-blue-800 font-medium">
                        {selectedJob.connectionsAtCompany} of your connections work here
                      </span>
                    </div>
                  )}
                </Section>

                {/* Recruiter */}
                {selectedJob.recruiterName && (
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 sm:p-8 card-hover mb-6"
                  >
                    <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-sm">
                        <Users className="w-4 h-4 text-white" />
                      </div>
                      Recruiting Team
                    </h3>
                    <div className="flex items-center gap-3 p-3 bg-[#F8F3F0] rounded-xl">
                      <UserAvatar name={selectedJob.recruiterName} size="md" />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{selectedJob.recruiterName}</p>
                        <p className="text-xs text-gray-500">{selectedJob.recruiterTitle} at {selectedJob.company}</p>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="ml-auto px-3 py-1.5 text-xs font-semibold text-[#014BAA] border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                      >
                        Message
                      </motion.button>
                    </div>
                  </motion.div>
                )}

                {/* Responsibilities */}
                <Section title="Responsibilities" icon={<ListChecks className="w-4 h-4 text-white" />} delay={0.28}>
                  <ul className="space-y-3">
                    {selectedJob.responsibilities.map((resp, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + i * 0.04 }}
                        className="flex items-start gap-3"
                      >
                        <div className="shrink-0 w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center mt-0.5 shadow-sm">
                          <CheckCircle className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-[15px] text-gray-700">{resp}</span>
                      </motion.li>
                    ))}
                  </ul>
                </Section>

                {/* Requirements */}
                {selectedJob.requirements && selectedJob.requirements.length > 0 && (
                  <Section title="Requirements" icon={<CheckCircle className="w-4 h-4 text-white" />} delay={0.32}>
                    <ul className="space-y-3">
                      {selectedJob.requirements.map((req, i) => (
                        <motion.li
                          key={i}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.34 + i * 0.04 }}
                          className="flex items-start gap-3"
                        >
                          <div className="shrink-0 w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 mt-2" />
                          <span className="text-[15px] text-gray-700">{req}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </Section>
                )}

                {/* Skills */}
                <Section title="Skills" icon={<Briefcase className="w-4 h-4 text-white" />} delay={0.36}>
                  <div className="flex flex-wrap gap-2">
                    {selectedJob.skillsRequired.map((skill) => (
                      <span key={skill} className="px-3 py-1.5 bg-blue-50 text-blue-700 text-sm font-semibold rounded-lg border border-blue-100">
                        {skill}
                      </span>
                    ))}
                  </div>
                </Section>

                {/* Benefits */}
                {selectedJob.benefits.length > 0 && (
                  <Section title="Benefits & Perks" icon={<BadgeCheck className="w-4 h-4 text-white" />} delay={0.38}>
                    <div className="flex flex-wrap gap-2">
                      {selectedJob.benefits.map((b) => (
                        <span key={b} className="px-3 py-1.5 bg-emerald-50 text-emerald-800 text-sm font-semibold rounded-lg border border-emerald-100">
                          {b}
                        </span>
                      ))}
                    </div>
                  </Section>
                )}

                {/* Salary Insights */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 sm:p-8 card-hover mb-6"
                >
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-sm">
                      <DollarSign className="w-4 h-4 text-white" />
                    </div>
                    Salary Insights
                  </h3>
                  <SalaryBar job={selectedJob} />
                  <div className="grid grid-cols-3 gap-3 mt-4">
                    {[
                      { label: 'Base range', value: selectedJob.salary, color: 'bg-blue-500' },
                      { label: 'Bonus', value: 'Up to 15%', color: 'bg-emerald-500' },
                      { label: 'Total est.', value: `~$${Math.round(((selectedJob.salaryMin + selectedJob.salaryMax) / 2 * 1.15) / 1000)}k`, color: 'bg-purple-500' },
                    ].map((item) => (
                      <div key={item.label} className="text-center p-3 bg-[#F8F3F0] rounded-lg">
                        <div className={`w-2 h-2 rounded-full mx-auto mb-1.5 ${item.color}`} />
                        <p className="text-sm font-bold text-gray-900">{item.value}</p>
                        <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider mt-0.5">{item.label}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-6 text-center text-xs text-gray-400 pb-4"
                >
                  Posted {selectedJob.postedAt} · {selectedJob.applicants} applicants
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex items-center justify-center p-8 bg-[#F8F3F0]"
              >
                <div className="text-center">
                  <div className="bg-white p-4 rounded-full inline-block shadow-sm mb-4">
                    <Briefcase className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Select a job</h3>
                  <p className="text-gray-500">Click on a job in the list to view the full details and apply.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ===== Save Search Modal ===== */}
      <AnimatePresence>
        {showSaveSearch && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-900">Save Search Alert</h2>
                <button onClick={() => setShowSaveSearch(false)} className="text-gray-400 hover:text-gray-600 p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Name this search</label>
                  <input
                    type="text"
                    placeholder="e.g. Remote React Jobs"
                    value={saveSearchName}
                    onChange={(e) => setSaveSearchName(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-[#F8F3F0] focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                  <p className="text-xs text-blue-700">
                    We'll notify you when new jobs match <span className="font-semibold">"{query || 'all'}"</span>
                  </p>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
                <button onClick={() => setShowSaveSearch(false)} className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors">
                  Cancel
                </button>
                <motion.button
                  onClick={saveCurrentSearch}
                  disabled={!saveSearchName.trim()}
                  className="flex-1 px-4 py-2.5 gradient-primary text-white rounded-xl text-sm font-semibold shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                  whileHover={{ scale: saveSearchName.trim() ? 1.02 : 1 }}
                  whileTap={{ scale: saveSearchName.trim() ? 0.98 : 1 }}
                >
                  <Bell className="w-4 h-4" /> Save
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
