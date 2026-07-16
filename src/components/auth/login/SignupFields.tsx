import { Mail, Lock, User } from "lucide-react";

import AuthField from "./AuthField";
import type { AuthFormState } from "./useAuthForm";

interface SignupFieldsProps {
  form: AuthFormState;
}

export default function SignupFields({ form }: SignupFieldsProps) {
  const clearAnd = (setter: (v: string) => void) => (value: string) => {
    setter(value);
    form.setError("");
  };

  return (
    <>
      {/* Full Name & Email (Side-by-Side) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
        <AuthField
          id="name-field"
          label="Full Name"
          type="text"
          value={form.name}
          onChange={clearAnd(form.setName)}
          placeholder="John Doe"
          icon={User}
          variant="compact"
        />
        <AuthField
          id="email-field"
          label="Email"
          type="email"
          value={form.email}
          onChange={clearAnd(form.setEmail)}
          placeholder="email@example.com"
          icon={Mail}
          variant="compact"
        />
      </div>

      {/* Password & Confirm Password (Side-by-Side) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
        <AuthField
          id="password-field"
          label="Password"
          type={form.showPassword ? "text" : "password"}
          value={form.password}
          onChange={clearAnd(form.setPassword)}
          placeholder="••••••••"
          icon={Lock}
          variant="compact"
          toggle={{
            visible: form.showPassword,
            onToggle: () => form.setShowPassword(!form.showPassword),
          }}
        />
        <AuthField
          id="confirm-password-field"
          label="Confirm"
          type={form.showConfirmPassword ? "text" : "password"}
          value={form.confirmPassword}
          onChange={clearAnd(form.setConfirmPassword)}
          placeholder="••••••••"
          icon={Lock}
          variant="compact"
          toggle={{
            visible: form.showConfirmPassword,
            onToggle: () => form.setShowConfirmPassword(!form.showConfirmPassword),
          }}
        />
      </div>

      {/* Role Checkbox (Parent/Student) */}
      <div className="flex items-center gap-2 pl-1 select-none py-1">
        <input
          id="role-checkbox"
          type="checkbox"
          checked={form.isParent}
          onChange={(e) => form.setIsParent(e.target.checked)}
          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
        />
        <label
          htmlFor="role-checkbox"
          className="text-xs font-bold text-slate-500 cursor-pointer"
        >
          I am a parent signing up for my child
        </label>
      </div>

      {/* Age Consent Checkbox */}
      <div className="flex items-center gap-2 pl-1 select-none py-1">
        <input
          id="age-consent-checkbox"
          type="checkbox"
          checked={form.ageConsent}
          onChange={(e) => {
            form.setAgeConsent(e.target.checked);
            form.setError("");
          }}
          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
        />
        <label
          htmlFor="age-consent-checkbox"
          className="text-xs font-bold text-slate-500 cursor-pointer"
        >
          I confirm that I am 18 years of age or older
        </label>
      </div>
    </>
  );
}
