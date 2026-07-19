import { db } from './db';

export interface Notification {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  action: string;
  time: string;
  type: 'like' | 'comment' | 'connection' | 'view' | 'post' | 'job_alert';
  read: boolean;
  postId?: string;
  friendRequestId?: string;
  link?: string;
  title?: string;
  message?: string;
}

const DEFAULT_NOTIFICATIONS: Notification[] = [];

export const notificationService = {
  getAll(): Notification[] {
    return db.get<Notification[]>('notifications', DEFAULT_NOTIFICATIONS);
  },

  markAsRead(id: string): Notification[] {
    const notifications = this.getAll().map(n => n.id === id ? { ...n, read: true } : n);
    db.set('notifications', notifications);
    return notifications;
  },

  markAllAsRead(): Notification[] {
    const notifications = this.getAll().map(n => ({ ...n, read: true }));
    db.set('notifications', notifications);
    return notifications;
  },

  add(notification: Omit<Notification, 'id'>): Notification[] {
    const notifications = this.getAll();
    const newNotification: Notification = { ...notification, id: String(Date.now()) };
    const updated = [newNotification, ...notifications];
    db.set('notifications', updated);
    return updated;
  },

  getUnreadCount(): number {
    return this.getAll().filter(n => !n.read).length;
  },

  remove(id: string): Notification[] {
    const updated = this.getAll().filter(n => n.id !== id);
    db.set('notifications', updated);
    return updated;
  },

  reset() {
    db.remove('notifications');
  }
};
