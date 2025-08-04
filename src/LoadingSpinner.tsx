import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

export default function LoadingSpinner({ 
  message = "Loading...", 
  size = 'md',
  fullScreen = false 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center p-4 bg-gray-800 rounded-full mb-4">
            <Loader2 className={`${sizeClasses[size]} text-blue-400 animate-spin`} />
          </div>
          <p className={`${textSizeClasses[size]} text-gray-300 font-medium`}>
            {message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-3">
      <Loader2 className={`${sizeClasses[size]} text-blue-400 animate-spin`} />
      <span className={`${textSizeClasses[size]} text-gray-300`}>
        {message}
      </span>
    </div>
  );
}
