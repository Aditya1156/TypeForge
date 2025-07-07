import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

interface SessionWarningProps {
  onExtend?: () => void;
  onDismiss?: () => void;
}

const SessionWarning: React.FC<SessionWarningProps> = ({ onExtend, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const { extendSession, getSessionTimeRemaining } = useAuth();

  useEffect(() => {
    const handleSessionWarning = () => {
      setIsVisible(true);
      setTimeRemaining(30 * 60 * 1000); // 30 minutes in milliseconds
    };

    window.addEventListener('sessionWarning' as any, handleSessionWarning);

    // Update time remaining every minute
    const interval = setInterval(() => {
      const remaining = getSessionTimeRemaining();
      setTimeRemaining(remaining);
      
      // Auto-hide if session expired
      if (remaining <= 0) {
        setIsVisible(false);
      }
    }, 60000);

    return () => {
      window.removeEventListener('sessionWarning' as any, handleSessionWarning);
      clearInterval(interval);
    };
  }, [getSessionTimeRemaining]);

  const handleExtend = async () => {
    try {
      await extendSession();
      setIsVisible(false);
      onExtend?.();
    } catch (error) {
      console.error('Failed to extend session:', error);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  const formatTimeRemaining = (ms: number): string => {
    const minutes = Math.floor(ms / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div className="bg-white dark:bg-gray-800 border border-yellow-200 dark:border-yellow-800 rounded-lg shadow-lg p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-yellow-500 text-xl">⏰</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                Session Expiring Soon
              </h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Your session will expire in {formatTimeRemaining(timeRemaining)}.
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 ml-4 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          >
            <span className="text-lg">×</span>
          </button>
        </div>
        
        <div className="mt-4 flex space-x-2">
          <button
            onClick={handleExtend}
            className="flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
          >
            <span className="mr-1">🛡️</span>
            Extend Session
          </button>
          <button
            onClick={handleDismiss}
            className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionWarning;
