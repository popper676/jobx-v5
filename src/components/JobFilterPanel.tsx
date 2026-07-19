import { CheckCircle2, ChevronDown, ChevronUp, SlidersHorizontal, X } from 'lucide-react';
import { useState } from 'react';
import {
  EXPERIENCE_OPTIONS,
  getActiveJobFilterCount,
  JOB_TYPE_OPTIONS,
  MINIMUM_SALARY_OPTIONS,
  POSTED_WITHIN_OPTIONS,
  toggleFilterValue,
  WORKPLACE_OPTIONS,
  type JobFilters,
} from '../services/jobFilterService';

interface JobFilterPanelProps {
  filters: JobFilters;
  onChange: (filters: JobFilters) => void;
  onClear: () => void;
  matchingJobs: number;
}

interface FilterOptionGroupProps<T extends string> {
  label: string;
  options: readonly T[];
  values: T[];
  onToggle: (value: T) => void;
}

function FilterOptionGroup<T extends string>({ label, options, values, onToggle }: FilterOptionGroupProps<T>) {
  return (
    <fieldset>
      <legend className="text-xs font-extrabold uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400">{label}</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((option) => {
          const selected = values.includes(option);
          return (
            <button
              key={option}
              type="button"
              aria-pressed={selected}
              onClick={() => onToggle(option)}
              className={`product-focus inline-flex min-h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-bold transition-colors ${selected ? 'border-[#155eef] bg-[#eef4ff] text-[#0c3e9e] dark:border-blue-400 dark:bg-blue-950/50 dark:text-blue-200' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'}`}
            >
              {selected && <CheckCircle2 className="h-3.5 w-3.5" />}
              {option}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export default function JobFilterPanel({ filters, onChange, onClear, matchingJobs }: JobFilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const activeCount = getActiveJobFilterCount(filters);

  const toggleList = <T extends string,>(key: 'types' | 'workplaces' | 'experienceLevels', value: T) => {
    const currentValues = filters[key] as T[];
    onChange({ ...filters, [key]: toggleFilterValue(currentValues, value) } as JobFilters);
  };

  return (
    <section className="mt-4" aria-label="Job filters">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          aria-expanded={isExpanded}
          aria-controls="all-job-filters"
          onClick={() => setIsExpanded((current) => !current)}
          className={`product-focus inline-flex min-h-10 items-center gap-2 rounded-xl border px-3.5 text-sm font-extrabold transition-colors ${isExpanded || activeCount ? 'border-blue-200 bg-[#eef4ff] text-[#0c3e9e] dark:border-blue-900 dark:bg-blue-950/50 dark:text-blue-200' : 'border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-[#eef4ff] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-blue-950/40'}`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          All filters
          {activeCount > 0 && <span className="rounded-full bg-[#155eef] px-1.5 py-0.5 text-[11px] leading-none text-white">{activeCount}</span>}
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {activeCount > 0 && <span role="status" className="text-xs font-semibold text-slate-500 dark:text-slate-400">{activeCount} filter{activeCount === 1 ? '' : 's'} active</span>}
        {activeCount > 0 && <button type="button" onClick={onClear} className="product-focus inline-flex min-h-9 items-center gap-1 rounded-lg px-2 text-xs font-extrabold text-[#155eef] hover:bg-blue-50 dark:hover:bg-blue-950/40"><X className="h-3.5 w-3.5" /> Clear all</button>}
      </div>

      {isExpanded && (
        <div id="all-job-filters" className="product-surface mt-3 overflow-hidden border border-blue-100/90 dark:border-blue-900/70">
          <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900/45">
            <div>
              <p className="text-sm font-extrabold text-slate-900 dark:text-white">Narrow your search</p>
              <p className="mt-0.5 text-xs font-medium text-slate-500 dark:text-slate-400">Choose any combination. Options in the same group expand your results.</p>
            </div>
            <span aria-live="polite" className="inline-flex w-fit rounded-full bg-white px-2.5 py-1 text-xs font-extrabold text-[#0c3e9e] shadow-sm dark:bg-slate-800 dark:text-blue-200">{matchingJobs} role{matchingJobs === 1 ? '' : 's'} match</span>
          </div>

          <div className="grid gap-6 p-4 sm:grid-cols-2 xl:grid-cols-3">
            <FilterOptionGroup label="Work style" options={WORKPLACE_OPTIONS} values={filters.workplaces} onToggle={(value) => toggleList('workplaces', value)} />
            <FilterOptionGroup label="Employment type" options={JOB_TYPE_OPTIONS} values={filters.types} onToggle={(value) => toggleList('types', value)} />
            <FilterOptionGroup label="Experience level" options={EXPERIENCE_OPTIONS} values={filters.experienceLevels} onToggle={(value) => toggleList('experienceLevels', value)} />

            <fieldset>
              <legend className="text-xs font-extrabold uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400">Minimum salary (USD)</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {MINIMUM_SALARY_OPTIONS.map((option) => {
                  const selected = filters.minimumSalary === option.value;
                  return <button key={option.label} type="button" aria-pressed={selected} onClick={() => onChange({ ...filters, minimumSalary: option.value })} className={`product-focus min-h-9 rounded-lg border px-3 text-xs font-bold transition-colors ${selected ? 'border-[#155eef] bg-[#eef4ff] text-[#0c3e9e] dark:border-blue-400 dark:bg-blue-950/50 dark:text-blue-200' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'}`}>{option.label}</button>;
                })}
              </div>
            </fieldset>

            <fieldset>
              <legend className="text-xs font-extrabold uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400">Date posted</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {POSTED_WITHIN_OPTIONS.map((option) => {
                  const selected = filters.postedWithin === option.value;
                  return <button key={option.value} type="button" aria-pressed={selected} onClick={() => onChange({ ...filters, postedWithin: option.value })} className={`product-focus min-h-9 rounded-lg border px-3 text-xs font-bold transition-colors ${selected ? 'border-[#155eef] bg-[#eef4ff] text-[#0c3e9e] dark:border-blue-400 dark:bg-blue-950/50 dark:text-blue-200' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'}`}>{option.label}</button>;
                })}
              </div>
            </fieldset>

            <fieldset>
              <legend className="text-xs font-extrabold uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400">Application flow</legend>
              <div className="mt-2 grid gap-2">
                <button type="button" aria-pressed={filters.easyApplyOnly} onClick={() => onChange({ ...filters, easyApplyOnly: !filters.easyApplyOnly })} className={`product-focus flex min-h-10 items-center justify-between rounded-lg border px-3 text-left text-xs font-bold transition-colors ${filters.easyApplyOnly ? 'border-[#155eef] bg-[#eef4ff] text-[#0c3e9e] dark:border-blue-400 dark:bg-blue-950/50 dark:text-blue-200' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'}`}><span>Easy Apply</span>{filters.easyApplyOnly && <CheckCircle2 className="h-4 w-4" />}</button>
                <button type="button" aria-pressed={filters.activelyRecruitingOnly} onClick={() => onChange({ ...filters, activelyRecruitingOnly: !filters.activelyRecruitingOnly })} className={`product-focus flex min-h-10 items-center justify-between rounded-lg border px-3 text-left text-xs font-bold transition-colors ${filters.activelyRecruitingOnly ? 'border-[#155eef] bg-[#eef4ff] text-[#0c3e9e] dark:border-blue-400 dark:bg-blue-950/50 dark:text-blue-200' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'}`}><span>Actively recruiting</span>{filters.activelyRecruitingOnly && <CheckCircle2 className="h-4 w-4" />}</button>
              </div>
            </fieldset>
          </div>
        </div>
      )}
    </section>
  );
}
