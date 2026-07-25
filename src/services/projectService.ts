import { db } from './db';
import type { User } from './userService';

export interface CommunityProject {
  id: string;
  title: string;
  description: string;
  image: string;
  metrics: { likes: number; comments: number; visitors?: number; collaborators?: number };
  category?: ProjectCategory;
  tags: string[];
  openToCollab: boolean;
  myProject: boolean;
  author: { name: string; avatar: string; title?: string };
  repositoryUrl?: string;
  demoUrl?: string;
  createdAt?: string;
}

export interface ProjectSubmission {
  title: string;
  description: string;
  tags: string[];
  imageUrl?: string;
  repositoryUrl?: string;
  demoUrl?: string;
  openToCollab: boolean;
  category?: ProjectCategory;
}

export const PROJECT_CATEGORIES = ['Web Apps', 'AI & Data', 'Design', 'Developer Tools', 'Open Source', 'Social Impact'] as const;
export type ProjectCategory = typeof PROJECT_CATEGORIES[number];

export interface ProjectSubmissionResult {
  success: boolean;
  project?: CommunityProject;
  error?: string;
}

const STORAGE_KEY = 'community_projects';
const ENGAGEMENT_KEY = 'project_engagement';
const DEFAULT_PROJECT_IMAGE = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80';

