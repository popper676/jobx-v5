import React from 'react';
import { motion } from 'motion/react';

interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
  colors?: string[];
}

export default function GradientText({
  children,
  className = '',
  colors = ['#014BAA', '#014BAA', '#014BAA', '#014BAA'],
}: GradientTextProps) {
  const gradient = `linear-gradient(135deg, ${colors.join(', ')})`;

  return (
    <motion.span
      initial={{ backgroundPosition: '0% 50%' }}
      animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
      transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
      className={`bg-clip-text text-transparent ${className}`}
      style={{
        backgroundImage: gradient,
        backgroundSize: '200% 200%',
      }}
    >
      {children}
    </motion.span>
  );
}
