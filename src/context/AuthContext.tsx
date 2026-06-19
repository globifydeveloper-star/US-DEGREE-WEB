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
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { exchangeIdToken, fetchMe, patchProfile } from "@/lib/auth/api";
import { clearAppJwt } from "@/lib/auth/tokenStore";

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

/**
 * Establish a backend session for a signed-in Firebase user and build the
 * AuthUser. Exchanges the Firebase ID token for an app JWT (which also creates
 * the backend `usdusers` row on first login, from the verified token only),
 * then loads identity from GET /auth/me. Falls back to Firebase data if the
 * backend lookup fails so the UI still renders.
 *
 * Note: identity (uid/email) is never POSTed for the backend to trust — that
 * trusted-identity anti-pattern was removed (auth spec §2 non-negotiable #2).
 *
 * `forceFreshToken` forces a fresh Firebase ID token before the exchange. Needed
 * right after signup: createUser mints a token before updateProfile runs, so the
 * cached token's `name` claim is empty — a forced refresh bakes the just-set
 * displayName into the token the backend verifies.
 */
async function buildAuthUser(
  firebaseUser: FirebaseUser,
  forceFreshToken = false,
): Promise<AuthUser> {
  const isPasswordAuth = firebaseUser.providerData.some(
    (p) => p.providerId === "password",
  );

  // Exchange Firebase ID token -> app JWT (stored in memory for later calls).
  await exchangeIdToken(forceFreshToken);

  let me: Record<string, unknown> = {};
  try {
    me = await fetchMe<Record<string, unknown>>();
  } catch (err) {
    console.error("Failed to load account from backend:", err);
  }

  return {
    id: typeof me.id === "number" ? me.id : undefined,
    displayName: (me.display_name as string) ?? firebaseUser.displayName,
    email: (me.email as string) ?? firebaseUser.email,
    photoURL: (me.profile_image as string) ?? firebaseUser.photoURL,
    role: (me.role as string) ?? undefined,
    authProvider: isPasswordAuth ? "credentials" : "firebase",
    emailVerified: firebaseUser.emailVerified,
    createdAt: (me.created_at as string) ?? null,
    lastLogin: (me.last_login as string) ?? null,
  };
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

  const login = async (
    email: string,
    password: string,
    rememberMe = true,
  ): Promise<AuthUser> => {
    // "Remember me" persists the Firebase session across browser restarts;
    // otherwise it lasts only for the tab session. Set before sign-in.
    await setPersistence(
      auth,
      rememberMe ? browserLocalPersistence : browserSessionPersistence,
    );
    const credential = await signInWithEmailAndPassword(auth, email, password);
    // Exchange the Firebase ID token for the app JWT and load the backend
    // profile — no identity is POSTed for the backend to trust.
    const mappedUser = await buildAuthUser(credential.user);
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
    // Signup happens entirely in Firebase — there is no backend signup endpoint.
    const credential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    // Set the display name BEFORE the token is minted so its `name` claim
    // carries the user's typed name (the backend reads identity from the token).
    await updateProfile(credential.user, { displayName });
    await sendEmailVerification(credential.user);

    // First /auth/login creates the backend row from the verified token.
    // Force a fresh token so the just-set displayName is in its `name` claim.
    const mappedUser = await buildAuthUser(credential.user, true);

    // Persist the chosen role (parent/student) as a profile field. Best-effort:
    // it is a non-email profile field, so it goes through PATCH /profile.
    if (role && mappedUser.role !== role) {
      try {
        const updated = await patchProfile<Record<string, unknown>>({ role });
        mappedUser.role = (updated.role as string) ?? role;
      } catch (err) {
        console.error("Failed to set role during signup:", err);
        mappedUser.role = role;
      }
    }

    setUser(mappedUser);
    window.dispatchEvent(new Event("auth-state-changed"));
    return mappedUser;
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
    clearAppJwt();
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
        // Re-exchange a fresh Firebase token so the backend sees the now-verified
        // state on the next /auth/login (it mirrors identity from the token —
        // no identity is POSTed for it to trust).
        try {
          await exchangeIdToken(true);
        } catch (e) {
          console.error("Re-exchange after verification failed:", e);
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
            // On (re)load, re-establish the backend session by exchanging a
            // fresh Firebase token for an app JWT and loading the profile.
            try {
              const mapped = await buildAuthUser(firebaseUser);
              if (active) setUser(mapped);
            } catch (err) {
              console.error("Error establishing session:", err);
              if (active) setUser(null);
            }
          } else {
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
