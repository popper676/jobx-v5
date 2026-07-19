import { beforeEach, describe, expect, it } from 'vitest';
import { db } from './db';
import { employerJobService } from './employerJobService';

describe('employerJobService', () => {
  beforeEach(() => {
    db.clear();
  });

  it('returns the default employer job posts when none have been saved', () => {
    const jobs = employerJobService.getAll();

    expect(jobs).toHaveLength(4);
    expect(jobs[0]).toMatchObject({ id: 'e1', title: 'Senior React Engineer', status: 'Active' });
  });

  it('creates and persists a valid job post', () => {
    const result = employerJobService.create({
      title: '  QA Engineer  ',
      location: 'Kuala Lumpur',
      currency: 'USD',
      salaryMin: '80000',
      salaryMax: '100000',
      payPeriod: 'per year',
      status: 'Draft',
    });

    expect(result.ok).toBe(true);
    expect(result.jobs[0]).toMatchObject({
      title: 'QA Engineer',
      location: 'Kuala Lumpur',
      salary: 'USD 80,000 - 100,000 per year',
      status: 'Draft',
    });
    expect(employerJobService.getAll()[0].title).toBe('QA Engineer');
  });

  it('rejects a job post without a title and does not persist it', () => {
    const result = employerJobService.create({
      title: '   ',
      location: 'Remote',
      currency: 'USD',
      salaryMin: '',
      salaryMax: '',
      payPeriod: 'per year',
      status: 'Active',
    });

    expect(result).toMatchObject({ ok: false, error: 'Job title is required.' });
    expect(employerJobService.getAll()).toHaveLength(4);
  });

  it('uses a safe salary fallback for invalid salary ranges', () => {
    const result = employerJobService.create({
      title: 'Support Engineer',
      location: 'Remote',
      currency: 'USD',
      salaryMin: '120000',
      salaryMax: '100000',
      payPeriod: 'per year',
      status: 'Active',
    });

    expect(result.ok).toBe(true);
    expect(result.jobs[0].salary).toBe('Salary not specified');
  });

  it('updates an existing post and prevents updates with an empty title', () => {
    const updated = employerJobService.update('e1', {
      title: 'Principal React Engineer',
      location: 'Remote',
      salary: '$180k - $210k',
      status: 'Closed',
    });

    expect(updated.ok).toBe(true);
    expect(updated.jobs.find((job) => job.id === 'e1')).toMatchObject({
      title: 'Principal React Engineer',
      status: 'Closed',
    });

    const invalid = employerJobService.update('e1', {
      title: ' ',
      location: 'Remote',
      salary: '$180k - $210k',
      status: 'Closed',
    });
    expect(invalid).toMatchObject({ ok: false, error: 'Job title is required.' });

    const invalidLocation = employerJobService.update('e1', {
      title: 'Principal React Engineer',
      location: ' ',
      salary: '$180k - $210k',
      status: 'Closed',
    });
    expect(invalidLocation).toMatchObject({ ok: false, error: 'Location is required.' });
  });

  it('removes posts and reports an attempt to remove an unknown post', () => {
    const removed = employerJobService.remove('e2');
    expect(removed.ok).toBe(true);
    expect(removed.jobs.some((job) => job.id === 'e2')).toBe(false);

    const missing = employerJobService.remove('missing');
    expect(missing).toMatchObject({ ok: false, error: 'Job post was not found.' });
  });

  it('resets persisted job posts back to defaults', () => {
    employerJobService.remove('e1');
    employerJobService.reset();

    expect(employerJobService.getAll()).toHaveLength(4);
    expect(employerJobService.getAll()[0].id).toBe('e1');
  });
});
