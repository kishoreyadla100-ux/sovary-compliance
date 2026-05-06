"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { auth, db, googleProvider } from "./firebase";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

const AuthContext = createContext({});
const ADMIN_EMAIL = "kishoreyadla100@gmail.com";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const ref = doc(db, "users", firebaseUser.uid);
          const snap = await getDoc(ref);
          
          if (snap.exists()) {
            setUserData(snap.data());
          } else {
            const isAdmin = firebaseUser.email === ADMIN_EMAIL;
            const newUser = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              name: firebaseUser.displayName || "",
              photo: firebaseUser.photoURL || "",
              role: isAdmin ? "admin" : "ca",
              status: isAdmin ? "active" : "pending",
              trialEnd: isAdmin ? null : new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
              createdAt: serverTimestamp(),
            };
            await setDoc(ref, newUser);
            setUserData(newUser);

            // Send notification to admin if not admin
            if (!isAdmin) {
              try {
                await fetch("/api/notify-admin", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    name: firebaseUser.displayName || firebaseUser.email,
                    email: firebaseUser.email,
                    firmName: "",
                    phone: "",
                  }),
                });
              } catch (notifyError) {
                console.log("Notification error (non-blocking):", notifyError.message);
              }
            }
          }
        } catch (e) {
          console.error("Auth check error:", e);
          const isAdmin = firebaseUser.email === ADMIN_EMAIL;
          setUserData({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName || "",
            photo: firebaseUser.photoURL || "",
            role: isAdmin ? "admin" : "ca",
            status: isAdmin ? "active" : "pending",
          });
        }
      } else {
        setUser(null);
        setUserData(null);
      }
      setLoading(false);
    });
    
    return () => unsub();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;
      const isAdmin = firebaseUser.email === ADMIN_EMAIL;

      try {
        const ref = doc(db, "users", firebaseUser.uid);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          const newUser = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName || "",
            photo: firebaseUser.photoURL || "",
            role: isAdmin ? "admin" : "ca",
            status: isAdmin ? "active" : "pending",
            trialEnd: isAdmin ? null : new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
            createdAt: serverTimestamp(),
          };
          await setDoc(ref, newUser);
          setUserData(newUser);

          // Send notification to admin
          if (!isAdmin) {
            try {
              await fetch("/api/notify-admin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  name: firebaseUser.displayName || firebaseUser.email,
                  email: firebaseUser.email,
                  firmName: "",
                  phone: "",
                }),
              });
            } catch (notifyError) {
              console.log("Notification error (non-blocking):", notifyError.message);
            }
          }
        } else {
          setUserData(snap.data());
        }
      } catch (e) {
        console.error("Firestore error:", e);
        setUserData({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || "",
          photo: firebaseUser.photoURL || "",
          role: isAdmin ? "admin" : "ca",
          status: isAdmin ? "active" : "pending",
        });
      }

      return { success: true };
    } catch (e) {
      console.error("Google sign-in error:", e);
      return { success: false, error: e.message };
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setUserData(null);
  };

  const refreshUserData = async () => {
    if (user) {
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) setUserData(snap.data());
      } catch (e) {
        console.error("Refresh error:", e);
      }
    }
  };

  return (
    <AuthContext.Provider value={{
      user, userData, loading,
      signInWithGoogle, logout, refreshUserData
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);