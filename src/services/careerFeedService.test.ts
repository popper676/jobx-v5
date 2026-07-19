import { describe, expect, it } from 'vitest';
import type { Post } from './postService';
import type { User } from './userService';
import { getPersonalizedCareerFeed } from './careerFeedService';

const user: User = {
  id: 'candidate-1', name: 'Avery Lee', email: 'avery@example.com', avatar: '', title: 'Frontend Engineer',
  bio: 'I build accessible React interfaces for product teams.', location: 'Remote', website: '',
  skills: [{ skill: 'React', endorsements: 4 }, { skill: 'TypeScript', endorsements: 2 }],
  connections: 0, profileViews: 0, endorsements: 0, experience: [], profileCompleted: true,
};

const createPost = (overrides: Partial<Post>): Post => ({
  id: 'post', authorId: 'author', authorName: 'Taylor', authorTitle: 'Product builder', authorAvatar: '',
  content: 'General professional discussion', likes: 4, comments: [], shares: 0, saves: 0,
  category: 'Thoughts', visibility: 'everyone', createdAt: '2026-07-18T09:00:00Z', liked: false, saved: false,
  ...overrides,
});

describe('careerFeedService', () => {
  it('prioritizes posts that match visible skills and explains why', () => {
    const items = getPersonalizedCareerFeed(user, [
      createPost({ id: 'design', content: 'A note about research and design systems.' }),
      createPost({ id: 'react', content: 'A React and TypeScript performance guide for frontend teams.' }),
    ]);

    expect(items[0].post.id).toBe('react');
    expect(items[0].matchedTopics).toEqual(expect.arrayContaining(['React', 'TypeScript']));
    expect(items[0].reason).toContain('React');
  });

  it('keeps a useful default ordering when a profile has no career signals', () => {
    const items = getPersonalizedCareerFeed({ ...user, title: '', bio: '', skills: [] }, [
      createPost({ id: 'low', likes: 1 }),
      createPost({ id: 'high', likes: 200 }),
    ]);

    expect(items).toHaveLength(2);
    expect(items[0].post.id).toBe('high');
    expect(items[0].reason).toBeTruthy();
  });
});
