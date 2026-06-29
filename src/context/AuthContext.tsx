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
  sendPasswordResetEmail
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
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

interface AuthContextType {
    user: AuthUser | null;
    loading: boolean;
    login: (email: string, password: string, rememberMe?: boolean) => Promise<AuthUser>;
    signup: (email: string, password: string, displayName: string, role?: string) => Promise<AuthUser>;
    loginWithGoogle: () => Promise<FirebaseUser>;
    logout: () => Promise<void>;
    resendVerificationEmail: () => Promise<void>;
    checkVerificationStatus: () => Promise<boolean>;
    resendVerificationForUnverifiedUser: (email: string, password: string) => Promise<void>;
    sendPasswordReset: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    login: async () => { throw new Error("AuthContext not initialized"); },
    signup: async () => { throw new Error("AuthContext not initialized"); },
    loginWithGoogle: async () => { throw new Error("AuthContext not initialized"); },
    logout: async () => {},
    resendVerificationEmail: async () => {},
    checkVerificationStatus: async () => false,
    resendVerificationForUnverifiedUser: async () => {},
    sendPasswordReset: async () => {}
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);
    const authActionInProgress = useRef(false);

    const getActionCodeSettings = () => {
        return {
            url: typeof window !== 'undefined' ? window.location.origin : 'https://usdegrees.web.app',
            handleCodeInApp: false
        };
    };

    // Ask the backend whether an email may register/sign in right now, or is
    // still within the 24h post-deactivation cooldown. Failures fail-open so a
    // backend hiccup never blocks a legitimate login.
    const checkEmailAvailability = async (
        email: string
    ): Promise<{ available: boolean; eligibleAt?: string }> => {
        try {
            const res = await fetch(
                `/api/proxy/account/availability?email=${encodeURIComponent(email.toLowerCase().trim())}`
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
            `You recently deactivated an account with this email. You can register again after ${when}.`
        );
    };

    const login = async (email: string, password: string, rememberMe = false): Promise<AuthUser> => {
        authActionInProgress.current = true;
        try {
            // Drop any app JWT minted for a previously signed-in user, so the
            // backend never resolves this session to the wrong account.
            clearAppJwt();

            // Persist the session across browser restarts only when "Remember me" is checked.
            await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);

            let credential;
            try {
                credential = await signInWithEmailAndPassword(auth, email, password);
            } catch (err) {
                // A recently deactivated account no longer exists in Firebase, so
                // login fails generically. Surface the 24h cooldown message instead.
                const avail = await checkEmailAvailability(email);
                if (!avail.available) throw cooldownError(avail.eligibleAt);
                throw err;
            }
            
            if (!credential.user.emailVerified) {
                throw new Error("EMAIL_NOT_VERIFIED");
            }
            
            // Sync/load user from Postgres DB via proxy /user
            const res = await fetch('/api/proxy/user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: credential.user.email,
                    display_name: credential.user.displayName,
                    auth_provider: 'credentials',
                    email_verified: credential.user.emailVerified,
                    provider_user_id: credential.user.uid
                })
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
                authProvider: 'credentials',
                emailVerified: credential.user.emailVerified
            };
            setUser(mappedUser);
            window.dispatchEvent(new Event('auth-state-changed'));
            return mappedUser;
        } finally {
            authActionInProgress.current = false;
        }
    };

    const signup = async (email: string, password: string, displayName: string, role?: string): Promise<AuthUser> => {
        authActionInProgress.current = true;
        try {
            // Drop any app JWT from a previously signed-in user before switching.
            clearAppJwt();

            // Block re-registration while the email is inside its deactivation
            // cooldown — checked before creating any Firebase user.
            const avail = await checkEmailAvailability(email);
            if (!avail.available) throw cooldownError(avail.eligibleAt);

            const credential = await createUserWithEmailAndPassword(auth, email, password);
            
            if (credential.user) {
                await updateProfile(credential.user, { displayName });
                await sendEmailVerification(credential.user, getActionCodeSettings());
                
                // Create user in Postgres DB (with email_verified = false initially)
                try {
                    await fetch('/api/proxy/user', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            email: email.toLowerCase().trim(),
                            display_name: displayName.trim(),
                            auth_provider: 'credentials',
                            role: role || 'student',
                            email_verified: false,
                            provider_user_id: credential.user.uid
                        })
                    });
                } catch (err) {
                    console.error("Postgres user creation error during signup:", err);
                }
            }
            // Always throw EMAIL_NOT_VERIFIED so that the user starts in a non-logged-in verification pending state
            throw new Error("EMAIL_NOT_VERIFIED");
        } finally {
            authActionInProgress.current = false;
        }
    };

    const loginWithGoogle = async (): Promise<FirebaseUser> => {
        // Drop any app JWT from a previously signed-in user before switching.
        clearAppJwt();
        const result = await signInWithPopup(auth, googleProvider);
        return result.user;
    };

    const logout = async (): Promise<void> => {
        // Clear the backend app JWT so the next user can't inherit this session.
        clearAppJwt();
        try {
            await signOut(auth);
        } catch (err) {
            console.error("Firebase signOut error:", err);
        }
        setUser(null);
        window.dispatchEvent(new Event('auth-state-changed'));
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
                // Sync verification with Postgres DB
                try {
                    const res = await fetch('/api/proxy/user', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            email: auth.currentUser.email,
                            display_name: auth.currentUser.displayName,
                            profile_image: auth.currentUser.photoURL,
                            auth_provider: auth.currentUser.providerData.some(p => p.providerId === 'password') ? 'credentials' : 'google',
                            email_verified: true,
                            provider_user_id: auth.currentUser.uid
                        })
                    });
                    if (res.ok) {
                        dbUser = await res.json();
                    }
                } catch (e) {
                    console.error("Sync verified status with database failed:", e);
                }
                
                // Set user context
                const mappedUser: AuthUser = {
                    id: dbUser?.id,
                    displayName: dbUser?.display_name || auth.currentUser.displayName,
                    email: dbUser?.email || auth.currentUser.email,
                    photoURL: dbUser?.profile_image || auth.currentUser.photoURL,
                    role: dbUser?.role || 'student',
                    authProvider: auth.currentUser.providerData.some(p => p.providerId === 'password') ? 'credentials' : 'firebase',
                    emailVerified: true
                };
                setUser(mappedUser);
                window.dispatchEvent(new Event('auth-state-changed'));
            }
            return verified;
        }
        return false;
    };

    const resendVerificationForUnverifiedUser = async (email: string, password: string): Promise<void> => {
        authActionInProgress.current = true;
        try {
            const credential = await signInWithEmailAndPassword(auth, email, password);
            await sendEmailVerification(credential.user, getActionCodeSettings());
        } finally {
            authActionInProgress.current = false;
        }
    };

    const sendPasswordReset = async (email: string): Promise<void> => {
        await sendPasswordResetEmail(auth, email);
    };

    useEffect(() => {
        let active = true;
        let unsubscribeFirebase: (() => void) | null = null;

        const checkAuth = async () => {
            if (active) {
                unsubscribeFirebase = onAuthStateChanged(auth, async (firebaseUser) => {
                    if (!active) return;
                    // The signed-in identity may have changed — drop any app JWT
                    // so authedFetch re-mints one for whoever is now current.
                    clearAppJwt();
                    if (firebaseUser) {
                        if (authActionInProgress.current) {
                            return;
                        }

                        if (!firebaseUser.emailVerified) {
                            setUser(null);
                            setLoading(false);
                            return;
                        }

                        const isPasswordAuth = firebaseUser.providerData.some(p => p.providerId === 'password');
                        
                        // Load/Sync profile from Postgres (via POST /user)
                        try {
                            const res = await fetch('/api/proxy/user', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    email: firebaseUser.email,
                                    display_name: firebaseUser.displayName,
                                    profile_image: firebaseUser.photoURL,
                                    auth_provider: isPasswordAuth ? 'credentials' : 'google',
                                    email_verified: firebaseUser.emailVerified,
                                    provider_user_id: firebaseUser.uid
                                })
                            });
                            if (res.ok && active) {
                                const dbUser = await res.json();
                                setUser({
                                    id: dbUser.id,
                                    displayName: dbUser.display_name,
                                    email: dbUser.email,
                                    photoURL: dbUser.profile_image,
                                    role: dbUser.role,
                                    authProvider: isPasswordAuth ? 'credentials' : 'firebase',
                                    emailVerified: firebaseUser.emailVerified
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
        <AuthContext.Provider value={{ 
            user, 
            loading, 
            login, 
            signup, 
            loginWithGoogle, 
            logout,
            resendVerificationEmail,
            checkVerificationStatus,
            resendVerificationForUnverifiedUser,
            sendPasswordReset
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
