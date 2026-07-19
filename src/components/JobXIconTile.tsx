import type { LucideIcon } from 'lucide-react';

type IconTone = 'brand' | 'growth' | 'trust';
type IconSize = 'sm' | 'md' | 'lg';

interface JobXIconTileProps {
  icon: LucideIcon;
  tone?: IconTone;
  size?: IconSize;
  className?: string;
}

const toneClasses: Record<IconTone, string> = {
  brand: 'border border-blue-100 bg-[#eef4ff] text-[#155eef] shadow-[0_8px_20px_rgba(21,94,239,0.12)] dark:border-blue-900/70 dark:bg-blue-950/60 dark:text-blue-200',
  growth: 'border border-violet-100 bg-violet-50 text-violet-600 shadow-[0_8px_20px_rgba(124,58,237,0.1)] dark:border-violet-900/70 dark:bg-violet-950/40 dark:text-violet-200',
  trust: 'border border-emerald-100 bg-emerald-50 text-emerald-600 shadow-[0_8px_20px_rgba(5,150,105,0.1)] dark:border-emerald-900/70 dark:bg-emerald-950/40 dark:text-emerald-200',
};

const sizeClasses: Record<IconSize, string> = {
  sm: 'h-8 w-8 rounded-lg [&>svg]:h-4 [&>svg]:w-4',
  md: 'h-10 w-10 rounded-xl [&>svg]:h-5 [&>svg]:w-5',
  lg: 'h-12 w-12 rounded-2xl [&>svg]:h-6 [&>svg]:w-6',
};

export default function JobXIconTile({ icon: Icon, tone = 'brand', size = 'md', className = '' }: JobXIconTileProps) {
  return (
    <span aria-hidden="true" className={`inline-flex shrink-0 items-center justify-center ${toneClasses[tone]} ${sizeClasses[size]} ${className}`}>
      <Icon strokeWidth={2} />
    </span>
  );
}
