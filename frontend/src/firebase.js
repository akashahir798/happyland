import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA7IvAqB4IxXZYK-wR0VBT8xvMATTd-ZkU",
  authDomain: "happyland-42855.firebaseapp.com",
  projectId: "happyland-42855",
  storageBucket: "happyland-42855.firebasestorage.app",
  messagingSenderId: "533013069114",
  appId: "1:533013069114:web:b0033021f24ad67c25e403",
  measurementId: "G-KWH5PEPBJB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;
