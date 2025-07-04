import React from 'react';
import Header from './Header';
import Hero from './Hero';
import Features from './Features';
import Footer from './Footer';
import type { ModalType } from '../../types';

interface LandingPageProps {
  onStartTyping: () => void;
  onShowModal: (modal: ModalType) => void;
}

const LandingPage = ({ onStartTyping, onShowModal }: LandingPageProps) => {
  return (
    <div className="font-sans bg-primary">
      <Header onShowModal={onShowModal} />
      <main>
        <Hero onStartTyping={onStartTyping} />
        <Features />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
