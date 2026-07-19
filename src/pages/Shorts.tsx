import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../store/StoreProvider';
import UserAvatar from '../components/UserAvatar';
import {
  Heart,
  MessageSquare,
  Share2,
  Bookmark,
  Music,
  X,
  Send,
  Plus,
  ChevronLeft,
  ChevronRight,
  Home,
  Users,
  Briefcase,
  Settings,
  Loader2,
  Volume2,
  VolumeX,
  Play,
  Pause,
  UserCircle,
  Download,
  EyeOff,
  Flag,
  Gauge,
  MonitorSmartphone,
  Repeat,
  Trash2,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

function formatCount(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return String(n);
}

function timeAgo(date: string): string {
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);
  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin}m`;
  if (diffHr < 24) return `${diffHr}h`;
  if (diffDay < 30) return `${diffDay}d`;
  return d.toLocaleDateString();
}

export default function Shorts() {
  const store = useStore();
  const navigate = useNavigate();
  const [shorts, setShorts] = useState(store.shorts);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [uploadUrl, setUploadUrl] = useState('');
  const [uploadDesc, setUploadDesc] = useState('');
  const [uploadMusic, setUploadMusic] = useState('');
  const [uploadVideoFile, setUploadVideoFile] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [slideNavOpen, setSlideNavOpen] = useState(false);
  const [muted, setMuted] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [autoScroll, setAutoScroll] = useState(false);
  const [cleanDisplay, setCleanDisplay] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; shortId: string } | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll: go to next short when current video ends
  const handleVideoEnded = useCallback(() => {
    if (!autoScroll || shorts.length <= 1) return;
    setActiveIndex(prev => {
      const next = prev + 1;
      if (next >= shorts.length) return 0;
      requestAnimationFrame(() => {
        containerRef.current?.scrollTo({ top: next * (containerRef.current?.clientHeight || 0), behavior: 'smooth' });
      });
      return next;
    });
  }, [autoScroll, shorts.length]);

  useEffect(() => {
    return () => {
      videoRefs.current.forEach((vid) => { vid.pause(); });
    };
  }, []);

  const currentShort = shorts[activeIndex];

  useEffect(() => {
    setShorts(store.shorts);
  }, [store.shorts]);

  // Apply playback speed to active video
  useEffect(() => {
    const vid = videoRefs.current.get(shorts[activeIndex]?.id);
    if (vid) vid.playbackRate = playbackSpeed;
  }, [playbackSpeed, activeIndex, shorts]);

  // Close context menu on click outside
  useEffect(() => {
    const handler = () => { setContextMenu(null); setDeleteConfirmId(null); };
    window.addEventListener('click', handler);
    return () => window.removeEventListener('click', handler);
  }, []);

  const handleContextMenu = (e: React.MouseEvent, shortId: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, shortId });
  };

  const handleDownload = (shortId: string) => {
    const short = shorts.find(s => s.id === shortId);
    if (!short) return;
    const a = document.createElement('a');
    a.href = short.videoUrl;
    a.download = `short_${shortId}.mp4`;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setContextMenu(null);
  };

  const handleNotInterested = (shortId: string) => {
    setShorts(prev => prev.filter(s => s.id !== shortId));
    setActiveIndex(prev => Math.min(prev, shorts.length - 2));
    setContextMenu(null);
  };

  const handleReport = (shortId: string) => {
    alert('Report submitted. Thank you for keeping the community safe.');
    setContextMenu(null);
  };

  const handleDeleteShort = (shortId: string) => {
    store.deleteShort(shortId);
    setShorts(store.shorts);
    setDeleteConfirmId(null);
    setContextMenu(null);
  };

  const speedOptions = [0.5, 0.75, 1, 1.25, 1.5, 2];

  // Play active video, pause all others
  useEffect(() => {
    shorts.forEach((short) => {
      const vid = videoRefs.current.get(short.id);
      if (vid) {
        if (short.id === shorts[activeIndex]?.id) {
          vid.play().catch(() => {});
        } else {
          vid.pause();
          vid.currentTime = 0;
        }
      }
    });
    setPlaying(true);
  }, [activeIndex, shorts]);

  const togglePlayPause = () => {
    const vid = videoRefs.current.get(shorts[activeIndex]?.id);
    if (!vid) return;
    if (vid.paused) {
      vid.play().catch(() => {});
      setPlaying(true);
    } else {
      vid.pause();
      setPlaying(false);
    }
  };

  const changeSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    const vid = videoRefs.current.get(shorts[activeIndex]?.id);
    if (vid) vid.playbackRate = speed;
    setContextMenu(null);
  };

  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const index = Math.round(el.scrollTop / el.clientHeight);
    if (index !== activeIndex && index >= 0 && index < shorts.length) {
      setActiveIndex(index);
    }
  }, [activeIndex, shorts.length]);

  const handleLike = (shortId: string) => {
    store.toggleLikeShort(shortId);
    setShorts([...store.shorts]);
  };

  const handleSave = (shortId: string) => {
    store.toggleSaveShort(shortId);
    setShorts([...store.shorts]);
  };

  const handleShare = (shortId: string) => {
    store.shareShort(shortId);
    setShorts([...store.shorts]);
  };

  const handleAddComment = (shortId: string) => {
    if (!commentText.trim()) return;
    store.addShortComment(shortId, commentText.trim());
    setCommentText('');
    setShorts([...store.shorts]);
  };

  const MAX_VIDEO_SIZE = 50 * 1024 * 1024;

  const handleUploadVideo = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    setIsUploading(true);
    setUploadProgress(0);
    const reader = new FileReader();
    reader.onprogress = (evt) => {
      if (evt.lengthComputable) {
        setUploadProgress(Math.round((evt.loaded / evt.total) * 100));
      }
    };
    reader.onerror = () => {
      setIsUploading(false);
      setUploadProgress(0);
    };
    reader.onload = () => {
      setUploadProgress(100);
      setUploadVideoFile(reader.result as string);
      setIsUploading(false);
      setUploadProgress(0);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleCreateShort = () => {
    const finalUrl = uploadVideoFile || uploadUrl;
    if (!finalUrl || !uploadDesc.trim()) return;
    const ok = store.createShort(finalUrl, uploadDesc.trim(), uploadMusic.trim());
    if (!ok) {
      alert('Failed to create short. Storage may be full — try a smaller video.');
      return;
    }
    setUploadUrl(''); setUploadDesc(''); setUploadMusic(''); setUploadVideoFile('');
    setShowUpload(false);
    const updated = [...store.shorts];
    setShorts(updated);
    requestAnimationFrame(() => {
      setActiveIndex(0);
      containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    });
  };

  const setVideoRef = (id: string) => (el: HTMLVideoElement | null) => {
    if (el) videoRefs.current.set(id, el);
    else videoRefs.current.delete(id);
  };

  const toggleMute = () => {
    setMuted(prev => !prev);
    shorts.forEach((short) => {
      const vid = videoRefs.current.get(short.id);
      if (vid) vid.muted = !muted;
    });
  };

  return (
    <div className="fixed inset-0 bg-black" style={{ zIndex: 50 }}>
      {/* ===== LEFT SLIDE NAV ===== */}
      <AnimatePresence>
        {slideNavOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-30"
              onClick={() => setSlideNavOpen(false)}
            />
            <motion.aside
              initial={{ x: -280, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -280, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-[260px] bg-gray-950/95 backdrop-blur-xl border-r border-white/10 z-30 flex flex-col overflow-y-auto scrollbar-hide"
            >
              <div className="p-5 pb-3 flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <Play className="w-5 h-5 text-white fill-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-blue-400 bg-clip-text text-transparent">Shorts</span>
                <button onClick={() => setSlideNavOpen(false)} className="ml-auto text-white/40 hover:text-white transition-colors">
                  <ChevronLeft className="w-5 h-5" />
                </button>
              </div>

              <div className="mx-4 mb-4 bg-white/5 rounded-xl p-3 border border-white/10">
                <div className="flex items-center gap-3">
                  <UserAvatar src={store.user.avatar} name={store.user.name} size="md" className="w-10 h-10 border-2 border-blue-500/50" />
                  <div className="min-w-0 flex-1">
                    <p className="text-white font-semibold text-sm truncate">{store.user.name}</p>
                    <p className="text-white/50 text-xs truncate">{store.user.title}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-3">
                  <div className="text-center">
                    <p className="text-white font-bold text-sm">{store.user.connections}</p>
                    <p className="text-white/40 text-[10px]">Connects</p>
                  </div>
                  <div className="text-center">
                    <p className="text-white font-bold text-sm">{store.user.profileViews}</p>
                    <p className="text-white/40 text-[10px]">Views</p>
                  </div>
                  <div className="text-center">
                    <p className="text-white font-bold text-sm">{store.user.skills?.length ?? 0}</p>
                    <p className="text-white/40 text-[10px]">Skills</p>
                  </div>
                </div>
              </div>

              <div className="px-4 mb-4">
                <p className="text-white/30 text-[10px] font-bold uppercase tracking-wider mb-2">Navigate</p>
                <div className="space-y-0.5">
                  {[
                    { name: 'Home', path: '/', icon: <Home className="w-4 h-4" /> },
                    { name: 'Profile', path: '/profile', icon: <UserCircle className="w-4 h-4" /> },
                    { name: 'Friends', path: '/friends', icon: <Users className="w-4 h-4" /> },
                    { name: 'Jobs', path: '/jobs', icon: <Briefcase className="w-4 h-4" /> },
                    { name: 'Settings', path: '/settings', icon: <Settings className="w-4 h-4" /> },
                  ].map((link) => (
                    <Link
                      key={link.name}
                      to={link.path}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      {link.icon}
                      {link.name}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="px-4 flex-1">
                <p className="text-white/30 text-[10px] font-bold uppercase tracking-wider mb-2">Trending</p>
                <div className="space-y-2">
                  {['#MyanmarTech', '#RemoteWork', '#ReactDev'].map((tag) => (
                    <div key={tag} className="px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer text-white/70 text-xs font-medium">
                      {tag}
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 mt-auto">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setShowUpload(true); setSlideNavOpen(false); }}
                  className="w-full gradient-primary text-white py-2.5 rounded-xl font-semibold text-sm shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Create Short
                </motion.button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Nav toggle */}
      <div className="fixed top-4 left-4 z-20 flex items-center gap-2">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setSlideNavOpen(true)} className="w-10 h-10 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors">
          <ChevronRight className="w-5 h-5" />
        </motion.button>
        <span className="text-white font-bold text-sm sm:text-lg bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full">Shorts</span>
      </div>

      {/* Mute toggle removed — moved inline into action bar below video */}

      {/* Floating create button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowUpload(true)}
        className="fixed bottom-6 right-4 sm:right-8 w-12 h-12 gradient-primary rounded-full shadow-lg shadow-blue-500/30 flex items-center justify-center z-20"
      >
        <Plus className="w-6 h-6 text-white" />
      </motion.button>

      {/* ===== MAIN FEED ===== */}
      {shorts.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-center px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mb-4">
              <Play className="w-10 h-10 text-white/40" />
            </div>
            <h2 className="text-white text-xl font-bold mb-2">No Shorts Yet</h2>
            <p className="text-white/50 text-sm mb-6 max-w-xs">Upload your first short video to get started!</p>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowUpload(true)} className="gradient-primary text-white px-6 py-3 rounded-xl font-semibold text-sm shadow-lg shadow-blue-500/30 flex items-center gap-2">
              <Plus className="w-4 h-4" /> Upload Your First Short
            </motion.button>
          </motion.div>
        </div>
      ) : (
        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="h-full w-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
          style={{ scrollSnapType: 'y mandatory' }}
        >
          {shorts.map((short, index) => {
            const isActive = index === activeIndex;
            const isOwn = short.authorId === store.user.id;
            return (
              <div
                key={short.id}
                className="snap-start h-full w-full relative"
                style={{ scrollSnapAlign: 'start' }}
              >
                <div className="h-full w-full flex items-center justify-center bg-black">
                  <div className="h-full w-full max-w-lg relative flex items-center justify-center">
                    {/* Video area - tap to pause/play */}
                    <div className="absolute inset-0 flex items-center justify-center" onClick={isActive ? togglePlayPause : undefined} onContextMenu={(e) => handleContextMenu(e, short.id)}>
                      <video
                        ref={setVideoRef(short.id)}
                        src={short.videoUrl}
                        className="h-full w-full object-contain"
                        playsInline
                        loop={!autoScroll}
                        muted={muted}
                        preload="auto"
                        onEnded={handleVideoEnded}
                      />
                    </div>

                    {/* Paused overlay */}
                    <AnimatePresence>
                      {isActive && !playing && !cleanDisplay && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.15 }}
                          className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center">
                            <Play className="w-8 h-8 text-white fill-white" />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Clean display exit button */}
                    {cleanDisplay && (
                      <button onClick={() => setCleanDisplay(false)} className="absolute top-4 right-4 z-30 w-8 h-8 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white/80 hover:text-white transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    )}

                    {/* Speed indicator */}
                    {playbackSpeed !== 1 && !cleanDisplay && (
                      <div className="absolute top-4 left-14 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full z-20">
                        <span className="text-white text-[11px] font-bold">{playbackSpeed}x</span>
                      </div>
                    )}

                    {/* Auto-scroll indicator */}
                    {autoScroll && !cleanDisplay && (
                      <div className="absolute top-4 left-28 bg-blue-500/70 backdrop-blur-sm px-2 py-1 rounded-full z-20 flex items-center gap-1">
                        <Repeat className="w-3 h-3 text-white" />
                        <span className="text-white text-[11px] font-bold">Auto</span>
                      </div>
                    )}

                    {/* Bottom-left info overlay */}
                    {!cleanDisplay && (
                      <div className="absolute bottom-4 left-3 right-14 z-10">
                        <Link
                          to={isOwn ? '/profile' : `/friend/${short.authorId}`}
                          className="flex items-center gap-2 mb-2"
                        >
                          <UserAvatar src={short.authorAvatar} name={short.authorName} size="md" className="w-9 h-9 sm:w-10 sm:h-10 border-2 border-white shadow-lg shrink-0" />
                          <span className="text-white font-bold text-sm drop-shadow-lg">{short.authorName}</span>
                          {isOwn ? (
                            <span className="text-[10px] font-bold bg-white/20 text-white px-2 py-0.5 rounded-full backdrop-blur-sm">You</span>
                          ) : (
                            <span className="text-[10px] font-bold border border-blue-400 text-blue-400 px-2 py-0.5 rounded-full hover:bg-blue-400 hover:text-white transition-colors cursor-pointer">Follow</span>
                          )}
                        </Link>
                        <p className="text-white text-xs sm:text-sm leading-relaxed line-clamp-2 drop-shadow-lg mb-1">{short.description}</p>
                        {short.music && (
                          <div className="flex items-center gap-1.5 text-white/60 text-[11px]">
                            <Music className="w-3 h-3 shrink-0" />
                            <span className="truncate max-w-[180px]">{short.music}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Right vertical action bar - TikTok style */}
                    {!cleanDisplay && (
                    <div className="absolute right-2 bottom-16 sm:bottom-20 flex flex-col items-center gap-4 sm:gap-5 z-10">
                      <motion.button whileTap={{ scale: 0.85 }} onClick={() => handleLike(short.id)} className="flex flex-col items-center">
                        <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shadow-lg ${short.liked ? 'bg-red-500/20 backdrop-blur-md border border-red-500/30' : 'bg-black/30 backdrop-blur-md border border-white/10'}`}>
                          <Heart className={`w-5 h-5 sm:w-6 sm:h-6 ${short.liked ? 'text-red-500 fill-red-500' : 'text-white'}`} />
                        </div>
                        <span className="text-white text-[10px] sm:text-[11px] mt-0.5 font-bold drop-shadow-lg">{formatCount(short.likes)}</span>
                      </motion.button>

                      <motion.button whileTap={{ scale: 0.85 }} onClick={() => setShowComments(true)} className="flex flex-col items-center">
                        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/30 backdrop-blur-md border border-white/10 flex items-center justify-center shadow-lg">
                          <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <span className="text-white text-[10px] sm:text-[11px] mt-0.5 font-bold drop-shadow-lg">{formatCount(short.comments.length)}</span>
                      </motion.button>

                      <motion.button whileTap={{ scale: 0.85 }} onClick={() => handleShare(short.id)} className="flex flex-col items-center">
                        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/30 backdrop-blur-md border border-white/10 flex items-center justify-center shadow-lg">
                          <Share2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <span className="text-white text-[10px] sm:text-[11px] mt-0.5 font-bold drop-shadow-lg">{formatCount(short.shares)}</span>
                      </motion.button>

                      <motion.button whileTap={{ scale: 0.85 }} onClick={() => handleSave(short.id)} className="flex flex-col items-center">
                        <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shadow-lg backdrop-blur-md ${short.saved ? 'bg-yellow-400/20 border border-yellow-400/30' : 'bg-black/30 border border-white/10'}`}>
                          <Bookmark className={`w-5 h-5 sm:w-6 sm:h-6 ${short.saved ? 'text-yellow-400 fill-yellow-400' : 'text-white'}`} />
                        </div>
                        <span className="text-white text-[10px] sm:text-[11px] mt-0.5 font-bold drop-shadow-lg">Save</span>
                      </motion.button>

                      {/* Mute toggle */}
                      <motion.button whileTap={{ scale: 0.85 }} onClick={toggleMute} className="flex flex-col items-center">
                        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/30 backdrop-blur-md border border-white/10 flex items-center justify-center shadow-lg">
                          {muted ? <VolumeX className="w-5 h-5 sm:w-6 sm:h-6 text-white" /> : <Volume2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />}
                        </div>
                        <span className="text-white text-[10px] sm:text-[11px] mt-0.5 font-bold drop-shadow-lg">{muted ? 'Off' : 'On'}</span>
                      </motion.button>

                      {!isOwn && (
                        <div className="mt-1">
                          <UserAvatar src={short.authorAvatar} name={short.authorName} size="md" className="w-10 h-10 sm:w-11 sm:h-11 border-2 border-white/40 shadow-lg" />
                        </div>
                      )}
                    </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ===== RIGHT COMMAND BOX ===== */}
      <AnimatePresence>
        {showComments && currentShort && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowComments(false)} />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="fixed right-0 top-0 bottom-0 w-full sm:w-[400px] bg-white z-50 flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50/50 to-blue-50/30 shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <UserAvatar src={currentShort.authorAvatar} name={currentShort.authorName} size="sm" className="w-9 h-9 border-2 border-blue-200 shrink-0" />
                  <div className="min-w-0">
                    <h3 className="font-bold text-gray-900 text-sm truncate">{currentShort.authorName}</h3>
                    <p className="text-[11px] text-gray-500 truncate">{currentShort.authorTitle}</p>
                  </div>
                </div>
                <button onClick={() => setShowComments(false)} className="text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-100 rounded-lg transition-colors shrink-0">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="px-4 py-3 border-b border-gray-100 bg-[#F8F3F0]/50 shrink-0">
                <p className="text-sm text-gray-800 leading-relaxed">{currentShort.description}</p>
                {currentShort.music && (
                  <div className="flex items-center gap-1.5 mt-2 text-gray-500 text-xs">
                    <Music className="w-3.5 h-3.5" />
                    <span>{currentShort.music}</span>
                  </div>
                )}
                <div className="flex items-center gap-4 mt-2.5">
                  <span className="text-xs text-gray-400">{timeAgo(currentShort.createdAt)}</span>
                  <span className="flex items-center gap-1 text-xs text-gray-500"><Heart className={`w-3.5 h-3.5 ${currentShort.liked ? 'text-red-500 fill-current' : ''}`} /> {currentShort.likes}</span>
                  <span className="flex items-center gap-1 text-xs text-gray-500"><MessageSquare className="w-3.5 h-3.5" /> {currentShort.comments.length}</span>
                  <span className="flex items-center gap-1 text-xs text-gray-500"><Share2 className="w-3.5 h-3.5" /> {currentShort.shares}</span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Comments ({currentShort.comments.length})</h4>
                {currentShort.comments.length === 0 ? (
                  <div className="text-center py-10">
                    <MessageSquare className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm">No comments yet</p>
                    <p className="text-gray-300 text-xs mt-1">Be the first to comment!</p>
                  </div>
                ) : (
                  currentShort.comments.map((comment) => (
                    <div key={comment.id} className="flex gap-2.5">
                      <img
                        src={comment.authorAvatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(comment.authorName)}
                        alt={comment.authorName}
                        className="w-8 h-8 rounded-full object-cover shrink-0"
                      />
                      <div className="flex-1 bg-[#F8F3F0] rounded-xl px-3 py-2">
                        <p className="text-xs font-semibold text-gray-900">{comment.authorName}</p>
                        <p className="text-sm text-gray-700 mt-0.5">{comment.text}</p>
                        <p className="text-[10px] text-gray-400 mt-1">{timeAgo(comment.createdAt)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="flex gap-2 items-center p-4 border-t border-gray-100 bg-white shrink-0">
                <UserAvatar src={store.user.avatar} name={store.user.name} size="sm" className="shrink-0" />
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAddComment(currentShort.id); }}
                  placeholder="Add a comment..."
                  className="flex-1 bg-[#F8F3F0] rounded-full px-4 py-2.5 text-sm text-gray-900 placeholder-gray-500 border border-transparent focus:border-blue-300 focus:bg-white outline-none transition-colors"
                />
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleAddComment(currentShort.id)} disabled={!commentText.trim()} className="gradient-primary text-white p-2.5 rounded-full disabled:opacity-40 transition-opacity shadow-md shadow-blue-500/20">
                  <Send className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ===== CONTEXT MENU ===== */}
      <AnimatePresence>
        {contextMenu && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-50"
              onClick={() => setContextMenu(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.15 }}
              className="fixed z-50 bg-gray-900/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden min-w-[260px] py-2"
              style={{ top: Math.min(contextMenu.y, window.innerHeight - 440), left: Math.min(contextMenu.x, window.innerWidth - 280) }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-4 py-2 border-b border-white/10">
                <p className="text-white/50 text-xs font-medium">Video Options</p>
              </div>
              <button
                onClick={() => handleDownload(contextMenu.shortId)}
                className="w-full flex items-center gap-3 px-5 py-3.5 text-sm text-white/90 hover:bg-white/10 transition-colors"
              >
                <Download className="w-5 h-5 text-blue-400" />
                <span>Download</span>
              </button>
              <button
                onClick={() => { setCleanDisplay(true); setContextMenu(null); }}
                className="w-full flex items-center gap-3 px-5 py-3.5 text-sm text-white/90 hover:bg-white/10 transition-colors"
              >
                <MonitorSmartphone className="w-5 h-5 text-purple-400" />
                <span>Clean Display</span>
              </button>
              <button
                onClick={() => { setAutoScroll(!autoScroll); setContextMenu(null); }}
                className="w-full flex items-center gap-3 px-5 py-3.5 text-sm text-white/90 hover:bg-white/10 transition-colors"
              >
                <Repeat className={`w-5 h-5 ${autoScroll ? 'text-blue-400' : 'text-white/70'}`} />
                <span>{autoScroll ? 'Auto Scroll: On' : 'Auto Scroll: Off'}</span>
                {autoScroll && <span className="ml-auto text-[10px] bg-blue-500 text-white px-1.5 py-0.5 rounded-full font-bold">ON</span>}
              </button>
              <div className="mx-4 py-2.5 border-t border-white/10">
                <p className="text-[11px] text-white/40 font-semibold uppercase tracking-wider mb-2">Playback Speed</p>
                <div className="grid grid-cols-3 gap-2">
                  {speedOptions.map((speed) => (
                    <button
                      key={speed}
                      onClick={() => changeSpeed(speed)}
                      className={`py-2 rounded-xl text-xs font-bold transition-colors ${
                        playbackSpeed === speed
                          ? 'bg-blue-500 text-white shadow-md shadow-blue-500/30'
                          : 'bg-white/10 text-white/70 hover:bg-white/20'
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              </div>
              <div className="border-t border-white/10" />
              <button
                onClick={() => handleNotInterested(contextMenu.shortId)}
                className="w-full flex items-center gap-3 px-5 py-3.5 text-sm text-white/90 hover:bg-white/10 transition-colors"
              >
                <EyeOff className="w-5 h-5 text-yellow-400" />
                <span>Not Interested</span>
              </button>
              <button
                onClick={() => handleReport(contextMenu.shortId)}
                className="w-full flex items-center gap-3 px-5 py-3.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <Flag className="w-5 h-5" />
                <span>Report</span>
              </button>
              {shorts.find(s => s.id === contextMenu.shortId)?.authorId === store.user.id && (
                <>
                  <div className="border-t border-white/10" />
                  {deleteConfirmId === contextMenu.shortId ? (
                    <div className="px-5 py-3">
                      <p className="text-white text-xs mb-2">Delete this short?</p>
                      <div className="flex gap-2">
                        <button onClick={() => handleDeleteShort(contextMenu.shortId)} className="flex-1 bg-red-500 hover:bg-red-600 text-white text-xs py-2 rounded-lg font-semibold transition-colors">Delete</button>
                        <button onClick={() => setDeleteConfirmId(null)} className="flex-1 bg-white/10 hover:bg-white/20 text-white text-xs py-2 rounded-lg font-semibold transition-colors">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirmId(contextMenu.shortId)}
                      className="w-full flex items-center gap-3 px-5 py-3.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                      <span>Delete Short</span>
                    </button>
                  )}
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ===== Upload modal ===== */}
      <AnimatePresence>
        {showUpload && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-40" onClick={() => setShowUpload(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              className="fixed inset-x-4 top-[10%] sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-md bg-white rounded-2xl z-50 overflow-hidden shadow-2xl"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                    <Play className="w-4 h-4 text-white fill-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg">Create Short</h3>
                </div>
                <button onClick={() => setShowUpload(false)} className="text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
                {isUploading ? (
                  <div className="rounded-xl overflow-hidden bg-[#F8F3F0] border border-gray-200 p-6 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 relative">
                      <Loader2 className="w-16 h-16 text-[#014BAA] animate-spin" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-bold text-[#014BAA]">{uploadProgress}%</span>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 mb-2">Uploading video...</p>
                    <p className="text-xs text-gray-500 mb-4">{uploadProgress}% complete</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${uploadProgress}%` }} transition={{ duration: 0.3 }} className="h-full gradient-primary rounded-full" />
                    </div>
                  </div>
                ) : uploadVideoFile ? (
                  <div className="relative rounded-xl overflow-hidden bg-black aspect-[9/16] max-h-64 flex items-center justify-center">
                    <video src={uploadVideoFile} className="w-full h-full object-contain" autoPlay muted loop />
                    <button onClick={() => setUploadVideoFile('')} className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white p-1.5 rounded-full transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-2 left-2 bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Play className="w-2.5 h-2.5 fill-current" /> Ready
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Video</label>
                    <div className="flex gap-2">
                      <input type="text" value={uploadUrl} onChange={(e) => setUploadUrl(e.target.value)} placeholder="Paste video URL..." className="flex-1 bg-[#F8F3F0] rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-500 border border-gray-200 focus:border-blue-400 focus:bg-white outline-none transition-colors" />
                      <span className="text-gray-400 text-sm self-center">or</span>
                      <motion.button whileTap={{ scale: 0.95 }} onClick={() => videoInputRef.current?.click()} className="gradient-primary text-white px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-1.5 shadow-md shadow-blue-500/20">
                        <Play className="w-4 h-4" /> Upload
                      </motion.button>
                      <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={handleUploadVideo} />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
                  <textarea value={uploadDesc} onChange={(e) => setUploadDesc(e.target.value)} placeholder="What's this about? #tags" rows={3} className="w-full bg-[#F8F3F0] rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-500 border border-gray-200 focus:border-blue-400 focus:bg-white resize-none outline-none transition-colors" />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Music (optional)</label>
                  <input type="text" value={uploadMusic} onChange={(e) => setUploadMusic(e.target.value)} placeholder="Original Sound - Your Name" className="w-full bg-[#F8F3F0] rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-500 border border-gray-200 focus:border-blue-400 focus:bg-white outline-none transition-colors" />
                </div>

                <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={handleCreateShort} disabled={!((uploadUrl || uploadVideoFile) && uploadDesc.trim())} className="w-full gradient-primary text-white py-3 rounded-xl font-semibold text-sm shadow-lg shadow-blue-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity">
                  Post Short
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      `}</style>
    </div>
  );
}