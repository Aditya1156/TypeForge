import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { auth } from '../firebaseConfig';
import { authService } from '../services/authService';
import type { User, SubscriptionTier } from '../types';
import { useToast } from './ToastContext';
import { secureSessionStorage } from '../utils/security';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<User>;
  signUp: (name: string, email: string, password: string) => Promise<User>;
  signOut: () => void;
  signInWithGoogle: () => Promise<void>;
  upgradeSubscription: (tier: SubscriptionTier, paymentMethod?: string) => Promise<void>;
  redeemGiftCode: (code: string) => Promise<SubscriptionTier>;
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
          subscription: {
            tier: 'free',
            startDate: new Date().toISOString(),
            sessionsUsed: 0,
            lastSessionDate: new Date().toISOString().split('T')[0],
            trialUsed: false
          },
          features: {
            aiCoach: false,
            advancedAnalytics: false,
            unlimitedSessions: false,
            customLessons: false,
            exportData: false,
            themesUnlocked: 2, // Dark and Light themes
            lessonsUnlocked: 5, // Basic lessons
            practiceModesUnlocked: ['keys', 'words'] // Basic practice modes
          }
        });

        // SECURITY FIX: Handle pending upgrade after authentication
        const pendingUpgrade = secureSessionStorage.get('pendingUpgrade', 300000); // 5 minute timeout
        if (pendingUpgrade) {
          secureSessionStorage.remove('pendingUpgrade');
          // Trigger upgrade modal after a brief delay to allow state to settle
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('showUpgradeModal', { 
              detail: { tier: pendingUpgrade } 
            }));
          }, 500);
        }
      } else {
        // Set a guest user with free tier to show upgrade prompts
        setUser({
          uid: 'guest',
          name: null,
          email: null,
          subscription: {
            tier: 'free',
            startDate: new Date().toISOString(),
            sessionsUsed: 0,
            lastSessionDate: new Date().toISOString().split('T')[0],
            trialUsed: false
          },
          features: {
            aiCoach: false,
            advancedAnalytics: false,
            unlimitedSessions: false,
            customLessons: false,
            exportData: false,
            themesUnlocked: 2, // Dark and Light themes
            lessonsUnlocked: 5, // Basic lessons
            practiceModesUnlocked: ['keys', 'words'] // Basic practice modes
          }
        });
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

  const upgradeSubscription = useCallback(async (tier: SubscriptionTier, _paymentMethod?: string) => {
    if (!user) {
      throw new Error('User must be signed in to upgrade subscription');
    }

    try {
      // Simulate API call to backend
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update user subscription tier and features
      const updatedFeatures = tier === 'premium' ? {
        aiCoach: true,
        advancedAnalytics: true,
        unlimitedSessions: true,
        customLessons: false,
        exportData: true,
        themesUnlocked: 6, // All themes
        lessonsUnlocked: 50, // Most lessons
        practiceModesUnlocked: ['keys', 'words', 'paragraph']
      } : tier === 'pro' ? {
        aiCoach: true,
        advancedAnalytics: true,
        unlimitedSessions: true,
        customLessons: true,
        exportData: true,
        themesUnlocked: 6, // All themes
        lessonsUnlocked: 100, // All lessons
        practiceModesUnlocked: ['keys', 'words', 'paragraph', 'code']
      } : user.features;

      const updatedUser: User = {
        ...user,
        subscription: {
          ...user.subscription,
          tier,
          startDate: new Date().toISOString(),
          endDate: tier !== 'free' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : undefined
        },
        features: updatedFeatures as any
      };

      setUser(updatedUser);
      addToast(`Successfully upgraded to ${tier}!`, 'success');
    } catch (error: any) {
      addToast(error.message || 'Failed to upgrade subscription', 'error');
      throw error;
    }
  }, [user, addToast]);

  const redeemGiftCode = useCallback(async (code: string): Promise<SubscriptionTier> => {
    if (!user) {
      throw new Error('User must be signed in to redeem gift codes');
    }

    // Demo gift codes validation - in production this would be done on backend
    const DEMO_GIFT_CODES: { [key: string]: SubscriptionTier } = {
      'TYPEFORGE2024': 'premium',
      'PREMIUM50OFF': 'premium',
      'BETA-ACCESS-001': 'pro',
      'EARLY-ADOPTER': 'premium',
      'LAUNCH-SPECIAL': 'pro'
    };

    const normalizedCode = code.trim().toUpperCase();
    const tier = DEMO_GIFT_CODES[normalizedCode];

    if (!tier) {
      throw new Error('Invalid gift code');
    }

    try {
      // Use the existing upgrade method
      await upgradeSubscription(tier, 'gift-code');
      addToast(`Gift code redeemed! Welcome to ${tier}!`, 'success');
      return tier;
    } catch (error: any) {
      addToast(error.message || 'Failed to redeem gift code', 'error');
      throw error;
    }
  }, [user, upgradeSubscription, addToast]);

  const value = { user, isLoading, signIn, signUp, signOut, signInWithGoogle, upgradeSubscription, redeemGiftCode };

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