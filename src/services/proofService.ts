import { db } from './db';

export type ProofType = 'mission' | 'test' | 'challenge';
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
  { id: 'test-react', type: 'test', title: 'React practical assessment', employer: 'Mono Engineering', employerInitials: 'ME', description: 'Debug, refactor, and extend a small React interface. Your reasoning and code quality both count.', skill: 'React', difficulty: 'Intermediate', duration: '45 min', points: 7, participants: 1240, deadline: 'On demand', featured: true },
  { id: 'test-typescript', type: 'test', title: 'TypeScript systems test', employer: 'Northstar Labs', employerInitials: 'NS', description: 'Model a domain, eliminate unsafe states, and explain the trade-offs in your implementation.', skill: 'TypeScript', difficulty: 'Advanced', duration: '60 min', points: 9, participants: 735, deadline: 'On demand' },
  { id: 'test-product', type: 'test', title: 'Product thinking simulation', employer: 'Orbit Commerce', employerInitials: 'OC', description: 'Prioritize competing customer problems and turn ambiguous evidence into a focused product decision.', skill: 'Product Strategy', difficulty: 'Intermediate', duration: '35 min', points: 6, participants: 896, deadline: 'On demand' },
  { id: 'test-data', type: 'test', title: 'SQL insight challenge', employer: 'Lumen Systems', employerInitials: 'LS', description: 'Query a realistic product dataset and communicate the decisions your findings support.', skill: 'SQL', difficulty: 'Intermediate', duration: '40 min', points: 7, participants: 1084, deadline: 'On demand' },
  { id: 'test-ux', type: 'test', title: 'UX decision review', employer: 'Arc Studio', employerInitials: 'AS', description: 'Evaluate interface options against research evidence, usability principles, and business constraints.', skill: 'UX Research', difficulty: 'Beginner', duration: '25 min', points: 5, participants: 654, deadline: 'On demand' },
];

export const proofService = {
  getProgress(): ProofProgress {
    const saved = db.get<Partial<ProofProgress>>('proof_progress', EMPTY_PROGRESS);
    return {
      completedIds: saved.completedIds || [],
      inProgressIds: saved.inProgressIds || [],
      certificates: (saved.certificates || []).map((certificate) => {
        const opportunity = PROOF_OPPORTUNITIES.find((item) => item.id === certificate.opportunityId);
        if (!opportunity || opportunity.type === 'test') return certificate;

        return {
          ...certificate,
          employer: 'JobX',
          credentialId: `JX-JX-${opportunity.id.slice(-5).toUpperCase()}-${new Date(certificate.issuedAt).getFullYear()}`,
        };
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
