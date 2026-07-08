import type { AuthModalMode } from "@/types/auth";

interface AuthModeTabsProps {
  mode: AuthModalMode;
  onSelect: (mode: "login" | "signup") => void;
}

export default function AuthModeTabs({ mode, onSelect }: AuthModeTabsProps) {
  return (
    <div className="flex bg-slate-100 p-1 rounded-xl mb-5 text-xs font-bold text-slate-500">
      <button
        type="button"
        onClick={() => onSelect("login")}
        className={`flex-1 py-2.5 rounded-lg transition-all cursor-pointer ${mode === "login" ? "bg-white text-blue-600 shadow-sm" : "hover:text-slate-900"}`}
      >
        Sign In
      </button>
      <button
        type="button"
        onClick={() => onSelect("signup")}
        className={`flex-1 py-2.5 rounded-lg transition-all cursor-pointer ${mode === "signup" ? "bg-white text-blue-600 shadow-sm" : "hover:text-slate-900"}`}
      >
        Create Account
      </button>
    </div>
  );
}
