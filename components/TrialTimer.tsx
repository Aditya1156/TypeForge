import React from 'react';
import { useGuestTrial } from '../hooks/useGuestTrial';

interface TrialTimerProps {
  onSignIn?: () => void;
}

const TrialTimer: React.FC<TrialTimerProps> = ({ onSignIn }) => {
  const { isActive, remainingTime, formatTime } = useGuestTrial();

  if (!isActive) return null;

  const isLowTime = remainingTime < 5 * 60 * 1000; // Less than 5 minutes

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 ${isLowTime ? 'bg-gradient-to-r from-danger/90 to-danger/70' : 'bg-gradient-to-r from-accent/90 to-accent/70'} backdrop-blur-sm text-primary text-center py-2`}>
      <div className="flex items-center justify-center space-x-4">
        <div className="flex items-center space-x-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm font-semibold">
            {isLowTime ? '⚠️ Trial ending soon: ' : 'Free Trial: '}
            {formatTime(remainingTime)}
          </span>
        </div>
        
        {onSignIn && (
          <button
            onClick={onSignIn}
            className="px-3 py-1 bg-primary/20 text-primary text-xs font-medium rounded-full hover:bg-primary/30 transition-all duration-300"
          >
            Sign Up Now
          </button>
        )}
      </div>
    </div>
  );
};

export default TrialTimer;
