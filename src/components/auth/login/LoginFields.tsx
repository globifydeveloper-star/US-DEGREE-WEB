import { Mail, Lock } from "lucide-react";

import AuthField from "./AuthField";
import type { AuthFormState } from "./useAuthForm";

interface LoginFieldsProps {
  form: AuthFormState;
}

export default function LoginFields({ form }: LoginFieldsProps) {
  const clearAnd = (setter: (v: string) => void) => (value: string) => {
    setter(value);
    form.setError("");
  };

  const passwordLabel = (
    <div className="flex justify-between items-center px-1">
      <label
        htmlFor="password-field"
        className="text-[11px] font-bold text-slate-500 uppercase tracking-wider"
      >
        Password
      </label>
      <button
        type="button"
        onClick={() => {
          form.setMode("forgot_password");
          form.setError("");
          form.setResetSent(false);
        }}
        className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
      >
        Forgot?
      </button>
    </div>
  );

  return (
    <>
      {/* Email (Stacked) */}
      <AuthField
        id="email-field"
        label="Email"
        type="email"
        value={form.email}
        onChange={clearAnd(form.setEmail)}
        placeholder="email@example.com"
        icon={Mail}
        variant="roomy"
      />

      {/* Password (Stacked) */}
      <AuthField
        id="password-field"
        label="Password"
        type={form.showPassword ? "text" : "password"}
        value={form.password}
        onChange={clearAnd(form.setPassword)}
        placeholder="••••••••"
        icon={Lock}
        variant="roomy"
        labelSlot={passwordLabel}
        toggle={{
          visible: form.showPassword,
          onToggle: () => form.setShowPassword(!form.showPassword),
        }}
      />
    </>
  );
}
