import { db } from './db';

export type EmployerJobStatus = 'Active' | 'Closed' | 'Draft';

export interface EmployerJob {
  id: string;
  title: string;
  location: string;
  salary: string;
  postedAt: string;
  status: EmployerJobStatus;
  applicants: number;
  views: number;
}

const DEFAULT_EMPLOYER_JOBS: EmployerJob[] = [
  { id: 'e1', title: 'Senior React Engineer', location: 'San Francisco, CA', salary: '$140k - $170k', postedAt: '2 days ago', status: 'Active', applicants: 18, views: 342 },
  { id: 'e2', title: 'Product Designer', location: 'Remote', salary: '$110k - $130k', postedAt: '5 days ago', status: 'Active', applicants: 12, views: 198 },
  { id: 'e3', title: 'Backend Developer (Go)', location: 'New York, NY', salary: '$130k - $160k', postedAt: '1 week ago', status: 'Closed', applicants: 24, views: 567 },
  { id: 'e4', title: 'DevOps Engineer', location: 'Austin, TX', salary: '$150k - $180k', postedAt: '1 day ago', status: 'Draft', applicants: 0, views: 12 },
];

export interface CreateEmployerJobInput {
  title: string;
  location: string;
  currency: string;
  salaryMin: string;
  salaryMax: string;
  payPeriod: string;
  status: Exclude<EmployerJobStatus, 'Closed'>;
}

export interface EmployerJobResult {
  jobs: EmployerJob[];
  ok: boolean;
  error?: string;
}

function persist(jobs: EmployerJob[]): EmployerJobResult {
  const result = db.set('employer_jobs', jobs);
  return { jobs, ...result };
}

function formatSalary(input: CreateEmployerJobInput): string {
  const min = Number(input.salaryMin);
  const max = Number(input.salaryMax);
  if (!Number.isFinite(min) || !Number.isFinite(max) || min < 0 || max < min) {
    return 'Salary not specified';
  }
  return `${input.currency} ${min.toLocaleString()} - ${max.toLocaleString()} ${input.payPeriod}`;
}

function isValidStatus(status: string): status is EmployerJobStatus {
  return status === 'Active' || status === 'Closed' || status === 'Draft';
}

export const employerJobService = {
  getAll(): EmployerJob[] {
    return db.get<EmployerJob[]>('employer_jobs', DEFAULT_EMPLOYER_JOBS);
  },

  create(input: CreateEmployerJobInput): EmployerJobResult {
    const title = input.title.trim();
    if (!title) {
      return { jobs: this.getAll(), ok: false, error: 'Job title is required.' };
    }
    const status = input.status as string;
    if (!isValidStatus(status) || status === 'Closed') {
      return { jobs: this.getAll(), ok: false, error: 'Job status is invalid.' };
    }

    const salary = formatSalary(input);
    const newJob: EmployerJob = {
      id: `employer-${Date.now()}`,
      title,
      location: input.location.trim() || 'Remote',
      salary,
      postedAt: 'Just now',
      status: input.status,
      applicants: 0,
      views: 0,
    };
    return persist([newJob, ...this.getAll()]);
  },

  update(id: string, updates: Pick<EmployerJob, 'title' | 'location' | 'salary' | 'status'>): EmployerJobResult {
    const title = updates.title.trim();
    if (!title) {
      return { jobs: this.getAll(), ok: false, error: 'Job title is required.' };
    }
    const location = updates.location.trim();
    if (!location) {
      return { jobs: this.getAll(), ok: false, error: 'Location is required.' };
    }
    if (!isValidStatus(updates.status)) {
      return { jobs: this.getAll(), ok: false, error: 'Job status is invalid.' };
    }

    const currentJobs = this.getAll();
    if (!currentJobs.some((job) => job.id === id)) {
      return { jobs: currentJobs, ok: false, error: 'Job post was not found.' };
    }

    const salary = updates.salary.trim() || 'Salary not specified';
    const jobs = currentJobs.map((job) => job.id === id ? { ...job, ...updates, title, location, salary } : job);
    return persist(jobs);
  },

  remove(id: string): EmployerJobResult {
    const currentJobs = this.getAll();
    if (!currentJobs.some((job) => job.id === id)) {
      return { jobs: currentJobs, ok: false, error: 'Job post was not found.' };
    }

    const jobs = currentJobs.filter((job) => job.id !== id);
    return persist(jobs);
  },

  reset(): void {
    db.remove('employer_jobs');
  },
};
