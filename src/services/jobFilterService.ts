import type { Job } from '../data';

export type PostedWithin = 'any' | '24h' | 'week' | 'month';

export interface JobFilters {
  types: Job['type'][];
  workplaces: Job['workplaceType'][];
  experienceLevels: Job['experience'][];
  minimumSalary: number | null;
  postedWithin: PostedWithin;
  easyApplyOnly: boolean;
  activelyRecruitingOnly: boolean;
}

export const JOB_TYPE_OPTIONS: Job['type'][] = ['Full-time', 'Part-time', 'Contract', 'Internship'];
export const WORKPLACE_OPTIONS: Job['workplaceType'][] = ['Remote', 'Hybrid', 'On-site'];
export const EXPERIENCE_OPTIONS: Job['experience'][] = ['Entry Level', 'Mid Level', 'Senior', 'Executive'];

export const MINIMUM_SALARY_OPTIONS = [
  { label: 'Any pay', value: null },
  { label: '$75k+', value: 75_000 },
  { label: '$100k+', value: 100_000 },
  { label: '$150k+', value: 150_000 },
  { label: '$200k+', value: 200_000 },
] as const;

export const POSTED_WITHIN_OPTIONS: Array<{ label: string; value: PostedWithin }> = [
  { label: 'Any time', value: 'any' },
  { label: 'Past 24 hours', value: '24h' },
  { label: 'Past week', value: 'week' },
  { label: 'Past month', value: 'month' },
];

export const EMPTY_JOB_FILTERS: JobFilters = {
  types: [],
  workplaces: [],
  experienceLevels: [],
  minimumSalary: null,
  postedWithin: 'any',
  easyApplyOnly: false,
  activelyRecruitingOnly: false,
};

export function createEmptyJobFilters(): JobFilters {
  return {
    ...EMPTY_JOB_FILTERS,
    types: [],
    workplaces: [],
    experienceLevels: [],
  };
}

export function toggleFilterValue<T>(values: T[], value: T): T[] {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

export function getActiveJobFilterCount(filters: JobFilters): number {
  return filters.types.length
    + filters.workplaces.length
    + filters.experienceLevels.length
    + (filters.minimumSalary === null ? 0 : 1)
    + (filters.postedWithin === 'any' ? 0 : 1)
    + (filters.easyApplyOnly ? 1 : 0)
    + (filters.activelyRecruitingOnly ? 1 : 0);
}

function annualizedSalaryMax(job: Job): number {
  if (job.salaryPeriod === 'hour') return job.salaryMax * 2_080;
  if (job.salaryPeriod === 'month') return job.salaryMax * 12;
  return job.salaryMax;
}

function postedAgeHours(postedAt: string): number {
  const match = postedAt.trim().toLowerCase().match(/^(\d+)\s+(hour|day|week|month)s?\s+ago$/);
  if (!match) return Number.POSITIVE_INFINITY;

  const value = Number(match[1]);
  const unit = match[2];
  if (unit === 'hour') return value;
  if (unit === 'day') return value * 24;
  if (unit === 'week') return value * 24 * 7;
  return value * 24 * 30;
}

function matchesPostedWithin(job: Job, postedWithin: PostedWithin): boolean {
  if (postedWithin === 'any') return true;

  const age = postedAgeHours(job.postedAt);
  if (postedWithin === '24h') return age <= 24;
  if (postedWithin === 'week') return age <= 24 * 7;
  return age <= 24 * 30;
}

export function filterJobs(jobs: Job[], filters: JobFilters): Job[] {
  return jobs.filter((job) => {
    const matchesTypes = !filters.types.length || filters.types.includes(job.type);
    const matchesWorkplaces = !filters.workplaces.length || filters.workplaces.includes(job.workplaceType);
    const matchesExperience = !filters.experienceLevels.length || filters.experienceLevels.includes(job.experience);
    const matchesSalary = filters.minimumSalary === null || annualizedSalaryMax(job) >= filters.minimumSalary;
    const matchesEasyApply = !filters.easyApplyOnly || job.easyApply;
    const matchesRecruiting = !filters.activelyRecruitingOnly || job.activelyRecruiting;

    return matchesTypes
      && matchesWorkplaces
      && matchesExperience
      && matchesSalary
      && matchesPostedWithin(job, filters.postedWithin)
      && matchesEasyApply
      && matchesRecruiting;
  });
}
