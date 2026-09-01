import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer, size = 'medium' }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    small: 'max-w-md',
    medium: 'max-w-lg',
    large: 'max-w-4xl'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-surface-950/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      <div className={`relative z-10 w-full ${sizeClasses[size]} rounded-xl bg-white shadow-xl flex flex-col max-h-[90vh]`}>
        <div className="flex items-center justify-between border-b border-surface-200 px-6 py-4">
          <h3 className="text-lg font-semibold text-surface-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-surface-400 hover:text-surface-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="px-6 py-4 overflow-y-auto">
          {children}
        </div>
        
        {footer && (
          <div className="border-t border-surface-200 px-6 py-4 bg-surface-50 rounded-b-xl flex justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
