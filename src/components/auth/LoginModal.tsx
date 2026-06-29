"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  X,
  GraduationCap,
  User,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface LoginModalProps {
  isOpen: boolean;
  initialMode?: "login" | "signup";
  onClose: () => void;
  onSuccess: (email: string) => void;
}

export default function LoginModal({ isOpen, initialMode = 'login', onClose, onSuccess }: LoginModalProps) {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot_password'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isParent, setIsParent] = useState(false);
  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const { login, signup, loginWithGoogle, resendVerificationForUnverifiedUser, checkVerificationStatus, sendPasswordReset } = useAuth();
  const modalRef = useRef<HTMLDivElement>(null);

  // Reset the form to a clean state whenever the modal transitions to open.
  // Done during render (not in an effect) to avoid cascading re-renders.
  const [wasOpen, setWasOpen] = useState(false);
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) {
      setMode(initialMode);
      setError("");
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setIsParent(false);
      setIsVerificationSent(false);
      setVerificationEmail('');
      setIsResending(false);
      setResendStatus('');
      setResetSent(false);
    }
  }

  // Poll verification status if pending verification
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isOpen && isVerificationSent) {
      interval = setInterval(async () => {
        try {
          const verified = await checkVerificationStatus();
          if (verified) {
            onSuccess(verificationEmail);
            onClose();
          }
        } catch (e) {
          console.error("Error checking verification status:", e);
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isOpen, isVerificationSent, checkVerificationStatus, verificationEmail, onSuccess, onClose]);

  // Close on Esc key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const cleanEmail = email.trim();
    const cleanName = name.trim();

    if (mode === 'forgot_password') {
      if (!cleanEmail) {
        setError('Email address is required');
        return;
      }
      if (!/\S+@\S+\.\S+/.test(cleanEmail)) {
        setError('Please enter a valid email address');
        return;
      }
      setIsLoading(true);
      try {
        await sendPasswordReset(cleanEmail);
        setResetSent(true);
      } catch (err) {
        setError(getFriendlyErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Common Validation
    if (mode === "signup" && !cleanName) {
      setError("Full Name is required");
      return;
    }
    if (!cleanEmail) {
      setError("Email address is required");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(cleanEmail)) {
      setError("Please enter a valid email address");
      return;
    }
    if (!password) {
      setError("Password is required");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (mode === "signup" && password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      if (mode === 'login') {
        await login(cleanEmail, password, rememberMe);
        onSuccess(cleanEmail);
        onClose();
      } else {
        await signup(cleanEmail, password, cleanName, isParent ? "parent" : "student");
      }
    } catch (err) {
      if (err instanceof Error && err.message === 'EMAIL_NOT_VERIFIED') {
        setVerificationEmail(cleanEmail);
        setIsVerificationSent(true);
      } else {
        setError(getFriendlyErrorMessage(err));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getFriendlyErrorMessage = (error: unknown): string => {
    const err = error as { code?: string; message?: string } | null;
    const code = err?.code || err?.message || "";
    if (code.includes("auth/email-already-in-use")) {
      return "This email address is already in use by another account.";
    }
    if (code.includes("auth/invalid-email")) {
      return "Please enter a valid email address.";
    }
    if (code.includes("auth/weak-password")) {
      return "The password must be at least 6 characters.";
    }
    if (
      code.includes("auth/user-not-found") ||
      code.includes("auth/wrong-password") ||
      code.includes("auth/invalid-credential")
    ) {
      return "Invalid email address or password.";
    }
    if (code.includes("auth/operation-not-allowed")) {
      return "Email/Password authentication is disabled in this project.";
    }
    if (code.includes("auth/too-many-requests")) {
      return "Too many failed login attempts. Please try again later.";
    }
    return err?.message || "Authentication failed. Please try again.";
  };

  const handleGoogleSignIn = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const firebaseUser = await loginWithGoogle();
      onSuccess(firebaseUser.email!);
      onClose();
    } catch (err) {
      setError(getFriendlyErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setIsResending(true);
    setResendStatus('');
    try {
      await resendVerificationForUnverifiedUser(verificationEmail, password);
      setResendStatus('Verification email resent successfully!');
    } catch (err) {
      setResendStatus(getFriendlyErrorMessage(err));
    } finally {
      setIsResending(false);
    }
  };

  if (isVerificationSent) {
    return (
      <div
        onClick={handleOverlayClick}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md px-4 py-6 overflow-y-auto animate-fade-in"
      >
        <div
          ref={modalRef}
          className="w-full max-w-[480px] bg-white rounded-[24px] sm:rounded-[32px] border border-gray-100 shadow-2xl p-5 sm:p-6 md:p-8 relative my-auto overflow-hidden animate-scale-up select-none font-['Poppins'] text-center"
        >
          {/* Decorative corner element */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -z-10"></div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 active:scale-90 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="my-6 flex flex-col items-center">
            <div className="inline-flex w-16 h-16 rounded-3xl bg-blue-50 items-center justify-center text-blue-600 mb-4 shadow-inner">
              <Mail className="w-8 h-8 animate-bounce" />
            </div>
            <h2 className="text-2xl font-black font-['Lexend'] text-slate-900 tracking-tight leading-none mb-3">
              Verify Your Email
            </h2>
            <p className="text-sm font-semibold text-slate-500 max-w-[320px] leading-relaxed mb-6">
              We have sent a verification link to <span className="text-blue-600 font-bold">{verificationEmail}</span>. Please check your Gmail inbox and verify your account to log in.
            </p>
            
            <button
              onClick={() => {
                setIsVerificationSent(false);
                setMode('login');
              }}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 active:scale-99 text-white font-extrabold text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/15 cursor-pointer"
            >
              Back to Sign In <ArrowRight className="w-4 h-4" />
            </button>

            <div className="mt-6 text-xs font-semibold text-slate-400">
              Didnt receive the email?{' '}
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={isResending}
                className="font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer disabled:opacity-50"
              >
                {isResending ? 'Sending...' : 'Resend verification email'}
              </button>
            </div>
            {resendStatus && (
              <p className={`mt-3 text-xs font-bold ${resendStatus.includes('successfully') ? 'text-emerald-600' : 'text-rose-600'}`}>
                {resendStatus}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={handleOverlayClick}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md px-4 py-6 overflow-y-auto animate-fade-in"
    >
      {/* Modal Container */}
      <div
        ref={modalRef}
        className="w-full max-w-[480px] bg-white rounded-[24px] sm:rounded-[32px] border border-gray-100 shadow-2xl p-5 sm:p-6 md:p-8 relative my-auto overflow-hidden animate-scale-up select-none font-['Poppins']"
      >
        {/* Decorative corner element */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -z-10"></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 active:scale-90 transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Logo & Tabs */}
        <div className="mb-5 text-center">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-blue-600 items-center justify-center text-white mb-3 shadow-lg shadow-blue-500/20">
            {mode === 'forgot_password' ? <Lock className="w-7 h-7" /> : <GraduationCap className="w-7 h-7" />}
          </div>
          <h2 className="text-2xl font-black font-['Lexend'] text-slate-900 tracking-tight leading-none mb-1.5">
            {mode === 'forgot_password' ? 'Reset Password' : mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-xs font-semibold text-slate-400">
            {mode === 'forgot_password' ? 'Enter your email to receive a password reset link.' : mode === 'login' ? 'Sign in to save your universities & details.' : 'Join us to discover your path to a US degree.'}
          </p>
        </div>

        {/* Mode Toggler Tabs */}
        {mode !== 'forgot_password' && (
          <div className="flex bg-slate-100 p-1 rounded-xl mb-5 text-xs font-bold text-slate-500">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 py-2.5 rounded-lg transition-all cursor-pointer ${mode === 'login' ? 'bg-white text-blue-600 shadow-sm' : 'hover:text-slate-900'}`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(''); }}
              className={`flex-1 py-2.5 rounded-lg transition-all cursor-pointer ${mode === 'signup' ? 'bg-white text-blue-600 shadow-sm' : 'hover:text-slate-900'}`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Social logins */}
        {mode !== 'forgot_password' && (
          <>
            <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-5">
              <button
                type="button" onClick={handleGoogleSignIn}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 active:scale-98 transition-all text-xs font-bold text-slate-600 cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span className="hidden sm:inline">Google</span>
              </button>
              <button
                type="button"
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 active:scale-98 transition-all text-xs font-bold text-slate-600 cursor-pointer"
              >
                <svg className="w-4 h-4 fill-current text-slate-700" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.21.67-2.93 1.49-.62.69-1.16 1.84-1.01 2.96 1.1.09 2.23-.58 2.95-1.39z" />
                </svg>
                <span className="hidden sm:inline">Apple</span>
              </button>
              <button
                type="button"
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 active:scale-98 transition-all text-xs font-bold text-slate-600 cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 23 23">
                  <path fill="#F25022" d="M1 1h10v10H1z" />
                  <path fill="#7FBA00" d="M12 1h10v10H12z" />
                  <path fill="#00A4EF" d="M1 12h10v10H1z" />
                  <path fill="#FFB900" d="M12 12h10v10H12z" />
                </svg>
                <span className="hidden sm:inline">Microsoft</span>
              </button>
            </div>

            <div className="relative flex py-1 items-center mb-4">
              <div className="flex-grow border-t border-slate-150"></div>
              <span className="flex-shrink mx-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Or continue with</span>
              <div className="flex-grow border-t border-slate-150"></div>
            </div>
          </>
        )}

        {/* Auth Form */}
        <form onSubmit={handleAuthSubmit} className="space-y-4">
          {error && (
            <div className="bg-rose-50 border border-rose-100 text-xs text-rose-600 font-bold px-4 py-2.5 rounded-xl flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0"></span>
              {error}
            </div>
          )}

          {/* Form Fields Section */}
          {mode === "signup" ? (
            <>
              {/* Full Name & Email (Side-by-Side) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
                <div className="space-y-1">
                  <label
                    htmlFor="name-field"
                    className="text-[11px] font-bold text-slate-500 uppercase tracking-wider pl-1"
                  >
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      id="name-field"
                      type="text"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        setError("");
                      }}
                      placeholder="John Doe"
                      className="w-full pl-9 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all shadow-inner-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="email-field"
                    className="text-[11px] font-bold text-slate-500 uppercase tracking-wider pl-1"
                  >
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      id="email-field"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError("");
                      }}
                      placeholder="email@example.com"
                      className="w-full pl-9 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all shadow-inner-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Password & Confirm Password (Side-by-Side) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
                <div className="space-y-1">
                  <label
                    htmlFor="password-field"
                    className="text-[11px] font-bold text-slate-500 uppercase tracking-wider pl-1"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="password-field"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError("");
                      }}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-8 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all shadow-inner-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="confirm-password-field"
                    className="text-[11px] font-bold text-slate-500 uppercase tracking-wider pl-1"
                  >
                    Confirm
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="confirm-password-field"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setError("");
                      }}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-8 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all shadow-inner-sm"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Role Checkbox (Parent/Student) */}
              <div className="flex items-center gap-2 pl-1 select-none py-1">
                <input
                  id="role-checkbox"
                  type="checkbox"
                  checked={isParent}
                  onChange={(e) => setIsParent(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <label
                  htmlFor="role-checkbox"
                  className="text-xs font-bold text-slate-500 cursor-pointer"
                >
                  I am a parent signing up for my child
                </label>
              </div>
            </>
          ) : mode === 'forgot_password' ? (
            <>
              {resetSent ? (
                <div className="my-4 text-center">
                  <div className="inline-flex w-16 h-16 rounded-3xl bg-emerald-50 items-center justify-center text-emerald-600 mb-4 shadow-inner">
                    <Mail className="w-8 h-8 animate-pulse" />
                  </div>
                  <h3 className="text-lg font-black text-slate-900 mb-2">Check Your Email</h3>
                  <p className="text-xs font-semibold text-slate-500 max-w-[280px] mx-auto leading-relaxed mb-6">
                    We have sent a password reset link to <span className="text-blue-600 font-bold">{email}</span>. Please check your inbox and follow the instructions to reset your password.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setResetSent(false);
                      setMode('login');
                      setError('');
                    }}
                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 active:scale-99 text-white font-extrabold text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/15 cursor-pointer"
                  >
                    Back to Sign In
                  </button>
                </div>
              ) : (
                <>
                  {/* Email (Stacked) */}
                  <div className="space-y-1 mb-4">
                    <label htmlFor="email-field" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider pl-1">Email</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        id="email-field"
                        type="email"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setError(''); }}
                        placeholder="email@example.com"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all shadow-inner-sm"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 active:scale-99 disabled:opacity-50 text-white font-extrabold text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/15 mt-3 cursor-pointer"
                  >
                    {isLoading ? 'Sending Link...' : 'Send Reset Link'} <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="text-center mt-5">
                    <button
                      type="button"
                      onClick={() => {
                        setMode('login');
                        setError('');
                      }}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                    >
                      Back to Sign In
                    </button>
                  </div>
                </>
              )}
            </>
          ) : (
            <>
              {/* Email (Stacked) */}
              <div className="space-y-1">
                <label
                  htmlFor="email-field"
                  className="text-[11px] font-bold text-slate-500 uppercase tracking-wider pl-1"
                >
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="email-field"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                    placeholder="email@example.com"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all shadow-inner-sm"
                  />
                </div>
              </div>

              {/* Password (Stacked) */}
              <div className="space-y-1">
                <div className="flex justify-between items-center px-1">
                  <label htmlFor="password-field" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Password</label>
                  <button 
                    type="button" 
                    onClick={() => { setMode('forgot_password'); setError(''); setResetSent(false); }}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                  >
                    Forgot?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="password-field"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                    }}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all shadow-inner-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Remember Me / Terms */}
          {mode !== 'forgot_password' && (
            <div className="flex items-center justify-between pl-1 py-0.5">
              {mode === 'login' ? (
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-slate-500">Remember me</span>
                </label>
              ) : (
                <p className="text-[10px] text-slate-400 leading-normal font-medium">
                  By creating an account, you agree to our{' '}
                  <span className="text-blue-600 font-bold hover:underline cursor-pointer">Terms</span> and{' '}
                  <span className="text-blue-600 font-bold hover:underline cursor-pointer">Privacy</span>.
                </p>
              )}
            </div>
          )}

          {/* Submit */}
          {mode !== 'forgot_password' && (
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 active:scale-99 disabled:opacity-50 text-white font-extrabold text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/15 mt-3 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  {mode === 'login' ? 'Sign In' : 'Create Account'} <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </form>

        {mode !== 'forgot_password' && (
          <div className="text-center mt-5">
            <p className="text-xs font-semibold text-slate-500">
              {mode === 'login' ? (
                <>
                  Dont have an account?{' '}
                  <button
                    type="button"
                    onClick={() => { setMode('signup'); setError(''); }}
                    className="font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                  >
                    Register now
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setError(''); }}
                    className="font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                  >
                    Sign in
                  </button>
                </>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
