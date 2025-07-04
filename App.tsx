import React, { useState, useCallback, useEffect } from 'react';
import LandingPage from './components/landing/LandingPage';
import TypingApp from './TypingApp';
import SignIn from './components/auth/SignIn';
import SignUp from './components/auth/SignUp';
import Profile from './components/auth/Profile';
import Settings from './components/Settings';
import ToastContainer from './components/ToastContainer';
import { useAuth } from './context/AuthContext';
import { useSettings } from './context/SettingsContext';
import type { ModalType } from './types';

const App = () => {
  const [view, setView] = useState<'landing' | 'app'>('landing');
  const [activeModal, setActiveModal] = useState<ModalType | null>(null);
  const { user } = useAuth();
  const { theme } = useSettings();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);
  
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
        return <Settings onClose={handleCloseModal} />;
      default:
        return null;
    }
  };

  return (
    <>
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
    </>
  );
};

export default App;