import { beforeEach, describe, expect, it } from 'vitest';
import { MOCK_JOBS } from '../data';
import { db } from './db';
import type { User } from './userService';
import {
  getApplicationReadiness,
  getCareerPassport,
  getCareerRecommendations,
  getJobIntelligence,
  parseCareerSearchIntent,
  searchJobsWithCareerIntent,
} from './careerIntelligenceService';

const baseUser: User = {
  id: 'candidate-1',
  name: 'Avery Lee',
  email: 'avery@example.com',
  avatar: '',
  title: 'Frontend Engineer',
  bio: 'Frontend engineer building accessible and high-performance product experiences.',
  location: 'Remote',
  website: '',
  skills: [
    { skill: 'React.js', endorsements: 4 },
    { skill: 'TypeScript', endorsements: 3 },
    { skill: 'JavaScript', endorsements: 5 },
  ],
  connections: 0,
  profileViews: 0,
  endorsements: 0,
  experience: [{ role: 'Frontend Engineer', company: 'Orbit', duration: '2 years', period: '2023 - Present', description: 'Built reusable React components and improved page performance.' }],
  profileCompleted: true,
};

describe('careerIntelligenceService', () => {
  beforeEach(() => db.clear());

  it('explains direct and alias skill matches without hiding missing requirements', () => {
    const intelligence = getJobIntelligence(MOCK_JOBS[0], baseUser);

    expect(intelligence.matchedSkills).toEqual(expect.arrayContaining([
      expect.objectContaining({ jobSkill: 'React', kind: 'alias' }),
      expect.objectContaining({ jobSkill: 'TypeScript' }),
    ]));
    expect(intelligence.missingSkills).toContain('GraphQL');
    expect(intelligence.score).toBeGreaterThan(45);
  });

  it('creates a career passport from visible, explainable profile evidence', () => {
    const passport = getCareerPassport(baseUser, MOCK_JOBS);

    expect(passport.score).toBeGreaterThan(70);
    expect(passport.level).toBe('Developing');
    expect(passport.sections.every((section) => section.complete)).toBe(true);
    expect(passport.strengths).toContain('React.js');
  });

  it('flags readiness gaps before an application is submitted', () => {
    const incompleteUser: User = { ...baseUser, bio: '', experience: [], skills: [] };
    const readiness = getApplicationReadiness(MOCK_JOBS[0], incompleteUser);

    expect(readiness.label).toBe('Build your case first');
    expect(readiness.checklist.some((item) => !item.complete)).toBe(true);
    expect(readiness.nextAction).toContain('React');
  });

  it('ranks recommendations using the same explainable match calculation', () => {
    const recommendations = getCareerRecommendations(baseUser, MOCK_JOBS);

    expect(recommendations).toHaveLength(MOCK_JOBS.length);
    expect(recommendations[0].intelligence.score).toBeGreaterThanOrEqual(recommendations[1].intelligence.score);
    expect(recommendations[0].reason).toBeTruthy();
  });

  it('parses natural-language job search constraints into inspectable intent', () => {
    const intent = parseCareerSearchIntent('remote senior React contract roles');

    expect(intent.workplaceTypes).toEqual(['Remote']);
    expect(intent.experienceLevels).toEqual(['Senior']);
    expect(intent.jobTypes).toEqual(['Contract']);
    expect(intent.skills).toContain('React');
  });

  it('filters and ranks career search results without a random match score', () => {
    const results = searchJobsWithCareerIntent('remote full-time', baseUser, MOCK_JOBS);

    expect(results.length).toBeGreaterThan(0);
    expect(results.every(({ job }) => job.workplaceType === 'Remote' && job.type === 'Full-time')).toBe(true);
    expect(results[0].score).toBeGreaterThanOrEqual(results[results.length - 1].score);
    expect(results[0].reason).toBeTruthy();
  });
});
