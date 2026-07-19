import { db } from './db';

export interface MyDayItem {
  id: string;
  type: 'image' | 'text';
  content: string;
  bgColor?: string;
  createdAt: string;
}

export interface MyDay {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  items: MyDayItem[];
  createdAt: string;
  viewed: boolean;
  viewedBy: string[];
}

const DEFAULT_MYDAYS: MyDay[] = [
  {
    id: 'md1',
    authorId: '2',
    authorName: 'Sarah Chen',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    items: [
      { id: 'mdi1', type: 'image', content: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80', createdAt: new Date(Date.now() - 2 * 3600000).toISOString() },
      { id: 'mdi2', type: 'text', content: 'Coding all day, shipping all night! 🚀', bgColor: 'from-purple-500 to-indigo-600', createdAt: new Date(Date.now() - 1 * 3600000).toISOString() },
    ],
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    viewed: true,
    viewedBy: ['1'],
  },
  {
    id: 'md2',
    authorId: '4',
    authorName: 'Marcus Rodriguez',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    items: [
      { id: 'mdi3', type: 'image', content: 'https://images.unsplash.com/photo-1519681393784-d12026793370?auto=format&fit=crop&w=800&q=80', createdAt: new Date(Date.now() - 4 * 3600000).toISOString() },
    ],
    createdAt: new Date(Date.now() - 4 * 3600000).toISOString(),
    viewed: false,
    viewedBy: [],
  },
  {
    id: 'md3',
    authorId: '5',
    authorName: 'Jenna Miles',
    authorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    items: [
      { id: 'mdi4', type: 'text', content: 'Excited to announce our Series A! 💰', bgColor: 'from-green-500 to-emerald-600', createdAt: new Date(Date.now() - 6 * 3600000).toISOString() },
      { id: 'mdi5', type: 'image', content: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80', createdAt: new Date(Date.now() - 5 * 3600000).toISOString() },
    ],
    createdAt: new Date(Date.now() - 6 * 3600000).toISOString(),
    viewed: false,
    viewedBy: [],
  },
];

export const myDayService = {
  getAll(): MyDay[] {
    return db.get<MyDay[]>('mydays', DEFAULT_MYDAYS);
  },

  createMyDay(authorId: string, authorName: string, authorAvatar: string, items: MyDayItem[]): MyDay | null {
    const mydays = this.getAll();
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const existing = mydays.find(m => m.authorId === authorId && m.createdAt.startsWith(todayStr));
    if (existing) {
      const updated = mydays.map(m => {
        if (m.id === existing.id) {
          return { ...m, items: [...m.items, ...items] };
        }
        return m;
      });
      const result = db.set('mydays', updated);
      if (!result.ok) return null;
      return { ...existing, items: [...existing.items, ...items] };
    }
    const newDay: MyDay = {
      id: 'md' + Date.now(),
      authorId,
      authorName,
      authorAvatar,
      items,
      createdAt: new Date().toISOString(),
      viewed: true,
      viewedBy: [],
    };
    const all = [newDay, ...mydays];
    const result = db.set('mydays', all);
    if (!result.ok) return null;
    return newDay;
  },

  markViewed(dayId: string, userId: string): MyDay[] {
    const mydays = this.getAll();
    const updated = mydays.map(m => {
      if (m.id === dayId) {
        return { ...m, viewed: true, viewedBy: [...new Set([...m.viewedBy, userId])] };
      }
      return m;
    });
    db.set('mydays', updated);
    return updated;
  },

  deleteMyDay(dayId: string): MyDay[] {
    const updated = this.getAll().filter(m => m.id !== dayId);
    db.set('mydays', updated);
    return updated;
  },

  reset(): MyDay[] {
    db.remove('mydays');
    return DEFAULT_MYDAYS;
  }
};