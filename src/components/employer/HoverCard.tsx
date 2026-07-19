import React from 'react';
import { motion } from 'motion/react';

interface HoverCardProps {
  children: React.ReactNode;
  className?: string;
}

export default function HoverCard({ children, className = '' }: HoverCardProps) {
  return (
    <motion.div
      whileHover={{
        y: -4,
        boxShadow: '0 12px 40px -12px rgba(0,0,0,0.12)',
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={`bg-white rounded-2xl border border-gray-200/80 shadow-sm transition-colors hover:border-blue-200/60 ${className}`}
    >
      {children}
    </motion.div>
  );
}
