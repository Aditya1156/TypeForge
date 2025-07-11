import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";

// Your web app's Firebase configuration, populated with your credentials.
const firebaseConfig = {
  apiKey: "AIzaSyAO9k4a2fJTXFRYoOotqhL2CdgiYiuk0-g",
  authDomain: "typeforge-81925.firebaseapp.com",
  projectId: "typeforge-81925",
  storageBucket: "typeforge-81925.appspot.com",
  messagingSenderId: "452043122885",
  appId: "1:452043122885:web:bb812c3e5d8e454d83a8ac",
  measurementId: "G-4MGL1XPW0X"
};

// Initialize Firebase, preventing re-initialization on hot reloads
const app = !firebase.apps.length ? firebase.initializeApp(firebaseConfig) : firebase.app();

// Initialize Firebase services
const auth = app.auth();
const db = app.firestore();

// Set default persistence to SESSION (only for current browser session)
// This prevents automatic login after browser restart
auth.setPersistence(firebase.auth.Auth.Persistence.SESSION);

// Force immediate auth state synchronization for new tabs
if (typeof window !== 'undefined') {
  // Listen for auth state changes to sync across tabs
  auth.onAuthStateChanged((user) => {
    console.log('[Firebase Config] Auth state changed:', user ? `User: ${user.uid}` : 'No user');
    
    // Broadcast auth state change to other tabs
    try {
      localStorage.setItem('firebase_auth_state_change', JSON.stringify({
        timestamp: Date.now(),
        hasUser: !!user,
        uid: user?.uid || null
      }));
    } catch (error) {
      console.warn('[Firebase Config] Failed to broadcast auth state:', error);
    }
  });
  
  // Listen for auth state changes from other tabs
  window.addEventListener('storage', (e) => {
    if (e.key === 'firebase_auth_state_change') {
      console.log('[Firebase Config] Received auth state change from another tab');
      // The auth state will automatically sync, we just log it
    } else if (e.key === 'firebase_auth_signout') {
      console.log('[Firebase Config] Received signout signal from another tab');
      // Force signout in this tab too
      auth.signOut().catch(err => console.warn('Cross-tab signout failed:', err));
    }
  });
}

export { auth, db };