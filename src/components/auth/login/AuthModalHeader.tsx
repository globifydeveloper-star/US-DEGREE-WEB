import { Lock, GraduationCap } from "lucide-react";
import type { AuthModalMode } from "@/types/auth";

interface AuthModalHeaderProps {
  mode: AuthModalMode;
}

export default function AuthModalHeader({ mode }: AuthModalHeaderProps) {
  return (
    <div className="mb-5 text-center">
      <div className="inline-flex w-12 h-12 rounded-2xl bg-blue-600 items-center justify-center text-white mb-3 shadow-lg shadow-blue-500/20">
        {mode === "forgot_password" ? (
          <Lock className="w-7 h-7" />
        ) : (
          <GraduationCap className="w-7 h-7" />
        )}
      </div>
      <h2 className="text-2xl font-black font-['Lexend'] text-slate-900 tracking-tight leading-none mb-1.5">
        {mode === "forgot_password"
          ? "Reset Password"
          : mode === "login"
            ? "Welcome Back"
            : "Create Account"}
      </h2>
      <p className="text-xs font-semibold text-slate-400">
        {mode === "forgot_password"
          ? "Enter your email to receive a password reset link."
          : mode === "login"
            ? "Sign in to save your universities & details."
            : "Join us to discover your path to a US degree."}
      </p>
    </div>
  );
}
