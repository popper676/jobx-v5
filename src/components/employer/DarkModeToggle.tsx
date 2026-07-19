import React from 'react';
import { motion } from 'motion/react';
import { Sun, Moon } from 'lucide-react';

interface DarkModeToggleProps {
  isDark: boolean;
  onToggle: () => void;
  size?: 'sm' | 'md';
}

export default function DarkModeToggle({ isDark, onToggle, size = 'md' }: DarkModeToggleProps) {
  const sizeClass = size === 'sm'
    ? 'w-12 h-7 p-0.5'
    : 'w-14 h-8 p-1';

  const thumbSize = size === 'sm'
    ? 'w-6 h-6'
    : 'w-7 h-7';

  return (
    <button
      onClick={onToggle}
      className={`${sizeClass} rounded-full flex items-center transition-colors ${
        isDark ? 'bg-gray-800' : 'bg-gray-200'
      }`}
    >
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className={`${thumbSize} rounded-full flex items-center justify-center ${
          isDark ? 'bg-gray-900' : 'bg-white'
        } shadow-sm`}
        style={{
          marginLeft: isDark ? 'auto' : '0',
          marginRight: isDark ? '0' : 'auto',
        }}
      >
        {isDark ? (
          <Moon className="w-3.5 h-3.5 text-yellow-300" />
        ) : (
          <Sun className="w-3.5 h-3.5 text-orange-500" />
        )}
      </motion.div>
    </button>
  );
}
