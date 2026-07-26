import { beforeEach, describe, expect, it } from 'vitest';
import { db } from './db';
import { PROOF_OPPORTUNITIES, proofService } from './proofService';

describe('proof opportunities', () => {
  beforeEach(() => db.clear());

  it('attributes every project mission and challenge to JobX', () => {
    const projectOpportunities = PROOF_OPPORTUNITIES.filter((item) => item.type !== 'test');

    expect(projectOpportunities.length).toBeGreaterThan(0);
    expect(projectOpportunities.every((item) => item.employer === 'JobX')).toBe(true);
    expect(projectOpportunities.every((item) => item.employerInitials === 'JX')).toBe(true);
  });

  it('normalizes previously issued mission certificates to JobX', () => {
    db.set('proof_progress', {
      completedIds: ['mission-accessibility'],
      inProgressIds: [],
      certificates: [{
        id: 'certificate-mission-accessibility',
        opportunityId: 'mission-accessibility',
        title: 'Audit an accessible checkout',
        employer: 'Northstar Labs',
        skill: 'Product Design',
        points: 8,
        issuedAt: '2026-07-20T00:00:00.000Z',
        credentialId: 'JX-NS-BILITY-2026',
        submissionSummary: 'Completed before the JobX issuer migration.',
      }],
    });

    expect(proofService.getProgress().certificates[0]).toEqual(expect.objectContaining({
      employer: 'JobX',
      credentialId: 'JX-JX-ILITY-2026',
    }));
  });
});
