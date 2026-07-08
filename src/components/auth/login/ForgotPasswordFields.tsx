import { Mail, ArrowRight } from "lucide-react";

import AuthField from "./AuthField";
import type { AuthFormState } from "./useAuthForm";

interface ForgotPasswordFieldsProps {
  form: AuthFormState;
}

export default function ForgotPasswordFields({
  form,
}: ForgotPasswordFieldsProps) {
  if (form.resetSent) {
    return (
      <div className="my-4 text-center">
        <div className="inline-flex w-16 h-16 rounded-3xl bg-emerald-50 items-center justify-center text-emerald-600 mb-4 shadow-inner">
          <Mail className="w-8 h-8 animate-pulse" />
        </div>
        <h3 className="text-lg font-black text-slate-900 mb-2">
          Check Your Email
        </h3>
        <p className="text-xs font-semibold text-slate-500 max-w-[280px] mx-auto leading-relaxed mb-6">
          We have sent a password reset link to{" "}
          <span className="text-blue-600 font-bold">{form.email}</span>. Please
          check your inbox and follow the instructions to reset your password.
        </p>
        <button
          type="button"
          onClick={() => {
            form.setResetSent(false);
            form.setMode("login");
            form.setError("");
          }}
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 active:scale-99 text-white font-extrabold text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/15 cursor-pointer"
        >
          Back to Sign In
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Email (Stacked) */}
      <AuthField
        id="email-field"
        label="Email"
        type="email"
        value={form.email}
        onChange={(value) => {
          form.setEmail(value);
          form.setError("");
        }}
        placeholder="email@example.com"
        icon={Mail}
        variant="roomy"
        wrapperClassName="space-y-1 mb-4"
      />

      <button
        type="submit"
        disabled={form.isLoading}
        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 active:scale-99 disabled:opacity-50 text-white font-extrabold text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/15 mt-3 cursor-pointer"
      >
        {form.isLoading ? "Sending Link..." : "Send Reset Link"}{" "}
        <ArrowRight className="w-4 h-4" />
      </button>

      <div className="text-center mt-5">
        <button
          type="button"
          onClick={() => {
            form.setMode("login");
            form.setError("");
          }}
          className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
        >
          Back to Sign In
        </button>
      </div>
    </>
  );
}
