"use client";

import React, { useEffect, useRef, useState } from "react";

import { useAuth } from "@/context/AuthContext";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { useEscapeKey } from "@/hooks/useEscapeKey";
import { getFriendlyErrorMessage } from "@/lib/auth/authErrors";
import type { AuthMode, AuthModalMode } from "@/types/auth";

const EMAIL_REGEX = /\S+@\S+\.\S+/;
const VERIFICATION_POLL_INTERVAL_MS = 3000;

interface UseAuthFormParams {
  isOpen: boolean;
  initialMode: AuthMode;
  onClose: () => void;
  onSuccess: (email: string) => void;
}

export function useAuthForm({
  isOpen,
  initialMode,
  onClose,
  onSuccess,
}: UseAuthFormParams) {
  const [mode, setMode] = useState<AuthModalMode>(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isParent, setIsParent] = useState(false);
  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState("");
  const [resetSent, setResetSent] = useState(false);

  const {
    login,
    signup,
    loginWithGoogle,
    resendVerificationForUnverifiedUser,
    checkVerificationStatus,
    sendPasswordReset,
  } = useAuth();
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
      setVerificationEmail("");
      setIsResending(false);
      setResendStatus("");
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
      }, VERIFICATION_POLL_INTERVAL_MS);
    }
    return () => clearInterval(interval);
  }, [
    isOpen,
    isVerificationSent,
    checkVerificationStatus,
    verificationEmail,
    onSuccess,
    onClose,
  ]);

  useEscapeKey(isOpen, onClose);
  useBodyScrollLock(isOpen);

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

    if (mode === "forgot_password") {
      if (!cleanEmail) {
        setError("Email address is required");
        return;
      }
      if (!EMAIL_REGEX.test(cleanEmail)) {
        setError("Please enter a valid email address");
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
    if (!EMAIL_REGEX.test(cleanEmail)) {
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
      if (mode === "login") {
        await login(cleanEmail, password, rememberMe);
        onSuccess(cleanEmail);
        onClose();
      } else {
        await signup(
          cleanEmail,
          password,
          cleanName,
          isParent ? "parent" : "student",
        );
      }
    } catch (err) {
      if (err instanceof Error && err.message === "EMAIL_NOT_VERIFIED") {
        setVerificationEmail(cleanEmail);
        setIsVerificationSent(true);
      } else {
        setError(getFriendlyErrorMessage(err));
      }
    } finally {
      setIsLoading(false);
    }
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
    setResendStatus("");
    try {
      await resendVerificationForUnverifiedUser(verificationEmail, password);
      setResendStatus("Verification email resent successfully!");
    } catch (err) {
      setResendStatus(getFriendlyErrorMessage(err));
    } finally {
      setIsResending(false);
    }
  };

  return {
    mode,
    setMode,
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    error,
    setError,
    isLoading,
    rememberMe,
    setRememberMe,
    isParent,
    setIsParent,
    isVerificationSent,
    setIsVerificationSent,
    verificationEmail,
    isResending,
    resendStatus,
    resetSent,
    setResetSent,
    modalRef,
    handleOverlayClick,
    handleAuthSubmit,
    handleGoogleSignIn,
    handleResendVerification,
  };
}

export type AuthFormState = ReturnType<typeof useAuthForm>;
