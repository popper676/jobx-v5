import { db } from './db';

export type PostVisibility = 'everyone' | 'friends' | 'only_me';

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorTitle: string;
  authorAvatar: string;
  content: string;
  image?: string;
  images?: string[];
  video?: string;
  likes: number;
  comments: Comment[];
  shares: number;
  saves: number;
  category: string;
  visibility: PostVisibility;
  createdAt: string;
  liked: boolean;
  saved: boolean;
}

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  text: string;
  createdAt: string;
}

const DEFAULT_POSTS: Post[] = [
  {
    id: '1',
    authorId: '2',
    authorName: 'Sarah Chen',
    authorTitle: 'Senior Frontend Engineer at TechCorp',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    content: "Just launched my new open-source project! It's a CLI tool for optimizing React components. Would love to hear your feedback and thoughts. #React #OpenSource #WebDev",
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
    likes: 124,
    comments: [
      { id: 'c1', authorId: '1', authorName: 'Alex Dev', authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80', text: 'This is amazing! Will definitely try it out.', createdAt: '2026-05-28T08:00:00Z' },
      { id: 'c2', authorId: '3', authorName: 'Jenna Miles', authorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80', text: 'Great work Sarah! The performance improvements are impressive.', createdAt: '2026-05-28T09:00:00Z' },
    ],
    shares: 5,
    saves: 23,
    category: 'Progress',
    createdAt: '2026-05-28T06:00:00Z',
    visibility: 'everyone',
    liked: false,
    saved: false,
  },
  {
    id: '2',
    authorId: '4',
    authorName: 'Marcus Rodriguez',
    authorTitle: 'Product Designer',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    content: "Thinking about the evolution of UI design systems. We've moved from rigid component libraries to flexible token-based systems. What do you think is the next big shift?",
    likes: 89,
    comments: [
      { id: 'c3', authorId: '1', authorName: 'Alex Dev', authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80', text: 'AI-generated design tokens could be the next frontier.', createdAt: '2026-05-27T14:00:00Z' },
    ],
    shares: 12,
    saves: 15,
    category: 'Thoughts',
    createdAt: '2026-05-27T10:00:00Z',
    visibility: 'everyone',
    liked: false,
    saved: false,
  },
  {
    id: '3',
    authorId: '5',
    authorName: 'Jenna Miles',
    authorTitle: 'Founder @ Stealth Startup',
    authorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    content: "We are hiring! Looking for a founding engineer to join our team. If you love building scalable systems and working with a great team, DM me.",
    likes: 342,
    comments: [],
    shares: 89,
    saves: 67,
    category: 'Opportunities',
    createdAt: '2026-05-26T18:00:00Z',
    visibility: 'everyone',
    liked: false,
    saved: false,
  },
];

export const postService = {
  getAll(): Post[] {
    return db.get<Post[]>('posts', DEFAULT_POSTS);
  },

  getByCategory(category: string): Post[] {
    if (category === 'All') return this.getAll();
    return this.getAll().filter(p => p.category === category);
  },

  createPost(content: string, category: string, authorId: string = '1', authorName: string = 'You', authorTitle: string = '', authorAvatar: string = '', images?: string[], video?: string): Post | null {
    const posts = this.getAll();
    const newPost: Post = {
      id: String(Date.now()),
      authorId,
      authorName,
      authorTitle,
      authorAvatar,
      content,
      images,
      video,
      likes: 0,
      comments: [],
      shares: 0,
      saves: 0,
      category,
      visibility: 'everyone',
      createdAt: new Date().toISOString(),
      liked: false,
      saved: false,
    };
    const updated = [newPost, ...posts];
    const result = db.set('posts', updated);
    if (!result.ok) {
      console.error('Failed to save post:', result.error);
      return null;
    }
    return newPost;
  },

  toggleLike(postId: string): Post[] {
    const posts = this.getAll();
    const updated = posts.map(p => {
      if (p.id === postId) {
        return { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 };
      }
      return p;
    });
    db.set('posts', updated);
    return updated;
  },

  toggleSave(postId: string): Post[] {
    const posts = this.getAll();
    const updated = posts.map(p => {
      if (p.id === postId) {
        return { ...p, saved: !p.saved, saves: p.saved ? p.saves - 1 : p.saves + 1 };
      }
      return p;
    });
    db.set('posts', updated);
    return updated;
  },

  addComment(postId: string, text: string, authorId: string = '1', authorName: string = 'You', authorAvatar: string = ''): Post[] {
    const posts = this.getAll();
    const updated = posts.map(p => {
      if (p.id === postId) {
        const newComment: Comment = {
          id: String(Date.now()),
          authorId,
          authorName,
          authorAvatar,
          text,
          createdAt: new Date().toISOString(),
        };
        return { ...p, comments: [...p.comments, newComment] };
      }
      return p;
    });
    db.set('posts', updated);
    return updated;
  },

  sharePost(postId: string): Post[] {
    const posts = this.getAll();
    const updated = posts.map(p => {
      if (p.id === postId) return { ...p, shares: p.shares + 1 };
      return p;
    });
    db.set('posts', updated);
    return updated;
  },

  updatePost(postId: string, content: string): Post[] {
    const posts = this.getAll();
    const updated = posts.map(p => {
      if (p.id === postId) return { ...p, content };
      return p;
    });
    db.set('posts', updated);
    return updated;
  },

  updateVisibility(postId: string, visibility: PostVisibility): Post[] {
    const posts = this.getAll();
    const updated = posts.map(p => {
      if (p.id === postId) return { ...p, visibility };
      return p;
    });
    db.set('posts', updated);
    return updated;
  },

  deletePost(postId: string): Post[] {
    const updated = this.getAll().filter(p => p.id !== postId);
    db.set('posts', updated);
    return updated;
  },

  reset(): Post[] {
    db.remove('posts');
    return DEFAULT_POSTS;
  }
};