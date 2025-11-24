import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Replace with your actual Firebase project configuration
// Get this from: Firebase Console -> Project Settings -> General -> Your apps -> SDK setup and configuration
const firebaseConfig = {
  apiKey: "", // e.g. "AIzaSy..."
  authDomain: "", // e.g. "maale-amos.firebaseapp.com"
  projectId: "", // e.g. "maale-amos"
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};

// We check if config is present to avoid errors in development/preview before setup
const isConfigured = firebaseConfig.apiKey !== "";

export const app = isConfigured ? initializeApp(firebaseConfig) : null;
export const auth = isConfigured && app ? getAuth(app) : null;
export const db = isConfigured && app ? getFirestore(app) : null;