import type { AuthModalMode } from "@/types/auth";

interface AuthConsentRowProps {
  mode: AuthModalMode;
  rememberMe: boolean;
  onRememberChange: (checked: boolean) => void;
}

export default function AuthConsentRow({
  mode,
  rememberMe,
  onRememberChange,
}: AuthConsentRowProps) {
  return (
    <div className="flex items-center justify-between pl-1 py-0.5">
      {mode === "login" ? (
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => onRememberChange(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
          />
          <span className="text-xs font-bold text-slate-500">Remember me</span>
        </label>
      ) : (
        <p className="text-[10px] text-slate-400 leading-normal font-medium">
          By creating an account, you agree to our{" "}
          <span className="text-blue-600 font-bold hover:underline cursor-pointer">
            Terms
          </span>{" "}
          and{" "}
          <span className="text-blue-600 font-bold hover:underline cursor-pointer">
            Privacy
          </span>
          .
        </p>
      )}
    </div>
  );
}
