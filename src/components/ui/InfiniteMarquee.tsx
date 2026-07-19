import React from 'react';

interface InfiniteMarqueeProps {
  children: React.ReactNode;
  speed?: 'fast' | 'normal' | 'slow';
  direction?: 'left' | 'right';
  className?: string;
}

export default function InfiniteMarquee({ children, speed = 'normal', direction = 'left', className = '' }: InfiniteMarqueeProps) {
  const duration = speed === 'fast' ? '15s' : speed === 'slow' ? '40s' : '25s';
  const animationDirection = direction === 'left' ? 'normal' : 'reverse';

  return (
    <div className={`relative flex w-full overflow-hidden ${className}`}>
      {/* Gradient masks for smooth fading edges */}
      <div className="absolute inset-y-0 left-0 w-32 z-10 bg-gradient-to-r from-white dark:from-slate-900 to-transparent pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-32 z-10 bg-gradient-to-l from-white dark:from-slate-900 to-transparent pointer-events-none" />
      
      <div 
        className="flex min-w-full shrink-0 items-center justify-around gap-4 animate-marquee hover:[animation-play-state:paused]"
        style={{ animationDuration: duration, animationDirection }}
      >
        {children}
      </div>
      
      <div 
        className="flex min-w-full shrink-0 items-center justify-around gap-4 animate-marquee hover:[animation-play-state:paused]"
        style={{ animationDuration: duration, animationDirection }}
      >
        {children}
      </div>
    </div>
  );
}
