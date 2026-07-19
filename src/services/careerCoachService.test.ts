import { beforeEach, describe, expect, it } from 'vitest';
import { MOCK_JOBS } from '../data';
import { db } from './db';
import { getCareerCoachPlan, getCompletedCoachActions, setCoachActionCompleted } from './careerCoachService';
import type { User } from './userService';

const user: User = {
  id: 'candidate-1', name: 'Avery Lee', email: 'avery@example.com', avatar: '', title: 'Frontend Engineer',
  bio: 'Frontend engineer building accessible and high-performance product experiences.', location: 'Remote', website: '',
  skills: [{ skill: 'React', endorsements: 3 }, { skill: 'TypeScript', endorsements: 2 }, { skill: 'JavaScript', endorsements: 3 }],
  connections: 0, profileViews: 0, endorsements: 0,
  experience: [{ role: 'Frontend Engineer', company: 'Orbit', duration: '2 years', period: '2023 - Present', description: 'Built reusable React components.' }],
  profileCompleted: true,
};

describe('careerCoachService', () => {
  beforeEach(() => db.clear());

  it('builds a four-week plan from the user profile and ranked roles', () => {
    const plan = getCareerCoachPlan(user, MOCK_JOBS, []);

    expect(plan.actions).toHaveLength(4);
    expect(plan.recommendedRole?.job).toBeTruthy();
    expect(plan.targetRole).toBe('Frontend Engineer');
  });

  it('persists completed coaching actions', () => {
    setCoachActionCompleted('career-story', true);

    expect(getCompletedCoachActions()).toContain('career-story');
  });
});
