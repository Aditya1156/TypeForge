import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useGuestTrial } from '../hooks/useGuestTrial';

interface SessionLimitGuardProps {
  children: React.ReactNode;
  onUpgrade?: () => void;
  onSignIn?: () => void;
}

const SessionLimitGuard: React.FC<SessionLimitGuardProps> = ({ 
  children, 
  onUpgrade,
  onSignIn 
}) => {
  const { user } = useAuth();
  const { isActive: guestTrialActive, expired: guestTrialExpired, remainingTime, startTrial, formatTime, duration } = useGuestTrial();

  // Helper function to check if user has reached daily session limit
  const hasReachedSessionLimit = () => {
    if (!user || user.subscription?.tier !== 'free') {
      return false; // Premium users have unlimited sessions
    }

    const today = new Date().toISOString().split('T')[0];
    const lastSessionDate = user.subscription?.lastSessionDate;
    const sessionsUsed = user.subscription?.sessionsUsed || 0;

    // Reset sessions if it's a new day
    if (lastSessionDate !== today) {
      return false; // New day, sessions reset
    }

    // Check if user has exceeded daily limit (3 sessions for free users)
    return sessionsUsed >= 3;
  };

  if (!user) {
    // If guest trial has expired, show sign-in prompt
    if (guestTrialExpired) {
      return (
        <div className="bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20 rounded-lg p-8 text-center">
          <div className="mb-6">
            <svg className="w-16 h-16 text-accent mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-bold text-text-primary mb-2">Trial Time Expired</h3>
            <p className="text-text-secondary mb-4">
              Your 30-minute trial has ended. Sign up now to continue practicing and track your progress!
            </p>
            
            <div className="bg-tertiary/30 rounded-lg p-4 mb-6">
              <div className="text-sm text-text-secondary">
                <p className="mb-2">✨ Create an account to get:</p>
                <ul className="text-left space-y-1">
                  <li>• Progress tracking</li>
                  <li>• Daily practice sessions</li>
                  <li>• Performance analytics</li>
                  <li>• Multiple themes</li>
                </ul>
              </div>
            </div>

            <div className="space-y-3">
              {onSignIn && (
                <button
                  onClick={onSignIn}
                  className="w-full px-6 py-3 bg-gradient-to-r from-accent to-accent/80 text-primary font-semibold rounded-lg hover:from-accent/90 hover:to-accent/70 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Sign Up / Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    // If guest trial is active, show timer
    if (guestTrialActive) {
      return (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-accent/10 to-accent/5 border border-accent/20 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium text-text-primary">
                  Trial Time: {formatTime(remainingTime)}
                </span>
              </div>
              {onSignIn && (
                <button
                  onClick={onSignIn}
                  className="text-xs px-3 py-1 text-accent border border-accent/50 rounded-full hover:bg-accent hover:text-primary transition-all duration-300"
                >
                  Sign Up
                </button>
              )}
            </div>
            <div className="mt-2 bg-tertiary rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-accent to-accent/80 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${(remainingTime / duration) * 100}%` }}
              />
            </div>
          </div>
          {children}
        </div>
      );
    }

    // Initial state - show sign-in options or trial option
    return (
      <div className="bg-secondary border border-accent/20 rounded-lg p-8 text-center">
        <div className="mb-6">
          <svg className="w-16 h-16 text-accent mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h3 className="text-xl font-bold text-text-primary mb-2">Start Your Typing Journey</h3>
          <p className="text-text-secondary mb-6">Create an account to track your progress, or try for free!</p>
          
          <div className="space-y-4">
            {/* Sign In Button */}
            {onSignIn && (
              <button
                onClick={onSignIn}
                className="w-full px-6 py-3 bg-gradient-to-r from-accent to-accent/80 text-primary font-semibold rounded-lg hover:from-accent/90 hover:to-accent/70 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Sign Up / Sign In
              </button>
            )}
            
            {/* Divider */}
            <div className="flex items-center my-4">
              <div className="flex-1 border-t border-border-primary"></div>
              <span className="px-3 text-sm text-text-secondary">or</span>
              <div className="flex-1 border-t border-border-primary"></div>
            </div>
            
            {/* Guest Trial Button */}
            <button
              onClick={startTrial}
              className="w-full px-6 py-3 bg-tertiary border border-accent/30 text-text-primary font-medium rounded-lg hover:bg-border-primary hover:border-accent/50 transition-all duration-300"
            >
              Try for 30 Minutes (No Account Required)
            </button>
            
            <div className="text-xs text-text-secondary mt-3">
              <p>No signup required • Limited features • Progress not saved</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (hasReachedSessionLimit()) {
    return (
      <div className="bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20 rounded-lg p-8 text-center">
        <div className="mb-6">
          <svg className="w-16 h-16 text-accent mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-xl font-bold text-text-primary mb-2">Daily Session Limit Reached</h3>
          <p className="text-text-secondary mb-4">
            You've completed your 3 free practice sessions for today. Come back tomorrow or upgrade for unlimited access!
          </p>
          
          <div className="bg-tertiary/30 rounded-lg p-4 mb-6">
            <div className="text-sm text-text-secondary">
              <p className="mb-2">🎯 Sessions completed today: <span className="font-semibold text-accent">3/3</span></p>
              <p>⏰ Sessions reset daily at midnight</p>
            </div>
          </div>

          <div className="space-y-3">
            {onUpgrade && (
              <button
                onClick={onUpgrade}
                className="w-full px-6 py-3 bg-gradient-to-r from-accent to-accent/80 text-primary font-semibold rounded-lg hover:from-accent/90 hover:to-accent/70 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Upgrade for Unlimited Sessions
              </button>
            )}
            
            <div className="text-xs text-text-secondary">
              <p>Premium starts at $4.99/month</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Free users get clean experience - session tracking is handled in AppHeader
  if (user.subscription?.tier === 'free') {
    return <>{children}</>;
  }

  // Premium users get completely clean experience - NO indicators or limits
  if (user.subscription?.tier === 'premium' || user.subscription?.tier === 'pro') {
    return <>{children}</>;
  }

  return <>{children}</>;
};

export default SessionLimitGuard;
