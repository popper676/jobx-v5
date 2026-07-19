import { describe, expect, it } from 'vitest';
import { MOCK_JOBS } from '../data';
import {
  createEmptyJobFilters,
  filterJobs,
  getActiveJobFilterCount,
  toggleFilterValue,
} from './jobFilterService';

describe('jobFilterService', () => {
  it('combines filters across categories while allowing alternatives in a category', () => {
    const filters = {
      ...createEmptyJobFilters(),
      workplaces: ['Remote' as const],
      types: ['Full-time' as const],
      experienceLevels: ['Mid Level' as const, 'Senior' as const],
    };

    expect(filterJobs(MOCK_JOBS, filters).map((job) => job.id)).toEqual(['2', '5']);
  });

  it('filters salary using the annualized maximum for hourly and salaried roles', () => {
    const filters = { ...createEmptyJobFilters(), minimumSalary: 150_000 };
    const result = filterJobs(MOCK_JOBS, filters);

    expect(result.map((job) => job.id)).toEqual(expect.arrayContaining(['1', '3', '6', '8']));
    expect(result.map((job) => job.id)).not.toContain('9');
  });

  it('filters fresh posts, Easy Apply roles, and active recruiters together', () => {
    const filters = {
      ...createEmptyJobFilters(),
      postedWithin: '24h' as const,
      easyApplyOnly: true,
      activelyRecruitingOnly: true,
    };

    expect(filterJobs(MOCK_JOBS, filters).map((job) => job.id)).toEqual(['2', '8']);
  });

  it('tracks active filters and toggles selected values immutably', () => {
    expect(toggleFilterValue(['Remote'], 'Hybrid')).toEqual(['Remote', 'Hybrid']);
    expect(toggleFilterValue(['Remote'], 'Remote')).toEqual([]);

    expect(getActiveJobFilterCount({
      ...createEmptyJobFilters(),
      workplaces: ['Remote'],
      easyApplyOnly: true,
      postedWithin: 'week',
    })).toBe(3);
  });
});
