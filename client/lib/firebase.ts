import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA3_HGq3qwaBwkHFjeZFfZSSP_ivksq3w8",
  authDomain: "electromart-78f5e.firebaseapp.com",
  projectId: "electromart-78f5e",
  storageBucket: "electromart-78f5e.firebasestorage.app",
  messagingSenderId: "320819788206",
  appId: "1:320819788206:web:8f9726d95855e3f1fbb03f",
  measurementId: "G-03VJH4P0HY",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
export const auth = getAuth(app);

// Initialize Firestore
export const db = getFirestore(app);

// Set persistence to LOCAL so users stay logged in
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Failed to set persistence:", error);
});

export default app;
