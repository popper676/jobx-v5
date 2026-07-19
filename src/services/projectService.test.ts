import { beforeEach, describe, expect, it } from 'vitest';
import { db } from './db';
import { projectService } from './projectService';
import type { User } from './userService';

const user: User = {
  id: 'candidate-1',
  name: 'Avery Lee',
  email: 'avery@example.com',
  avatar: '',
  title: 'Frontend Engineer',
  bio: '',
  location: 'Remote',
  website: '',
  skills: [],
  connections: 0,
  profileViews: 0,
  endorsements: 0,
  experience: [],
  profileCompleted: true,
};

describe('projectService', () => {
  beforeEach(() => db.clear());

  it('validates essential project information and safe public links', () => {
    expect(projectService.submit({
      title: 'Hi',
      description: 'Too short',
      tags: [],
      openToCollab: false,
    }, user)).toEqual(expect.objectContaining({ success: false }));

    expect(projectService.submit({
      title: 'Accessible portfolio',
      description: 'A detailed portfolio project that makes the work and outcomes easy for hiring teams to review.',
      tags: ['React'],
      repositoryUrl: 'javascript:alert(1)',
      openToCollab: true,
    }, user)).toEqual(expect.objectContaining({ success: false, error: 'Links must start with http:// or https://.' }));
  });

  it('persists submitted projects and makes them available in My Projects', () => {
    const result = projectService.submit({
      title: 'Career portfolio',
      description: 'A portfolio that documents my product work, accessibility decisions, and measurable delivery outcomes.',
      tags: ['React', 'TypeScript', 'React'],
      repositoryUrl: 'https://github.com/example/career-portfolio',
      demoUrl: 'https://example.com/portfolio',
      openToCollab: true,
    }, user);

    expect(result.success).toBe(true);
    expect(result.project).toEqual(expect.objectContaining({
      title: 'Career portfolio',
      tags: ['React', 'TypeScript'],
      author: expect.objectContaining({ name: 'Avery Lee' }),
    }));
    expect(projectService.getSubmittedProjects()).toHaveLength(1);
    expect(projectService.getProjectById(result.project!.id, user)).toEqual(expect.objectContaining({ id: result.project!.id }));
  });
});
