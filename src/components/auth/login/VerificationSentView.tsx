import { Mail, ArrowRight } from "lucide-react";

import AuthModalShell from "./AuthModalShell";
import type { AuthFormState } from "./useAuthForm";

interface VerificationSentViewProps {
  form: AuthFormState;
  onClose: () => void;
}

export default function VerificationSentView({
  form,
  onClose,
}: VerificationSentViewProps) {
  return (
    <AuthModalShell
      modalRef={form.modalRef}
      onOverlayClick={form.handleOverlayClick}
      onClose={onClose}
      centered
    >
      <div className="my-6 flex flex-col items-center">
        <div className="inline-flex w-16 h-16 rounded-3xl bg-blue-50 items-center justify-center text-blue-600 mb-4 shadow-inner">
          <Mail className="w-8 h-8 animate-bounce" />
        </div>
        <h2 className="text-2xl font-black font-['Lexend'] text-slate-900 tracking-tight leading-none mb-3">
          Verify Your Email
        </h2>
        <p className="text-sm font-semibold text-slate-500 max-w-[320px] leading-relaxed mb-6">
          We have sent a verification link to{" "}
          <span className="text-blue-600 font-bold">
            {form.verificationEmail}
          </span>
          . Please check your Gmail inbox and verify your account to log in.
        </p>

        <button
          onClick={() => {
            form.setIsVerificationSent(false);
            form.setMode("login");
          }}
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 active:scale-99 text-white font-extrabold text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/15 cursor-pointer"
        >
          Back to Sign In <ArrowRight className="w-4 h-4" />
        </button>

        <div className="mt-6 text-xs font-semibold text-slate-400">
          Didnt receive the email?{" "}
          <button
            type="button"
            onClick={form.handleResendVerification}
            disabled={form.isResending}
            className="font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer disabled:opacity-50"
          >
            {form.isResending ? "Sending..." : "Resend verification email"}
          </button>
        </div>
        {form.resendStatus && (
          <p
            className={`mt-3 text-xs font-bold ${form.resendStatus.includes("successfully") ? "text-emerald-600" : "text-rose-600"}`}
          >
            {form.resendStatus}
          </p>
        )}
      </div>
    </AuthModalShell>
  );
}
