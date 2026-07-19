import type { SVGProps } from 'react';

export default function JobXCareerSignal({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M7 7.5 25 24.5" />
      <path d="M25 7.5 7 24.5" />
      <circle cx="7" cy="7.5" r="2.25" fill="currentColor" stroke="none" />
      <circle cx="25" cy="7.5" r="2.25" fill="currentColor" stroke="none" />
      <circle cx="7" cy="24.5" r="2.25" fill="currentColor" stroke="none" />
      <circle cx="25" cy="24.5" r="2.25" fill="currentColor" stroke="none" />
      <path d="M16 13v6" />
      <path d="m13.5 16 2.5-3 2.5 3" />
    </svg>
  );
}
