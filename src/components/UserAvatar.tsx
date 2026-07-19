import React, { useState } from 'react';

interface UserAvatarProps {
  src?: string;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeMap = {
  xs: 'w-6 h-6 text-[8px]',
  sm: 'w-8 h-8 text-[10px]',
  md: 'w-10 h-10 text-xs',
  lg: 'w-12 h-12 text-sm',
  xl: 'w-20 h-20 text-xl',
};

const initialSizeMap = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-20 h-20 text-2xl',
};

function getInitials(name: string): string {
  if (!name || !name.trim()) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return parts[0][0].toUpperCase();
}

function resolveAvatar(src: string, name: string): string | null {
  if (src && src.trim()) {
    if (src.startsWith('http') || src.startsWith('data:') || src.startsWith('/')) return src;
  }
  if (name && name.trim()) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name.trim())}&background=1877F2&color=fff&bold=true&size=256`;
  }
  return null;
}

export default function UserAvatar({ src, name, size = 'md', className = '' }: UserAvatarProps) {
  const [imgError, setImgError] = useState(false);
  const avatarUrl = resolveAvatar(src, name);
  const initials = getInitials(name);

  if (avatarUrl && !imgError) {
    return (
      <img
        src={avatarUrl}
        alt={name || 'User'}
        className={`rounded-full object-cover ${sizeMap[size]} ${className}`}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div
      className={`rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-sm shrink-0 ${initialSizeMap[size]} ${className}`}
    >
      <span className="font-bold text-white select-none">{initials}</span>
    </div>
  );
}