import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { auth } from '../firebaseConfig';
import { authService } from '../services/authService';
import { userService } from '../services/userService';
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
  updateProfile: (name: string) => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  upgradeSubscription: (tier: SubscriptionTier, paymentMethod?: string) => Promise<void>;
  redeemGiftCode: (code: string) => Promise<SubscriptionTier>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Ensure we have the latest user information
          await firebaseUser.reload();
          
          let userData: User;
          
          // Check if this is a Google Sign-In user
          if (firebaseUser.providerData.some(provider => provider?.providerId === 'google.com')) {
            try {
              userData = await userService.handleGoogleSignIn(firebaseUser);
            } catch (googleError) {
              console.warn('Google Sign-In data handling failed, using fallback:', googleError);
              userData = userService.createDefaultUserData(
                firebaseUser.uid,
                firebaseUser.displayName || null,
                firebaseUser.email || null
              );
            }
          } else {
            // For email/password users, try to load from Firestore with fallback
            try {
              const firestoreData = await userService.loadUserData(firebaseUser.uid);
              if (firestoreData) {
                userData = firestoreData;
              } else {
                // Fallback: create default data for existing users
                userData = userService.createDefaultUserData(
                  firebaseUser.uid,
                  firebaseUser.displayName || null,
                  firebaseUser.email || null
                );
                try {
                  await userService.saveUserData(userData);
                } catch (saveError) {
                  console.warn('Could not save user data to Firestore:', saveError);
                  // Continue anyway - user can still sign in
                }
              }
            } catch (loadError) {
              console.warn('Could not load user data from Firestore, using default data:', loadError);
              userData = userService.createDefaultUserData(
                firebaseUser.uid,
                firebaseUser.displayName || null,
                firebaseUser.email || null
              );
            }
          }

          setUser(userData);

          // Show success message for new users (both Google and email/password)
          const wasSigningIn = secureSessionStorage.get('signingIn');
          if (wasSigningIn) {
            const displayName = userData.name || userData.email?.split('@')[0] || 'User';
            addToast(`Welcome, ${displayName}!`, 'success');
            
            // Don't remove the signingIn flag here - let App.tsx handle it for proper redirect
          }

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
        } catch (error) {
          console.error('Error processing Firebase user:', error);
          // If there's an error, still set a basic user object
          const basicUserData = userService.createDefaultUserData(
            firebaseUser.uid,
            firebaseUser.displayName || null,
            firebaseUser.email || null
          );
          setUser(basicUserData);
        }
      } else {
        // Set a guest user with SAME restrictions as free signed-up users
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
            aiCoach: false, // Premium feature
            advancedAnalytics: false, // Premium feature  
            unlimitedSessions: false, // Same limit as free users
            customLessons: false, // Premium feature
            exportData: false, // Premium feature
            themesUnlocked: 2, // Same as free users - Dark and Light themes only
            lessonsUnlocked: 3, // Reduced to 3 lessons for both guest and free users
            practiceModesUnlocked: ['keys', 'words'] // Same as free users - basic modes only
          }
        });
      }
      setIsLoading(false);
    });

    // Handle redirect result with better error handling
    auth.getRedirectResult().then((result) => {
      if (result && result.user) {
        // Success message is now handled in onAuthStateChanged
        console.log('Google Sign-In successful:', result.user.displayName || result.user.email);
        // Don't remove signingIn flag here - let App.tsx handle the redirect
      }
    }).catch(error => {
      console.error("Redirect result error:", error);
      // Only clear the signing in flag on error
      secureSessionStorage.remove('signingIn');
      addToast(error.message || 'Failed to sign in with Google.', 'error');
    });

    return () => unsubscribe();
  }, [addToast]);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const signedInUser = await authService.signIn(email, password);
      // Set user state immediately for faster UI update
      setUser(signedInUser);
      const displayName = signedInUser.name || signedInUser.email?.split('@')[0] || 'User';
      addToast(`Welcome back, ${displayName}!`, 'success');
      return signedInUser;
    } catch (error: any) {
      addToast(error.message, 'error');
      throw error;
    }
  }, [addToast]);

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    try {
      const newUser = await authService.signUp(name, email, password);
      // Set user state immediately for faster UI update
      setUser(newUser);
      const displayName = newUser.name || name || 'User';
      addToast(`Account created successfully! Welcome, ${displayName}!`, 'success');
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

  const updateProfile = useCallback(async (name: string) => {
    try {
      await authService.updateProfile(name);
      // Update the user state immediately
      if (user) {
        setUser(prev => prev ? { ...prev, name } : null);
      }
      addToast('Profile updated successfully!', 'success');
    } catch (error: any) {
      addToast(error.message, 'error');
      throw error;
    }
  }, [user, addToast]);

  const updatePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    try {
      // First reauthenticate the user
      await authService.reauthenticate(currentPassword);
      // Then update the password
      await authService.updatePassword(newPassword);
      addToast('Password updated successfully!', 'success');
    } catch (error: any) {
      addToast(error.message, 'error');
      throw error;
    }
  }, [addToast]);

  const upgradeSubscription = useCallback(async (tier: SubscriptionTier, _paymentMethod?: string) => {
    if (!user) {
      throw new Error('User must be signed in to upgrade subscription');
    }

    if (user.uid === 'guest') {
      throw new Error('Please sign in to upgrade your subscription');
    }

    try {
      console.log('Starting subscription upgrade for user:', user.uid, 'to tier:', tier);
      
      // Simulate API call to backend
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Get new features for the tier
      const updatedFeatures = userService.getPremiumFeatures(tier);

      // Create updated subscription info
      const updatedSubscription = {
        ...user.subscription,
        tier,
        startDate: new Date().toISOString(),
        endDate: tier !== 'free' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : undefined
      };

      // Update local state first for immediate UI response
      const updatedUser: User = {
        ...user,
        subscription: updatedSubscription,
        features: updatedFeatures
      };
      setUser(updatedUser);

      console.log('Attempting to update subscription in Firestore...');
      
      try {
        // Try to update subscription in Firestore
        await userService.updateSubscription(user.uid, updatedSubscription, updatedFeatures);
        console.log('Subscription upgrade completed successfully with Firestore sync');
        addToast(`Successfully upgraded to ${tier}!`, 'success');
      } catch (firestoreError: any) {
        console.warn('Firestore update failed, but subscription is active locally:', firestoreError);
        // Still show success since the subscription is working locally
        addToast(`Upgraded to ${tier}! (Data will sync when connection is restored)`, 'success');
        
        // Optionally, you could store the failed update for retry later
        try {
          localStorage.setItem('pendingSubscriptionUpdate', JSON.stringify({
            uid: user.uid,
            subscription: updatedSubscription,
            features: updatedFeatures,
            timestamp: Date.now()
          }));
        } catch (storageError) {
          console.warn('Could not store pending update:', storageError);
        }
      }
    } catch (error: any) {
      console.error('Subscription upgrade failed:', error);
      const errorMessage = error.message || 'Failed to upgrade subscription';
      addToast(errorMessage, 'error');
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

  // Function to retry pending subscription updates
  const retryPendingSubscriptionUpdate = useCallback(async () => {
    try {
      const pendingUpdate = localStorage.getItem('pendingSubscriptionUpdate');
      if (!pendingUpdate) return;

      const updateData = JSON.parse(pendingUpdate);
      const { uid, subscription, features } = updateData;

      // Only retry if it's for the current user and not too old (24 hours)
      if (uid === user?.uid && Date.now() - updateData.timestamp < 24 * 60 * 60 * 1000) {
        console.log('Retrying pending subscription update...');
        await userService.updateSubscription(uid, subscription, features);
        localStorage.removeItem('pendingSubscriptionUpdate');
        console.log('Pending subscription update completed successfully');
      } else {
        // Remove old or invalid pending updates
        localStorage.removeItem('pendingSubscriptionUpdate');
      }
    } catch (error) {
      console.warn('Failed to retry pending subscription update:', error);
      // Keep the pending update for next retry
    }
  }, [user]);

  // Try to sync pending updates when user changes or comes online
  useEffect(() => {
    if (user && user.uid !== 'guest') {
      retryPendingSubscriptionUpdate();
    }
  }, [user, retryPendingSubscriptionUpdate]);

  const value = { user, isLoading, signIn, signUp, signOut, signInWithGoogle, updateProfile, updatePassword, upgradeSubscription, redeemGiftCode };

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