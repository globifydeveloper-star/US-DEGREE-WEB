"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";

export interface AuthUser {
  id?: number;
  displayName: string | null;
  email: string | null;
  photoURL?: string | null;
  role?: string;
  authProvider: "credentials" | "firebase";
  emailVerified: boolean;
  createdAt?: string | null;
  lastLogin?: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  signup: (
    email: string,
    password: string,
    displayName: string,
    role?: string,
  ) => Promise<AuthUser>;
  loginWithGoogle: () => Promise<FirebaseUser>;
  logout: () => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  checkVerificationStatus: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {
    throw new Error("AuthContext not initialized");
  },
  signup: async () => {
    throw new Error("AuthContext not initialized");
  },
  loginWithGoogle: async () => {
    throw new Error("AuthContext not initialized");
  },
  logout: async () => {},
  resendVerificationEmail: async () => {},
  checkVerificationStatus: async () => false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const login = async (email: string, password: string): Promise<AuthUser> => {
    const credential = await signInWithEmailAndPassword(auth, email, password);

    // Sync/load user from Postgres DB via proxy /user
    const res = await fetch("/api/proxy/user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: credential.user.email,
        display_name: credential.user.displayName,
        auth_provider: "credentials",
        email_verified: credential.user.emailVerified,
        provider_user_id: credential.user.uid,
      }),
    });

    if (!res.ok) {
      throw new Error("Failed to sync user session with backend");
    }

    const dbUser = await res.json();
    const mappedUser: AuthUser = {
      id: dbUser.id,
      displayName: dbUser.display_name,
      email: dbUser.email,
      photoURL: dbUser.profile_image,
      role: dbUser.role,
      authProvider: "credentials",
      emailVerified: credential.user.emailVerified,
      createdAt: dbUser.created_at ?? null,
      lastLogin: dbUser.last_login ?? null,
    };
    setUser(mappedUser);
    window.dispatchEvent(new Event("auth-state-changed"));
    return mappedUser;
  };

  const signup = async (
    email: string,
    password: string,
    displayName: string,
    role?: string,
  ): Promise<AuthUser> => {
    const credential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );

    if (credential.user) {
      await updateProfile(credential.user, { displayName });
      await sendEmailVerification(credential.user);

      // Create user in Postgres DB (with email_verified = false initially)
      try {
        const res = await fetch("/api/proxy/user", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.toLowerCase().trim(),
            display_name: displayName.trim(),
            auth_provider: "credentials",
            role: role || "student",
            email_verified: false,
            provider_user_id: credential.user.uid,
          }),
        });
        if (res.ok) {
          const dbUser = await res.json();
          const mappedUser: AuthUser = {
            id: dbUser.id,
            displayName: dbUser.display_name,
            email: dbUser.email,
            photoURL: dbUser.profile_image,
            role: dbUser.role,
            authProvider: "credentials",
            emailVerified: false,
            createdAt: dbUser.created_at ?? null,
            lastLogin: dbUser.last_login ?? null,
          };
          setUser(mappedUser);
          window.dispatchEvent(new Event("auth-state-changed"));
          return mappedUser;
        }
      } catch (err) {
        console.error("Postgres user creation error during signup:", err);
      }
    }

    // Fallback mapped user if postgres api fails
    const fallbackUser: AuthUser = {
      displayName,
      email,
      authProvider: "credentials",
      emailVerified: false,
    };
    setUser(fallbackUser);
    window.dispatchEvent(new Event("auth-state-changed"));
    return fallbackUser;
  };

  const loginWithGoogle = async (): Promise<FirebaseUser> => {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  };

  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Firebase signOut error:", err);
    }
    setUser(null);
    window.dispatchEvent(new Event("auth-state-changed"));
  };

  const resendVerificationEmail = async (): Promise<void> => {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
    }
  };

  const checkVerificationStatus = async (): Promise<boolean> => {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      const verified = auth.currentUser.emailVerified;

      if (verified && (!user || !user.emailVerified)) {
        // Sync verification with Postgres DB
        try {
          await fetch("/api/proxy/user", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: auth.currentUser.email,
              display_name: auth.currentUser.displayName,
              profile_image: auth.currentUser.photoURL,
              auth_provider: auth.currentUser.providerData.some(
                (p) => p.providerId === "password",
              )
                ? "credentials"
                : "google",
              email_verified: true,
              provider_user_id: auth.currentUser.uid,
            }),
          });
        } catch (e) {
          console.error("Sync verified status with database failed:", e);
        }

        // Update local state
        setUser((prev) => (prev ? { ...prev, emailVerified: true } : null));
      }
      return verified;
    }
    return false;
  };

  useEffect(() => {
    let active = true;
    let unsubscribeFirebase: (() => void) | null = null;

    const checkAuth = async () => {
      if (active) {
        unsubscribeFirebase = onAuthStateChanged(auth, async (firebaseUser) => {
          if (!active) return;
          if (firebaseUser) {
            const isPasswordAuth = firebaseUser.providerData.some(
              (p) => p.providerId === "password",
            );

            // Load/Sync profile from Postgres (via POST /user)
            try {
              const res = await fetch("/api/proxy/user", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  email: firebaseUser.email,
                  display_name: firebaseUser.displayName,
                  profile_image: firebaseUser.photoURL,
                  auth_provider: isPasswordAuth ? "credentials" : "google",
                  email_verified: firebaseUser.emailVerified,
                  provider_user_id: firebaseUser.uid,
                }),
              });
              if (res.ok && active) {
                const dbUser = await res.json();
                setUser({
                  id: dbUser.id,
                  displayName: dbUser.display_name,
                  email: dbUser.email,
                  photoURL: dbUser.profile_image,
                  role: dbUser.role,
                  authProvider: isPasswordAuth ? "credentials" : "firebase",
                  emailVerified: firebaseUser.emailVerified,
                  createdAt: dbUser.created_at ?? null,
                  lastLogin: dbUser.last_login ?? null,
                });
              }
            } catch (err) {
              console.error("Error syncing user:", err);
            }
          } else {
            setUser(null);
          }
          setLoading(false);
        });
      }
    };

    checkAuth();

    return () => {
      active = false;
      if (unsubscribeFirebase) {
        unsubscribeFirebase();
      }
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        loginWithGoogle,
        logout,
        resendVerificationEmail,
        checkVerificationStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
