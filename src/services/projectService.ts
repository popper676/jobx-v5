import { db } from './db';
import type { User } from './userService';

export interface CommunityProject {
  id: string;
  title: string;
  description: string;
  image: string;
  metrics: { likes: number; comments: number };
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
}

export interface ProjectSubmissionResult {
  success: boolean;
  project?: CommunityProject;
  error?: string;
}

const STORAGE_KEY = 'community_projects';
const DEFAULT_PROJECT_IMAGE = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80';

const DEFAULT_PROJECTS: CommunityProject[] = [
  {
    id: '1',
    title: 'Jobx Social Platform',
    description: 'A professional social network platform built with React, Tailwind CSS, and Vite. Features include a real-time feed, connections management, and interactive project showcases.',
    image: DEFAULT_PROJECT_IMAGE,
    metrics: { likes: 142, comments: 24 },
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
    tags: ['Vue', 'D3.js', 'Firebase'],
    openToCollab: false,
    myProject: false,
    author: { name: 'Marcus Rodriguez', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&facearea&facepad=2&w=256&h=256&q=80', title: 'Product Designer' },
  },
];

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
    return db.get<CommunityProject[]>(STORAGE_KEY, []);
  },

  getAllProjects(user: User): CommunityProject[] {
    const defaultProjects = DEFAULT_PROJECTS.map((project) => (
      project.myProject
        ? { ...project, author: { name: user.name, avatar: user.avatar, title: user.title || project.author.title } }
        : project
    ));
    return [...this.getSubmittedProjects(), ...defaultProjects];
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
};
