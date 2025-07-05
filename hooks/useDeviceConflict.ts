import { useState, useCallback } from 'react';
import { sessionService } from '../services/sessionService';
import type { ActiveSession } from '../components/DeviceConflictModal';

interface UseDeviceConflictResult {
  isConflictModalOpen: boolean;
  activeSession: ActiveSession | null;
  conflictUserEmail: string;
  showDeviceConflict: (session: ActiveSession, email: string) => void;
  hideDeviceConflict: () => void;
  handleRemoveOtherDevice: () => Promise<void>;
  handleCancelSignIn: () => void;
}

export const useDeviceConflict = (): UseDeviceConflictResult => {
  const [isConflictModalOpen, setIsConflictModalOpen] = useState(false);
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [conflictUserEmail, setConflictUserEmail] = useState('');

  const showDeviceConflict = useCallback((session: ActiveSession, email: string) => {
    setActiveSession(session);
    setConflictUserEmail(email);
    setIsConflictModalOpen(true);
  }, []);

  const hideDeviceConflict = useCallback(() => {
    setIsConflictModalOpen(false);
    setActiveSession(null);
    setConflictUserEmail('');
  }, []);

  const handleRemoveOtherDevice = useCallback(async () => {
    if (!activeSession) return;

    try {
      // Force remove the existing session
      await sessionService.forceRemoveSession(activeSession.userId);
      
      // Start a new session for the current user
      await sessionService.startSession(activeSession.userId);
      
      // Hide the conflict modal
      hideDeviceConflict();
      
      // Trigger a page reload or auth state update to complete the sign-in
      window.location.reload();
    } catch (error) {
      console.error('Error removing other device:', error);
      throw error;
    }
  }, [activeSession, hideDeviceConflict]);

  const handleCancelSignIn = useCallback(() => {
    hideDeviceConflict();
    // Could also trigger sign-out if needed
  }, [hideDeviceConflict]);

  return {
    isConflictModalOpen,
    activeSession,
    conflictUserEmail,
    showDeviceConflict,
    hideDeviceConflict,
    handleRemoveOtherDevice,
    handleCancelSignIn
  };
};
