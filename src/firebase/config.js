// src/firebase/config.js
// ─────────────────────────────────────────
// Go to https://console.firebase.google.com
// Create project → Add Web App → copy config here
// ─────────────────────────────────────────
import { initializeApp } from 'firebase/app';
import { getFirestore, enableMultiTabIndexedDbPersistence } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyC0FhUu34dKApDYRQAqaFmXxlxuKbzvEFY",
  authDomain: "drivetrack-53ab7.firebaseapp.com",
  projectId: "drivetrack-53ab7",
  storageBucket: "drivetrack-53ab7.firebasestorage.app",
  messagingSenderId: "392569154207",
  appId: "1:392569154207:web:0ee40c71cedba823d8d0aa",
  measurementId: "G-SCY2Q193E4"
};

export const isFirebaseConfigured =
  firebaseConfig.apiKey !== "YOUR_API_KEY" &&
  firebaseConfig.projectId !== "YOUR_PROJECT_ID";

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Enable offline persistence (multiple tabs / admins)
enableMultiTabIndexedDbPersistence(db).catch(() => {});

export default app;
