interface AuthButtonsProps {
  onSignIn: () => void;
  onSignUp: () => void;
}

export default function AuthButtons({ onSignIn, onSignUp }: AuthButtonsProps) {
  return (
    <>
      <button
        onClick={onSignIn}
        className="hidden sm:inline text-[16px] font-medium text-[#4b5563] hover:text-[#2b55ff] transition-colors cursor-pointer"
      >
        Sign In
      </button>
      <button
        onClick={onSignUp}
        className="hidden sm:inline-flex bg-[#3b5bdb] hover:bg-[#364fc7] text-white px-6 sm:px-8 py-2.5 rounded-full text-[15px] font-semibold transition-colors shadow-md cursor-pointer"
      >
        Get Started
      </button>
    </>
  );
}
