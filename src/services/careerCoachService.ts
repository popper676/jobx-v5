import type { Job } from '../data';
import { db } from './db';
import { getCareerPassport, getCareerRecommendations } from './careerIntelligenceService';
import type { User } from './userService';

const COACH_PROGRESS_KEY = 'career_coach_completed_actions';

export interface CareerCoachAction {
  id: string;
  phase: string;
  title: string;
  detail: string;
  href: string;
  ctaLabel: string;
  completed: boolean;
}

export interface CareerCoachPlan {
  targetRole: string;
  level: string;
  score: number;
  coachNote: string;
  actions: CareerCoachAction[];
  recommendedRole: ReturnType<typeof getCareerRecommendations>[number] | null;
}

function uniqueStrings(values: unknown): string[] {
  return Array.isArray(values) ? [...new Set(values.filter((value): value is string => typeof value === 'string' && value.length > 0))] : [];
}

export function getCompletedCoachActions(): string[] {
  return uniqueStrings(db.get<unknown>(COACH_PROGRESS_KEY, []));
}

export function setCoachActionCompleted(actionId: string, completed: boolean): string[] {
  const current = new Set(getCompletedCoachActions());
  if (completed) current.add(actionId);
  else current.delete(actionId);
  const next = [...current];
  db.set(COACH_PROGRESS_KEY, next);
  return next;
}

export function getCareerCoachPlan(user: User, jobs: Job[], completedIds = getCompletedCoachActions()): CareerCoachPlan {
  const passport = getCareerPassport(user, jobs);
  const recommendations = getCareerRecommendations(user, jobs);
  const recommendedRole = recommendations[0] ?? null;
  const incompleteSection = passport.sections.find((section) => !section.complete);
  const prioritySkill = passport.growthFocus[0];
  const actions = [
    {
      id: 'career-story',
      phase: 'Week 1 · Positioning',
      title: incompleteSection ? `Strengthen your ${incompleteSection.label.toLowerCase()}` : 'Refine your professional story',
      detail: incompleteSection
        ? incompleteSection.detail
        : 'Keep your profile focused on the work you want next and the evidence that supports it.',
      href: '/profile',
      ctaLabel: 'Update profile',
    },
    {
      id: 'skill-evidence',
      phase: 'Week 2 · Evidence',
      title: prioritySkill ? `Build visible evidence for ${prioritySkill}` : 'Make your strongest skills visible',
      detail: prioritySkill
        ? `Add a truthful project, result, or learning milestone that demonstrates ${prioritySkill}.`
        : 'List the skills you want employers to see and connect each one to an outcome or project.',
      href: '/projects',
      ctaLabel: 'Add project proof',
    },
    {
      id: 'resume-case',
      phase: 'Week 3 · Application case',
      title: 'Turn experience into a focused resume case',
      detail: 'Use the resume builder to make one achievement bullet specific, truthful, and easy to scan.',
      href: '/resume',
      ctaLabel: 'Open resume builder',
    },
    {
      id: 'role-review',
      phase: 'Week 4 · Target roles',
      title: recommendedRole ? `Review your fit for ${recommendedRole.job.title}` : 'Review a role you want next',
      detail: recommendedRole
        ? recommendedRole.reason
        : 'Compare your visible skills with a target role and choose one evidence gap to close.',
      href: recommendedRole ? `/jobs/${recommendedRole.job.id}` : '/jobs',
      ctaLabel: 'Review role',
    },
  ].map((action) => ({ ...action, completed: completedIds.includes(action.id) }));

  const nextAction = actions.find((action) => !action.completed);
  const coachNote = nextAction
    ? `Start with “${nextAction.title}.” One clear piece of evidence is more useful than a longer, generic profile.`
    : 'Your current plan is complete. Revisit it when your target role or evidence changes.';

  return {
    targetRole: passport.targetRole,
    level: passport.level,
    score: passport.score,
    coachNote,
    actions,
    recommendedRole,
  };
}
