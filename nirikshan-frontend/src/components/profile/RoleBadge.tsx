import React from 'react';
import { cn } from '../../utils/cn';
import type { UserRole } from '../../data/mockUser';

const ROLE_CONFIG: Record<UserRole, { label: string; cls: string }> = {
  INSPECTOR:  { label: 'Inspector', cls: 'bg-primary-100 text-primary-800 border-primary-200' },
  SUPERVISOR: { label: 'Supervisor', cls: 'bg-purple-100  text-purple-800  border-purple-200' },
  ADMIN:      { label: 'Admin',      cls: 'bg-orange-100  text-orange-800  border-orange-200' },
  CITIZEN:    { label: 'Citizen',    cls: 'bg-green-100   text-green-800   border-green-200' },
};

interface RoleBadgeProps {
  role: UserRole;
  size?: 'sm' | 'md';
  className?: string;
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role, size = 'md', className }) => {
  const { label, cls } = ROLE_CONFIG[role];
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-semibold uppercase tracking-widest',
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs',
        cls,
        className
      )}
    >
      {label}
    </span>
  );
};
