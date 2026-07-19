import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { antiGhostingService } from './antiGhostingService';
import { db } from './db';
import { Application } from '../types';

vi.mock('./db', () => ({
  db: {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
  }
}));

describe('antiGhostingService', () => {
  const now = new Date();
  
  const mockDbGet = db.get as any;
  const mockDbSet = db.set as any;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(now);
    mockDbGet.mockReset();
    mockDbSet.mockReset();
    mockDbSet.mockReturnValue({ ok: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('generates mock data with deadlines appliedAt + 7 days', () => {
    mockDbGet.mockReturnValue([]);
    const apps = antiGhostingService.getApplications();
    expect(apps.length).toBeGreaterThan(0);
    
    apps.forEach(app => {
      const appliedAtMs = new Date(app.appliedAt).getTime();
      const deadlineMs = new Date(app.deadline).getTime();
      const diffDays = Math.round((deadlineMs - appliedAtMs) / (1000 * 60 * 60 * 24));
      expect(diffDays).toBe(7);
    });
  });

  it('checkExpiredApplications() marks overdue applications as Expired', () => {
    const expiredApp: Application = {
      id: 'app_expired',
      jobId: '1',
      jobTitle: 'Job 1',
      companyId: 'company_1',
      candidateId: 'user_1',
      candidateName: 'Test User',
      candidateHeadline: 'Headline',
      candidateAvatar: '',
      appliedAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      deadline: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      employerResponded: false,
      status: 'New',
      matchScore: 90
    };

    const validApp: Application = {
      id: 'app_valid',
      jobId: '1',
      jobTitle: 'Job 1',
      companyId: 'company_1',
      candidateId: 'user_1',
      candidateName: 'Test User',
      candidateHeadline: 'Headline',
      candidateAvatar: '',
      appliedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      deadline: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      employerResponded: false,
      status: 'New',
      matchScore: 90
    };

    mockDbGet.mockReturnValue([expiredApp, validApp]);

    const updatedApps = antiGhostingService.checkExpiredApplications();
    
    expect(updatedApps.find(a => a.id === 'app_expired')?.status).toBe('Expired');
    expect(updatedApps.find(a => a.id === 'app_expired')?.expiredAt).toBeDefined();
    
    expect(updatedApps.find(a => a.id === 'app_valid')?.status).toBe('New');
    expect(mockDbSet).toHaveBeenCalled();
  });

  it('getCompanyResponseRate() returns 100% when all applications were answered on time', () => {
    const app1: Application = {
      id: '1', jobId: '1', jobTitle: 'Job', companyId: 'company_1', candidateId: '1', candidateName: 'A', candidateHeadline: 'A', candidateAvatar: '',
      appliedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      deadline: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      employerResponded: true,
      status: 'Shortlisted', matchScore: 90
    };

    mockDbGet.mockReturnValue([app1]);
    const rate = antiGhostingService.getCompanyResponseRate('company_1');
    expect(rate).toBe(100);
  });

  it('getCompanyResponseRate() returns 0% when no applications were answered and deadline passed', () => {
    const app1: Application = {
      id: '1', jobId: '1', jobTitle: 'Job', companyId: 'company_1', candidateId: '1', candidateName: 'A', candidateHeadline: 'A', candidateAvatar: '',
      appliedAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      deadline: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      employerResponded: false,
      status: 'Expired', matchScore: 90
    };

    mockDbGet.mockReturnValue([app1]);
    const rate = antiGhostingService.getCompanyResponseRate('company_1');
    expect(rate).toBe(0);
  });

  it('employerRespondToApplication() updates application correctly', () => {
    const app1: Application = {
      id: 'app_to_respond', jobId: '1', jobTitle: 'Job', companyId: 'company_1', candidateId: '1', candidateName: 'A', candidateHeadline: 'A', candidateAvatar: '',
      appliedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      deadline: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      employerResponded: false,
      status: 'New', matchScore: 90
    };

    mockDbGet.mockReturnValue([app1]);
    
    const updated = antiGhostingService.employerRespondToApplication('app_to_respond', 'accepted');
    expect(updated?.employerResponded).toBe(true);
    expect(updated?.status).toBe('Shortlisted');
    expect(updated?.respondedAt).toBeDefined();
    expect(mockDbSet).toHaveBeenCalled();
  });

  it('creates a candidate application with a seven-day response deadline', () => {
    mockDbGet.mockReturnValue([]);

    const result = antiGhostingService.createApplication({
      jobId: '1',
      jobTitle: 'Senior React Engineer',
      companyName: 'TechFlow',
      candidateId: 'candidate_1',
      candidateName: 'Jordan Lee',
      candidateHeadline: 'Frontend Engineer',
      candidateAvatar: '',
      matchScore: 82,
    });

    expect(result.ok).toBe(true);
    expect(result.application).toMatchObject({
      jobId: '1',
      companyId: 'company_1',
      companyName: 'TechFlow',
      candidateId: 'candidate_1',
      status: 'New',
      employerResponded: false,
    });
    expect(new Date(result.application!.deadline).getTime() - new Date(result.application!.appliedAt).getTime())
      .toBe(7 * 24 * 60 * 60 * 1000);
    expect(mockDbSet).toHaveBeenCalled();
  });

  it('honors the employer response commitment selected for the job', () => {
    mockDbGet.mockReturnValue([]);

    const result = antiGhostingService.createApplication({
      jobId: '2', jobTitle: 'Product Designer', companyName: 'StudioX', candidateId: 'candidate_1',
      candidateName: 'Jordan Lee', candidateHeadline: 'Product Designer', candidateAvatar: '', matchScore: 88,
      responseCommitmentDays: 3,
    });

    expect(result.ok).toBe(true);
    expect(new Date(result.application!.deadline).getTime() - new Date(result.application!.appliedAt).getTime())
      .toBe(3 * 24 * 60 * 60 * 1000);
  });

  it('prevents duplicate applications for the same candidate and job', () => {
    const existing: Application = {
      id: 'existing', jobId: '1', jobTitle: 'Senior React Engineer', companyId: 'company_1', candidateId: 'candidate_1', candidateName: 'Jordan Lee', candidateHeadline: 'Frontend Engineer', candidateAvatar: '',
      appliedAt: now.toISOString(), deadline: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(), employerResponded: false, status: 'New', matchScore: 82,
    };
    mockDbGet.mockReturnValue([existing]);

    const result = antiGhostingService.createApplication({
      jobId: '1', jobTitle: 'Senior React Engineer', companyName: 'TechFlow', candidateId: 'candidate_1', candidateName: 'Jordan Lee', candidateHeadline: 'Frontend Engineer', candidateAvatar: '', matchScore: 82,
    });

    expect(result).toMatchObject({ ok: false, error: 'You have already applied to this job.' });
    expect(mockDbSet).not.toHaveBeenCalled();
  });

  it('marks an overdue application as expired instead of allowing a late response', () => {
    const overdue: Application = {
      id: 'overdue', jobId: '1', jobTitle: 'Senior React Engineer', companyId: 'company_1', candidateId: 'candidate_1', candidateName: 'Jordan Lee', candidateHeadline: 'Frontend Engineer', candidateAvatar: '',
      appliedAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString(), deadline: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(), employerResponded: false, status: 'New', matchScore: 82,
    };
    mockDbGet.mockReturnValue([overdue]);

    const result = antiGhostingService.employerRespondToApplication('overdue', 'accepted');

    expect(result).toBeNull();
    expect(mockDbSet).toHaveBeenCalledWith('applications', expect.arrayContaining([expect.objectContaining({ id: 'overdue', status: 'Expired' })]));
  });
});