const DEFAULT_PROJECTS: CommunityProject[] = [
  {
    id: '1',
    title: 'Jobx Social Platform',
    description: 'A career opportunity workspace built with React, Tailwind CSS, and Vite. Features include skills evidence, transparent jobs, accountable applications, and interactive project showcases.',
    image: DEFAULT_PROJECT_IMAGE,
    metrics: { likes: 142, comments: 24 },
    category: 'Web Apps',
    tags: ['React', 'TypeScript', 'Tailwind'],
    openToCollab: true,
    myProject: true,
    author: { name: 'You', avatar: '', title: 'Full Stack Developer' },
  },
  {
    id: '2',
    title: 'DevChat Workspace',
    description: 'Real-time collaborative workspace for developers with code highlighting, video calls, and integrated terminal. Designed to replace Slack for small dev teams.',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
    metrics: { likes: 89, comments: 12 },
    category: 'Developer Tools',
    tags: ['Next.js', 'Socket.io', 'WebRTC'],
    openToCollab: true,
    myProject: false,
    author: { name: 'Sarah Chen', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&facearea&facepad=2&w=256&h=256&q=80', title: 'Senior Full Stack Engineer' },
  },
  {
    id: '3',
    title: 'FinTech Dashboard',
    description: 'An open-source financial dashboard template providing insightful analytics, user tracking, and revenue forecasting using custom charts.',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
    metrics: { likes: 215, comments: 45 },
    category: 'AI & Data',
    tags: ['Vue', 'D3.js', 'Firebase'],
    openToCollab: false,
    myProject: false,
    author: { name: 'Marcus Rodriguez', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&facearea&facepad=2&w=256&h=256&q=80', title: 'Product Designer' },
  },
];

const PROJECT_SEEDS: Array<[string, string, ProjectCategory, string[], boolean, string, number, number]> = [
  ['OpenHealth Triage', 'Privacy-first symptom triage and clinic routing for underserved communities.', 'Social Impact', ['React', 'Python', 'FHIR'], true, 'Amina Patel', 1840, 8],
  ['Design Token Forge', 'A collaborative design-token pipeline with visual diffs and framework exports.', 'Design', ['Figma', 'Storybook', 'Tokens'], true, 'Maya Chen', 1260, 6],
  ['Local-first Notes', 'An encrypted offline knowledge workspace with peer-to-peer synchronization.', 'Open Source', ['TypeScript', 'CRDT', 'IndexedDB'], true, 'Noah Williams', 980, 5],
  ['Climate Lens', 'Neighborhood-level climate risk maps with transparent public datasets.', 'AI & Data', ['Python', 'Mapbox', 'PostGIS'], true, 'Elena Torres', 2310, 12],
  ['API Observatory', 'Open-source API health, latency, and contract monitoring for small teams.', 'Developer Tools', ['Go', 'OpenTelemetry', 'React'], true, 'Daniel Kim', 1720, 9],
  ['Accessible Commerce Kit', 'Reusable checkout components tested against practical accessibility standards.', 'Web Apps', ['Next.js', 'WCAG', 'Playwright'], false, 'Priya Shah', 1430, 4],
  ['Mentor Match', 'A skills-based mentoring network for early-career technologists.', 'Social Impact', ['Vue', 'Node.js', 'Postgres'], true, 'Jordan Lee', 890, 7],
  ['Model Card Studio', 'Create, review, and publish responsible AI model cards with team workflows.', 'AI & Data', ['Python', 'LLM', 'FastAPI'], true, 'Fatima Noor', 2670, 14],
  ['Release Notes AI', 'Turns merged pull requests into editable, customer-friendly release notes.', 'Developer Tools', ['GitHub API', 'React', 'AI'], true, 'Lucas Martin', 2050, 11],
  ['Civic Budget Explorer', 'Makes municipal budgets searchable and understandable through data stories.', 'Social Impact', ['D3.js', 'Svelte', 'Open Data'], true, 'Sofia Reyes', 1580, 10],
  ['Motion Pattern Library', 'Production-ready interaction patterns with accessibility and reduced-motion modes.', 'Design', ['Framer Motion', 'React', 'A11y'], false, 'Olivia Grant', 1120, 3],
  ['Tiny CI Runner', 'A lightweight self-hosted continuous integration runner for side projects.', 'Open Source', ['Rust', 'Docker', 'YAML'], true, 'Ethan Brooks', 1940, 13],
];

const EXTRA_PROJECTS: CommunityProject[] = PROJECT_SEEDS.map((seed, index) => ({
  id: `sample-${index + 4}`,
  title: seed[0],
  description: seed[1],
  category: seed[2],
  tags: seed[3],
  openToCollab: seed[4],
  myProject: false,
  author: { name: seed[5], avatar: '', title: 'JobX creator' },
  metrics: { likes: 36 + index * 17, comments: 4 + index * 3, visitors: seed[6], collaborators: seed[7] },
  image: [
    'https://images.unsplash.com/photo-1551434678-e076c223a692',
    'https://images.unsplash.com/photo-1552664730-d307ca884978',
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa',
  ][index % 4] + '?auto=format&fit=crop&w=800&q=80',
}));

type ProjectEngagement = Record<string, { visitors: number; collaborators: string[] }>;

function safeExternalUrl(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;

  try {
    const url = new URL(trimmed);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

function cleanTags(tags: string[]): string[] {
  return [...new Set(tags.map((tag) => tag.trim()).filter(Boolean))].slice(0, 6);
}

function validateSubmission(input: ProjectSubmission): string | undefined {
  const title = input.title.trim();
  const description = input.description.trim();
  const tags = cleanTags(input.tags);
  const rawTags = [...new Set(input.tags.map((tag) => tag.trim()).filter(Boolean))];

  if (title.length < 3 || title.length > 80) return 'Use a project title between 3 and 80 characters.';
  if (description.length < 30 || description.length > 1_000) return 'Add a project description between 30 and 1,000 characters.';
  if (!tags.length) return 'Add at least one skill or technology.';
  if (rawTags.length > 6) return 'Use up to six skills or technologies.';

  if ((input.imageUrl?.trim() && !safeExternalUrl(input.imageUrl))
    || (input.repositoryUrl?.trim() && !safeExternalUrl(input.repositoryUrl))
    || (input.demoUrl?.trim() && !safeExternalUrl(input.demoUrl))) {
    return 'Links must start with http:// or https://.';
  }

  return undefined;
}

export const projectService = {
  getSubmittedProjects(): CommunityProject[] {
    return db.get<CommunityProject[]>(STORAGE_KEY, []).map((project) => ({
      ...project,
      category: project.category || 'Web Apps',
      metrics: { visitors: 0, collaborators: 0, ...project.metrics },
    }));
  },

  getAllProjects(user: User): CommunityProject[] {
    const defaultProjects = DEFAULT_PROJECTS.map((project) => (
      project.myProject
        ? { ...project, author: { name: user.name, avatar: user.avatar, title: user.title || project.author.title } }
        : project
    ));
    return [...this.getSubmittedProjects(), ...defaultProjects, ...EXTRA_PROJECTS];
  },

  getProjectById(id: string, user: User): CommunityProject | undefined {
    return this.getAllProjects(user).find((project) => project.id === id);
  },

  submit(input: ProjectSubmission, user: User): ProjectSubmissionResult {
    const error = validateSubmission(input);
    if (error) return { success: false, error };

    const submittedProject: CommunityProject = {
      id: `project-${Date.now().toString(36)}`,
      title: input.title.trim(),
      description: input.description.trim(),
      image: safeExternalUrl(input.imageUrl) || DEFAULT_PROJECT_IMAGE,
      metrics: { likes: 0, comments: 0 },
      category: input.category || 'Web Apps',
      tags: cleanTags(input.tags),
      openToCollab: input.openToCollab,
      myProject: true,
      author: { name: user.name, avatar: user.avatar, title: user.title },
      repositoryUrl: safeExternalUrl(input.repositoryUrl),
      demoUrl: safeExternalUrl(input.demoUrl),
      createdAt: new Date().toISOString(),
    };

    const savedProjects = [submittedProject, ...this.getSubmittedProjects()];
    const result = db.set(STORAGE_KEY, savedProjects);
    if (!result.ok) return { success: false, error: result.error || 'We could not save your project. Please try again.' };

    return { success: true, project: submittedProject };
  },

  recordVisit(projectId: string): void {
    const engagement = db.get<ProjectEngagement>(ENGAGEMENT_KEY, {});
    const current = engagement[projectId] || { visitors: 0, collaborators: [] };
    db.set(ENGAGEMENT_KEY, { ...engagement, [projectId]: { ...current, visitors: current.visitors + 1 } });
  },

  recordCollaboration(projectId: string, userId: string): void {
    const engagement = db.get<ProjectEngagement>(ENGAGEMENT_KEY, {});
    const current = engagement[projectId] || { visitors: 0, collaborators: [] };
    db.set(ENGAGEMENT_KEY, {
      ...engagement,
      [projectId]: { ...current, collaborators: [...new Set([...current.collaborators, userId])] },
    });
  },

  getEngagement(projectId: string): { visitors: number; collaborators: number } {
    const current = db.get<ProjectEngagement>(ENGAGEMENT_KEY, {})[projectId];
    return { visitors: current?.visitors || 0, collaborators: current?.collaborators.length || 0 };
  },

  getVerificationPoints(user: User): number {
    const engagement = db.get<ProjectEngagement>(ENGAGEMENT_KEY, {});
    const ownProjects = this.getAllProjects(user).filter((project) => project.myProject);
    return Math.min(20, ownProjects.reduce((total, project) => {
      const live = engagement[project.id];
      const visitors = (project.metrics.visitors || 0) + (live?.visitors || 0);
      const collaborators = (project.metrics.collaborators || 0) + (live?.collaborators.length || 0);
      return total + Math.floor(visitors / 100) + collaborators * 2;
    }, 0));
  },
};
