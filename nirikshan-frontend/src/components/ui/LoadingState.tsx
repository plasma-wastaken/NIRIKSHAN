import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-surface-500">
      <Loader2 className="mb-4 h-8 w-8 animate-spin text-primary-600" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
};
