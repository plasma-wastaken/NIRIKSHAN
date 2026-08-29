import React from 'react';
import { cn } from '../../utils/cn';

interface ProfileAvatarProps {
  name: string;
  avatar_url: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/** Shows avatar image if available, otherwise renders initials. */
export const ProfileAvatar: React.FC<ProfileAvatarProps> = ({
  name,
  avatar_url,
  size = 'md',
  className,
}) => {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');

  const sizeClasses = {
    sm: 'h-9 w-9 text-sm',
    md: 'h-16 w-16 text-xl',
    lg: 'h-24 w-24 text-3xl',
  }[size];

  if (avatar_url) {
    return (
      <img
        src={avatar_url}
        alt={name}
        className={cn('rounded-full object-cover ring-2 ring-surface-200', sizeClasses, className)}
      />
    );
  }

  return (
    <div
      className={cn(
        'rounded-full bg-primary-100 border-2 border-primary-200 flex items-center justify-center font-bold text-primary-700 select-none flex-shrink-0',
        sizeClasses,
        className
      )}
    >
      {initials}
    </div>
  );
};
