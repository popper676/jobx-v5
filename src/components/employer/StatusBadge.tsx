import React from 'react';
import { motion } from 'motion/react';

export type JobStatus = 'Active' | 'Draft' | 'Closed';

interface StatusBadgeProps {
  status: JobStatus;
  size?: 'sm' | 'md';
  animate?: boolean;
}

const statusConfig: Record<JobStatus, { label: string; className: string }> = {
  Active: {
    label: 'Active',
    className: 'bg-blue-50 text-[#014BAA] border-blue-200',
  },
  Draft: {
    label: 'Draft',
    className: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  },
  Closed: {
    label: 'Closed',
    className: 'bg-gray-100 text-gray-500 border-gray-200',
  },
};

export default function StatusBadge({ status, size = 'md', animate = true }: StatusBadgeProps) {
  const config = statusConfig[status];
  const sizeClass = size === 'sm'
    ? 'px-2 py-0.5 text-[10px]'
    : 'px-2.5 py-1 text-xs';

  const badge = (
    <span className={`inline-flex items-center rounded-full font-bold border ${sizeClass} ${config.className}`}>
      {config.label}
    </span>
  );

  if (!animate) return badge;

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className={`inline-flex items-center rounded-full font-bold border ${sizeClass} ${config.className}`}
    >
      {config.label}
    </motion.span>
  );
}
