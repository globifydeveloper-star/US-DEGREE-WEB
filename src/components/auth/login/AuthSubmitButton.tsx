import { ArrowRight } from "lucide-react";
import type { AuthModalMode } from "@/types/auth";

interface AuthSubmitButtonProps {
  mode: AuthModalMode;
  isLoading: boolean;
}

export default function AuthSubmitButton({
  mode,
  isLoading,
}: AuthSubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={isLoading}
      className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 active:scale-99 disabled:opacity-50 text-white font-extrabold text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/15 mt-3 cursor-pointer"
    >
      {isLoading ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Processing...
        </>
      ) : (
        <>
          {mode === "login" ? "Sign In" : "Create Account"}{" "}
          <ArrowRight className="w-4 h-4" />
        </>
      )}
    </button>
  );
}
