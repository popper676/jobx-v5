import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/StoreProvider';
import { PostVisibility } from '../services/postService';
import UserAvatar from '../components/UserAvatar';
import VideoPlayer from '../components/VideoPlayer';
import Lightbox from '../components/Lightbox';
import MyDayBar from '../components/MyDayBar';
import StoryViewer from '../components/StoryViewer';
import CreateMyDayModal from '../components/CreateMyDayModal';
import { getPersonalizedCareerFeed } from '../services/careerFeedService';
import {
  Heart,
  MessageSquare,
  Share2,
  Bookmark,
  Image as ImageIcon,
  Video,
  FileText,
  MoreHorizontal,
  Edit3,
  Trash2,
  Globe,
  Users,
  Lock,
  Check,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Send,
  Loader2,
  Target
} from 'lucide-react';

function timeAgo(date: string | Date): string {
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);
  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 30) return `${diffDay}d ago`;
  return d.toLocaleDateString();
}

export default function HomeFeed() {
  const store = useStore();
  const [activeCategory, setActiveCategory] = useState('All');
  const [feedMode, setFeedMode] = useState<'for-you' | 'latest'>('for-you');
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostImages, setNewPostImages] = useState<string[]>([]);
  const [newPostVideo, setNewPostVideo] = useState<string>('');
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [commentTexts, setCommentTexts] = useState<Record<string, string>>({});
  const [menuPostId, setMenuPostId] = useState<string | null>(null);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const [imageSlideIndex, setImageSlideIndex] = useState<Record<string, number>>({});
  const [lightboxImages, setLightboxImages] = useState<string[] | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [videoUploadProgress, setVideoUploadProgress] = useState(0);
  const [isVideoUploading, setIsVideoUploading] = useState(false);
  const [storyViewerDayId, setStoryViewerDayId] = useState<string | null>(null);
  const [showCreateMyDay, setShowCreateMyDay] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuPostId(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);
  const categories = ['All', 'Progress', 'Thoughts', 'Opportunities', 'Announcements'];
  const feedItems = useMemo(() => {
    const postsInCategory = store.posts.filter((post) => activeCategory === 'All' || post.category === activeCategory);
    if (feedMode === 'for-you') return getPersonalizedCareerFeed(store.user, postsInCategory);
    return [...postsInCategory]
      .sort((first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime())
      .map((post) => ({ post, score: 0, reason: 'Latest from your professional network.', matchedTopics: [] }));
  }, [activeCategory, feedMode, store.posts, store.user]);

  const handlePost = () => {
    const content = newPostContent.trim();
    const images = newPostImages.length > 0 ? newPostImages : undefined;
    const video = newPostVideo || undefined;
    if (!content && !images && !video) return;
    const ok = store.createPost(content || ' ', activeCategory === 'All' ? 'Progress' : activeCategory, images, video);
    if (!ok) {
      alert('Failed to create post. Storage may be full — try a smaller video or image.');
      return;
    }
    setNewPostContent('');
    setNewPostImages([]);
    setNewPostVideo('');
    setShowSlashMenu(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const remaining = 4 - newPostImages.length;
    if (remaining <= 0) return;
    const toProcess = Array.from(files).slice(0, remaining) as File[];
    toProcess.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPostImages(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      e.target.value = '';
      return;
    }
    if (file.size > MAX_VIDEO_SIZE) {
      alert('Video file is too large. Please select a video under 50MB.');
      e.target.value = '';
      return;
    }
    setIsVideoUploading(true);
    setVideoUploadProgress(0);
    const reader = new FileReader();
    reader.onprogress = (evt) => {
      if (evt.lengthComputable) {
        setVideoUploadProgress(Math.round((evt.loaded / evt.total) * 100));
      }
    };
    reader.onerror = () => {
      setIsVideoUploading(false);
      setVideoUploadProgress(0);
    };
    reader.onload = () => {
      setNewPostVideo(reader.result as string);
      setIsVideoUploading(false);
      setVideoUploadProgress(0);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    setNewPostImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeVideo = () => {
    setNewPostVideo('');
  };

  const toggleComments = (postId: string) => {
    setExpandedComments(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  const handleAddComment = (postId: string) => {
    const text = (commentTexts[postId] || '').trim();
    if (!text) return;
    store.addComment(postId, text);
    setCommentTexts(prev => ({ ...prev, [postId]: '' }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

      <div className="hidden lg:block lg:col-span-1">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-24 card-hover"
        >
          <div className="h-20 gradient-primary"></div>
          <div className="px-4 pb-4">
            <div className="relative flex justify-center -mt-10 mb-3">
              <UserAvatar src={store.user.avatar} name={store.user.name} size="xl" className="w-20 h-20 border-4 border-white" />
            </div>
            <div className="text-center mb-4">
              <Link to="/profile" className="text-base font-bold text-gray-900 hover:text-primary hover:underline">{store.user.name}</Link>
              <p className="text-xs text-gray-500 mt-1">{store.user.bio}</p>
            </div>

            <div className="border-t border-gray-100 py-3 space-y-2">
              <div className="flex justify-between items-center text-sm hover:bg-[#F8F3F0] p-1 cursor-pointer rounded">
                <span className="text-gray-500">Connections</span>
                <span className="font-semibold text-primary">{store.user.connections}</span>
              </div>
              <div className="flex justify-between items-center text-sm hover:bg-[#F8F3F0] p-1 cursor-pointer rounded">
                <span className="text-gray-500">Profile views</span>
                <span className="font-semibold text-primary">{store.user.profileViews}</span>
              </div>
              <div className="flex justify-between items-center text-sm hover:bg-[#F8F3F0] p-1 cursor-pointer rounded">
                <span className="text-gray-500">Skills</span>
                <span className="font-semibold text-primary">{store.user.skills?.length ?? 0}</span>
              </div>
            </div>
            <div className="border-t border-gray-100 pt-4">
              <Link to="/profile" className="w-full block text-center text-sm font-medium text-gray-700 bg-[#F8F3F0] hover:bg-gray-100 rounded-lg py-2 transition-colors">
                View Profile
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="lg:col-span-2 space-y-6">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
        >
          <div className="flex gap-4 mb-4">
            <UserAvatar src={store.user.avatar} name={store.user.name} size="md" className="shrink-0" />
            <div className="flex-1 relative">
              <textarea
                className="w-full h-auto bg-[#F8F3F0] rounded-xl px-4 py-3 text-gray-900 placeholder-gray-500 border border-transparent focus:border-primary/50 focus:bg-white focus:ring-0 resize-none outline-none transition-colors"
                placeholder="What are you building? (type / for commands)"
                rows={3}
                value={newPostContent}
                onChange={(e) => {
                  setNewPostContent(e.target.value);
                  setShowSlashMenu(e.target.value.endsWith('/'));
                }}
              ></textarea>

              <AnimatePresence>
                {showSlashMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-10"
                  >
                    <div className="p-2">
                      <div className="text-xs font-semibold text-gray-500 px-3 flex pb-2 border-b border-gray-100">Quick Commands</div>
                      <button onClick={() => { imageInputRef.current?.click(); setShowSlashMenu(false); }} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-[#F8F3F0] rounded-lg transition-colors mt-1">
                        <ImageIcon className="w-4 h-4 text-blue-500" /> Insert Image
                      </button>
                      <button onClick={() => { videoInputRef.current?.click(); setShowSlashMenu(false); }} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-[#F8F3F0] rounded-lg transition-colors">
                        <Video className="w-4 h-4 text-[#014BAA]" /> Embed Video
                      </button>
                      <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-[#F8F3F0] rounded-lg transition-colors">
                        <FileText className="w-4 h-4 text-orange-500" /> Create Article
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {(newPostImages.length > 0 || newPostVideo || isVideoUploading) && (
            <div className="mb-3">
              {isVideoUploading && (
                <div className="rounded-xl overflow-hidden border border-gray-200 bg-[#F8F3F0] p-5 text-center">
                  <Loader2 className="w-10 h-10 text-[#014BAA] animate-spin mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-700">Uploading video...</p>
                  <p className="text-xs text-gray-500 mb-3">{videoUploadProgress}%</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${videoUploadProgress}%` }}
                      transition={{ duration: 0.3 }}
                      className="h-full gradient-primary rounded-full"
                    />
                  </div>
                </div>
              )}
              {newPostVideo && !isVideoUploading && (
                <div className="relative rounded-xl overflow-hidden border border-gray-200 mb-2">
                  <video src={newPostVideo} controls className="w-full max-h-64 object-contain bg-black" />
                  <button
                    onClick={removeVideo}
                    className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white p-1 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              {newPostImages.length > 0 && (
                <div className={`grid gap-2 ${newPostImages.length === 1 ? 'grid-cols-1' : newPostImages.length === 2 ? 'grid-cols-2' : 'grid-cols-2'}`}>
                  {newPostImages.map((img, idx) => (
                    <div key={idx} className={`relative rounded-xl overflow-hidden border border-gray-200 ${newPostImages.length === 3 && idx === 0 ? 'col-span-2' : ''}`}>
                      <img src={img} alt="" className={`w-full object-cover ${newPostImages.length === 1 ? 'max-h-80' : newPostImages.length === 3 && idx === 0 ? 'max-h-52' : 'max-h-48'}`} />
                      <button
                        onClick={() => removeImage(idx)}
                        className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white p-1 rounded-full transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <input ref={imageInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
          <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />

          <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
            <div className="flex items-center gap-2 sm:gap-4">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => imageInputRef.current?.click()} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-[#F8F3F0] px-2 sm:px-3 py-1.5 rounded-lg transition-colors">
                <ImageIcon className="w-4 h-4 text-blue-500" />
                <span className="hidden sm:inline">Media</span>
              </motion.button>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => videoInputRef.current?.click()} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-[#F8F3F0] px-2 sm:px-3 py-1.5 rounded-lg transition-colors">
                <Video className="w-4 h-4 text-[#014BAA]" />
                <span className="hidden sm:inline">Video</span>
              </motion.button>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-[#F8F3F0] px-2 sm:px-3 py-1.5 rounded-lg transition-colors">
                <FileText className="w-4 h-4 text-orange-500" />
                <span className="hidden sm:inline">Article</span>
              </motion.button>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handlePost}
              className="gradient-primary text-white px-5 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-md shadow-blue-500/20"
            >
              Post
            </motion.button>
          </div>
        </motion.div>

        <MyDayBar
          onOpenViewer={(dayId) => setStoryViewerDayId(dayId)}
          onOpenCreate={() => setShowCreateMyDay(true)}
        />

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.12 }}
          className="rounded-xl border border-blue-100 bg-[#eef4ff]/65 px-4 py-3 sm:flex sm:items-center sm:justify-between"
          aria-label="Personalized career feed"
        >
          <div className="flex items-start gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-[#014BAA] shadow-sm"><Target className="h-4 w-4" /></span>
            <div>
              <p className="text-sm font-bold text-gray-900">Your career feed</p>
              <p className="mt-0.5 text-xs leading-5 text-gray-600">Prioritized from the skills and career direction visible on your profile.</p>
            </div>
          </div>
          <Link to="/profile" className="mt-3 inline-flex text-xs font-bold text-[#014BAA] hover:underline sm:mt-0">Tune your profile</Link>
        </motion.section>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="flex flex-col gap-3"
        >
          <div className="scrollbar-hide flex max-w-full items-center gap-2 overflow-x-auto pb-1">
            <AnimatePresence mode="popLayout">
              {categories.map((cat, index) => (
                <motion.button
                  key={cat}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    activeCategory === cat
                      ? 'gradient-primary text-white shadow-sm shadow-blue-500/20'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-[#F8F3F0]'
                  }`}
                >
                  {cat}
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
          <div className="inline-flex w-fit self-start rounded-lg border border-gray-200 bg-white p-1 sm:self-end" role="group" aria-label="Feed order">
            <button onClick={() => setFeedMode('for-you')} aria-pressed={feedMode === 'for-you'} className={`rounded-md px-3 py-1.5 text-xs font-bold transition-colors ${feedMode === 'for-you' ? 'bg-[#014BAA] text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}>For you</button>
            <button onClick={() => setFeedMode('latest')} aria-pressed={feedMode === 'latest'} className={`rounded-md px-3 py-1.5 text-xs font-bold transition-colors ${feedMode === 'latest' ? 'bg-[#014BAA] text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}>Latest</button>
          </div>
        </motion.div>

        <div className="space-y-6">
          <AnimatePresence mode="popLayout">
            {feedItems.map(({ post }, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ y: -2 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-5 card-hover"
              >

                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-3">
                    <img src={post.authorAvatar} alt={post.authorName} className="w-12 h-12 rounded-full object-cover" />
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{post.authorName}</h3>
                      <p className="text-xs text-gray-500">{post.authorTitle}</p>
                      <div className="flex items-center gap-1.5 mt-0.5 text-xs text-gray-400">
                        <span>{timeAgo(post.createdAt)}</span>
                        <span>•</span>
                        <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-[10px] uppercase font-semibold">{post.category}</span>
                        <span>•</span>
                        {post.visibility === 'everyone' && <Globe className="w-3 h-3" />}
                        {post.visibility === 'friends' && <Users className="w-3 h-3" />}
                        {post.visibility === 'only_me' && <Lock className="w-3 h-3" />}
                      </div>
                    </div>
                  </div>
                  {post.authorId === store.user.id && (
                    <div className="relative" ref={menuPostId === String(post.id) ? menuRef : null}>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setMenuPostId(menuPostId === String(post.id) ? null : String(post.id))}
                        className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-lg transition-colors"
                      >
                        <MoreHorizontal className="w-5 h-5" />
                      </motion.button>
                      <AnimatePresence>
                        {menuPostId === String(post.id) && (
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
                              onClick={() => { setDeletingPostId(post.id); setMenuPostId(null); }}
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

                {editingPostId === post.id ? (
                  <div className="mb-4">
                    <textarea
                      className="w-full bg-[#F8F3F0] rounded-xl px-4 py-3 text-sm text-gray-900 border border-gray-200 focus:border-blue-400 focus:bg-white resize-none outline-none transition-colors"
                      rows={4}
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
                ) : deletingPostId === String(post.id) ? (
                  <div className="mb-4 bg-red-50 rounded-xl p-4 flex items-center justify-between">
                    <p className="text-sm text-red-700 font-medium">Delete this post?</p>
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setDeletingPostId(null)}
                        className="text-xs font-medium text-gray-600 bg-white hover:bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200 transition-colors"
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => { store.deletePost(post.id); setDeletingPostId(null); }}
                        className="text-xs font-medium text-white bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Delete
                      </motion.button>
                    </div>
                  </div>
                ) : (
                  <div className="mb-4 text-sm sm:text-base text-gray-800 whitespace-pre-wrap">
                    {post.content}
                  </div>
                )}

                {post.video && (
                  <div className="mb-4">
                    <VideoPlayer src={post.video} maxH="max-h-96" />
                  </div>
                )}
                {post.images && post.images.length > 0 && (
                  <div className="mb-4 rounded-xl overflow-hidden border border-gray-100">
                    {post.images.length === 1 ? (
                      <img
                        src={post.images[0]}
                        alt="Post content"
                        className="w-full max-h-96 object-cover cursor-pointer hover:brightness-95 transition-all"
                        onClick={() => { setLightboxImages(post.images!); setLightboxIndex(0); }}
                      />
                    ) : (
                      <div className="relative">
                        <img
                          src={post.images[imageSlideIndex[post.id] || 0]}
                          alt="Post content"
                          className="w-full max-h-96 object-cover cursor-pointer hover:brightness-95 transition-all"
                          onClick={() => { setLightboxImages(post.images!); setLightboxIndex(imageSlideIndex[post.id] || 0); }}
                        />
                        {(imageSlideIndex[post.id] || 0) > 0 && (
                          <button
                            onClick={(e) => { e.stopPropagation(); setImageSlideIndex(prev => ({ ...prev, [post.id]: Math.max(0, (prev[post.id] || 0) - 1) })); }}
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-full transition-colors"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                        )}
                        {(imageSlideIndex[post.id] || 0) < post.images.length - 1 && (
                          <button
                            onClick={(e) => { e.stopPropagation(); setImageSlideIndex(prev => ({ ...prev, [post.id]: Math.min(post.images!.length - 1, (prev[post.id] || 0) + 1) })); }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-full transition-colors"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        )}
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                          {post.images.map((_, i) => (
                            <div
                              key={i}
                              className={`w-1.5 h-1.5 rounded-full transition-colors ${(imageSlideIndex[post.id] || 0) === i ? 'bg-white' : 'bg-white/50'}`}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {!post.images?.length && post.image && (
                  <div className="mb-4 rounded-xl overflow-hidden border border-gray-100">
                    <img
                      src={post.image}
                      alt="Post content"
                      className="w-full h-auto max-h-96 object-cover cursor-pointer hover:brightness-95 transition-all"
                      onClick={() => { setLightboxImages([post.image!]); setLightboxIndex(0); }}
                    />
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-gray-500 pb-3 border-b border-gray-100 mb-2">
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center">
                      <Heart className="w-2.5 h-2.5 text-blue-500 fill-current" />
                    </div>
                    <span>{post.likes}</span>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => toggleComments(String(post.id))} className="hover:text-primary transition-colors cursor-pointer">
                      {post.comments.length} comments
                    </button>
                    <span>{post.shares} shares</span>
                  </div>
                </div>

                <div className="flex justify-between pt-1">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => store.toggleLikePost(post.id)}
                    className={`flex-1 flex justify-center items-center gap-2 text-sm font-medium py-2 rounded-lg transition-colors ${
                      post.liked
                        ? 'text-red-500 hover:bg-red-50'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-[#F8F3F0]'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${post.liked ? 'fill-current text-red-500' : ''}`} />
                    <span className="hidden sm:inline">Like</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleComments(String(post.id))}
                    className="flex-1 flex justify-center items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-[#F8F3F0] py-2 rounded-lg transition-colors"
                  >
                    <MessageSquare className="w-5 h-5" />
                    <span className="hidden sm:inline">Comment</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => store.sharePost(post.id)}
                    className="flex-1 flex justify-center items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-[#F8F3F0] py-2 rounded-lg transition-colors"
                  >
                    <Share2 className="w-5 h-5" />
                    <span className="hidden sm:inline">Share</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => store.toggleSavePost(post.id)}
                    className={`flex-1 flex justify-center items-center gap-2 text-sm font-medium py-2 rounded-lg transition-colors ${
                      post.saved
                        ? 'text-primary hover:bg-primary/5'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-[#F8F3F0]'
                    }`}
                  >
                    <Bookmark className={`w-5 h-5 ${post.saved ? 'fill-current text-primary' : ''}`} />
                    <span className="hidden sm:inline">Save</span>
                  </motion.button>
                </div>

                <AnimatePresence>
                  {expandedComments[String(post.id)] && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 pt-3 border-t border-gray-100 space-y-3">
                        {post.comments.map((comment) => (
                          <div key={comment.id} className="flex gap-2.5">
                            <img src={comment.authorAvatar} alt={comment.authorName} className="w-8 h-8 rounded-full object-cover shrink-0" />
                            <div className="flex-1 bg-[#F8F3F0] rounded-lg px-3 py-2">
                              <p className="text-xs font-semibold text-gray-900">{comment.authorName}</p>
                              <p className="text-sm text-gray-700 mt-0.5">{comment.text}</p>
                              <p className="text-[10px] text-gray-400 mt-1">{timeAgo(comment.createdAt)}</p>
                            </div>
                          </div>
                        ))}
                        <div className="flex gap-2 items-center mt-2">
                          <UserAvatar src={store.user.avatar} name={store.user.name} size="sm" className="shrink-0" />
                          <input
                            type="text"
                            className="flex-1 bg-[#F8F3F0] rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-500 border border-transparent focus:border-primary/50 focus:bg-white outline-none transition-colors"
                            placeholder="Write a comment..."
                            value={commentTexts[String(post.id)] || ''}
                            onChange={(e) => setCommentTexts(prev => ({ ...prev, [String(post.id)]: e.target.value }))}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleAddComment(post.id);
                            }}
                          />
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleAddComment(post.id)}
                            className="text-primary hover:bg-primary/10 p-2 rounded-lg transition-colors"
                          >
                            <Send className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="hidden lg:block lg:col-span-1 space-y-6"
      >

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-24">
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
                <Users className="w-3 h-3 text-white" />
              </div>
              Explore Communities
            </h3>
          </div>
          <div className="p-4 space-y-4">
            {[
              { name: 'React Developers', members: '142k' },
              { name: 'UI/UX Designers', members: '89k' },
              { name: 'Indie Hackers', members: '56k' },
            ].map((community, index) => (
              <motion.div
                key={community.name}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                className="flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 text-gray-500" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <h4 className="font-medium text-sm text-gray-900 truncate">{community.name}</h4>
                  <p className="text-xs text-gray-500">{community.members} members</p>
                </div>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="text-xs font-semibold text-primary hover:bg-primary/5 px-2 py-1 rounded">
                  Join
                </motion.button>
              </motion.div>
            ))}
          </div>
          <div className="border-t border-gray-100 px-4 py-3">
            <Link to="#" className="text-sm font-medium text-gray-500 hover:text-gray-900 flex items-center gap-1">
              Show more <ChevronDown className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden card-hover">
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 text-sm">Trending now</h3>
          </div>
          <div className="p-4 space-y-4">
            {[
              { tag: '#MyanmarTech', posts: '1.2k' },
              { tag: '#RemoteWork', posts: '4.5k' },
              { tag: '#StartupLife', posts: '890' },
              { tag: '#OpenSource', posts: '3.2k' },
              { tag: '#Web3', posts: '12.4k' },
            ].map((topic, index) => (
              <motion.div
                key={topic.tag}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + index * 0.05 }}
                className="flex flex-col cursor-pointer group"
              >
                <span className="font-medium text-sm text-gray-800 group-hover:text-primary transition-colors">{topic.tag}</span>
                <span className="text-xs text-gray-500">{topic.posts} posts</span>
              </motion.div>
            ))}
          </div>
        </div>

      </motion.div>

      {lightboxImages && (
        <Lightbox
          images={lightboxImages}
          startIndex={lightboxIndex}
          onClose={() => setLightboxImages(null)}
          onChangeIndex={(i) => setLightboxIndex(i)}
        />
      )}

      {storyViewerDayId && (
        <StoryViewer
          dayId={storyViewerDayId}
          onClose={() => setStoryViewerDayId(null)}
          allDayIds={store.myDays.map(d => d.id)}
        />
      )}

      {showCreateMyDay && (
        <CreateMyDayModal onClose={() => setShowCreateMyDay(false)} />
      )}

    </div>
  );
}
