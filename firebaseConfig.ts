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

export { auth, db };