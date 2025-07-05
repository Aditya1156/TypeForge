import { useState, useEffect, useCallback } from 'react';

interface GuestTrialState {
  isActive: boolean;
  startTime: number | null;
  remainingTime: number;
  expired: boolean;
}

const GUEST_TRIAL_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds

export const useGuestTrial = () => {
  const [trialState, setTrialState] = useState<GuestTrialState>({
    isActive: false,
    startTime: null,
    remainingTime: 0,
    expired: false
  });

  // Check for existing trial in localStorage
  useEffect(() => {
    const savedTrialStart = localStorage.getItem('guestTrialStart');
    if (savedTrialStart) {
      const startTime = parseInt(savedTrialStart, 10);
      const elapsed = Date.now() - startTime;
      
      if (elapsed < GUEST_TRIAL_DURATION) {
        // Trial is still active
        setTrialState({
          isActive: true,
          startTime,
          remainingTime: GUEST_TRIAL_DURATION - elapsed,
          expired: false
        });
      } else {
        // Trial has expired
        setTrialState({
          isActive: false,
          startTime,
          remainingTime: 0,
          expired: true
        });
        localStorage.removeItem('guestTrialStart');
      }
    }
  }, []);

  // Update remaining time every second when trial is active
  useEffect(() => {
    if (trialState.isActive && trialState.startTime) {
      const interval = setInterval(() => {
        const elapsed = Date.now() - trialState.startTime!;
        const remaining = Math.max(0, GUEST_TRIAL_DURATION - elapsed);
        
        if (remaining === 0) {
          // Trial expired
          setTrialState(prev => ({
            ...prev,
            isActive: false,
            remainingTime: 0,
            expired: true
          }));
          localStorage.removeItem('guestTrialStart');
          clearInterval(interval);
        } else {
          setTrialState(prev => ({
            ...prev,
            remainingTime: remaining
          }));
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [trialState.isActive, trialState.startTime]);

  const startTrial = useCallback(() => {
    const startTime = Date.now();
    localStorage.setItem('guestTrialStart', startTime.toString());
    
    setTrialState({
      isActive: true,
      startTime,
      remainingTime: GUEST_TRIAL_DURATION,
      expired: false
    });
  }, []);

  const endTrial = useCallback(() => {
    localStorage.removeItem('guestTrialStart');
    setTrialState({
      isActive: false,
      startTime: null,
      remainingTime: 0,
      expired: false
    });
  }, []);

  const formatTime = useCallback((milliseconds: number) => {
    const minutes = Math.floor(milliseconds / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  return {
    ...trialState,
    startTrial,
    endTrial,
    formatTime,
    duration: GUEST_TRIAL_DURATION
  };
};
