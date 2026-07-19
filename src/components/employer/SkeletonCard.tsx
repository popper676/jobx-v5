import React from 'react';
import { motion } from 'motion/react';

export default function SkeletonCard({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.1 }}
          className="rounded-2xl border border-gray-100 bg-white p-5"
        >
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-gray-100 animate-pulse" />
            <div className="w-16 h-6 rounded-full bg-gray-100 animate-pulse" />
          </div>
          <div className="w-20 h-8 rounded bg-gray-100 animate-pulse mt-4" />
          <div className="w-32 h-4 rounded bg-gray-100 animate-pulse mt-2" />
        </motion.div>
      ))}
    </div>
  );
}
