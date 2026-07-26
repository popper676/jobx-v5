import { db } from './db';

export type ProofType = 'mission' | 'challenge';
export type ProofDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export interface ProofOpportunity {
  id: string; type: ProofType; title: string; employer: string; employerInitials: string;
  description: string; skill: string; difficulty: ProofDifficulty; duration: string;
  points: number; participants: number; deadline: string; featured?: boolean;
}

export interface ProofCertificate {
  id: string;
  opportunityId: string;
  title: string;
  employer: string;
  skill: string;
  points: number;
  issuedAt: string;
  credentialId: string;
  submissionSummary: string;
}

export interface ProofProgress {
  completedIds: string[];
  inProgressIds: string[];
  certificates: ProofCertificate[];
}

const EMPTY_PROGRESS: ProofProgress = { completedIds: [], inProgressIds: [], certificates: [] };

export const PROOF_OPPORTUNITIES: ProofOpportunity[] = [
  { id: 'mission-accessibility', type: 'mission', title: 'Audit an accessible checkout', employer: 'JobX', employerInitials: 'JX', description: 'Review a real checkout flow, identify accessibility gaps, and present a prioritized remediation plan.', skill: 'Product Design', difficulty: 'Intermediate', duration: '3–4 hours', points: 8, participants: 184, deadline: '7 days left', featured: true },
  { id: 'mission-api', type: 'mission', title: 'Design a resilient notification API', employer: 'JobX', employerInitials: 'JX', description: 'Propose an API contract, retry strategy, and observability plan for a high-volume notification service.', skill: 'Backend Engineering', difficulty: 'Advanced', duration: '5–6 hours', points: 10, participants: 96, deadline: '10 days left' },
  { id: 'mission-growth', type: 'mission', title: 'Find the onboarding drop-off', employer: 'JobX', employerInitials: 'JX', description: 'Use a sample product funnel to find friction, form a hypothesis, and recommend one measurable experiment.', skill: 'Product Analytics', difficulty: 'Intermediate', duration: '2–3 hours', points: 7, participants: 241, deadline: '5 days left' },
  { id: 'mission-campaign', type: 'mission', title: 'Launch a zero-budget campaign', employer: 'JobX', employerInitials: 'JX', description: 'Build a channel strategy and a week-one content plan for an early-stage sustainability product.', skill: 'Growth Marketing', difficulty: 'Beginner', duration: '2 hours', points: 5, participants: 329, deadline: '12 days left' },
  { id: 'mission-dashboard', type: 'mission', title: 'Prototype an operations dashboard', employer: 'JobX', employerInitials: 'JX', description: 'Turn a messy logistics brief into a clear dashboard prototype with decisions, states, and edge cases.', skill: 'UI/UX', difficulty: 'Advanced', duration: '4–5 hours', points: 9, participants: 118, deadline: '8 days left' },
  { id: 'challenge-open-source', type: 'challenge', title: 'Open-source contribution sprint', employer: 'JobX', employerInitials: 'JX', description: 'Improve documentation, fix an issue, or review a pull request in a participating open-source project.', skill: 'Collaboration', difficulty: 'Beginner', duration: 'Flexible', points: 6, participants: 872, deadline: 'Always open', featured: true },
  { id: 'challenge-data-story', type: 'challenge', title: 'Tell a story with public data', employer: 'JobX', employerInitials: 'JX', description: 'Explore an open dataset and publish a concise visual story that makes one useful insight understandable.', skill: 'Data Visualization', difficulty: 'Intermediate', duration: 'Weekend', points: 8, participants: 413, deadline: '14 days left' },
  { id: 'challenge-climate', type: 'challenge', title: 'Climate product design jam', employer: 'JobX', employerInitials: 'JX', description: 'Join a small team, define a climate behavior problem, and contribute to a tested solution concept.', skill: 'Team Contribution', difficulty: 'Intermediate', duration: '1 week', points: 9, participants: 265, deadline: 'Starts Monday' },
];

export const proofService = {
  getProgress(): ProofProgress {
    const saved = db.get<Partial<ProofProgress>>('proof_progress', EMPTY_PROGRESS);
    const supportedIds = new Set(PROOF_OPPORTUNITIES.map((opportunity) => opportunity.id));
    return {
      completedIds: (saved.completedIds || []).filter((id) => supportedIds.has(id)),
      inProgressIds: (saved.inProgressIds || []).filter((id) => supportedIds.has(id)),
      certificates: (saved.certificates || []).flatMap((certificate) => {
        const opportunity = PROOF_OPPORTUNITIES.find((item) => item.id === certificate.opportunityId);
        if (!opportunity) return [];

        return [{
          ...certificate,
          employer: 'JobX',
          credentialId: `JX-JX-${opportunity.id.slice(-5).toUpperCase()}-${new Date(certificate.issuedAt).getFullYear()}`,
        }];
      }),
    };
  },
  start(id: string): ProofProgress {
    const progress = this.getProgress();
    if (progress.completedIds.includes(id) || progress.inProgressIds.includes(id)) return progress;
    const updated = { ...progress, inProgressIds: [...progress.inProgressIds, id] };
    db.set('proof_progress', updated);
    return updated;
  },
  complete(id: string, submissionSummary = 'Completed and reviewed through JobX.'): ProofProgress {
    const progress = this.getProgress();
    const opportunity = PROOF_OPPORTUNITIES.find((item) => item.id === id);
    if (!opportunity) return progress;
    const alreadyIssued = progress.certificates.some((certificate) => certificate.opportunityId === id);
    const certificate: ProofCertificate = {
      id: `certificate-${id}`,
      opportunityId: id,
      title: opportunity.title,
      employer: opportunity.employer,
      skill: opportunity.skill,
      points: opportunity.points,
      issuedAt: new Date().toISOString(),
      credentialId: `JX-${opportunity.employerInitials}-${id.slice(-5).toUpperCase()}-${new Date().getFullYear()}`,
      submissionSummary,
    };
    const updated = {
      completedIds: [...new Set([...progress.completedIds, id])],
      inProgressIds: progress.inProgressIds.filter((itemId) => itemId !== id),
      certificates: alreadyIssued ? progress.certificates : [...progress.certificates, certificate],
    };
    db.set('proof_progress', updated);
    return updated;
  },
  getCertificate(id: string, progress = this.getProgress()): ProofCertificate | undefined {
    return progress.certificates.find((certificate) => certificate.opportunityId === id);
  },
  getEarnedPoints(progress = this.getProgress()): number {
    return PROOF_OPPORTUNITIES.filter((item) => progress.completedIds.includes(item.id)).reduce((total, item) => total + item.points, 0);
  },
  reset() { db.remove('proof_progress'); },
};
