import { db } from './db';

export interface Conversation {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  role?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  text: string;
  time: string;
  isMe: boolean;
}

const DEFAULT_CONVERSATIONS: Conversation[] = [
  { id: '1', name: 'Sarah Chen', role: 'Senior React Engineer', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80', lastMessage: "Sounds great! Let's catch up tomorrow.", time: '10:45 AM', unread: 2, online: true },
  { id: '2', name: 'Marcus Rodriguez', role: 'Product Designer', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80', lastMessage: 'Did you see the new update?', time: 'Yesterday', unread: 0, online: false },
  { id: '3', name: 'Jenna Miles', role: 'UX Researcher', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80', lastMessage: 'Can you send over the Figma files?', time: 'Tue', unread: 0, online: true },
];

const DEFAULT_MESSAGES: Message[] = [
  { id: '1', conversationId: '1', senderId: '2', senderName: 'Sarah Chen', text: 'Hey Alex, how is the new project coming along?', time: '10:30 AM', isMe: false },
  { id: '2', conversationId: '1', senderId: '1', senderName: 'Alex Dev', text: "It's going well! Just wrapping up the new features.", time: '10:35 AM', isMe: true },
  { id: '3', conversationId: '1', senderId: '2', senderName: 'Sarah Chen', text: 'Awesome. Would love to see a demo when you have a moment.', time: '10:40 AM', isMe: false },
  { id: '4', conversationId: '1', senderId: '1', senderName: 'Alex Dev', text: "For sure. I'll schedule something for next week.", time: '10:42 AM', isMe: true },
  { id: '5', conversationId: '1', senderId: '2', senderName: 'Sarah Chen', text: "Sounds great! Let's catch up tomorrow.", time: '10:45 AM', isMe: false },
  { id: '6', conversationId: '2', senderId: '4', senderName: 'Marcus Rodriguez', text: 'Hey! Check out the latest design updates.', time: 'Yesterday', isMe: false },
  { id: '7', conversationId: '2', senderId: '1', senderName: 'Alex Dev', text: 'Looks really clean! Love the new color palette.', time: 'Yesterday', isMe: true },
  { id: '8', conversationId: '2', senderId: '4', senderName: 'Marcus Rodriguez', text: 'Did you see the new update?', time: 'Yesterday', isMe: false },
  { id: '9', conversationId: '3', senderId: '5', senderName: 'Jenna Miles', text: 'Hey, quick question about the project timeline.', time: 'Tue', isMe: false },
  { id: '10', conversationId: '3', senderId: '1', senderName: 'Alex Dev', text: "Sure, what's up?", time: 'Tue', isMe: true },
  { id: '11', conversationId: '3', senderId: '5', senderName: 'Jenna Miles', text: 'Can you send over the Figma files?', time: 'Tue', isMe: false },
];

export const messageService = {
  getConversations(): Conversation[] {
    return db.get<Conversation[]>('conversations', DEFAULT_CONVERSATIONS);
  },

  getMessages(conversationId: string): Message[] {
    const all = db.get<Message[]>('messages', DEFAULT_MESSAGES);
    return all.filter(m => m.conversationId === conversationId);
  },

  sendMessage(conversationId: string, text: string, senderId: string = '1', senderName: string = 'You'): { conversations: Conversation[]; messages: Message[] } {
    const allMessages = db.get<Message[]>('messages', DEFAULT_MESSAGES);
    const newMsg: Message = {
      id: String(Date.now()),
      conversationId,
      senderId,
      senderName,
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
    };
    const updatedMessages = [...allMessages, newMsg];
    db.set('messages', updatedMessages);

    const conversations = this.getConversations();
    const updatedConversations = conversations.map(c => {
      if (c.id === conversationId) {
        return { ...c, lastMessage: text, time: 'Just now', unread: 0 };
      }
      return c;
    });
    db.set('conversations', updatedConversations);

    return { conversations: updatedConversations, messages: updatedMessages.filter(m => m.conversationId === conversationId) };
  },

  markAsRead(conversationId: string): Conversation[] {
    const conversations = this.getConversations();
    const updated = conversations.map(c => c.id === conversationId ? { ...c, unread: 0 } : c);
    db.set('conversations', updated);
    return updated;
  },

  searchConversations(query: string): Conversation[] {
    const q = query.toLowerCase();
    if (!q) return this.getConversations();
    return this.getConversations().filter(c => c.name.toLowerCase().includes(q) || c.role?.toLowerCase().includes(q) || c.lastMessage.toLowerCase().includes(q));
  },

  reset() {
    db.remove('conversations');
    db.remove('messages');
  }
};
