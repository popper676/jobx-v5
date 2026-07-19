import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Briefcase, Users, MessageSquare, UserPlus, Clock, CheckCircle, ChevronLeft, Globe, Mail } from 'lucide-react';
import { useStore } from '../store/StoreProvider';

const FRIEND_DATA: Record<string, {
  id: string;
  name: string;
  title: string;
  avatar: string;
  location: string;
  bio: string;
  company: string;
  skills: string[];
  mutual: number;
  connections: number;
}> = {
  '2': { id: '2', name: 'Sarah Chen', title: 'Senior Frontend Engineer', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80', location: 'San Francisco, CA', bio: 'Passionate about building beautiful and performant web experiences. Open source contributor and mentor. Strong advocate for accessibility in tech.', company: 'TechCorp', skills: ['React', 'TypeScript', 'Next.js', 'CSS', 'Performance'], mutual: 12, connections: 458 },
  '3': { id: '3', name: 'Jenna Miles', title: 'VP of Engineering', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80', location: 'New York, NY', bio: 'Engineering leader focused on building high-performing teams. Former founder, now scaling stealth startup to new heights.', company: 'Stealth Startup', skills: ['Leadership', 'Strategy', 'Hiring', 'Architecture'], mutual: 8, connections: 1200 },
  '4': { id: '4', name: 'Marcus Rodriguez', title: 'UI/UX Designer', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80', location: 'Austin, TX', bio: 'Design systems enthusiast exploring the intersection of design and engineering. Building tools that make design accessible to everyone.', company: 'CreativeMinds', skills: ['Figma', 'Design Systems', 'Prototyping', 'CSS'], mutual: 4, connections: 312 },
  '6': { id: '6', name: 'Michael Chang', title: 'iOS Developer', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80', location: 'Seattle, WA', bio: 'Building delightful mobile experiences on Apple platforms. Swift enthusiast and SwiftUI early adopter.', company: 'Apple', skills: ['Swift', 'Objective-C', 'UI/UX', 'SwiftUI'], mutual: 23, connections: 189 },
  '7': { id: '7', name: 'Jessica Lee', title: 'UX Researcher', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80', location: 'Portland, OR', bio: 'Understanding users to build better products. Mixed methods researcher with a passion for inclusive design.', company: 'ResearchLab', skills: ['Figma', 'Prototyping', 'Research', 'Analytics'], mutual: 8, connections: 267 },
  '8': { id: '8', name: 'Thomas Anderson', title: 'Backend Engineer', avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80', location: 'Denver, CO', bio: 'Distributed systems engineer building the infrastructure that powers real-time applications at scale.', company: 'InfraScale', skills: ['Node.js', 'Python', 'Redis', 'Kubernetes'], mutual: 15, connections: 534 },
  '9': { id: '9', name: 'Alice Waters', title: 'Data Scientist', avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1bfa8e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80', location: 'Boston, MA', bio: 'Turning data into decisions. ML practitioner focused on NLP and recommendation systems.', company: 'MetricSpace', skills: ['Python', 'SQL', 'Machine Learning', 'NLP'], mutual: 3, connections: 421 },
  '10': { id: '10', name: 'David Kim', title: 'Product Manager', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80', location: 'Chicago, IL', bio: 'Bridging the gap between user needs and business goals. Passionate about building products that make a difference.', company: 'InnovateTech', skills: ['Strategy', 'Analytics', 'UX', 'Agile'], mutual: 12, connections: 678 },
  '11': { id: '11', name: 'Emily Stanton', title: 'Technical Recruiter', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80', location: 'Remote', bio: 'Connecting great talent with great opportunities. Specializing in engineering leadership placements at high-growth startups.', company: 'TalentBridge', skills: ['Recruiting', 'Networking', 'Sourcing', 'HR'], mutual: 4, connections: 2100 },
};

interface FriendInfo {
  id: string;
  name: string;
  title: string;
  avatar: string;
  location: string;
  bio: string;
  company: string;
  skills: string[];
  mutual: number;
  connections: number;
}

function resolveFriend(id: string, store: any): FriendInfo | null {
  if (FRIEND_DATA[id]) return FRIEND_DATA[id];

  const rec = store.recommendations?.find((r: any) => r.id === id);
  if (rec) {
    const base = FRIEND_DATA[id] || {} as any;
    return {
      id: rec.id,
      name: rec.name,
      title: rec.title,
      avatar: rec.avatar,
      location: base.location || 'Unknown',
      bio: base.bio || '',
      company: base.company || '',
      skills: rec.skills || base.skills || [],
      mutual: rec.mutual || 0,
      connections: base.connections || 0,
    };
  }

  const conn = store.connections?.find((c: any) => c.friendId === id || c.id === id);
  if (conn) {
    const base = FRIEND_DATA[conn.friendId] || FRIEND_DATA[conn.id] || {} as any;
    return {
      id: conn.friendId || conn.id,
      name: conn.name,
      title: conn.title || base.title || '',
      avatar: conn.avatar,
      location: base.location || 'Unknown',
      bio: base.bio || '',
      company: base.company || '',
      skills: base.skills || [],
      mutual: base.mutual || 0,
      connections: base.connections || 0,
    };
  }

  const sentReq = store.sentRequests?.find((r: any) => r.toId === id);
  if (sentReq) {
    const base = FRIEND_DATA[id] || {} as any;
    return {
      id: sentReq.toId,
      name: sentReq.toName,
      title: base.title || '',
      avatar: sentReq.toAvatar,
      location: base.location || 'Unknown',
      bio: base.bio || '',
      company: base.company || '',
      skills: base.skills || [],
      mutual: base.mutual || 0,
      connections: base.connections || 0,
    };
  }

  const inReq = store.friendRequests?.find((r: any) => r.fromId === id);
  if (inReq) {
    const base = FRIEND_DATA[id] || {} as any;
    return {
      id: inReq.fromId,
      name: inReq.fromName,
      title: base.title || '',
      avatar: inReq.fromAvatar,
      location: base.location || 'Unknown',
      bio: base.bio || '',
      company: base.company || '',
      skills: base.skills || [],
      mutual: base.mutual || 0,
      connections: base.connections || 0,
    };
  }

  if (FRIEND_DATA[id]) return FRIEND_DATA[id];

  return null;
}

export default function FriendProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const store = useStore();
  const [showMessage, setShowMessage] = useState(false);
  const [messageText, setMessageText] = useState('');

  const friend = id ? resolveFriend(id, store) : null;
  if (!friend) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <Users className="w-12 h-12 text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile not found</h2>
        <p className="text-gray-500 mb-6">This profile does not exist.</p>
        <Link to="/friends" className="text-[#014BAA] hover:underline font-medium">&larr; Back to Friends</Link>
      </div>
    );
  }

  const isConnected = store.connections.some((c: any) => (c.friendId && c.friendId === friend.id) || c.id === friend.id);
  const isPending = store.recommendations.some((r: any) => r.id === friend.id && r.connectionStatus === 'pending') || store.sentRequests.some((r: any) => r.toId === friend.id);

  const handleConnect = () => {
    store.sendConnectionRequest(friend.id);
  };

  const handleSendMessage = () => {
    const existing = store.conversations.find((c: any) => c.id === friend.id);
    if (existing) {
      store.setActiveChat(existing);
      navigate('/messages');
    } else {
      setShowMessage(true);
    }
  };

  const sendNewMessage = () => {
    if (!messageText.trim()) return;
    navigate('/messages');
  };

  return (
    <div className="max-w-4xl mx-auto w-full space-y-6 pb-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Link to="/friends" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-[#014BAA] mb-6 transition-colors group">
          <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-0.5 transition-transform" /> Back to Friends
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden"
      >
        <div className="h-48 gradient-header relative" />
        <div className="px-6 pb-6 lg:px-8">
          <div className="relative flex flex-col sm:flex-row sm:items-end justify-between -mt-16 sm:-mt-20 mb-4 gap-4">
            <div className="relative">
              <img
                src={friend.avatar}
                alt={friend.name}
                className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-white object-cover bg-white shadow-lg"
              />
            </div>
            <div className="flex gap-3 sm:mt-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSendMessage}
                className="flex items-center gap-2 bg-white border border-gray-300 hover:border-blue-300 hover:bg-blue-50/50 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium transition-all"
              >
                <MessageSquare className="w-4 h-4" /> Message
              </motion.button>
              {isConnected ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-blue-50 text-[#014BAA] border border-blue-200 px-4 py-2 rounded-xl text-sm font-medium"
                >
                  <CheckCircle className="w-4 h-4" /> Connected
                </motion.button>
              ) : isPending ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled
                  className="flex items-center gap-2 bg-[#F8F3F0] text-gray-500 border border-gray-200 px-4 py-2 rounded-xl text-sm font-medium"
                >
                  <Clock className="w-4 h-4" /> Pending
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleConnect}
                  className="flex items-center gap-2 gradient-primary text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-md shadow-blue-500/25 transition-all"
                >
                  <UserPlus className="w-4 h-4" /> Add Friend
                </motion.button>
              )}
            </div>
          </div>

          <div className="mt-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">{friend.name}</h1>
            <p className="text-lg text-gray-600 mt-1">{friend.title}{friend.company ? ` at ${friend.company}` : ''}</p>
            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
              {friend.location && friend.location !== 'Unknown' && (
                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{friend.location}</span>
              )}
              {friend.company && (
                <span className="flex items-center gap-1.5"><Briefcase className="w-4 h-4" />{friend.company}</span>
              )}
              {friend.mutual > 0 && (
                <span className="flex items-center gap-1.5"><Users className="w-4 h-4" />{friend.mutual} mutual connections</span>
              )}
            </div>
          </div>

          {(friend.connections > 0 || friend.mutual > 0) && (
            <div className="flex gap-8 mt-6 pt-6 border-t border-gray-100">
              {friend.connections > 0 && (
                <div>
                  <div className="text-sm text-gray-500 mb-1">Connections</div>
                  <div className="text-2xl font-bold text-gray-900">{friend.connections}</div>
                </div>
              )}
              {friend.mutual > 0 && (
                <div>
                  <div className="text-sm text-gray-500 mb-1">Mutual</div>
                  <div className="text-2xl font-bold text-gray-900">{friend.mutual}</div>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {friend.bio && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 lg:p-8 card-hover"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4">About</h2>
          <p className="text-gray-600 leading-relaxed">{friend.bio}</p>
        </motion.div>
      )}

      {friend.skills.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 lg:p-8 card-hover"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {friend.skills.map(skill => (
              <span key={skill} className="px-4 py-2 bg-gradient-to-r from-blue-50 to-blue-50 border border-blue-200/70 text-[#014BAA] text-sm font-medium rounded-lg shadow-sm">
                {skill}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {showMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">Message {friend.name}</h2>
                <button onClick={() => setShowMessage(false)} className="text-gray-400 hover:text-gray-600">
                  <span className="text-xl">&times;</span>
                </button>
              </div>
              <div className="p-6">
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder={`Say hi to ${friend.name}...`}
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all bg-[#F8F3F0] focus:bg-white resize-none"
                  rows={4}
                  autoFocus
                />
                <div className="flex gap-3 justify-end mt-4">
                  <button
                    onClick={() => setShowMessage(false)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl text-sm font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={sendNewMessage}
                    className="px-6 py-2 gradient-primary text-white rounded-xl text-sm font-medium shadow-md shadow-blue-500/25 transition-all"
                  >
                    Send
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}