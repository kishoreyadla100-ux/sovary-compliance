import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCWvgTmbBu4uREmi3BeD0EUvQ1zMMjzPUM",
  authDomain: "sovary-compliance.firebaseapp.com",
  projectId: "sovary-compliance",
  storageBucket: "sovary-compliance.firebasestorage.app",
  messagingSenderId: "635436969268",
  appId: "1:635436969268:web:8460a91a11db32d7ac8961",
  measurementId: "G-QJTN817LJ4"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth           = getAuth(app);
export const db             = getFirestore(app);
export const storage        = getStorage(app);
export const googleProvider = new GoogleAuthProvider();