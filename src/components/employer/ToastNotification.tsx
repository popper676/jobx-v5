import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, UserCheck } from 'lucide-react';
import UserAvatar from '../UserAvatar';

export interface ToastItem {
  id: string;
  name: string;
  avatar: string;
  jobTitle: string;
  time: string;
}

interface ToastNotificationProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
  autoDismissMs?: number;
}

function ToastItemCard({
  toast,
  onDismiss,
  autoDismissMs = 4000,
}: {
  toast: ToastItem;
  onDismiss: (id: string) => void;
  autoDismissMs?: number;
}) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const elapsed = now - start;
      const pct = Math.max(0, 100 - (elapsed / autoDismissMs) * 100);
      setProgress(pct);
      if (pct > 0) {
        raf = requestAnimationFrame(tick);
      } else {
        onDismiss(toast.id);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [toast.id, autoDismissMs, onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 60, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 40, scale: 0.95 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-80 bg-white rounded-2xl shadow-xl shadow-gray-200/60 border border-gray-200/80 overflow-hidden"
    >
      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-100">
        <motion.div
          className="h-full bg-[#014BAA]"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex items-start gap-3 p-4 pb-4">
        <div className="p-2 rounded-xl bg-blue-50 shrink-0">
          <UserCheck className="w-4 h-4 text-[#014BAA]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900">
            {toast.name} applied
          </p>
          <p className="text-xs text-gray-500 mt-0.5 truncate">
            for {toast.jobTitle}
          </p>
          <p className="text-[11px] text-gray-400 mt-1">{toast.time}</p>
        </div>
        <button
          onClick={() => onDismiss(toast.id)}
          className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
}

export default function ToastNotification({
  toasts,
  onDismiss,
  autoDismissMs = 4000,
}: ToastNotificationProps) {
  return (
    <div className="fixed top-20 right-4 z-[60] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItemCard
              toast={toast}
              onDismiss={onDismiss}
              autoDismissMs={autoDismissMs}
            />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
