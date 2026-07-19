import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../store/StoreProvider';
import UserAvatar from './UserAvatar';
import { Plus } from 'lucide-react';

interface MyDayBarProps {
  onOpenViewer: (dayId: string, startIndex?: number) => void;
  onOpenCreate: () => void;
}

const GRADIENT_RING = 'conic-gradient(from 0deg, #014BAA, #014BAA, #014BAA, #014BAA)';

export default function MyDayBar({ onOpenViewer, onOpenCreate }: MyDayBarProps) {
  const store = useStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const userId = store.user.id;

  const myDay = store.myDays.find(d => d.authorId === userId);
  const otherDays = store.myDays.filter(d => d.authorId !== userId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 card-hover"
    >
      <div
        ref={scrollRef}
        className="flex items-center gap-4 overflow-x-auto scrollbar-hide pb-1"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onOpenCreate}
          className="flex flex-col items-center gap-1.5 shrink-0"
        >
          <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center shadow-md">
            <Plus className="w-6 h-6 text-white" strokeWidth={2.5} />
            <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow">
              <div className="w-3.5 h-3.5 gradient-primary rounded-full" />
            </div>
          </div>
          <span className="text-[11px] font-medium text-gray-600 truncate max-w-[64px]">Your Day</span>
        </motion.button>

        <AnimatePresence>
          {myDay && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onOpenViewer(myDay.id)}
              className="flex flex-col items-center gap-1.5 shrink-0"
            >
              <div
                className="w-16 h-16 rounded-full p-[2.5px]"
                style={{ background: GRADIENT_RING }}
              >
                <div className="w-full h-full rounded-full overflow-hidden border-2 border-white bg-gray-100">
                  <UserAvatar src={store.user.avatar} name={store.user.name} size="xl" className="w-full h-full !rounded-full" />
                </div>
              </div>
              <span className="text-[11px] font-medium text-gray-600 truncate max-w-[64px]">You</span>
            </motion.button>
          )}

          {otherDays.map((day) => (
            <motion.button
              key={day.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onOpenViewer(day.id)}
              className="flex flex-col items-center gap-1.5 shrink-0"
            >
              <div
                className="w-16 h-16 rounded-full p-[2.5px]"
                style={{ background: day.viewed ? '#d1d5db' : GRADIENT_RING }}
              >
                <div className="w-full h-full rounded-full overflow-hidden border-2 border-white bg-gray-100">
                  <UserAvatar src={day.authorAvatar} name={day.authorName} size="xl" className="w-full h-full !rounded-full" />
                </div>
              </div>
              <span className="text-[11px] font-medium text-gray-600 truncate max-w-[64px]">{day.authorName.split(' ')[0]}</span>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}