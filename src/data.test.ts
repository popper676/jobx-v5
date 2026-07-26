import { describe, expect, it } from 'vitest';
import { MOCK_JOBS } from './data';

describe('job marketplace data', () => {
  it('offers 50 jobs from 50 distinct employers', () => {
    expect(MOCK_JOBS).toHaveLength(50);
    expect(new Set(MOCK_JOBS.map((job) => job.company)).size).toBe(50);
  });

  it('provides detailed role information for every job', () => {
    for (const job of MOCK_JOBS) {
      expect(job.description.length).toBeGreaterThan(80);
      expect(job.requirements.length).toBeGreaterThanOrEqual(4);
      expect(job.responsibilities.length).toBeGreaterThanOrEqual(4);
      expect(job.skillsRequired.length).toBeGreaterThanOrEqual(5);
      expect(job.companyOverview.length).toBeGreaterThan(80);
    }
  });
});
