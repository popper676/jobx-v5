import { describe, it, expect, beforeEach } from 'vitest';
import { jobService } from './jobService';
import { db } from './db';

describe('jobService', () => {
  beforeEach(() => {
    db.clear();
  });

  it('should return all mock jobs', () => {
    const jobs = jobService.getAll();
    expect(jobs.length).toBe(50);
    expect(jobs[0].title).toBe('Senior React Engineer');
  });

  it('should retrieve job by id', () => {
    const job = jobService.getById('2');
    expect(job).toBeDefined();
    expect(job?.title).toBe('Product Designer');
    expect(job?.company).toBe('StudioX');

    const nonExistent = jobService.getById('999');
    expect(nonExistent).toBeUndefined();
  });

  it('should search jobs by query text', () => {
    // Query matches full title uniquely
    const resultsTitle = jobService.search('Senior React Engineer', '');
    expect(resultsTitle.length).toBe(1);
    expect(resultsTitle[0].id).toBe('1');

    // Query continues to match the original React roles as the catalogue grows.
    const resultsReact = jobService.search('React', '');
    expect(resultsReact.map((job) => job.id)).toEqual(expect.arrayContaining(['1', '7']));
    expect(resultsReact.every((job) => (
      job.title.toLowerCase().includes('react')
      || job.tags.some((tag) => tag.toLowerCase().includes('react'))
      || job.skillsRequired.some((skill) => skill.toLowerCase().includes('react'))
    ))).toBe(true);

    // Query matches company name
    const resultsCompany = jobService.search('StudioX', '');
    expect(resultsCompany.length).toBe(1);
    expect(resultsCompany[0].id).toBe('2');

    // Query matches tag
    const resultsTag = jobService.search('Microservices', '');
    expect(resultsTag.length).toBe(2);
  });

  it('should search jobs by location', () => {
    const resultsLoc = jobService.search('', 'Remote');
    expect(resultsLoc.map((job) => job.id)).toEqual(expect.arrayContaining(['2', '5', '8', '9']));
    expect(resultsLoc.every((job) => job.location.toLowerCase().includes('remote'))).toBe(true);

    const resultsSpecificLoc = jobService.search('', 'San Francisco');
    expect(resultsSpecificLoc.map((job) => job.company)).toContain('TechFlow');
    expect(resultsSpecificLoc.every((job) => job.location.includes('San Francisco'))).toBe(true);
  });

  it('should manage saving and unsaving jobs', () => {
    expect(jobService.isSaved('1')).toBe(false);
    expect(jobService.getSaved().length).toBe(0);

    const saved = jobService.saveJob('1');
    expect(saved.length).toBe(1);
    expect(saved[0].jobId).toBe('1');
    expect(jobService.isSaved('1')).toBe(true);

    const savedJobs = jobService.getSavedJobs();
    expect(savedJobs.length).toBe(1);
    expect(savedJobs[0].title).toBe('Senior React Engineer');

    const unsaved = jobService.unsaveJob('1');
    expect(unsaved.length).toBe(0);
    expect(jobService.isSaved('1')).toBe(false);
  });

  it('should manage applying to jobs', () => {
    expect(jobService.isApplied('2')).toBe(false);
    expect(jobService.getApplied().length).toBe(0);

    const applied = jobService.applyToJob('2');
    expect(applied.length).toBe(1);
    expect(applied[0].jobId).toBe('2');
    expect(applied[0].status).toBe('pending');
    expect(jobService.isApplied('2')).toBe(true);

    const appliedJobs = jobService.getAppliedJobs();
    expect(appliedJobs.length).toBe(1);
    expect(appliedJobs[0].title).toBe('Product Designer');
  });

  it('resets saved and applied jobs', () => {
    jobService.saveJob('1');
    jobService.applyToJob('2');

    jobService.reset();

    expect(jobService.getSaved()).toEqual([]);
    expect(jobService.getApplied()).toEqual([]);
  });
});
