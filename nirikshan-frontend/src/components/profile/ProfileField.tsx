import React from 'react';
import { cn } from '../../utils/cn';

interface ProfileFieldProps {
  label: string;
  value: React.ReactNode;
  className?: string;
  /** Render value as mono (e.g. IDs). */
  mono?: boolean;
}

/** Read-only profile field with label + value. */
export const ProfileField: React.FC<ProfileFieldProps> = ({ label, value, className, mono }) => (
  <div className={cn('space-y-0.5', className)}>
    <p className="text-[10px] font-semibold uppercase tracking-wider text-surface-500">{label}</p>
    <p className={cn('text-sm text-surface-900 font-medium', mono && 'font-mono')}>{value}</p>
  </div>
);
