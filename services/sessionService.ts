import { db } from '../firebaseConfig';
import { auth } from '../firebaseConfig';

export interface SessionData {
  sessionId: string;
  userId: string;
  deviceInfo: string;
  lastActivity: string;
  createdAt: string;
}

/**
 * Generate a unique session ID
 */
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Get basic device information for session tracking
 */
function getDeviceInfo(): string {
  const userAgent = navigator.userAgent;
  const platform = navigator.platform;
  const language = navigator.language;
  
  // Create a simplified device fingerprint
  const deviceInfo = {
    platform,
    language,
    browser: userAgent.includes('Chrome') ? 'Chrome' : 
             userAgent.includes('Firefox') ? 'Firefox' : 
             userAgent.includes('Safari') ? 'Safari' : 
             userAgent.includes('Edge') ? 'Edge' : 'Unknown',
    timestamp: Date.now()
  };
  
  return JSON.stringify(deviceInfo);
}

export const sessionService = {
  currentSessionId: null as string | null,
  sessionListener: null as (() => void) | null,

  /**
   * Start a new session for the authenticated user
   */
  async startSession(userId: string): Promise<string> {
    try {
      const sessionId = generateSessionId();
      const sessionData: SessionData = {
        sessionId,
        userId,
        deviceInfo: getDeviceInfo(),
        lastActivity: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };

      // Store session data in Firestore
      await db.collection('sessions').doc(userId).set({
        activeSession: sessionData,
        updatedAt: new Date().toISOString()
      });

      this.currentSessionId = sessionId;
      console.log('Session started:', sessionId);
      
      // Start monitoring for session changes
      this.startSessionMonitoring(userId);
      
      return sessionId;
    } catch (error) {
      console.error('Error starting session:', error);
      throw new Error('Failed to start session');
    }
  },

  /**
   * Update session activity timestamp
   */
  async updateSessionActivity(userId: string): Promise<void> {
    if (!this.currentSessionId) return;

    try {
      await db.collection('sessions').doc(userId).update({
        'activeSession.lastActivity': new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.warn('Failed to update session activity:', error);
      // Don't throw error for activity updates
    }
  },

  /**
   * End the current session
   */
  async endSession(userId: string): Promise<void> {
    try {
      if (this.currentSessionId) {
        // Remove the active session from Firestore
        await db.collection('sessions').doc(userId).delete();
        console.log('Session ended:', this.currentSessionId);
      }
      
      this.currentSessionId = null;
      this.stopSessionMonitoring();
    } catch (error) {
      console.warn('Error ending session:', error);
      // Continue with local cleanup even if Firestore update fails
      this.currentSessionId = null;
      this.stopSessionMonitoring();
    }
  },

  /**
   * Start monitoring for session changes (another device login)
   */
  startSessionMonitoring(userId: string): void {
    if (this.sessionListener) {
      this.stopSessionMonitoring();
    }

    this.sessionListener = db.collection('sessions').doc(userId)
      .onSnapshot((doc) => {
        if (doc.exists) {
          const data = doc.data();
          const activeSession = data?.activeSession as SessionData;
          
          if (activeSession && activeSession.sessionId !== this.currentSessionId) {
            // Another session has become active - log out this session
            console.log('Another session detected, logging out current session');
            this.handleSessionConflict();
          }
        }
      }, (error) => {
        console.warn('Session monitoring error:', error);
      });
  },

  /**
   * Stop session monitoring
   */
  stopSessionMonitoring(): void {
    if (this.sessionListener) {
      this.sessionListener();
      this.sessionListener = null;
    }
  },

  /**
   * Handle session conflict (another device logged in)
   */
  handleSessionConflict(): void {
    // Stop monitoring to prevent recursive calls
    this.stopSessionMonitoring();
    
    // Clear current session
    this.currentSessionId = null;
    
    // Sign out the user
    auth.signOut().then(() => {
      // Dispatch a custom event to notify the app
      window.dispatchEvent(new CustomEvent('sessionConflict', {
        detail: { 
          message: 'You have been signed out because your account was accessed from another device.',
          type: 'warning'
        }
      }));
    }).catch(error => {
      console.error('Error signing out due to session conflict:', error);
    });
  },

  /**
   * Check if there's an active session for a user
   */
  async getActiveSession(userId: string): Promise<SessionData | null> {
    try {
      const doc = await db.collection('sessions').doc(userId).get();
      if (doc.exists) {
        const data = doc.data();
        return data?.activeSession as SessionData || null;
      }
      return null;
    } catch (error) {
      console.warn('Error getting active session:', error);
      return null;
    }
  },

  /**
   * Check if there's an existing active session before starting a new one
   */
  async checkForExistingSession(userId: string): Promise<SessionData | null> {
    try {
      const doc = await db.collection('sessions').doc(userId).get();
      if (doc.exists) {
        const data = doc.data();
        return data?.activeSession as SessionData || null;
      }
      return null;
    } catch (error) {
      console.warn('Error checking for existing session:', error);
      return null;
    }
  },

  /**
   * Force remove an existing session (for device conflict resolution)
   */
  async forceRemoveSession(userId: string): Promise<void> {
    try {
      await db.collection('sessions').doc(userId).delete();
      console.log('Forced session removal for user:', userId);
    } catch (error) {
      console.error('Error forcing session removal:', error);
      throw new Error('Failed to remove existing session');
    }
  },

  /**
   * Start a new session with conflict resolution
   */
  async startSessionWithConflictCheck(userId: string): Promise<{ sessionId: string; existingSession?: SessionData }> {
    try {
      // Check for existing session first
      const existingSession = await this.checkForExistingSession(userId);
      
      if (existingSession) {
        // Return existing session info without creating new session
        return { 
          sessionId: '', 
          existingSession 
        };
      }

      // No existing session, proceed normally
      const sessionId = await this.startSession(userId);
      return { sessionId };
    } catch (error) {
      console.error('Error starting session with conflict check:', error);
      throw new Error('Failed to start session with conflict check');
    }
  },

  /**
   * Initialize session activity tracking
   */
  initializeActivityTracking(userId: string): void {
    // Update session activity every 5 minutes
    const activityInterval = setInterval(() => {
      if (this.currentSessionId && auth.currentUser) {
        this.updateSessionActivity(userId);
      } else {
        clearInterval(activityInterval);
      }
    }, 5 * 60 * 1000); // 5 minutes

    // Update activity on user interaction
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    let lastActivityUpdate = 0;
    
    const handleActivity = () => {
      const now = Date.now();
      // Throttle activity updates to once per minute
      if (now - lastActivityUpdate > 60000 && this.currentSessionId && auth.currentUser) {
        lastActivityUpdate = now;
        this.updateSessionActivity(userId);
      }
    };

    events.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      clearInterval(activityInterval);
    });
  }
};
