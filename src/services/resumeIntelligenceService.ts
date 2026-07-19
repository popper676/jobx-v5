export interface ResumePersonal {
  name: string;
  email: string;
  phone: string;
  title: string;
}

export interface ResumeExperience {
  id: number;
  company: string;
  role: string;
  description: string;
}

export interface ResumeSuggestion {
  id: 'headline' | 'contact' | 'experience' | 'impact' | 'action';
  title: string;
  detail: string;
}

export interface ResumeAnalysis {
  score: number;
  label: 'Strong foundation' | 'Nearly ready' | 'Build your draft';
  summary: string;
  suggestions: ResumeSuggestion[];
  actionVerbCount: number;
  metricCount: number;
}

const ACTION_VERBS = [
  'achieved', 'built', 'created', 'delivered', 'designed', 'developed', 'drove', 'improved', 'implemented',
  'increased', 'launched', 'led', 'managed', 'optimized', 'reduced', 'shipped', 'streamlined', 'supported',
  'transformed', 'worked',
];

function normalize(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

function hasActionVerb(value: string): boolean {
  const words = normalize(value).toLowerCase().split(/[^a-z]+/).filter(Boolean);
  return words.some((word) => ACTION_VERBS.includes(word));
}

function hasMetric(value: string): boolean {
  return /\b\d+(?:[.,]\d+)?(?:%|\+|x\b|\s*(?:users?|customers?|projects?|days?|hours?|months?|years?))\b/i.test(value)
    || /\$\s?\d+/i.test(value);
}

export function analyzeResume(personal: ResumePersonal, experience: ResumeExperience[]): ResumeAnalysis {
  const populatedExperience = experience.filter((item) => normalize(item.company) || normalize(item.role) || normalize(item.description));
  const descriptions = populatedExperience.map((item) => normalize(item.description)).filter(Boolean);
  const actionVerbCount = descriptions.filter(hasActionVerb).length;
  const metricCount = descriptions.filter(hasMetric).length;
  const suggestions: ResumeSuggestion[] = [];

  if (!normalize(personal.title)) {
    suggestions.push({ id: 'headline', title: 'Name your target role', detail: 'A clear professional title helps employers and matching tools understand your direction.' });
  }
  if (!normalize(personal.email)) {
    suggestions.push({ id: 'contact', title: 'Add a contact email', detail: 'Make it easy for a recruiter to contact you without leaving the resume.' });
  }
  if (!populatedExperience.length || populatedExperience.some((item) => !normalize(item.role) || !normalize(item.company))) {
    suggestions.push({ id: 'experience', title: 'Complete your experience context', detail: 'For each role, include both the employer and role title before refining the bullet points.' });
  }
  if (descriptions.length && actionVerbCount < descriptions.length) {
    suggestions.push({ id: 'action', title: 'Start bullets with ownership', detail: 'Use a concrete action verb so readers can quickly see what you personally delivered.' });
  }
  if (descriptions.length && metricCount === 0) {
    suggestions.push({ id: 'impact', title: 'Add one verifiable outcome', detail: 'Include a truthful result, scope, time saved, quality improvement, or other measurable impact.' });
  }
  if (!descriptions.length && !suggestions.some((suggestion) => suggestion.id === 'experience')) {
    suggestions.push({ id: 'experience', title: 'Add one achievement bullet', detail: 'Describe a real project or responsibility so the assistant can help you strengthen its evidence.' });
  }

  const identityScore = (normalize(personal.name) ? 8 : 0) + (normalize(personal.title) ? 16 : 0) + (normalize(personal.email) ? 8 : 0);
  const experienceScore = Math.min(38, populatedExperience.length * 14 + descriptions.length * 5);
  const evidenceScore = Math.min(30, actionVerbCount * 8 + metricCount * 10);
  const score = Math.min(100, identityScore + experienceScore + evidenceScore);
  const label = score >= 75 ? 'Strong foundation' : score >= 48 ? 'Nearly ready' : 'Build your draft';
  const summary = suggestions.length
    ? suggestions[0].detail
    : 'Your draft has a clear direction and visible evidence. Tailor the strongest bullet to each role before applying.';

  return { score, label, summary, suggestions: suggestions.slice(0, 4), actionVerbCount, metricCount };
}

export function createAchievementTemplate(description: string, role: string): string {
  const source = normalize(description);
  const roleLabel = normalize(role) || 'this role';
  if (!source) {
    return `For ${roleLabel}: [action verb] [specific work or project] using [method or tool], resulting in [truthful measurable outcome].`;
  }
  return `For ${roleLabel}: [action verb] ${source.replace(/[.\s]+$/, '')} by [method or tool], resulting in [truthful measurable outcome].`;
}
