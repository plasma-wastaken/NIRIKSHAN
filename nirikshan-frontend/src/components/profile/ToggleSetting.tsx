import React from 'react';
import { cn } from '../../utils/cn';

interface ToggleSettingProps {
  id: string;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export const ToggleSetting: React.FC<ToggleSettingProps> = ({
  id,
  label,
  description,
  checked,
  onChange,
  disabled = false,
}) => (
  <div className="flex items-start gap-4 py-3">
    <div className="flex-1 min-w-0">
      <label htmlFor={id} className="text-sm font-medium text-surface-900 cursor-pointer select-none">
        {label}
      </label>
      {description && (
        <p className="text-xs text-surface-500 mt-0.5 leading-relaxed">{description}</p>
      )}
    </div>
    {/* Accessible toggle switch */}
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent',
        'transition-colors duration-200 ease-in-out cursor-pointer',
        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        checked ? 'bg-primary-600' : 'bg-surface-300'
      )}
    >
      <span className="sr-only">{label}</span>
      <span
        className={cn(
          'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm',
          'transform transition-transform duration-200 ease-in-out',
          checked ? 'translate-x-5' : 'translate-x-0'
        )}
      />
    </button>
  </div>
);
