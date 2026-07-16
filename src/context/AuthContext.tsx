"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { clearAppJwt } from "@/lib/auth/tokenStore";
import { signInWithApple } from "@/lib/appleAuth";
import { exchangeAppleIdToken } from "@/lib/auth/api";
import { syncCompareOwner } from "@/components/search/useCompareSelected";

export interface AuthUser {
  id?: number;
  displayName: string | null;
  email: string | null;
  photoURL?: string | null;
  role?: string;
  authProvider: "credentials" | "firebase" | "apple";
  emailVerified: boolean;
  createdAt?: string | null;
  lastLogin?: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (
    email: string,
    password: string,
    rememberMe?: boolean,
  ) => Promise<AuthUser>;
  signup: (
    email: string,
    password: string,
    displayName: string,
    role?: string,
    ageConsent?: boolean,
  ) => Promise<AuthUser>;
  loginWithGoogle: () => Promise<FirebaseUser>;
  loginWithApple: () => Promise<AuthUser>;
  logout: () => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  checkVerificationStatus: () => Promise<boolean>;
  resendVerificationForUnverifiedUser: (
    email: string,
    password: string,
  ) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
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
  loginWithApple: async () => {
    throw new Error("AuthContext not initialized");
  },
  logout: async () => {},
  resendVerificationEmail: async () => {},
  checkVerificationStatus: async () => false,
  resendVerificationForUnverifiedUser: async () => {},
  sendPasswordReset: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const authActionInProgress = useRef(false);

  const currentUidRef = useRef<string | null>(null);

  const getActionCodeSettings = () => {
    return {
      url:
        typeof window !== "undefined"
          ? window.location.origin
          : "https://usdegrees.web.app",
      handleCodeInApp: false,
    };
  };

  // Ask the backend whether an email may register/sign in right now, or is
  // still within the 24h post-deactivation cooldown. Failures fail-open so a
  // backend hiccup never blocks a legitimate login.
  const checkEmailAvailability = async (
    email: string,
  ): Promise<{ available: boolean; eligibleAt?: string }> => {
    try {
      const res = await fetch(
        `/api/proxy/account/availability?email=${encodeURIComponent(email.toLowerCase().trim())}`,
      );
      if (!res.ok) return { available: true };
      return await res.json();
    } catch {
      return { available: true };
    }
  };

  const cooldownError = (eligibleAt?: string): Error => {
    const when = eligibleAt
      ? new Date(eligibleAt).toLocaleString(undefined, {
          dateStyle: "medium",
          timeStyle: "short",
        })
      : "24 hours after deactivation";
    return new Error(
      `You recently deactivated an account with this email. You can register again after ${when}.`,
    );
  };

