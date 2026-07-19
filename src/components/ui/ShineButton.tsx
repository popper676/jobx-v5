import React from 'react';

interface ShineButtonProps {
  children: React.ReactNode;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  onClick?: () => void | Promise<void>;
}

export default function ShineButton({ children, className = '', ...props }: ShineButtonProps) {
  return (
    <button
      className={`group inline-flex items-center justify-center rounded-xl relative overflow-hidden bg-[#014BAA] border border-transparent text-white font-medium transition-all hover:bg-[#013b86] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#014BAA] disabled:pointer-events-none disabled:opacity-50 [--shine:rgba(255,255,255,.4)] text-sm px-6 py-2.5 ${className}`}
      {...props}
    >
      <span 
        className="tracking-wide flex items-center justify-center h-full w-full relative z-10"
        style={{
          WebkitMaskImage: 'linear-gradient(-75deg, white calc(var(--mask-x, 100%) + 20%), transparent calc(var(--mask-x, 100%) + 30%), white calc(var(--mask-x, 100%) + 100%))',
          maskImage: 'linear-gradient(-75deg, white calc(var(--mask-x, 100%) + 20%), transparent calc(var(--mask-x, 100%) + 30%), white calc(var(--mask-x, 100%) + 100%))'
        }}
      >
        {children}
      </span>
      <span 
        className="block absolute inset-0 rounded-xl p-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: 'linear-gradient(-75deg, transparent 30%, var(--shine) 50%, transparent 70%)',
          backgroundSize: '200% 100%',
          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          maskComposite: 'exclude',
          WebkitMaskComposite: 'xor',
          backgroundPosition: '100% 0'
        }}
      />
      {/* Fallback simple shine overlay for better performance if needed */}
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
    </button>
  );
}
