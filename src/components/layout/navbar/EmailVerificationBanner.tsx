interface EmailVerificationBannerProps {
  resending: boolean;
  resent: boolean;
  resendError: string;
  onResend: () => void;
}

export default function EmailVerificationBanner({
  resending,
  resent,
  resendError,
  onResend,
}: EmailVerificationBannerProps) {
  return (
    <div className="bg-[#3b5bdb] text-white text-[13px] font-semibold py-2.5 px-4 flex items-center justify-center gap-2 select-none w-full relative z-[60] text-center flex-wrap">
      <span>Please verify your email address to secure your account.</span>
      <button
        onClick={onResend}
        disabled={resending}
        className="underline hover:opacity-90 font-bold ml-2 cursor-pointer disabled:opacity-50"
      >
        {resending ? "Sending..." : "Resend link"}
      </button>
      {resent && (
        <span className="text-emerald-300 font-bold ml-2">
          ✓ Verification email sent!
        </span>
      )}
      {resendError && (
        <span className="text-rose-300 font-bold ml-2">⚠️ {resendError}</span>
      )}
    </div>
  );
}
