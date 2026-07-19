import { db } from './db';
import { Application, ApplicantStatus } from '../types';

const DB_KEY = 'applications';
const RESPONSE_WINDOW_DAYS = 7;

export interface CreateApplicationInput {
  jobId: string;
  jobTitle: string;
  companyName: string;
  candidateId: string;
  candidateName: string;
  candidateHeadline: string;
  candidateAvatar: string;
  matchScore: number;
}

export interface ApplicationResult {
  application?: Application;
  ok: boolean;
  error?: string;
}

const generateMockData = (): Application[] => {
  const now = new Date();
  
  // Create a function to easily make dates relative to now
  const daysAgo = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  const addDays = (date: Date, days: number) => new Date(date.getTime() + days * 24 * 60 * 60 * 1000);

  return [
    {
      id: 'app_1',
      jobId: '1',
      jobTitle: 'Senior React Engineer',
      companyId: 'company_1',
      companyName: 'TechFlow',
      candidateId: 'user_2',
      candidateName: 'Sarah Chen',
      candidateHeadline: 'Senior React Developer',
      candidateAvatar: '',
      appliedAt: daysAgo(2).toISOString(),
      deadline: addDays(daysAgo(2), 7).toISOString(),
      employerResponded: false,
      status: 'New',
      matchScore: 94,
    },
    {
      id: 'app_2',
      jobId: '1',
      jobTitle: 'Senior React Engineer',
      companyId: 'company_1',
      companyName: 'TechFlow',
      candidateId: 'user_3',
      candidateName: 'James Wilson',
      candidateHeadline: 'Frontend Lead',
      candidateAvatar: '',
      appliedAt: daysAgo(8).toISOString(), // Should be expired if not responded
      deadline: addDays(daysAgo(8), 7).toISOString(),
      employerResponded: false,
      status: 'New',
      matchScore: 87,
    },
    {
      id: 'app_3',
      jobId: '1',
      jobTitle: 'Senior React Engineer',
      companyId: 'company_1',
      companyName: 'TechFlow',
      candidateId: 'user_4',
      candidateName: 'Maria Garcia',
      candidateHeadline: 'React & TypeScript Specialist',
      candidateAvatar: '',
      appliedAt: daysAgo(5).toISOString(),
      deadline: addDays(daysAgo(5), 7).toISOString(),
      employerResponded: true,
      status: 'Shortlisted',
      matchScore: 82,
    }
  ];
};

export const antiGhostingService = {
  getApplications(): Application[] {
    const apps = db.get<Application[]>(DB_KEY, []);
    if (apps.length === 0) {
      const mock = generateMockData();
      db.set(DB_KEY, mock);
      return mock;
    }
    return apps;
  },

  saveApplications(apps: Application[]) {
    db.set(DB_KEY, apps);
  },

  getApplicationsForCandidate(candidateId: string): Application[] {
    return this.checkExpiredApplications()
      .filter((application) => application.candidateId === candidateId)
      .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());
  },

  createApplication(input: CreateApplicationInput): ApplicationResult {
    if (!input.jobId || !input.jobTitle.trim()) {
      return { ok: false, error: 'Job information is required.' };
    }
    if (!input.candidateId || !input.candidateName.trim()) {
      return { ok: false, error: 'Complete your profile before applying.' };
    }

    const applications = this.getApplications();
    if (applications.some((application) => application.jobId === input.jobId && application.candidateId === input.candidateId)) {
      return { ok: false, error: 'You have already applied to this job.' };
    }

    const appliedAt = new Date();
    const application: Application = {
      id: `application-${Date.now()}`,
      jobId: input.jobId,
      jobTitle: input.jobTitle.trim(),
      companyId: input.jobId === '1' ? 'company_1' : `company_${input.jobId}`,
      companyName: input.companyName.trim() || 'This employer',
      candidateId: input.candidateId,
      candidateName: input.candidateName.trim(),
      candidateHeadline: input.candidateHeadline.trim() || 'JobX candidate',
      candidateAvatar: input.candidateAvatar,
      appliedAt: appliedAt.toISOString(),
      deadline: new Date(appliedAt.getTime() + RESPONSE_WINDOW_DAYS * 24 * 60 * 60 * 1000).toISOString(),
      employerResponded: false,
      status: 'New',
      matchScore: Math.max(0, Math.min(100, Math.round(input.matchScore))),
    };

    const saveResult = db.set(DB_KEY, [application, ...applications]);
    if (!saveResult.ok) {
      return { ok: false, error: saveResult.error || 'Unable to save your application.' };
    }

    return { application, ok: true };
  },

  checkExpiredApplications(): Application[] {
    const apps = this.getApplications();
    const now = new Date().getTime();
    let updated = false;

    const newApps = apps.map(app => {
      if (!app.employerResponded && app.status !== 'Expired') {
        const deadlineTime = new Date(app.deadline).getTime();
        if (now > deadlineTime) {
          updated = true;
          return {
            ...app,
            status: 'Expired' as ApplicantStatus,
            expiredAt: new Date().toISOString(),
          };
        }
      }
      return app;
    });

    if (updated) {
      this.saveApplications(newApps);
    }
    return newApps;
  },

  getCompanyResponseRate(companyId: string): number {
    const apps = this.getApplications().filter(a => a.companyId === companyId);
    if (apps.length === 0) return 0; // or null if no data, but 0 is safe

    // A response is either when employerResponded is true, or if it expired, it counts as failed.
    // Actually, only applications where (now > deadline or employerResponded) should count towards the rate.
    // Or simpler: response rate = (responded on time) / (all applications past deadline + responded applications)
    // To make it simple: answered / total. But what about new ones?
    // Usually, response rate applies to applications whose deadline has passed OR have been responded to.
    
    let totalEligible = 0;
    let respondedOnTime = 0;
    const now = new Date().getTime();

    for (const app of apps) {
      const deadlinePassed = now > new Date(app.deadline).getTime();
      if (app.employerResponded || deadlinePassed) {
        totalEligible++;
        if (app.employerResponded && (!app.respondedAt || new Date(app.respondedAt).getTime() <= new Date(app.deadline).getTime())) {
          respondedOnTime++;
        }
      }
    }

    if (totalEligible === 0) return 100; // No eligible applications = 100%
    return Math.round((respondedOnTime / totalEligible) * 100);
  },

  employerRespondToApplication(applicationId: string, decision: 'accepted' | 'rejected'): Application | null {
    const apps = this.getApplications();
    const idx = apps.findIndex(a => a.id === applicationId);
    if (idx === -1) return null;

    const app = apps[idx];
    if (app.status === 'Expired') return null; // Can't respond to expired
    if (new Date().getTime() > new Date(app.deadline).getTime()) {
      apps[idx] = { ...app, status: 'Expired', expiredAt: new Date().toISOString() };
      this.saveApplications(apps);
      return null;
    }

    apps[idx] = {
      ...app,
      employerResponded: true,
      respondedAt: new Date().toISOString(),
      status: decision === 'accepted' ? 'Shortlisted' : 'Rejected',
    };

    this.saveApplications(apps);
    return apps[idx];
  },

  reset(): void {
    db.remove(DB_KEY);
  }
};
