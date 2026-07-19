import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../store/StoreProvider';
import { MyDay, MyDayItem } from '../services/myDayService';
import UserAvatar from './UserAvatar';
import { X, Trash2, ChevronLeft, ChevronRight, Pause, Volume2, VolumeX } from 'lucide-react';

interface StoryViewerProps {
  dayId: string;
  onClose: () => void;
  onPrev?: () => string | null;
  onNext?: () => string | null;
  allDayIds: string[];
}

const STORY_DURATION = 5000;

const BG_GRADIENTS = [
  'from-blue-500 to-blue-600',
  'from-purple-500 to-indigo-600',
  'from-amber-500 to-orange-600',
  'from-blue-500 to-cyan-600',
  'from-indigo-500 to-blue-600',
  'from-blue-500 to-blue-700',
  'from-violet-500 to-purple-700',
  'from-red-500 to-indigo-600',
];

function getGradient(dayId: string) {
  let hash = 0;
  for (let i = 0; i < dayId.length; i++) hash = dayId.charCodeAt(i) + ((hash << 5) - hash);
  return BG_GRADIENTS[Math.abs(hash) % BG_GRADIENTS.length];
}

function timeAgo(date: string): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  return d.toLocaleDateString();
}

export default function StoryViewer({ dayId, onClose, allDayIds }: StoryViewerProps) {
  const store = useStore();
  const [currentDayId, setCurrentDayId] = useState(dayId);
  const [itemIndex, setItemIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [muted, setMuted] = useState(false);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentDay: MyDay | undefined = store.myDays.find(d => d.id === currentDayId);
  const currentItem: MyDayItem | undefined = currentDay?.items[itemIndex];
  const isOwn = currentDay?.authorId === store.user.id;

  const currentDayIndex = allDayIds.indexOf(currentDayId);

  const goNextItem = useCallback(() => {
    if (!currentDay) return;
    if (itemIndex < currentDay.items.length - 1) {
      setItemIndex(prev => prev + 1);
      setProgress(0);
    } else {
      if (currentDayIndex < allDayIds.length - 1) {
        const nextId = allDayIds[currentDayIndex + 1];
        setCurrentDayId(nextId);
        setItemIndex(0);
        setProgress(0);
        if (!store.myDays.find(d => d.id === nextId)?.viewed) {
          store.markMyDayViewed(nextId);
        }
      } else {
        onClose();
      }
    }
  }, [currentDay, itemIndex, currentDayIndex, allDayIds, store, onClose]);

  const goPrevItem = useCallback(() => {
    if (itemIndex > 0) {
      setItemIndex(prev => prev - 1);
      setProgress(0);
    } else if (currentDayIndex > 0) {
      const prevId = allDayIds[currentDayIndex - 1];
      setCurrentDayId(prevId);
      const prevDay = store.myDays.find(d => d.id === prevId);
      setItemIndex(prevDay ? prevDay.items.length - 1 : 0);
      setProgress(0);
    }
  }, [itemIndex, currentDayIndex, allDayIds, store.myDays]);

  useEffect(() => {
    if (!currentDay) { onClose(); return; }

    if (paused) {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
      return;
    }

    if (timerRef.current) clearTimeout(timerRef.current);
    if (progressRef.current) clearInterval(progressRef.current);

    const startTime = Date.now();
    const remaining = STORY_DURATION * (1 - progress / 100);

    progressRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setProgress(Math.min(100, (elapsed / remaining) * (100 - progress) + progress));
    }, 50);

    timerRef.current = setTimeout(() => {
      setProgress(100);
      goNextItem();
    }, remaining);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, [currentDayId, itemIndex, paused, goNextItem]);

  useEffect(() => {
    if (currentDay && !currentDay.viewed) {
      store.markMyDayViewed(currentDayId);
    }
  }, [currentDayId]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diffX = e.changedTouches[0].clientX - touchStartX.current;
    const diffY = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(diffY) > Math.abs(diffX)) return;
    if (diffX < -50) goNextItem();
    else if (diffX > 50) goPrevItem();
  };

  const handleClick = (e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x < rect.width / 3) goPrevItem();
    else goNextItem();
  };

  const handleDelete = () => {
    if (!currentDay) return;
    store.deleteMyDay(currentDayId);
    if (currentDayIndex < allDayIds.length - 1) {
      const nextId = allDayIds[currentDayIndex + 1];
      setCurrentDayId(nextId);
      setItemIndex(0);
      setProgress(0);
    } else if (currentDayIndex > 0) {
      const prevId = allDayIds[currentDayIndex - 1];
      setCurrentDayId(prevId);
      const prevDay = store.myDays.find(d => d.id === prevId);
      setItemIndex(prevDay ? prevDay.items.length - 1 : 0);
      setProgress(0);
    } else {
      onClose();
    }
  };

  if (!currentDay || !currentItem) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 bg-black flex items-center justify-center"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="relative w-full h-full max-w-lg mx-auto flex flex-col"
          onClick={handleClick}
        >
          <div className="absolute top-0 left-0 right-0 z-20 p-2 pt-3">
            <div className="flex gap-1 mb-3">
              {currentDay.items.map((_, i) => (
                <div key={i} className="flex-1 h-[3px] bg-white/30 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-white rounded-full"
                    initial={false}
                    animate={{
                      width: i < itemIndex ? '100%' : i === itemIndex ? `${progress}%` : '0%'
                    }}
                    transition={i === itemIndex ? { duration: 0.05 } : { duration: 0 }}
                  />
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
              <UserAvatar
                src={currentDay.authorAvatar}
                name={currentDay.authorName}
                size="md"
                className="!w-9 !h-9 border-2 border-white"
              />
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-semibold truncate">{currentDay.authorName}</p>
                <p className="text-white/70 text-xs">{timeAgo(currentItem.createdAt)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); setPaused(!paused); }}
                  className="text-white/80 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors"
                >
                  {paused ? <ChevronRight className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setMuted(!muted); }}
                  className="text-white/80 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors"
                >
                  {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                {isOwn && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(); }}
                    className="text-white/80 hover:text-red-400 p-1.5 rounded-full hover:bg-white/10 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); onClose(); }}
                  className="text-white/80 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <motion.div
            key={`${currentDayId}-${itemIndex}`}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25 }}
            className="flex-1 flex items-center justify-center p-4"
          >
            {currentItem.type === 'image' ? (
              <img
                src={currentItem.content}
                alt=""
                className="max-w-full max-h-full object-contain rounded-2xl"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <div className={`w-full h-full max-h-[70vh] rounded-2xl bg-gradient-to-br ${currentItem.bgColor || getGradient(currentDay.id)} flex items-center justify-center p-8 shadow-2xl`}>
                <p className="text-white text-xl sm:text-2xl font-bold text-center leading-relaxed drop-shadow-lg">
                  {currentItem.content}
                </p>
              </div>
            )}
          </motion.div>

          <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={goPrevItem}
              disabled={itemIndex === 0 && currentDayIndex === 0}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-2 rounded-full transition-colors disabled:opacity-30"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="text-white/50 text-xs">
              {itemIndex + 1} / {currentDay.items.length}
            </div>
            <button
              onClick={goNextItem}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-2 rounded-full transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {paused && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                className="bg-black/40 rounded-full p-4"
              >
                <Pause className="w-12 h-12 text-white" />
              </motion.div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}