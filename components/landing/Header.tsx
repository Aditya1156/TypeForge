import React from 'react';
import { useAuth } from '../../context/AuthContext';
import type { ModalType } from '../../types';

interface HeaderProps {
  onShowModal: (modal: ModalType) => void;
}

const Header = ({ onShowModal }: HeaderProps) => {
  const { user, isLoading } = useAuth();

  return (
    <header className="absolute top-0 left-0 right-0 z-20 p-4 sm:p-6">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-2xl font-bold text-text-primary">
          Type<span className="text-accent">Forge</span>
        </div>
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#" className="text-text-secondary hover:text-accent transition-colors">Features</a>
          <a href="#" className="text-text-secondary hover:text-accent transition-colors">Pricing</a>
          <a href="#" className="text-text-secondary hover:text-accent transition-colors">Contact</a>
        </nav>
        <div className="flex items-center space-x-4">
          {isLoading ? (
            <div className="h-9 w-36 bg-tertiary/50 animate-pulse rounded-md"></div>
          ) : user ? (
            <button
              onClick={() => onShowModal('profile')}
              className="px-5 py-2 font-semibold text-text-primary bg-tertiary rounded-md hover:bg-tertiary/70 transition-colors"
            >
              Profile
            </button>
          ) : (
            <>
              <button onClick={() => onShowModal('signIn')} className="hidden sm:block text-text-primary hover:text-white transition-colors">Sign In</button>
              <button onClick={() => onShowModal('signUp')} className="px-5 py-2 font-semibold text-primary bg-accent rounded-md hover:bg-accent/80 transition-colors">Sign Up</button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
