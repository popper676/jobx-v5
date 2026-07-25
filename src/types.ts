export type ApplicantStatus =
  | 'New'
  | 'Viewed'
  | 'Shortlisted'
  | 'Phone Screen'
  | 'Interview'
  | 'Offer'
  | 'Hired'
  | 'On Hold'
  | 'Rejected'
  | 'Expired';

export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  companyId: string;
  companyName?: string;
  candidateId: string;
  candidateName: string;
  candidateHeadline: string;
  candidateAvatar: string;
  appliedAt: string; // ISO timestamp
  deadline: string; // appliedAt + the employer's JobX response commitment
  employerResponded: boolean;
  respondedAt?: string;
  expiredAt?: string; // Set when checking if expired
  status: ApplicantStatus;
  matchScore: number;
}
