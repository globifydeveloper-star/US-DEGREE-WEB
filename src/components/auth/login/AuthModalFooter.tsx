import type { AuthModalMode } from "@/types/auth";

interface AuthModalFooterProps {
  mode: AuthModalMode;
  onSelect: (mode: "login" | "signup") => void;
}

export default function AuthModalFooter({ mode, onSelect }: AuthModalFooterProps) {
  return (
    <div className="text-center mt-5">
      <p className="text-xs font-semibold text-slate-500">
        {mode === "login" ? (
          <>
            Dont have an account?{" "}
            <button
              type="button"
              onClick={() => onSelect("signup")}
              className="font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
            >
              Register now
            </button>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => onSelect("login")}
              className="font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
            >
              Sign in
            </button>
          </>
        )}
      </p>
    </div>
  );
}
