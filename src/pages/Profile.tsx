import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Briefcase, Mail, Link as LinkIcon, Edit2, Users, Eye, Star, CheckCircle, X, Save, Heart, MessageSquare, Share2, Bookmark, Trash2, MoreHorizontal, Edit3, Globe, Lock, Check, Clock, Camera, ChevronLeft, ChevronRight, Play, Volume2, VolumeX } from 'lucide-react';
import { useStore } from '../store/StoreProvider';
import { PostVisibility } from '../services/postService';
import UserAvatar from '../components/UserAvatar';
import VideoPlayer from '../components/VideoPlayer';
import Lightbox from '../components/Lightbox';
import CareerPassportCard from '../components/CareerPassportCard';
import { MOCK_JOBS } from '../data';

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export default function Profile() {
  const store = useStore();
  const user = store.user;
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', title: '', bio: '', location: '', website: '' });
  const [editAvatar, setEditAvatar] = useState('');
  const [activeTab, setActiveTab] = useState<'posts' | 'saved' | 'friends' | 'likedVideos' | 'savedVideos'>('posts');
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [menuPostId, setMenuPostId] = useState<string | null>(null);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [imageSlideIndex, setImageSlideIndex] = useState<Record<string, number>>({});
  const [lightboxImages, setLightboxImages] = useState<string[] | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuPostId(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const myPosts = store.posts.filter(p => p.authorId === store.user.id);
  const savedPosts = store.posts.filter(p => p.saved);
  const likedShorts = store.shorts.filter(s => s.liked);
  const savedShorts = store.shorts.filter(s => s.saved);
  const pendingRequests = store.friendRequests.filter(r => r.status === 'pending');

  const statsData = [
    { icon: Users, label: 'Connections', value: user.connections },
    { icon: Eye, label: 'Profile views', value: user.profileViews },
    { icon: Star, label: 'Endorsements', value: user.endorsements },
  ];

  const startEdit = () => {
    setEditForm({ name: user.name, title: user.title, bio: user.bio, location: user.location, website: user.website });
    setEditAvatar('');
    setEditing(true);
  };

  const saveEdit = () => {
    const updates: any = { ...editForm };
    if (editAvatar) updates.avatar = editAvatar;
    store.updateUser(updates);
    setEditing(false);
  };

  const cancelEdit = () => {
    setEditing(false);
  };

  const toggleComments = (postId: string) => {
    setExpandedComments(prev => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
  };

  const handleDeletePost = (postId: string) => {
    store.deletePost(postId);
    setDeleteConfirm(null);
  };

  return (
    <div className="max-w-4xl mx-auto w-full space-y-6">

      <motion.div
        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative card-hover"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="h-48 gradient-header relative group">
          <button onClick={startEdit} className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 p-2 rounded-lg text-white backdrop-blur-sm transition-colors opacity-0 group-hover:opacity-100">
            <Edit2 className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 pb-6 lg:px-8">
          <div className="relative flex justify-between items-start -mt-16 sm:-mt-20 mb-4 sm:mb-0">
            <div className="relative group">
              <UserAvatar src={user.avatar} name={user.name} size="xl" className="w-32 h-32 sm:w-40 sm:h-40 border-4 border-white" />
            </div>

            <div className="mt-20 sm:mt-6 flex gap-3">
              <motion.button
                className="hidden sm:flex text-gray-700 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-transparent"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Share Profile
              </motion.button>
              <motion.button
                className="gradient-primary text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors shadow-md"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={startEdit}
              >
                Edit Profile
              </motion.button>
            </div>
          </div>

          {editing && (
            <motion.div
              className="bg-[#F8F3F0] rounded-xl p-6 mt-4 border border-gray-200 space-y-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-bold text-gray-900">Edit Profile</h3>
                <div className="flex gap-2">
                  <motion.button
                    className="flex items-center gap-1.5 text-gray-600 bg-white hover:bg-gray-100 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-gray-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={cancelEdit}
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </motion.button>
                  <motion.button
                    className="gradient-primary text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-md flex items-center gap-1.5"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={saveEdit}
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </motion.button>
                </div>
              </div>
              <div className="flex items-center gap-4 mb-2">
                <div className="relative group">
                  <UserAvatar src={editAvatar || user.avatar} name={editForm.name || user.name} size="lg" />
                  <label className="absolute -bottom-1 -right-1 w-7 h-7 bg-white rounded-full shadow flex items-center justify-center cursor-pointer border border-gray-200 hover:bg-[#F8F3F0] transition-colors">
                    <Camera className="w-3.5 h-3.5 text-gray-600" />
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onloadend = () => setEditAvatar(reader.result as string);
                      reader.readAsDataURL(file);
                    }} />
                  </label>
                </div>
                <p className="text-xs text-gray-400">Click camera icon to change photo</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Name</label>
                  <input
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Title</label>
                  <input
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Location</label>
                  <input
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                    value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Website</label>
                  <input
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                    value={editForm.website}
                    onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Bio</label>
                <textarea
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none"
                  rows={3}
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                />
              </div>
            </motion.div>
          )}

          <div className="mt-3 sm:mt-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">{user.name}</h1>
            <p className="text-lg text-gray-600 mt-1">{user.title}</p>

            <div className="flex flex-wrap items-center gap-y-2 gap-x-6 mt-4 text-sm text-gray-500">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                <span>{user.location}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Mail className="w-4 h-4" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-1.5 hover:text-[#014BAA] cursor-pointer transition-colors">
                <LinkIcon className="w-4 h-4" />
                <span>{user.website}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap border-t border-gray-100 mt-6 pt-6 gap-6 sm:gap-12">
            {statsData.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              >
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                  <stat.icon className="w-4 h-4" /> {stat.label}
                </div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:p-8 card-hover"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <h2 className="text-xl font-bold text-gray-900 mb-4">About</h2>
        <p className="text-gray-600 leading-relaxed text-sm sm:text-base">{user.bio}</p>
      </motion.div>

      <CareerPassportCard user={user} jobs={MOCK_JOBS} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:p-8 card-hover"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6">Experience</h2>
          <div className="space-y-6">
            {user.experience.map((item, index) => (
              <motion.div
                key={item.role}
                className="flex gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.05 }}
              >
                <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                  <Briefcase className="w-6 h-6 text-gray-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{item.role}</h3>
                  <p className="text-sm text-gray-900">{item.company}</p>
                  <p className="text-xs text-gray-500 mt-1">{item.period} • {item.duration}</p>
                  <p className="text-sm text-gray-600 mt-2">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:p-8 card-hover"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6">Skills</h2>
          <div className="space-y-4">
            {user.skills.map((item, index) => (
              <motion.div
                key={item.skill}
                className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0 last:pb-0"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.25 + index * 0.05 }}
              >
                <span className="font-medium text-gray-800 text-sm">{item.skill}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">{item.endorsements} endorsements</span>
                  <motion.button
                    className="text-[#014BAA] hover:bg-blue-50 p-1.5 rounded-full transition-colors"
                    title="Endorse"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => store.endorseSkill(index)}
                  >
                    <CheckCircle className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Posts & Friends Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
      >
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex-1 py-4 px-3 text-sm font-semibold transition-colors border-b-2 ${
              activeTab === 'posts'
                ? 'border-blue-500 text-[#014BAA]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Posts ({myPosts.length})
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex-1 py-4 px-3 text-sm font-semibold transition-colors border-b-2 ${
              activeTab === 'saved'
                ? 'border-blue-500 text-[#014BAA]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Saved ({savedPosts.length})
          </button>
          <button
            onClick={() => setActiveTab('likedVideos')}
            className={`flex-1 py-4 px-3 text-sm font-semibold transition-colors border-b-2 ${
              activeTab === 'likedVideos'
                ? 'border-blue-500 text-[#014BAA]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Heart className="w-3.5 h-3.5 inline mr-1" />{likedShorts.length}
          </button>
          <button
            onClick={() => setActiveTab('savedVideos')}
            className={`flex-1 py-4 px-3 text-sm font-semibold transition-colors border-b-2 ${
              activeTab === 'savedVideos'
                ? 'border-blue-500 text-[#014BAA]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5 inline mr-1" />{savedShorts.length}
          </button>
          <button
            onClick={() => setActiveTab('friends')}
            className={`flex-1 py-4 px-3 text-sm font-semibold transition-colors border-b-2 ${
              activeTab === 'friends'
                ? 'border-blue-500 text-[#014BAA]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Friends ({store.connections.length + pendingRequests.length})
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'posts' && (
            <motion.div
              key="posts"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {myPosts.length === 0 ? (
                <div className="p-12 text-center">
                  <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">You haven't posted anything yet.</p>
                  <Link to="/" className="text-[#014BAA] hover:underline text-sm font-medium mt-2 inline-block">Create your first post</Link>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {myPosts.map((post, index) => (
                    <motion.div
                      key={post.id}
                      className="p-5"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-gray-900 text-sm">{user.name}</h3>
                              <span className="text-xs text-gray-400">{timeAgo(post.createdAt)}</span>
                              <span className="px-1.5 py-0.5 bg-blue-50 text-[#014BAA] text-[10px] font-bold uppercase rounded">{post.category}</span>
                              {post.visibility === 'everyone' && <Globe className="w-3 h-3 text-gray-400" />}
                              {post.visibility === 'friends' && <Users className="w-3 h-3 text-gray-400" />}
                              {post.visibility === 'only_me' && <Lock className="w-3 h-3 text-gray-400" />}
                            </div>
                            {editingPostId === post.id ? (
                              <div className="mt-2">
                                <textarea
                                  className="w-full bg-[#F8F3F0] rounded-xl px-3 py-2 text-sm text-gray-900 border border-gray-200 focus:border-blue-400 focus:bg-white resize-none outline-none transition-colors"
                                  rows={3}
                                  value={editContent}
                                  onChange={(e) => setEditContent(e.target.value)}
                                  autoFocus
                                />
                                <div className="flex justify-end gap-2 mt-2">
                                  <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setEditingPostId(null)}
                                    className="text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors"
                                  >
                                    Cancel
                                  </motion.button>
                                  <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => { store.updatePost(post.id, editContent.trim()); setEditingPostId(null); }}
                                    className="text-xs font-medium text-white gradient-primary px-3 py-1.5 rounded-lg shadow-sm"
                                  >
                                    Save
                                  </motion.button>
                                </div>
                              </div>
                            ) : deleteConfirm === post.id ? (
                              <div className="mt-2 bg-red-50 rounded-xl p-3 flex items-center justify-between">
                                <p className="text-xs text-red-700 font-medium">Delete this post?</p>
                                <div className="flex gap-1.5">
                                  <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setDeleteConfirm(null)}
                                    className="text-xs font-medium text-gray-600 bg-white hover:bg-gray-100 px-2.5 py-1.5 rounded-lg border border-gray-200 transition-colors"
                                  >
                                    Cancel
                                  </motion.button>
                                  <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleDeletePost(post.id)}
                                    className="text-xs font-medium text-white bg-red-500 hover:bg-red-600 px-2.5 py-1.5 rounded-lg transition-colors"
                                  >
                                    Delete
                                  </motion.button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <p className="text-sm text-gray-800 mt-1 whitespace-pre-wrap">{post.content}</p>
                                {post.video && (
                                  <div className="mt-3">
                                    <VideoPlayer src={post.video} maxH="max-h-64" />
                                  </div>
                                )}
                                {post.images && post.images.length > 0 && (
                                  <div className="mt-3 rounded-xl overflow-hidden border border-gray-100">
                                    {post.images.length === 1 ? (
                                      <img
                                        src={post.images[0]}
                                        alt=""
                                        className="w-full max-h-64 object-cover cursor-pointer hover:brightness-95 transition-all"
                                        onClick={() => { setLightboxImages(post.images!); setLightboxIndex(0); }}
                                      />
                                    ) : (
                                      <div className="relative">
                                        <img
                                          src={post.images[imageSlideIndex[post.id] || 0]}
                                          alt=""
                                          className="w-full max-h-64 object-cover cursor-pointer hover:brightness-95 transition-all"
                                          onClick={() => { setLightboxImages(post.images!); setLightboxIndex(imageSlideIndex[post.id] || 0); }}
                                        />
                                        {(imageSlideIndex[post.id] || 0) > 0 && (
                                          <button
                                            onClick={(e) => { e.stopPropagation(); setImageSlideIndex(prev => ({ ...prev, [post.id]: Math.max(0, (prev[post.id] || 0) - 1) })); }}
                                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full transition-colors"
                                          >
                                            <ChevronLeft className="w-3.5 h-3.5" />
                                          </button>
                                        )}
                                        {(imageSlideIndex[post.id] || 0) < post.images.length - 1 && (
                                          <button
                                            onClick={(e) => { e.stopPropagation(); setImageSlideIndex(prev => ({ ...prev, [post.id]: Math.min(post.images!.length - 1, (prev[post.id] || 0) + 1) })); }}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full transition-colors"
                                          >
                                            <ChevronRight className="w-3.5 h-3.5" />
                                          </button>
                                        )}
                                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                                          {post.images.map((_, i) => (
                                            <div key={i} className={`w-1.5 h-1.5 rounded-full ${(imageSlideIndex[post.id] || 0) === i ? 'bg-white' : 'bg-white/50'}`} />
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                                {!post.images?.length && post.image && (
                                  <img
                                    src={post.image}
                                    alt=""
                                    className="mt-3 rounded-xl max-h-64 object-cover w-full cursor-pointer hover:brightness-95 transition-all"
                                    onClick={() => { setLightboxImages([post.image!]); setLightboxIndex(0); }}
                                  />
                                )}
                              </>
                            )}
                          </div>
                        </div>
                        {editingPostId !== post.id && deleteConfirm !== post.id && (
                          <div className="relative shrink-0" ref={menuPostId === post.id ? menuRef : null}>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => setMenuPostId(menuPostId === post.id ? null : post.id)}
                              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </motion.button>
                            <AnimatePresence>
                              {menuPostId === post.id && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.95, y: -5 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.95, y: -5 }}
                                  transition={{ duration: 0.15 }}
                                  className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-20"
                                >
                                  <button
                                    onClick={() => { setEditingPostId(post.id); setEditContent(post.content); setMenuPostId(null); }}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-[#F8F3F0] transition-colors"
                                  >
                                    <Edit3 className="w-4 h-4 text-gray-500" />
                                    Edit Post
                                  </button>
                                  <button
                                    onClick={() => { setDeleteConfirm(post.id); setMenuPostId(null); }}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    Delete Post
                                  </button>
                                  <div className="border-t border-gray-100 px-4 py-2">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Visibility</p>
                                    {(['everyone', 'friends', 'only_me'] as PostVisibility[]).map(v => (
                                      <button
                                        key={v}
                                        onClick={() => { store.updatePostVisibility(post.id, v); setMenuPostId(null); }}
                                        className="w-full flex items-center justify-between gap-2 py-1.5 text-sm text-gray-700 hover:bg-[#F8F3F0] rounded px-1 transition-colors"
                                      >
                                        <div className="flex items-center gap-2">
                                          {v === 'everyone' && <Globe className="w-4 h-4 text-gray-500" />}
                                          {v === 'friends' && <Users className="w-4 h-4 text-gray-500" />}
                                          {v === 'only_me' && <Lock className="w-4 h-4 text-gray-500" />}
                                          <span className="capitalize text-xs">{v.replace('_', ' ')}</span>
                                        </div>
                                        {post.visibility === v && <Check className="w-4 h-4 text-[#014BAA]" />}
                                      </button>
                                    ))}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )}
                      </div>

                      {editingPostId !== post.id && deleteConfirm !== post.id && (
                        <div className="flex items-center gap-4 mt-3 ml-13">
                          <button className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors">
                            <span>{post.likes}</span> likes
                          </button>
                          <button
                            onClick={() => toggleComments(post.id)}
                            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors"
                          >
                            <span>{post.comments.length}</span> comments
                          </button>
                          <span className="text-xs text-gray-400">{post.shares} shares</span>
                        </div>
                      )}

                      <AnimatePresence>
                        {expandedComments.has(post.id) && post.comments.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-3 ml-13 space-y-2 overflow-hidden"
                          >
                            {post.comments.map(comment => (
                              <div key={comment.id} className="flex items-start gap-2 bg-[#F8F3F0] rounded-lg p-2.5">
                                <img src={comment.authorAvatar} alt="" className="w-6 h-6 rounded-full object-cover shrink-0" />
                                <div>
                                  <p className="text-xs font-semibold text-gray-900">{comment.authorName}</p>
                                  <p className="text-xs text-gray-600">{comment.text}</p>
                                </div>
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'saved' && (
            <motion.div
              key="saved"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {savedPosts.length === 0 ? (
                <div className="p-12 text-center">
                  <Bookmark className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No saved posts yet.</p>
                  <p className="text-gray-400 text-xs mt-1">Click the bookmark icon on any post to save it here.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {savedPosts.map((post, index) => (
                    <motion.div
                      key={post.id}
                      className="p-5"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                    >
                      <div className="flex items-start gap-3">
                        <img src={post.authorAvatar} alt={post.authorName} className="w-10 h-10 rounded-full object-cover shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900 text-sm">{post.authorName}</h3>
                            <span className="text-xs text-gray-400">{timeAgo(post.createdAt)}</span>
                            <span className="px-1.5 py-0.5 bg-blue-50 text-[#014BAA] text-[10px] font-bold uppercase rounded">{post.category}</span>
                          </div>
                          <p className="text-sm text-gray-800 mt-1 whitespace-pre-wrap">{post.content}</p>
                          {post.video && (
                            <div className="mt-3">
                              <VideoPlayer src={post.video} maxH="max-h-64" />
                            </div>
                          )}
                          {post.images && post.images.length > 0 && (
                            <div className="mt-3 rounded-xl overflow-hidden border border-gray-100">
                              {post.images.length === 1 ? (
                                <img
                                  src={post.images[0]}
                                  alt=""
                                  className="w-full max-h-64 object-cover cursor-pointer hover:brightness-95 transition-all"
                                  onClick={() => { setLightboxImages(post.images!); setLightboxIndex(0); }}
                                />
                              ) : (
                                <div className="relative">
                                  <img
                                    src={post.images[imageSlideIndex[`saved-${post.id}`] || 0]}
                                    alt=""
                                    className="w-full max-h-64 object-cover cursor-pointer hover:brightness-95 transition-all"
                                    onClick={() => { setLightboxImages(post.images!); setLightboxIndex(imageSlideIndex[`saved-${post.id}`] || 0); }}
                                  />
                                  {(imageSlideIndex[`saved-${post.id}`] || 0) > 0 && (
                                    <button
                                      onClick={(e) => { e.stopPropagation(); setImageSlideIndex(prev => ({ ...prev, [`saved-${post.id}`]: Math.max(0, (prev[`saved-${post.id}`] || 0) - 1) })); }}
                                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full transition-colors"
                                    >
                                      <ChevronLeft className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                  {(imageSlideIndex[`saved-${post.id}`] || 0) < post.images.length - 1 && (
                                    <button
                                      onClick={(e) => { e.stopPropagation(); setImageSlideIndex(prev => ({ ...prev, [`saved-${post.id}`]: Math.min(post.images!.length - 1, (prev[`saved-${post.id}`] || 0) + 1) })); }}
                                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full transition-colors"
                                    >
                                      <ChevronRight className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                                    {post.images.map((_, i) => (
                                      <div key={i} className={`w-1.5 h-1.5 rounded-full ${(imageSlideIndex[`saved-${post.id}`] || 0) === i ? 'bg-white' : 'bg-white/50'}`} />
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                          {!post.images?.length && post.image && (
                            <img
                              src={post.image}
                              alt=""
                              className="mt-3 rounded-xl max-h-64 object-cover w-full cursor-pointer hover:brightness-95 transition-all"
                              onClick={() => { setLightboxImages([post.image!]); setLightboxIndex(0); }}
                            />
                          )}
                          <div className="flex items-center gap-4 mt-3">
                            <span className="flex items-center gap-1 text-xs text-gray-500"><Heart className={`w-3.5 h-3.5 ${post.liked ? 'text-red-500 fill-current' : ''}`} /> {post.likes}</span>
                            <span className="flex items-center gap-1 text-xs text-gray-500"><MessageSquare className="w-3.5 h-3.5" /> {post.comments.length}</span>
                            <span className="flex items-center gap-1 text-xs text-gray-500"><Share2 className="w-3.5 h-3.5" /> {post.shares}</span>
                            <div className="flex-1" />
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => store.toggleSavePost(post.id)}
                              className="flex items-center gap-1 text-xs text-primary font-medium"
                            >
                              <Bookmark className="w-3.5 h-3.5 fill-current" /> Saved
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'likedVideos' && (
            <motion.div
              key="likedVideos"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {likedShorts.length === 0 ? (
                <div className="p-12 text-center">
                  <Heart className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No liked videos yet.</p>
                  <p className="text-gray-400 text-xs mt-1">Like videos in Shorts to see them here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-4">
                  {likedShorts.map((short, index) => (
                    <motion.div
                      key={short.id}
                      className="relative aspect-[9/16] bg-gray-900 rounded-xl overflow-hidden group cursor-pointer"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.04 }}
                    >
                      <video
                        src={short.videoUrl}
                        className="w-full h-full object-cover"
                        muted
                        playsInline
                        onMouseOver={(e) => (e.target as HTMLVideoElement).play().catch(() => {})}
                        onMouseOut={(e) => { (e.target as HTMLVideoElement).pause(); (e.target as HTMLVideoElement).currentTime = 0; }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-2.5">
                        <p className="text-white text-[11px] font-semibold line-clamp-2 leading-tight">{short.description}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <img src={short.authorAvatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(short.authorName)} alt="" className="w-4 h-4 rounded-full object-cover" />
                          <span className="text-white/70 text-[10px] truncate">{short.authorName}</span>
                        </div>
                      </div>
                      <div className="absolute top-2 right-2">
                        <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'savedVideos' && (
            <motion.div
              key="savedVideos"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {savedShorts.length === 0 ? (
                <div className="p-12 text-center">
                  <Bookmark className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No saved videos yet.</p>
                  <p className="text-gray-400 text-xs mt-1">Save videos in Shorts to see them here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-4">
                  {savedShorts.map((short, index) => (
                    <motion.div
                      key={short.id}
                      className="relative aspect-[9/16] bg-gray-900 rounded-xl overflow-hidden group cursor-pointer"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.04 }}
                    >
                      <video
                        src={short.videoUrl}
                        className="w-full h-full object-cover"
                        muted
                        playsInline
                        onMouseOver={(e) => (e.target as HTMLVideoElement).play().catch(() => {})}
                        onMouseOut={(e) => { (e.target as HTMLVideoElement).pause(); (e.target as HTMLVideoElement).currentTime = 0; }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-2.5">
                        <p className="text-white text-[11px] font-semibold line-clamp-2 leading-tight">{short.description}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <img src={short.authorAvatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(short.authorName)} alt="" className="w-4 h-4 rounded-full object-cover" />
                          <span className="text-white/70 text-[10px] truncate">{short.authorName}</span>
                        </div>
                      </div>
                      <div className="absolute top-2 right-2">
                        <Bookmark className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'friends' && (
            <motion.div
              key="friends"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {pendingRequests.length > 0 && (
                <div className="border-b border-gray-100">
                  <div className="px-5 py-3 bg-gradient-to-r from-blue-50/50 to-blue-50/30">
                    <h3 className="text-sm font-semibold text-gray-700">Pending Requests ({pendingRequests.length})</h3>
                  </div>
                  {pendingRequests.map((req, index) => (
                    <motion.div
                      key={req.id}
                      className="px-5 py-3 flex items-center justify-between gap-3 border-b border-gray-50 last:border-0"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                    >
                      <Link to={`/friend/${req.fromId}`} className="flex items-center gap-3 hover:opacity-90 transition-opacity flex-1 min-w-0">
                        <img src={req.fromAvatar} alt={req.fromName} className="w-10 h-10 rounded-full object-cover shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate hover:text-[#014BAA] transition-colors">{req.fromName}</p>
                          <p className="text-xs text-gray-500 truncate">Wants to connect</p>
                        </div>
                      </Link>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => store.acceptFriendRequest(req.id)}
                          className="p-1.5 gradient-primary text-white rounded-lg shadow-sm"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => store.declineFriendRequest(req.id)}
                          className="p-1.5 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              <div>
                <div className="px-5 py-3 bg-[#F8F3F0]/50">
                  <h3 className="text-sm font-semibold text-gray-700">Connections ({store.connections.length})</h3>
                </div>
                {store.connections.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 text-sm">
                    <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    No connections yet
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4">
                    {store.connections.map((conn, index) => (
                      <motion.div
                        key={conn.id}
                        className="flex flex-col items-center p-3 rounded-xl hover:bg-blue-50/50 transition-colors"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.03 }}
                      >
                        <Link to={`/friend/${conn.id}`} className="hover:opacity-90 transition-opacity">
                          <div className="relative">
                            <img src={conn.avatar} alt={conn.name} className="w-14 h-14 rounded-full object-cover border-2 border-gray-100" />
                            {conn.online && (
                              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-blue-500 border-2 border-white rounded-full" />
                            )}
                          </div>
                        </Link>
                        <Link to={`/friend/${conn.id}`} className="mt-2 text-center hover:text-[#014BAA] transition-colors">
                          <p className="text-xs font-semibold text-gray-900 truncate w-full">{conn.name}</p>
                          <p className="text-[10px] text-gray-500 truncate w-full">{conn.title}</p>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {lightboxImages && (
        <Lightbox
          images={lightboxImages}
          startIndex={lightboxIndex}
          onClose={() => setLightboxImages(null)}
          onChangeIndex={(i) => setLightboxIndex(i)}
        />
      )}
    </div>
  );
}