  const broadcastAuthChange = (type: "LOGIN" | "LOGOUT") => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(
          "auth_sync_event",
          JSON.stringify({ type, timestamp: Date.now() }),
        );
      } catch (e) {
        console.error("Storage event broadcast failed:", e);
      }
    }
  };

  const login = async (
    email: string,
    password: string,
    rememberMe = false,
  ): Promise<AuthUser> => {
    authActionInProgress.current = true;
    try {
      // Drop any app JWT minted for a previously signed-in user
      clearAppJwt();

      // Persist across restarts when "remember me" is set; otherwise keep
      // the session only for the current browser session.
      await setPersistence(
        auth,
        rememberMe ? browserLocalPersistence : browserSessionPersistence,
      );

      let credential;
      try {
        credential = await signInWithEmailAndPassword(
          auth,
          email.trim(),
          password,
        );
      } catch (err) {
        const avail = await checkEmailAvailability(email);
        if (!avail.available) throw cooldownError(avail.eligibleAt);
        throw err;
      }

      if (!credential.user.emailVerified) {
        throw new Error("EMAIL_NOT_VERIFIED");
      }

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
      };
      currentUidRef.current = credential.user.uid;
      setUser(mappedUser);
      broadcastAuthChange("LOGIN");
      window.dispatchEvent(new Event("auth-state-changed"));
      return mappedUser;
    } finally {
      authActionInProgress.current = false;
    }
  };

  const signup = async (
    email: string,
    password: string,
    displayName: string,
    role?: string,
    ageConsent?: boolean,
  ): Promise<AuthUser> => {
    authActionInProgress.current = true;
    try {
      clearAppJwt();

      const avail = await checkEmailAvailability(email);
      if (!avail.available) throw cooldownError(avail.eligibleAt);

      const credential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password,
      );

      if (credential.user) {
        await updateProfile(credential.user, {
          displayName: displayName.trim(),
        });
        await sendEmailVerification(credential.user, getActionCodeSettings());

        try {
          await fetch("/api/proxy/user", {
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
              age_consent: !!ageConsent,
            }),
          });
        } catch (err) {
          console.error("Postgres user creation error during signup:", err);
        }
      }
      throw new Error("EMAIL_NOT_VERIFIED");
    } finally {
      authActionInProgress.current = false;
    }
  };

  const loginWithGoogle = async (): Promise<FirebaseUser> => {
    clearAppJwt();
    await setPersistence(auth, browserLocalPersistence);
    const result = await signInWithPopup(auth, googleProvider);
    if (result.user) {
      currentUidRef.current = result.user.uid;
      broadcastAuthChange("LOGIN");
    }
    return result.user;
  };

  const loginWithApple = async (): Promise<AuthUser> => {
    authActionInProgress.current = true;
    try {
      clearAppJwt();
      const { idToken, fullName } = await signInWithApple();
      const { user: dbUser } = await exchangeAppleIdToken(idToken, fullName);

      const mappedUser: AuthUser = {
        id: dbUser.id,
        displayName: dbUser.display_name ?? null,
        email: dbUser.email ?? null,
        photoURL: dbUser.profile_image ?? null,
        role: dbUser.role,
        authProvider: "apple",
        emailVerified: dbUser.email_verified ?? true,
      };
      setUser(mappedUser);
      broadcastAuthChange("LOGIN");
      window.dispatchEvent(new Event("auth-state-changed"));
      return mappedUser;
    } finally {
      authActionInProgress.current = false;
    }
  };

  const logout = async (): Promise<void> => {
    clearAppJwt();
    currentUidRef.current = null;
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Firebase signOut error:", err);
    }
    setUser(null);
    broadcastAuthChange("LOGOUT");
    window.dispatchEvent(new Event("auth-state-changed"));
  };

  const resendVerificationEmail = async (): Promise<void> => {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser, getActionCodeSettings());
    }
  };

  const checkVerificationStatus = async (): Promise<boolean> => {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      const verified = auth.currentUser.emailVerified;

      if (verified) {
        let dbUser = null;
        try {
          const res = await fetch("/api/proxy/user", {
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
          if (res.ok) {
            dbUser = await res.json();
          }
        } catch (e) {
          console.error("Sync verified status with database failed:", e);
        }

        const mappedUser: AuthUser = {
          id: dbUser?.id,
          displayName: dbUser?.display_name || auth.currentUser.displayName,
          email: dbUser?.email || auth.currentUser.email,
          photoURL: dbUser?.profile_image || auth.currentUser.photoURL,
          role: dbUser?.role || "student",
          authProvider: auth.currentUser.providerData.some(
            (p) => p.providerId === "password",
          )
            ? "credentials"
            : "firebase",
          emailVerified: true,
        };
        currentUidRef.current = auth.currentUser.uid;
        setUser(mappedUser);
        broadcastAuthChange("LOGIN");
        window.dispatchEvent(new Event("auth-state-changed"));
      }
      return verified;
    }
    return false;
  };

  const resendVerificationForUnverifiedUser = async (
    email: string,
    password: string,
  ): Promise<void> => {
    authActionInProgress.current = true;
    try {
      const credential = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password,
      );
      await sendEmailVerification(credential.user, getActionCodeSettings());
    } finally {
      authActionInProgress.current = false;
    }
  };

  const sendPasswordReset = async (email: string): Promise<void> => {
    await sendPasswordResetEmail(auth, email.trim());
  };

  // Keep the compare-selection localStorage mirror scoped to whichever
  // account is actually signed in, so logging out, switching accounts, or
  // re-registering under an old account's email never inherits a previous
  // account's compare selections on this browser.
  useEffect(() => {
    syncCompareOwner(user?.id ?? null);
  }, [user?.id]);

  // Cross-tab auth synchronization listener
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "auth_sync_event" && e.newValue) {
        try {
          const data = JSON.parse(e.newValue);
          if (data.type === "LOGOUT") {
            clearAppJwt();
            currentUidRef.current = null;
            setUser(null);
            window.dispatchEvent(new Event("auth-state-changed"));
          } else if (data.type === "LOGIN") {
            if (auth.currentUser && auth.currentUser.emailVerified) {
              // Re-verify auth state if needed
              window.dispatchEvent(new Event("auth-state-changed"));
            }
          }
        } catch (err) {
          console.error("Error parsing auth sync event:", err);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    let active = true;
    let unsubscribeFirebase: (() => void) | null = null;

    const checkAuth = async () => {
      if (active) {
        unsubscribeFirebase = onAuthStateChanged(auth, async (firebaseUser) => {
          if (!active) return;

          if (firebaseUser) {
            // Only clear app JWT if switching users
            if (currentUidRef.current !== firebaseUser.uid) {
              clearAppJwt();
              currentUidRef.current = firebaseUser.uid;
            }

            if (authActionInProgress.current) {
              return;
            }

            if (!firebaseUser.emailVerified) {
              setUser(null);
              setLoading(false);
              return;
            }

            const isPasswordAuth = firebaseUser.providerData.some(
              (p) => p.providerId === "password",
            );

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
                });
              }
            } catch (err) {
              console.error("Error syncing user:", err);
            }
          } else {
            currentUidRef.current = null;
            clearAppJwt();
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
        loginWithApple,
        logout,
        resendVerificationEmail,
        checkVerificationStatus,
        resendVerificationForUnverifiedUser,
        sendPasswordReset,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
