import { describe, expect, it } from 'vitest';
import { MOCK_JOBS } from '../data';
import type { CommunityProject } from './projectService';
import { getJobTrustProfile, getProofCoverage, getSkillProofs, isTrustedJob } from './trustService';
import type { User } from './userService';

const user: User = {
  id: 'u1', name: 'Maya', email: 'maya@example.com', avatar: '', title: 'Frontend Engineer', bio: '', location: '', website: '',
  skills: [{ skill: 'React', endorsements: 0 }, { skill: 'TypeScript', endorsements: 0 }],
  connections: 0, profileViews: 0, endorsements: 0, experience: [], profileCompleted: true,
};

const projects: CommunityProject[] = [{
  id: 'p1', title: 'Design system', description: 'A production-ready component system with documented outcomes.', image: '',
  metrics: { likes: 0, comments: 0 }, tags: ['React'], openToCollab: false, myProject: true,
  author: { name: 'Maya', avatar: '' },
}];

describe('trustService', () => {
  it('builds a transparent trust profile for a job', () => {
    const profile = getJobTrustProfile(MOCK_JOBS[0]);
    expect(profile.companyVerified).toBe(true);
    expect(profile.salaryTransparent).toBe(true);
    expect(profile.responseCommitmentDays).toBe(5);
    expect(profile.trustScore).toBeGreaterThanOrEqual(80);
  });

  it('identifies jobs that meet the JobX trust standard', () => {
    expect(isTrustedJob(MOCK_JOBS[0])).toBe(true);
    expect(isTrustedJob(MOCK_JOBS[3])).toBe(false);
  });

  it('links profile skills to owned project evidence', () => {
    const proofs = getSkillProofs(user, projects);
    expect(proofs[0].verified).toBe(true);
    expect(proofs[0].evidence[0].title).toBe('Design system');
    expect(proofs[1].verified).toBe(false);
    expect(getProofCoverage(user, projects)).toBe(50);
  });
});
