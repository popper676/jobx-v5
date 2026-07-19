import { db } from './db';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  title: string;
  bio: string;
  location: string;
  website: string;
  skills: { skill: string; endorsements: number }[];
  connections: number;
  profileViews: number;
  endorsements: number;
  experience: { role: string; company: string; duration: string; period: string; description: string }[];
  profileCompleted: boolean;
}

const FALLBACK_AVATAR = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80';

function getAvatar(user: User): string {
  if (user.avatar && user.avatar.trim()) return user.avatar;
  if (user.name && user.name.trim()) return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=16A34A&color=fff&bold=true&size=256`;
  return FALLBACK_AVATAR;
}

const DEFAULT_USER: User = {
  id: '1',
  name: '',
  email: '',
  avatar: '',
  title: '',
  bio: '',
  location: '',
  website: '',
  skills: [],
  connections: 0,
  profileViews: 0,
  endorsements: 0,
  experience: [],
  profileCompleted: false,
};

export const userService = {
  get(): User {
    return db.get<User>('user', DEFAULT_USER);
  },

  getWithAvatar(): User {
    const user = db.get<User>('user', DEFAULT_USER);
    return { ...user, avatar: getAvatar(user) };
  },

  update(updates: Partial<User>): User {
    const current = this.get();
    const updated = { ...current, ...updates };
    db.set('user', updated);
    return updated;
  },

  updateSkill(index: number, endorsements: number): User {
    const user = this.get();
    const skills = [...user.skills];
    if (skills[index]) {
      skills[index] = { ...skills[index], endorsements };
    }
    return this.update({ skills });
  },

  completeProfile(data: Partial<User>): User {
    const updated = this.update({ ...data, profileCompleted: true });
    return updated;
  },

  reset(): User {
    db.remove('user');
    return DEFAULT_USER;
  }
};