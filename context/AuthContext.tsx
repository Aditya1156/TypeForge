import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { auth } from '../firebaseConfig';
import { authService } from '../services/authService';
import type { User } from '../types';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<User>;
  signUp: (name: string, email: string, password: string) => Promise<User>;
  signOut: () => void;
  signInWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          name: firebaseUser.displayName,
          email: firebaseUser.email,
        });
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    // Handle redirect result
    auth.getRedirectResult().then((result) => {
      if (result && result.user) {
        addToast(`Welcome, ${result.user.displayName}!`, 'success');
      }
    }).catch(error => {
      console.error("Redirect result error:", error);
      addToast(error.message || 'Failed to sign in with Google.', 'error');
    });

    return () => unsubscribe();
  }, [addToast]);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const signedInUser = await authService.signIn(email, password);
      addToast(`Welcome back, ${signedInUser.name || signedInUser.email}!`, 'success');
      return signedInUser;
    } catch (error: any) {
      addToast(error.message, 'error');
      throw error;
    }
  }, [addToast]);

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    try {
      const newUser = await authService.signUp(name, email, password);
      addToast(`Account created successfully! Welcome, ${newUser.name}!`, 'success');
      return newUser;
    } catch (error: any) {
      addToast(error.message, 'error');
      throw error;
    }
  }, [addToast]);
  
  const signInWithGoogle = useCallback(async () => {
    try {
        await authService.signInWithGoogle();
        // Toast is handled by getRedirectResult
    } catch (error: any) {
        addToast(error.message, 'error');
        throw error;
    }
  }, [addToast]);

  const signOut = useCallback(() => {
    authService.signOut().then(() => {
        addToast('You have been signed out.', 'info');
    });
  }, [addToast]);

  const value = { user, isLoading, signIn, signUp, signOut, signInWithGoogle };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};