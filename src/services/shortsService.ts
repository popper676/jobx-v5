import { db } from './db';

export interface ShortVideo {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorTitle: string;
  videoUrl: string;
  thumbnail?: string;
  description: string;
  music?: string;
  likes: number;
  comments: ShortComment[];
  shares: number;
  liked: boolean;
  saved: boolean;
  createdAt: string;
}

export interface ShortComment {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  text: string;
  createdAt: string;
}

const DEFAULT_SHORTS: ShortVideo[] = [];

export const shortsService = {
  getAll(): ShortVideo[] {
    return db.get<ShortVideo[]>('shorts', DEFAULT_SHORTS);
  },

  createShort(videoUrl: string, description: string, music: string, authorId: string, authorName: string, authorTitle: string, authorAvatar: string): ShortVideo | null {
    const shorts = this.getAll();
    const newShort: ShortVideo = {
      id: 's' + Date.now(),
      authorId,
      authorName,
      authorTitle,
      authorAvatar,
      videoUrl,
      description,
      music: music || undefined,
      likes: 0,
      comments: [],
      shares: 0,
      liked: false,
      saved: false,
      createdAt: new Date().toISOString(),
    };
    const updated = [newShort, ...shorts];
    const result = db.set('shorts', updated);
    if (!result.ok) {
      console.error('Failed to save short:', result.error);
      return null;
    }
    return newShort;
  },

  toggleLike(shortId: string): ShortVideo[] {
    const shorts = this.getAll();
    const updated = shorts.map(s => {
      if (s.id === shortId) {
        return { ...s, liked: !s.liked, likes: s.liked ? s.likes - 1 : s.likes + 1 };
      }
      return s;
    });
    db.set('shorts', updated);
    return updated;
  },

  toggleSave(shortId: string): ShortVideo[] {
    const shorts = this.getAll();
    const updated = shorts.map(s => {
      if (s.id === shortId) return { ...s, saved: !s.saved };
      return s;
    });
    db.set('shorts', updated);
    return updated;
  },

  addComment(shortId: string, text: string, authorId: string, authorName: string, authorAvatar: string): ShortVideo[] {
    const shorts = this.getAll();
    const updated = shorts.map(s => {
      if (s.id === shortId) {
        const newComment: ShortComment = {
          id: 'sc' + Date.now(),
          authorId,
          authorName,
          authorAvatar,
          text,
          createdAt: new Date().toISOString(),
        };
        return { ...s, comments: [...s.comments, newComment] };
      }
      return s;
    });
    db.set('shorts', updated);
    return updated;
  },

  shareShort(shortId: string): ShortVideo[] {
    const shorts = this.getAll();
    const updated = shorts.map(s => {
      if (s.id === shortId) return { ...s, shares: s.shares + 1 };
      return s;
    });
    db.set('shorts', updated);
    return updated;
  },

  deleteShort(shortId: string): ShortVideo[] {
    const updated = this.getAll().filter(s => s.id !== shortId);
    db.set('shorts', updated);
    return updated;
  },

  reset(): ShortVideo[] {
    db.remove('shorts');
    return DEFAULT_SHORTS;
  }
};