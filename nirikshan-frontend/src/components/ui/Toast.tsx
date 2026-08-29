import React, { useEffect } from 'react';
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { cn } from '../../utils/cn';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastProps {
  id: string;
  type: ToastType;
  message: string;
  onClose: (id: string) => void;
  duration?: number;
}

const icons = {
  success: <CheckCircle2 className="h-5 w-5 text-green-500" />,
  error: <XCircle className="h-5 w-5 text-red-500" />,
  info: <Info className="h-5 w-5 text-blue-500" />,
  warning: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
};

export const Toast: React.FC<ToastProps> = ({ id, type, message, onClose, duration = 5000 }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => onClose(id), duration);
      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  return (
    <div className={cn(
      "flex w-full max-w-sm items-center gap-3 rounded-lg border bg-white p-4 shadow-lg pointer-events-auto transform transition-all duration-300",
      "border-surface-200"
    )}>
      <div className="flex-shrink-0">
        {icons[type]}
      </div>
      <p className="flex-1 text-sm font-medium text-surface-900">
        {message}
      </p>
      <button
        onClick={() => onClose(id)}
        className="flex-shrink-0 rounded-md text-surface-400 hover:text-surface-900 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

// This is a simple ToastProvider stub. 
// In a real app, you'd use a context or state manager to manage toast queue.
export const ToastContainer: React.FC<{ toasts: ToastProps[] }> = ({ toasts }) => {
  return (
    <div className="fixed bottom-0 right-0 z-[100] flex flex-col gap-2 p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col sm:p-6 pointer-events-none">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} />
      ))}
    </div>
  );
};
