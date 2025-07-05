import { useState, useCallback, useEffect } from 'react';
import LandingPage from './components/landing/LandingPage';
import TypingApp from './TypingApp';
import SignIn from './components/auth/SignIn';
import SignUp from './components/auth/SignUp';
import Profile from './components/auth/Profile';
import Settings from './components/Settings';
import SubscriptionManager from './components/SubscriptionManager';
import TrialTimer from './components/TrialTimer';
import ToastContainer from './components/ToastContainer';
import ErrorBoundary from './components/ErrorBoundary';
import { useAuth } from './context/AuthContext';
import { useSettings } from './context/SettingsContext';
import { TimerProvider } from './context/TimerContext';
import { secureSessionStorage } from './utils/security';
import type { ModalType } from './types';

const App = () => {
  const [view, setView] = useState<'landing' | 'app'>('landing');
  const [activeModal, setActiveModal] = useState<ModalType | null>(null);
  const { user } = useAuth();
  const { theme } = useSettings();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // SECURITY FIX: Handle auth requirement from subscription attempts
  useEffect(() => {
    const handleRequireAuth = (event: CustomEvent) => {
      const { action, tier } = event.detail;
      if (action === 'upgrade') {
        // Store the intended upgrade for after authentication using secure storage
        secureSessionStorage.set('pendingUpgrade', tier);
        handleShowModal('signIn');
      }
    };

    const handleShowUpgradeModal = () => {
      // Open upgrade modal after authentication
      handleShowModal('upgrade');
    };

    window.addEventListener('requireAuth', handleRequireAuth as EventListener);
    window.addEventListener('showUpgradeModal', handleShowUpgradeModal as EventListener);
    
    return () => {
      window.removeEventListener('requireAuth', handleRequireAuth as EventListener);
      window.removeEventListener('showUpgradeModal', handleShowUpgradeModal as EventListener);
    };
  }, []);
  
  const handleStartTyping = () => {
    setView('app');
  };

  const handleGoToLanding = () => {
    setView('landing');
  };

  const handleShowModal = useCallback((modal: ModalType) => {
    setActiveModal(modal);
  }, []);

  const handleCloseModal = useCallback(() => {
    setActiveModal(null);
  }, []);

  const renderModal = () => {
    if (!activeModal) return null;
    switch(activeModal) {
      case 'signIn':
        return <SignIn onClose={handleCloseModal} onSwitchToSignUp={() => handleShowModal('signUp')} />;
      case 'signUp':
        return <SignUp onClose={handleCloseModal} onSwitchToSignIn={() => handleShowModal('signIn')} />;
      case 'profile':
        return user ? <Profile onClose={handleCloseModal} /> : null;
      case 'settings':
        return <Settings onClose={handleCloseModal} onUpgrade={() => handleShowModal('upgrade')} />;
      case 'upgrade':
        return <SubscriptionManager onClose={handleCloseModal} />;
      default:
        return null;
    }
  };

  return (
    <ErrorBoundary>
      <TimerProvider>
        <TrialTimer onSignIn={() => handleShowModal('signIn')} />
        <ToastContainer />
        {view === 'landing' ? (
          <LandingPage onStartTyping={handleStartTyping} onShowModal={handleShowModal} />
        ) : (
          <TypingApp 
            onGoToLanding={handleGoToLanding} 
            onShowModal={handleShowModal}
          />
        )}
        {renderModal()}
      </TimerProvider>
    </ErrorBoundary>
  );
};

export default App;