import type { SVGProps } from 'react';

interface BrandLogoProps extends SVGProps<SVGSVGElement> {
  className?: string;
  showWordmark?: boolean;
  wordmarkClassName?: string;
}

export default function BrandLogo({
  className = 'h-9 w-auto',
  showWordmark = true,
  wordmarkClassName,
  ...props
}: BrandLogoProps) {
  return (
    <span className="inline-flex items-center gap-2.5" aria-label="JobX">
      <svg
        viewBox="0 0 40 40"
        className={className}
        role="img"
        aria-hidden="true"
        {...props}
      >
        <rect width="40" height="40" rx="10" fill="#10213B" />
        <path d="M27.5 0H40v12.5L27.5 0Z" fill="#B7FF3C" />
        <path
          d="M11 11v11.2c0 4.5 2.7 7.3 7.2 7.3 2.1 0 3.9-.7 5.2-2"
          fill="none"
          stroke="white"
          strokeWidth="3.4"
          strokeLinecap="round"
        />
        <path
          d="m24.5 15 7 10m0-10-7 10"
          fill="none"
          stroke="#F7C8D9"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
      </svg>
      {showWordmark && (
        <span className={wordmarkClassName || 'text-xl font-black tracking-[-0.055em] text-slate-950 dark:text-white'}>
          Job<span className="text-[#173B67] dark:text-[#B7FF3C]">X</span>
        </span>
      )}
    </span>
  );
}
