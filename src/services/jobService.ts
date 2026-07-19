import { db } from './db';
import { MOCK_JOBS, Job } from '../data';

export interface SavedJob {
  jobId: string;
  savedAt: string;
}

export interface AppliedJob {
  jobId: string;
  appliedAt: string;
  status: 'pending' | 'reviewed' | 'interview';
}

export const jobService = {
  getAll(): Job[] {
    return MOCK_JOBS;
  },

  getById(id: string): Job | undefined {
    return MOCK_JOBS.find(j => j.id === id);
  },

  search(query: string, location: string): Job[] {
    return MOCK_JOBS.filter(job => {
      const q = query.toLowerCase();
      const loc = location.toLowerCase();
      const matchesQuery = !q || 
        job.title.toLowerCase().includes(q) || 
        job.company.toLowerCase().includes(q) || 
        job.tags.some(t => t.toLowerCase().includes(q)) ||
        job.skillsRequired.some(s => s.toLowerCase().includes(q));
      const matchesLocation = !loc || job.location.toLowerCase().includes(loc);
      return matchesQuery && matchesLocation;
    });
  },

  getSaved(): SavedJob[] {
    return db.get<SavedJob[]>('saved_jobs', []);
  },

  saveJob(jobId: string): SavedJob[] {
    const saved = this.getSaved();
    if (saved.find(s => s.jobId === jobId)) return saved;
    const updated = [...saved, { jobId, savedAt: new Date().toISOString() }];
    db.set('saved_jobs', updated);
    return updated;
  },

  unsaveJob(jobId: string): SavedJob[] {
    const updated = this.getSaved().filter(s => s.jobId !== jobId);
    db.set('saved_jobs', updated);
    return updated;
  },

  isSaved(jobId: string): boolean {
    return this.getSaved().some(s => s.jobId === jobId);
  },

  getApplied(): AppliedJob[] {
    return db.get<AppliedJob[]>('applied_jobs', []);
  },

  applyToJob(jobId: string): AppliedJob[] {
    const applied = this.getApplied();
    if (applied.find(a => a.jobId === jobId)) return applied;
    const updated = [...applied, { jobId, appliedAt: new Date().toISOString(), status: 'pending' as const }];
    db.set('applied_jobs', updated);
    return updated;
  },

  isApplied(jobId: string): boolean {
    return this.getApplied().some(a => a.jobId === jobId);
  },

  getSavedJobs(): Job[] {
    const saved = this.getSaved();
    return saved.map(s => MOCK_JOBS.find(j => j.id === s.jobId)).filter(Boolean) as Job[];
  },

  getAppliedJobs(): Job[] {
    const applied = this.getApplied();
    return applied.map(a => MOCK_JOBS.find(j => j.id === a.jobId)).filter(Boolean) as Job[];
  },

  reset(): void {
    db.remove('saved_jobs');
    db.remove('applied_jobs');
  }
};
