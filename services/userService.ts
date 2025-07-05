import { db } from '../firebaseConfig';
import type { User, SubscriptionTier, SubscriptionInfo, PremiumFeatures } from '../types';

/**
 * Check if Firebase is available and connected
 */
const checkFirebaseConnection = async (): Promise<boolean> => {
  try {
    // Try to perform a simple read operation
    await db.collection('_connection_test').limit(1).get();
    return true;
  } catch (error) {
    console.warn('Firebase connection check failed:', error);
    return false;
  }
};

export interface UserDocument {
  uid: string;
  name: string | null;
  email: string | null;
  subscription: SubscriptionInfo;
  features: PremiumFeatures;
  createdAt: string;
  updatedAt: string;
}

export const userService = {
  /**
   * Create or update user document in Firestore
   */
  async saveUserData(user: User): Promise<void> {
    try {
      // Check connection first
      const isConnected = await checkFirebaseConnection();
      if (!isConnected) {
        throw new Error('Firebase connection not available');
      }

      const userDoc: UserDocument = {
        ...user,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await db.collection('users').doc(user.uid).set(userDoc, { merge: true });
      console.log('User data saved to Firestore:', user.uid);
    } catch (error) {
      console.error('Error saving user data to Firestore:', error);
      // Don't throw error to prevent authentication failures
      throw error;
    }
  },

  /**
   * Load user data from Firestore
   */
  async loadUserData(uid: string): Promise<User | null> {
    try {
      // Check connection first
      const isConnected = await checkFirebaseConnection();
      if (!isConnected) {
        console.warn('Firebase connection not available, cannot load user data');
        return null;
      }

      const doc = await db.collection('users').doc(uid).get();
      
      if (!doc.exists) {
        console.log('No user document found in Firestore for:', uid);
        return null;
      }

      const data = doc.data() as UserDocument;
      const user: User = {
        uid: data.uid,
        name: data.name,
        email: data.email,
        subscription: data.subscription,
        features: data.features
      };

      console.log('User data loaded from Firestore:', uid);
      return user;
    } catch (error) {
      console.error('Error loading user data from Firestore:', error);
      // Return null instead of throwing to allow fallback to default data
      return null;
    }
  },

  /**
   * Update subscription data in Firestore
   */
  async updateSubscription(uid: string, subscription: SubscriptionInfo, features: PremiumFeatures): Promise<void> {
    try {
      console.log('Updating subscription for user:', uid);
      console.log('New subscription data:', subscription);
      console.log('New features:', features);
      
      // Check Firebase connection first
      const isConnected = await checkFirebaseConnection();
      if (!isConnected) {
        throw new Error('Firebase connection not available');
      }
      
      // Use set with merge to ensure document exists
      await db.collection('users').doc(uid).set({
        subscription,
        features,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      
      console.log('Subscription updated successfully in Firestore for user:', uid);
    } catch (error) {
      console.error('Error updating subscription in Firestore:', error);
      console.error('Error details:', {
        code: (error as any)?.code,
        message: (error as any)?.message,
        uid,
        subscription,
        features
      });
      throw new Error(`Failed to update subscription: ${(error as any)?.message || error}`);
    }
  },

  /**
   * Update user profile information
   */
  async updateProfile(uid: string, updates: { name?: string; email?: string }): Promise<void> {
    try {
      await db.collection('users').doc(uid).update({
        ...updates,
        updatedAt: new Date().toISOString()
      });
      
      console.log('Profile updated in Firestore for user:', uid);
    } catch (error) {
      console.error('Error updating profile in Firestore:', error);
      throw new Error('Failed to update profile');
    }
  },

  /**
   * Create default user data for new users
   */
  createDefaultUserData(uid: string, name: string | null, email: string | null): User {
    return {
      uid,
      name,
      email,
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
        lessonsUnlocked: 3, // Reduced to 3 lessons for free users
        practiceModesUnlocked: ['keys', 'words']
      }
    };
  },

  /**
   * Handle Google Sign-In user data
   */
  async handleGoogleSignIn(firebaseUser: any): Promise<User> {
    const { uid, displayName, email } = firebaseUser;
    
    // Try to load existing user data from Firestore
    let userData: User | null = null;
    try {
      userData = await this.loadUserData(uid);
    } catch (loadError) {
      console.warn('Could not load Google user data from Firestore:', loadError);
    }
    
    // If no Firestore data exists, create default data and try to save it
    if (!userData) {
      console.log('No Firestore data found for Google user, creating default data');
      userData = this.createDefaultUserData(uid, displayName || null, email);
      try {
        await this.saveUserData(userData);
      } catch (saveError) {
        console.warn('Could not save Google user data to Firestore:', saveError);
        // Continue anyway - user can still sign in
      }
    }
    
    return userData;
  },

  /**
   * Get premium features for a subscription tier
   */
  getPremiumFeatures(tier: SubscriptionTier): PremiumFeatures {
    switch (tier) {
      case 'premium':
        return {
          aiCoach: true,
          advancedAnalytics: true,
          unlimitedSessions: true,
          customLessons: false,
          exportData: true,
          themesUnlocked: 6, // All themes
          lessonsUnlocked: 50, // Most lessons
          practiceModesUnlocked: ['keys', 'words', 'paragraph']
        };
      case 'pro':
        return {
          aiCoach: true,
          advancedAnalytics: true,
          unlimitedSessions: true,
          customLessons: true,
          exportData: true,
          themesUnlocked: 6, // All themes
          lessonsUnlocked: 100, // All lessons
          practiceModesUnlocked: ['keys', 'words', 'paragraph', 'code']
        };
      default: // 'free'
        return {
          aiCoach: false,
          advancedAnalytics: false,
          unlimitedSessions: false,
          customLessons: false,
          exportData: false,
          themesUnlocked: 2, // Dark and Light themes
          lessonsUnlocked: 5,
          practiceModesUnlocked: ['keys', 'words']
        };
    }
  },

  /**
   * Update session usage for free tier users
   */
  async updateSessionUsage(uid: string, sessionsUsed: number): Promise<void> {
    try {
      await db.collection('users').doc(uid).update({
        'subscription.sessionsUsed': sessionsUsed,
        'subscription.lastSessionDate': new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString()
      });
      
      console.log('Session usage updated for user:', uid);
    } catch (error) {
      console.error('Error updating session usage:', error);
      throw new Error('Failed to update session usage');
    }
  },

  /**
   * Reset session usage for free tier users (daily reset)
   */
  async resetDailySessionUsage(uid: string): Promise<void> {
    try {
      await db.collection('users').doc(uid).update({
        'subscription.sessionsUsed': 0,
        'subscription.lastSessionDate': new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString()
      });
      
      console.log('Daily session usage reset for user:', uid);
    } catch (error) {
      console.error('Error resetting session usage:', error);
      throw new Error('Failed to reset session usage');
    }
  },

  /**
   * Check if user's subscription is still active
   */
  isSubscriptionActive(subscription: SubscriptionInfo): boolean {
    if (subscription.tier === 'free') {
      return true; // Free tier never expires
    }
    
    if (!subscription.endDate) {
      return false; // Premium/Pro should have an end date
    }
    
    return new Date(subscription.endDate) > new Date();
  },

  /**
   * Test Firestore write permissions for current user
   */
  async testFirestorePermissions(uid: string): Promise<{ canRead: boolean; canWrite: boolean; error?: string }> {
    try {
      // Test read permissions
      let canRead = false;
      try {
        await db.collection('users').doc(uid).get();
        canRead = true;
      } catch (readError) {
        console.warn('Read permission test failed:', readError);
      }

      // Test write permissions
      let canWrite = false;
      try {
        await db.collection('users').doc(uid).set({
          lastPermissionTest: new Date().toISOString()
        }, { merge: true });
        canWrite = true;
      } catch (writeError) {
        console.warn('Write permission test failed:', writeError);
      }

      return { canRead, canWrite };
    } catch (error) {
      return { 
        canRead: false, 
        canWrite: false, 
        error: (error as any)?.message || 'Permission test failed' 
      };
    }
  },

  /**
   * Get session information for debugging/testing
   */
  async getSessionInfo(uid: string): Promise<any> {
    try {
      const doc = await db.collection('sessions').doc(uid).get();
      if (doc.exists) {
        return doc.data();
      }
      return null;
    } catch (error) {
      console.warn('Error getting session info:', error);
      return null;
    }
  },

  /**
   * Force end all sessions for a user (admin function)
   */
  async forceEndAllSessions(uid: string): Promise<void> {
    try {
      await db.collection('sessions').doc(uid).delete();
      console.log('All sessions ended for user:', uid);
    } catch (error) {
      console.error('Error ending all sessions:', error);
      throw new Error('Failed to end sessions');
    }
  },
};
