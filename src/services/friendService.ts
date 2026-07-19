import { db } from './db';

export interface FriendRequest {
  id: string;
  fromId: string;
  fromName: string;
  fromAvatar: string;
  toId: string;
  toName: string;
  toAvatar: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
}

export interface Connection {
  id: string;
  friendId: string;
  name: string;
  title: string;
  avatar: string;
  connectedSince: string;
  online: boolean;
}

export interface Recommendation {
  id: string;
  name: string;
  title: string;
  avatar: string;
  mutual: number;
  skills: string[];
  connectionStatus: 'none' | 'pending' | 'connected';
}

const DEFAULT_RECOMMENDATIONS: Recommendation[] = [
  { id: '6', name: 'Michael Chang', title: 'iOS Developer', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80', mutual: 23, skills: ['Swift', 'Objective-C', 'UI/UX'], connectionStatus: 'none' },
  { id: '7', name: 'Jessica Lee', title: 'UX Researcher', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80', mutual: 8, skills: ['Figma', 'Prototyping', 'Research'], connectionStatus: 'none' },
  { id: '8', name: 'Thomas Anderson', title: 'Backend Engineer', avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80', mutual: 15, skills: ['Node.js', 'Python', 'Redis'], connectionStatus: 'none' },
  { id: '9', name: 'Alice Waters', title: 'Data Scientist', avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1bfa8e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80', mutual: 3, skills: ['Python', 'SQL', 'Machine Learning'], connectionStatus: 'none' },
  { id: '10', name: 'David Kim', title: 'Product Manager', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80', mutual: 12, skills: ['Strategy', 'Analytics', 'Agile'], connectionStatus: 'none' },
  { id: '11', name: 'Emily Stanton', title: 'Technical Recruiter', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80', mutual: 4, skills: ['Recruiting', 'Networking', 'HR'], connectionStatus: 'none' },
];

const RECOMMENDATION_DETAILS: Record<string, { name: string; title: string; avatar: string }> = {};
DEFAULT_RECOMMENDATIONS.forEach(r => {
  RECOMMENDATION_DETAILS[r.id] = { name: r.name, title: r.title, avatar: r.avatar };
});

export const friendService = {
  getIncomingRequests(): FriendRequest[] {
    return db.get<FriendRequest[]>('friend_requests', []).filter(r => r.toId === '1' && r.status === 'pending');
  },

  getSentRequests(): FriendRequest[] {
    return db.get<FriendRequest[]>('friend_requests', []).filter(r => r.fromId === '1' && r.status === 'pending');
  },

  getAllRequests(): FriendRequest[] {
    return db.get<FriendRequest[]>('friend_requests', []);
  },

  acceptRequest(id: string): { requests: FriendRequest[]; connections: Connection[] } {
    const allRequests = db.get<FriendRequest[]>('friend_requests', []);
    const req = allRequests.find(r => r.id === id);
    if (!req || req.status !== 'pending') return { requests: allRequests, connections: this.getConnections() };

    const updatedRequests = allRequests.map(r => r.id === id ? { ...r, status: 'accepted' as const } : r);
    db.set('friend_requests', updatedRequests);

    const connections = this.getConnections();
    const newConnection: Connection = {
      id: String(Date.now()),
      friendId: req.fromId,
      name: req.fromName,
      title: '',
      avatar: req.fromAvatar,
      connectedSince: 'Just now',
      online: Math.random() > 0.5,
    };
    const updatedConnections = [newConnection, ...connections];
    db.set('connections', updatedConnections);

    const recs = this.getRecommendations();
    const updatedRecs = recs.map(r => r.id === req.fromId ? { ...r, connectionStatus: 'connected' as const } : r);
    db.set('recommendations', updatedRecs);

    return { requests: updatedRequests, connections: updatedConnections };
  },

  declineRequest(id: string): FriendRequest[] {
    const allRequests = db.get<FriendRequest[]>('friend_requests', []);
    const updated = allRequests.map(r => r.id === id ? { ...r, status: 'declined' as const } : r);
    db.set('friend_requests', updated);
    return updated;
  },

  getConnections(): Connection[] {
    return db.get<Connection[]>('connections', []);
  },

  sendConnectionRequest(targetId: string, fromName: string = 'You', fromAvatar: string = ''): { requests: FriendRequest[]; recommendations: Recommendation[] } {
    const allRequests = db.get<FriendRequest[]>('friend_requests', []);
    
    const existing = allRequests.find(r => 
      ((r.fromId === '1' && r.toId === targetId) || (r.fromId === targetId && r.toId === '1')) && r.status === 'pending'
    );
    if (existing) return { requests: allRequests, recommendations: this.getRecommendations() };

    const existingConnection = this.getConnections().find(c => c.friendId === targetId);
    if (existingConnection) return { requests: allRequests, recommendations: this.getRecommendations() };

    const target = RECOMMENDATION_DETAILS[targetId] || { name: 'Unknown', title: '', avatar: '' };

    const newRequest: FriendRequest = {
      id: String(Date.now()),
      fromId: '1',
      fromName,
      fromAvatar,
      toId: targetId,
      toName: target.name,
      toAvatar: target.avatar,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    const updatedRequests = [...allRequests, newRequest];
    db.set('friend_requests', updatedRequests);

    const recs = this.getRecommendations();
    const updatedRecs = recs.map(r => r.id === targetId ? { ...r, connectionStatus: 'pending' as const } : r);
    db.set('recommendations', updatedRecs);

    return { requests: updatedRequests, recommendations: updatedRecs };
  },

  removeConnection(connectionId: string): Connection[] {
    const connections = this.getConnections().filter(c => c.id !== connectionId);
    db.set('connections', connections);
    return connections;
  },

  getRecommendations(): Recommendation[] {
    return db.get<Recommendation[]>('recommendations', DEFAULT_RECOMMENDATIONS);
  },

  searchPeople(query: string): { requests: FriendRequest[]; connections: Connection[]; recommendations: Recommendation[] } {
    const q = query.toLowerCase();
    if (!q) return { requests: this.getIncomingRequests(), connections: this.getConnections(), recommendations: this.getRecommendations() };
    return {
      requests: this.getIncomingRequests().filter(r => r.fromName.toLowerCase().includes(q)),
      connections: this.getConnections().filter(c => c.name.toLowerCase().includes(q) || c.title?.toLowerCase().includes(q)),
      recommendations: this.getRecommendations().filter(r => r.name.toLowerCase().includes(q) || r.title.toLowerCase().includes(q) || r.skills.some(s => s.toLowerCase().includes(q))),
    };
  },

  reset() {
    db.remove('friend_requests');
    db.remove('connections');
    db.remove('recommendations');
  }
};