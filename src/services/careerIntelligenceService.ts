import { MOCK_JOBS, type Job } from '../data';
import type { User } from './userService';

type MatchKind = 'exact' | 'alias' | 'adjacent';

export interface SkillMatch {
  jobSkill: string;
  profileSkill: string;
  kind: MatchKind;
}

export interface JobIntelligence {
  score: number;
  label: 'Strong fit' | 'Promising fit' | 'Growth opportunity';
  matchedSkills: SkillMatch[];
  missingSkills: string[];
  transferableSkills: SkillMatch[];
  evidence: Array<{ label: string; value: number; detail: string }>;
  nextSteps: string[];
}

export interface CareerPassport {
  score: number;
  level: 'Emerging' | 'Developing' | 'Established' | 'Leadership';
  targetRole: string;
  strengths: string[];
  growthFocus: string[];
  recommendations: string[];
  sections: Array<{ label: string; complete: boolean; detail: string }>;
}

export interface ApplicationReadiness {
  score: number;
  label: 'Ready to apply' | 'Nearly ready' | 'Build your case first';
  checklist: Array<{ label: string; complete: boolean; detail: string }>;
  nextAction: string;
}

export interface CareerRecommendation {
  job: Job;
  intelligence: JobIntelligence;
  reason: string;
}

export interface CareerSearchIntent {
  rawQuery: string;
  skills: string[];
  workplaceTypes: Job['workplaceType'][];
  jobTypes: Job['type'][];
  experienceLevels: Job['experience'][];
  keywords: string[];
}

export interface CareerSearchResult {
  job: Job;
  intelligence: JobIntelligence;
  score: number;
  reason: string;
}

const SKILL_ALIASES: Record<string, string[]> = {
  'react': ['react.js', 'reactjs'],
  'typescript': ['ts'],
  'javascript': ['js', 'ecmascript'],
  'node.js': ['node', 'nodejs'],
  'next.js': ['nextjs'],
  'aws': ['amazon web services'],
  'google analytics': ['ga4', 'google analytics 4'],
  'machine learning': ['ml'],
  'data visualization': ['data viz', 'dataviz'],
  'ci/cd': ['continuous integration', 'continuous delivery'],
  'ui/ux': ['user experience', 'user interface'],
};

const ADJACENT_SKILL_PAIRS: Array<[string, string]> = [
  ['javascript', 'typescript'],
  ['react', 'next.js'],
  ['node.js', 'javascript'],
  ['aws', 'kubernetes'],
  ['docker', 'kubernetes'],
  ['python', 'machine learning'],
  ['sql', 'data visualization'],
  ['figma', 'prototyping'],
  ['seo', 'content strategy'],
];

