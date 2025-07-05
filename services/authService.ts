import firebase from "firebase/compat/app";
import { auth } from '../firebaseConfig';
import type { User } from '../types';

const googleProvider = new firebase.auth.GoogleAuthProvider();

export const authService = {
  signInWithGoogle: async (): Promise<void> => {
    // Using signInWithRedirect is more robust for different environments (like sandboxed previews)
    // that might block pop-ups. The result is handled by the onAuthStateChanged listener in AuthContext.
    try {
      await auth.signInWithRedirect(googleProvider);
    } catch (error) {
      console.error("Google Sign-In Redirect Error:", error);
      // This error usually happens before the redirect (e.g., config error)
      throw new Error('Failed to start Google Sign-In. Please check your configuration.');
    }
  },

  signUp: async (name: string, email: string, password: string): Promise<User> => {
    try {
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      if (userCredential.user) {
        await userCredential.user.updateProfile({ displayName: name });
      }
      const { uid, displayName, email: userEmail } = userCredential.user!;
      return { 
        uid, 
        name: displayName, 
        email: userEmail,
        subscription: {
          tier: 'free',
          sessionsUsed: 0,
          lastSessionDate: new Date().toISOString().split('T')[0]
        },
        features: {
          aiCoach: false,
          advancedAnalytics: false,
          unlimitedSessions: false,
          customLessons: false,
          exportData: false,
          themesUnlocked: 1,
          lessonsUnlocked: 5,
          practiceModesUnlocked: ['keys', 'words']
        }
      };
    } catch (error: any) {
      // Map Firebase error codes to more user-friendly messages
      switch (error.code) {
        case 'auth/email-already-in-use':
          throw new Error('A user with this email already exists.');
        case 'auth/invalid-email':
          throw new Error('Please enter a valid email address.');
        case 'auth/weak-password':
          throw new Error('Password should be at least 6 characters long.');
        default:
          throw new Error('An unexpected error occurred during sign up.');
      }
    }
  },
  
  signIn: async (email: string, password: string): Promise<User> => {
    try {
      const userCredential = await auth.signInWithEmailAndPassword(email, password);
      const { uid, displayName, email: userEmail } = userCredential.user!;
      return { 
        uid, 
        name: displayName, 
        email: userEmail,
        subscription: {
          tier: 'free',
          sessionsUsed: 0,
          lastSessionDate: new Date().toISOString().split('T')[0]
        },
        features: {
          aiCoach: false,
          advancedAnalytics: false,
          unlimitedSessions: false,
          customLessons: false,
          exportData: false,
          themesUnlocked: 1,
          lessonsUnlocked: 5,
          practiceModesUnlocked: ['keys', 'words']
        }
      };
    } catch (error: any) {
      switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          throw new Error('Invalid email or password.');
        case 'auth/invalid-email':
          throw new Error('Please enter a valid email address.');
        default:
          throw new Error('An unexpected error occurred during sign in.');
      }
    }
  },

  signOut: async (): Promise<void> => {
    return auth.signOut();
  }
};