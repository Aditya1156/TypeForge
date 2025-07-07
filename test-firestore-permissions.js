import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';

// Firebase configuration - use the same config as your app
const firebaseConfig = {
  apiKey: "AIzaSyAO9k4a2fJTXFRYoOotqhL2CdgiYiuk0-g",
  authDomain: "typeforge-81925.firebaseapp.com",
  projectId: "typeforge-81925",
  storageBucket: "typeforge-81925.appspot.com",
  messagingSenderId: "452043122885",
  appId: "1:452043122885:web:bb812c3e5d8e454d83a8ac",
  measurementId: "G-4MGL1XPW0X"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function testFirestorePermissions() {
  try {
    console.log('🧪 Testing Firestore permissions...');
    
    // Sign in anonymously to get an authenticated user
    console.log('🔐 Signing in anonymously...');
    const userCredential = await signInAnonymously(auth);
    const user = userCredential.user;
    console.log('✅ Successfully signed in with UID:', user.uid);
    
    // Test writing to user document
    console.log('📝 Testing user document write...');
    const userDocRef = doc(db, 'users', user.uid);
    await setDoc(userDocRef, {
      isPremium: true,
      email: 'test@example.com',
      updatedAt: new Date().toISOString(),
      testField: 'This is a test'
    });
    console.log('✅ Successfully wrote to user document');
    
    // Test reading from user document
    console.log('📖 Testing user document read...');
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      console.log('✅ Successfully read user document:', userDoc.data());
    } else {
      console.log('❌ User document does not exist');
    }
    
    // Test writing to sessions collection
    console.log('📝 Testing session document write...');
    const sessionDocRef = doc(db, 'sessions', `session_${Date.now()}`);
    await setDoc(sessionDocRef, {
      userId: user.uid,
      wpm: 65,
      accuracy: 95.5,
      timestamp: new Date().toISOString(),
      testType: 'permission-test'
    });
    console.log('✅ Successfully wrote to session document');
    
    console.log('🎉 All Firestore permission tests passed!');
    
  } catch (error) {
    console.error('❌ Firestore permission test failed:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
  }
}

// Run the test
testFirestorePermissions();