function normalizeSkill(value: string): string {
  return value
    .toLowerCase()
    .replace(/[._/]/g, ' ')
    .replace(/\bjs\b/g, 'javascript')
    .replace(/[^a-z0-9+# ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function canonicalSkill(value: string): string {
  const normalized = normalizeSkill(value);
  for (const [canonical, aliases] of Object.entries(SKILL_ALIASES)) {
    if (normalizeSkill(canonical) === normalized || aliases.some((alias) => normalizeSkill(alias) === normalized)) {
      return normalizeSkill(canonical);
    }
  }
  return normalized;
}

function unique(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function profileSkills(user: User): string[] {
  const explicitSkills = user.skills.map(({ skill }) => skill);
  const inferredSkills = `${user.title} ${user.bio} ${user.experience.map((item) => `${item.role} ${item.description}`).join(' ')}`
    .split(/[,;|]/)
    .map((value) => value.trim())
    .filter((value) => value.length > 1 && value.length < 42);

  return unique([...explicitSkills, ...inferredSkills]);
}

function matchRequiredSkill(requiredSkill: string, skills: string[]): SkillMatch | null {
  const requiredCanonical = canonicalSkill(requiredSkill);

  for (const profileSkill of skills) {
    const profileCanonical = canonicalSkill(profileSkill);
    if (profileCanonical === requiredCanonical) {
      return {
        jobSkill: requiredSkill,
        profileSkill,
        kind: normalizeSkill(profileSkill) === normalizeSkill(requiredSkill) ? 'exact' : 'alias',
      };
    }
  }

  return null;
}

function findAdjacentSkill(requiredSkill: string, skills: string[]): SkillMatch | null {
  const requiredCanonical = canonicalSkill(requiredSkill);
  for (const profileSkill of skills) {
    const profileCanonical = canonicalSkill(profileSkill);
    const isAdjacent = ADJACENT_SKILL_PAIRS.some(([first, second]) => (
      (first === requiredCanonical && second === profileCanonical)
      || (second === requiredCanonical && first === profileCanonical)
    ));
    if (isAdjacent) {
      return { jobSkill: requiredSkill, profileSkill, kind: 'adjacent' };
    }
  }
  return null;
}

export function getProfileCompletion(user: User): number {
  const identity = user.name.trim() && user.title.trim() ? 20 : 0;
  const location = user.location.trim() ? 10 : 0;
  const summary = user.bio.trim().length >= 40 ? 20 : 0;
  const skills = Math.min(30, user.skills.length * 6);
  const experience = user.experience.length > 0 ? 20 : 0;
  return Math.min(100, identity + location + summary + skills + experience);
}

export function getJobIntelligence(job: Job, user: User): JobIntelligence {
  const skills = profileSkills(user);
  const requiredSkills = unique(job.skillsRequired);
  const matchedSkills = requiredSkills
    .map((requiredSkill) => matchRequiredSkill(requiredSkill, skills))
    .filter((match): match is SkillMatch => Boolean(match));
  const matchedRequiredSkills = new Set(matchedSkills.map((match) => match.jobSkill));
  const missingSkills = requiredSkills.filter((skill) => !matchedRequiredSkills.has(skill));
  const transferableSkills = missingSkills
    .map((requiredSkill) => findAdjacentSkill(requiredSkill, skills))
    .filter((match): match is SkillMatch => Boolean(match));

  const matchedWeight = matchedSkills.reduce((total, match) => total + (match.kind === 'exact' ? 1 : 0.88), 0);
  const transferableWeight = transferableSkills.length * 0.38;
  const skillCoverage = requiredSkills.length
    ? Math.min(1, (matchedWeight + transferableWeight) / requiredSkills.length)
    : 0.55;
  const profileEvidence = (user.title.trim() ? 5 : 0)
    + (user.bio.trim().length >= 40 ? 5 : 0)
    + (user.experience.length > 0 ? 8 : 0)
    + (user.skills.length >= 3 ? 4 : 0);
  const score = Math.max(28, Math.min(96, Math.round(skillCoverage * 78 + profileEvidence)));
  const label = score >= 75 ? 'Strong fit' : score >= 52 ? 'Promising fit' : 'Growth opportunity';
  const evidence = [
    {
      label: 'Skill fit',
      value: Math.round(skillCoverage * 100),
      detail: matchedSkills.length
        ? `${matchedSkills.length} required skill${matchedSkills.length === 1 ? '' : 's'} supported by your profile`
        : 'Add relevant skills to make this match more precise',
    },
    {
      label: 'Career evidence',
      value: Math.round((profileEvidence / 22) * 100),
      detail: user.experience.length > 0
        ? 'Experience and profile context strengthen your application'
        : 'Experience examples will strengthen your application case',
    },
  ];
  const nextSteps = [
    ...(missingSkills.slice(0, 2).map((skill) => `Show evidence for ${skill}, or add it to your growth plan.`)),
    ...(!user.bio.trim() ? ['Add a concise profile summary so employers can understand your direction.'] : []),
    ...(user.experience.length === 0 ? ['Add one experience or project outcome before applying.'] : []),
  ].slice(0, 3);

  return { score, label, matchedSkills, missingSkills, transferableSkills, evidence, nextSteps };
}

function inferCareerLevel(user: User): CareerPassport['level'] {
  const signal = `${user.title} ${user.experience.map((item) => item.role).join(' ')}`.toLowerCase();
  if (/chief|vp|vice president|director|head of|founder|principal/.test(signal)) return 'Leadership';
  if (/lead|senior|staff|manager|architect/.test(signal) || user.experience.length >= 3) return 'Established';
  if (user.experience.length > 0 || user.skills.length >= 4) return 'Developing';
  return 'Emerging';
}

export function getCareerPassport(user: User, jobs: Job[] = MOCK_JOBS): CareerPassport {
  const sections = [
    { label: 'Career identity', complete: Boolean(user.name.trim() && user.title.trim()), detail: user.title.trim() || 'Add the role you are growing toward.' },
    { label: 'Professional story', complete: user.bio.trim().length >= 40, detail: user.bio.trim().length >= 40 ? 'Your summary gives employers context.' : 'Write a short summary of your strengths and direction.' },
    { label: 'Skills', complete: user.skills.length >= 3, detail: `${user.skills.length} skill${user.skills.length === 1 ? '' : 's'} listed` },
    { label: 'Experience evidence', complete: user.experience.length > 0, detail: user.experience.length ? `${user.experience.length} experience entr${user.experience.length === 1 ? 'y' : 'ies'}` : 'Add a role, project, or measurable outcome.' },
  ];
  const userSkillCanonicals = new Set(user.skills.map(({ skill }) => canonicalSkill(skill)));
  const commonMissingSkills = jobs
    .flatMap((job) => job.skillsRequired)
    .filter((skill) => !userSkillCanonicals.has(canonicalSkill(skill)))
    .reduce<Record<string, number>>((counts, skill) => ({ ...counts, [skill]: (counts[skill] || 0) + 1 }), {});
  const growthFocus = Object.entries(commonMissingSkills)
    .sort(([, firstCount], [, secondCount]) => secondCount - firstCount)
    .slice(0, 3)
    .map(([skill]) => skill);
  const strengths = unique([
    ...user.skills.slice(0, 3).map(({ skill }) => skill),
    ...(user.title.trim() ? [user.title.trim()] : []),
    ...(user.experience.length > 0 ? ['Experience evidence'] : []),
  ]).slice(0, 4);
  const recommendations = [
    ...(!sections[1].complete ? ['Add a two-sentence summary that names your strengths and target work.'] : []),
    ...(!sections[2].complete ? ['Add three relevant skills so matching can become more accurate.'] : []),
    ...(!sections[3].complete ? ['Add a project or role with a measurable outcome.'] : []),
    ...(growthFocus.length ? [`Build evidence for ${growthFocus[0]} to unlock more relevant roles.`] : []),
  ].slice(0, 3);

  return {
    score: getProfileCompletion(user),
    level: inferCareerLevel(user),
    targetRole: user.title.trim() || 'Your next career move',
    strengths,
    growthFocus,
    recommendations,
    sections,
  };
}

export function getApplicationReadiness(job: Job, user: User): ApplicationReadiness {
  const intelligence = getJobIntelligence(job, user);
  const profileCompletion = getProfileCompletion(user);
  const score = Math.round(intelligence.score * 0.7 + profileCompletion * 0.3);
  const checklist = [
    { label: 'Career basics', complete: Boolean(user.title.trim() && user.location.trim()), detail: 'Role title and location help recruiters understand your context.' },
    { label: 'Relevant skill evidence', complete: intelligence.matchedSkills.length > 0, detail: intelligence.matchedSkills.length ? `${intelligence.matchedSkills.length} role skill${intelligence.matchedSkills.length === 1 ? '' : 's'} matched.` : 'No required skills are visible on your profile yet.' },
    { label: 'Experience or project proof', complete: user.experience.length > 0, detail: user.experience.length ? 'You have experience evidence to reference.' : 'Add a project or work outcome before submitting.' },
    { label: 'Tailored application', complete: false, detail: 'Use the application response to connect one concrete outcome to this role.' },
  ];
  const label = score >= 72 ? 'Ready to apply' : score >= 52 ? 'Nearly ready' : 'Build your case first';
  const nextAction = intelligence.missingSkills[0]
    ? `Address ${intelligence.missingSkills[0]} in your application, or explain adjacent experience honestly.`
    : checklist.find((item) => !item.complete)?.detail || 'Connect one career outcome to the role before you submit.';

  return { score, label, checklist, nextAction };
}

export function getCareerRecommendations(user: User, jobs: Job[] = MOCK_JOBS): CareerRecommendation[] {
  return jobs
    .map((job) => {
      const intelligence = getJobIntelligence(job, user);
      const matchedNames = intelligence.matchedSkills.slice(0, 2).map((match) => match.jobSkill);
      return {
        job,
        intelligence,
        reason: matchedNames.length
          ? `Your profile already shows ${matchedNames.join(' and ')}.`
          : intelligence.transferableSkills.length
            ? `${intelligence.transferableSkills[0].profileSkill} is adjacent to this role's ${intelligence.transferableSkills[0].jobSkill} requirement.`
            : 'This role can help shape a focused growth plan.',
      };
    })
    .sort((first, second) => second.intelligence.score - first.intelligence.score);
}

const SEARCH_STOP_WORDS = new Set([
  'a', 'an', 'and', 'at', 'for', 'from', 'in', 'of', 'on', 'or', 'the', 'to', 'with',
  'job', 'jobs', 'role', 'roles', 'position', 'positions', 'opportunity', 'opportunities',
  'looking', 'work', 'working', 'want', 'need', 'please', 'find', 'show', 'me',
  'full', 'time', 'part', 'contract', 'internship', 'intern', 'remote', 'hybrid', 'onsite', 'site',
  'entry', 'level', 'mid', 'senior', 'executive', 'junior', 'graduate', 'staff', 'lead',
]);

function normalizeSearchText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9+#]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function queryIncludesPhrase(query: string, phrase: string): boolean {
  const normalizedPhrase = normalizeSearchText(phrase);
  return Boolean(normalizedPhrase) && ` ${query} `.includes(` ${normalizedPhrase} `);
}

function displaySearchSkill(canonical: string): string {
  const fromJobs = MOCK_JOBS
    .flatMap((job) => job.skillsRequired)
    .find((skill) => canonicalSkill(skill) === canonical);
  if (fromJobs) return fromJobs;

  const configuredSkill = Object.keys(SKILL_ALIASES)
    .find((skill) => canonicalSkill(skill) === canonical);
  return configuredSkill || canonical;
}

/**
 * Converts common career-language queries (for example, "remote senior React roles")
 * into explicit constraints. The output stays inspectable so UI can explain its ranking.
 */
export function parseCareerSearchIntent(query: string): CareerSearchIntent {
  const normalizedQuery = normalizeSearchText(query);
  const knownSkills = unique([
    ...MOCK_JOBS.flatMap((job) => job.skillsRequired),
    ...Object.keys(SKILL_ALIASES),
    ...Object.values(SKILL_ALIASES).flat(),
  ]).sort((first, second) => second.length - first.length);
  const detectedSkillCanonicals = new Set(
    knownSkills
      .filter((skill) => queryIncludesPhrase(normalizedQuery, skill))
      .map((skill) => canonicalSkill(skill)),
  );
  const skills = [...detectedSkillCanonicals].map(displaySearchSkill);

  const workplaceTypes: Job['workplaceType'][] = [];
  if (queryIncludesPhrase(normalizedQuery, 'remote')) workplaceTypes.push('Remote');
  if (queryIncludesPhrase(normalizedQuery, 'hybrid')) workplaceTypes.push('Hybrid');
  if (/\bon[ -]?site\b|\bonsite\b|\bin office\b/.test(normalizedQuery)) workplaceTypes.push('On-site');

  const jobTypes: Job['type'][] = [];
  if (/\bfull[ -]?time\b/.test(normalizedQuery)) jobTypes.push('Full-time');
  if (/\bpart[ -]?time\b/.test(normalizedQuery)) jobTypes.push('Part-time');
  if (/\bcontract(or)?\b|\bfreelance\b/.test(normalizedQuery)) jobTypes.push('Contract');
  if (/\bintern(ship)?\b/.test(normalizedQuery)) jobTypes.push('Internship');

  const experienceLevels: Job['experience'][] = [];
  if (/\bentry[ -]?level\b|\bjunior\b|\bgraduate\b/.test(normalizedQuery)) experienceLevels.push('Entry Level');
  if (/\bmid[ -]?level\b|\bintermediate\b/.test(normalizedQuery)) experienceLevels.push('Mid Level');
  if (/\bsenior\b|\bstaff\b|\blead\b/.test(normalizedQuery)) experienceLevels.push('Senior');
  if (/\bexecutive\b|\bdirector\b|\bhead of\b|\bvp\b/.test(normalizedQuery)) experienceLevels.push('Executive');

  const constrainedWords = new Set([
    ...skills.flatMap((skill) => normalizeSearchText(skill).split(' ')),
    ...workplaceTypes.flatMap((type) => normalizeSearchText(type).split(' ')),
    ...jobTypes.flatMap((type) => normalizeSearchText(type).split(' ')),
    ...experienceLevels.flatMap((level) => normalizeSearchText(level).split(' ')),
  ]);
  const keywords = unique(normalizedQuery.split(' ')
    .filter((word) => word.length > 1 && !SEARCH_STOP_WORDS.has(word) && !constrainedWords.has(word)));

  return { rawQuery: query.trim(), skills, workplaceTypes, jobTypes, experienceLevels, keywords };
}

export function describeCareerSearchIntent(intent: CareerSearchIntent): string | null {
  const parts = [
    ...intent.skills.slice(0, 2),
    ...intent.workplaceTypes,
    ...intent.jobTypes,
    ...intent.experienceLevels,
  ];
  return parts.length ? parts.join(' · ') : null;
}

/**
 * Ranks search results with query intent and the same profile evidence used by job-match cards.
 * There is intentionally no hidden model call: every input is visible in the returned result.
 */
export function searchJobsWithCareerIntent(
  query: string,
  user: User,
  jobs: Job[] = MOCK_JOBS,
): CareerSearchResult[] {
  const intent = parseCareerSearchIntent(query);
  const requestedSkillCanonicals = new Set(intent.skills.map(canonicalSkill));

  return jobs
    .map((job) => {
      const jobSkillCanonicals = new Set(job.skillsRequired.map(canonicalSkill));
      const matchedQuerySkills = [...requestedSkillCanonicals].filter((skill) => jobSkillCanonicals.has(skill));
      const searchableText = normalizeSearchText([
        job.title,
        job.company,
        job.location,
        job.workplaceType,
        job.type,
        job.experience,
        ...job.tags,
        ...job.skillsRequired,
      ].join(' '));
      const keywordHits = intent.keywords.filter((keyword) => searchableText.includes(keyword));
      const matchesIntent =
        (!intent.workplaceTypes.length || intent.workplaceTypes.includes(job.workplaceType))
        && (!intent.jobTypes.length || intent.jobTypes.includes(job.type))
        && (!intent.experienceLevels.length || intent.experienceLevels.includes(job.experience))
        && (!intent.skills.length || matchedQuerySkills.length > 0)
        && (!intent.keywords.length || keywordHits.length === intent.keywords.length);

      if (!matchesIntent) return null;

      const intelligence = getJobIntelligence(job, user);
      const queryScore =
        (intent.skills.length ? (matchedQuerySkills.length / intent.skills.length) * 30 : 0)
        + (intent.keywords.length ? (keywordHits.length / intent.keywords.length) * 18 : 0)
        + (intent.workplaceTypes.length ? 8 : 0)
        + (intent.jobTypes.length ? 5 : 0)
        + (intent.experienceLevels.length ? 5 : 0);
      const score = Math.round(intelligence.score + queryScore + (job.promoted ? 2 : 0));
      const reason = matchedQuerySkills.length
        ? `Matches your ${matchedQuerySkills.slice(0, 2).map(displaySearchSkill).join(' and ')} search intent.`
        : keywordHits.length
          ? `Matches ${keywordHits.slice(0, 2).join(' and ')} in the role details.`
          : `Prioritized using your ${intelligence.label.toLowerCase()} profile fit.`;

      return { job, intelligence, score, reason };
    })
    .filter((result): result is CareerSearchResult => Boolean(result))
    .sort((first, second) => second.score - first.score);
}
