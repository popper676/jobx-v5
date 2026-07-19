import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight, ArrowDownRight, type LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number;
  trend?: number; // positive or negative
  icon: LucideIcon;
  color?: "blue" | "green" | 'purple' | 'amber';
  delay?: number;
}

const colorMap = {
  blue:  {
    card:   'bg-blue-50 text-[#014BAA] border-blue-200',
    iconBg: 'bg-blue-100 text-[#014BAA]',
    trend:  'text-[#014BAA]',
  },
  purple: {
    card:   'bg-purple-50 text-purple-900 border-purple-200',
    iconBg: 'bg-purple-100 text-purple-700',
    trend:  'text-purple-700',
  },
  amber:  {
    card:   'bg-amber-50 text-amber-900 border-amber-200',
    iconBg: 'bg-amber-100 text-amber-700',
    trend:  'text-amber-700',
  },
};

function useAnimatedNumber(target: number, duration = 1200) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(2, -10 * progress); // easeOutExpo
      setDisplay(Math.round(target * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return display;
}

export default function StatCard({
  title,
  value,
  trend = 0,
  icon: Icon,
  color = "blue",
  delay = 0,
}: StatCardProps) {
  const animated = useAnimatedNumber(value);
  const colors = colorMap[color];
  const trendUp = trend >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`rounded-2xl border p-5 ${colors.card}`}
    >
      <div className="flex items-start justify-between">
        <div className={`p-2.5 rounded-xl ${colors.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend !== 0 && (
          <div className={`inline-flex items-center gap-0.5 text-xs font-bold px-2 py-1 rounded-full bg-white/70 backdrop-blur-sm ${colors.trend}`}>
            {trendUp ? (
              <ArrowUpRight className="w-3.5 h-3.5" />
            ) : (
              <ArrowDownRight className="w-3.5 h-3.5" />
            )}
            {Math.abs(trend)}
          </div>
        )}
      </div>

      <motion.p
        className="text-3xl font-extrabold mt-4 tracking-tight"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: delay + 0.15, duration: 0.4 }}
      >
        {animated.toLocaleString()}
      </motion.p>

      <p className="text-sm font-medium opacity-70 mt-1">{title}</p>
    </motion.div>
  );
}
