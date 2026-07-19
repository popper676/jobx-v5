import type { Job } from '../data';
import type { CommunityProject } from './projectService';
import type { User } from './userService';

export type ResponseCommitmentDays = 3 | 5 | 7;

export interface JobTrustProfile {
  companyVerified: boolean;
  hiringConfirmed: string;
  responseCommitmentDays: ResponseCommitmentDays;
  responseRate: number;
  medianResponseHours: number;
  hiresOnJobX: number;
  proofFirst: boolean;
  salaryTransparent: boolean;
  trustScore: number;
}

export interface SkillProof {
  skill: string;
  evidence: Array<Pick<CommunityProject, 'id' | 'title' | 'tags'>>;
  verified: boolean;
}

const TRUST_PROFILES: Record<string, Omit<JobTrustProfile, 'salaryTransparent' | 'trustScore'>> = {
  '1': { companyVerified: true, hiringConfirmed: 'Today', responseCommitmentDays: 5, responseRate: 96, medianResponseHours: 18, hiresOnJobX: 14, proofFirst: true },
  '2': { companyVerified: true, hiringConfirmed: 'Today', responseCommitmentDays: 3, responseRate: 92, medianResponseHours: 22, hiresOnJobX: 9, proofFirst: true },
  '3': { companyVerified: true, hiringConfirmed: 'Yesterday', responseCommitmentDays: 7, responseRate: 84, medianResponseHours: 39, hiresOnJobX: 21, proofFirst: true },
  '4': { companyVerified: false, hiringConfirmed: '3 days ago', responseCommitmentDays: 7, responseRate: 71, medianResponseHours: 54, hiresOnJobX: 6, proofFirst: false },
  '5': { companyVerified: true, hiringConfirmed: 'Today', responseCommitmentDays: 5, responseRate: 88, medianResponseHours: 31, hiresOnJobX: 11, proofFirst: true },
  '6': { companyVerified: true, hiringConfirmed: 'Yesterday', responseCommitmentDays: 7, responseRate: 91, medianResponseHours: 26, hiresOnJobX: 18, proofFirst: true },
  '7': { companyVerified: true, hiringConfirmed: 'Today', responseCommitmentDays: 3, responseRate: 97, medianResponseHours: 12, hiresOnJobX: 7, proofFirst: true },
  '8': { companyVerified: true, hiringConfirmed: 'Today', responseCommitmentDays: 5, responseRate: 94, medianResponseHours: 20, hiresOnJobX: 25, proofFirst: true },
};

function normalize(value: string): string {
  return value.toLowerCase().replace(/[._/]/g, ' ').replace(/[^a-z0-9+# ]/g, '').replace(/\s+/g, ' ').trim();
}

function fallbackProfile(job: Job): Omit<JobTrustProfile, 'salaryTransparent' | 'trustScore'> {
  const numericId = Number.parseInt(job.id.replace(/\D/g, ''), 10) || job.company.length;
  const responseRate = 78 + (numericId % 17);
  return {
    companyVerified: numericId % 5 !== 0,
    hiringConfirmed: numericId % 3 === 0 ? 'Yesterday' : 'Today',
    responseCommitmentDays: ([3, 5, 7] as const)[numericId % 3],
    responseRate,
    medianResponseHours: 18 + (numericId % 29),
    hiresOnJobX: 4 + (numericId % 19),
    proofFirst: numericId % 4 !== 0,
  };
}

export function getJobTrustProfile(job: Job): JobTrustProfile {
  const base = TRUST_PROFILES[job.id] || fallbackProfile(job);
  const salaryTransparent = job.salaryMin > 0 && job.salaryMax >= job.salaryMin;
  const trustScore = Math.min(99, Math.round(
    base.responseRate * 0.62
    + (base.companyVerified ? 16 : 4)
    + (salaryTransparent ? 10 : 0)
    + (base.proofFirst ? 8 : 0),
  ));

  return { ...base, salaryTransparent, trustScore };
}

export function isTrustedJob(job: Job): boolean {
  const profile = getJobTrustProfile(job);
  return profile.companyVerified && profile.responseRate >= 80 && profile.salaryTransparent;
}

export function getSkillProofs(user: User, projects: CommunityProject[]): SkillProof[] {
  const ownedProjects = projects.filter((project) => project.myProject);
  return user.skills.map(({ skill }) => {
    const normalizedSkill = normalize(skill);
    const evidence = ownedProjects.filter((project) => project.tags.some((tag) => {
      const normalizedTag = normalize(tag);
      return normalizedTag === normalizedSkill
        || normalizedTag.includes(normalizedSkill)
        || normalizedSkill.includes(normalizedTag);
    })).map(({ id, title, tags }) => ({ id, title, tags }));

    return { skill, evidence, verified: evidence.length > 0 };
  });
}

export function getProofCoverage(user: User, projects: CommunityProject[]): number {
  const proofs = getSkillProofs(user, projects);
  if (!proofs.length) return 0;
  return Math.round((proofs.filter((proof) => proof.verified).length / proofs.length) * 100);
}
