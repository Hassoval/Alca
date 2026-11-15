import { useState } from 'react';
import type { AssetKey } from '../types/alca';
import { MEDIA_ASSETS } from '../utils/mediaAssets';

interface UserAvatarProps {
  name: string;
  initials: string;
  avatarKey?: AssetKey;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function UserAvatar({
  name,
  initials,
  avatarKey,
  size = 'md',
  className = '',
}: UserAvatarProps) {
  const [imgFailed, setImgFailed] = useState(false);

  const sizeMap = {
    xs: 'w-7 h-7 text-[11px]',
    sm: 'w-9 h-9 text-xs',
    md: 'w-11 h-11 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-20 h-20 text-xl',
  };

  const src = avatarKey && !imgFailed ? MEDIA_ASSETS[avatarKey] : null;

  return (
    <div
      className={`relative rounded-full overflow-hidden shrink-0 flex items-center justify-center font-display font-semibold bg-gradient-to-br from-indigo-100 via-slate-100 to-sky-100 text-indigo-900 border border-white/80 shadow-xs ${sizeMap[size]} ${className}`}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          referrerPolicy="no-referrer"
          onError={() => setImgFailed(true)}
          className="w-full h-full object-cover"
        />
      ) : (
        <span aria-hidden="true">{initials}</span>
      )}
    </div>
  );
}
