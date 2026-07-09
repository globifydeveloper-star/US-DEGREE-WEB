import Link from "next/link";

import { NAV_LINKS } from "@/constants/navigation";
import CompareBadge from "./CompareBadge";

interface MobileNavMenuProps {
  isLoggedIn: boolean;
  compareCount: number;
  firstName: string;
  onClose: () => void;
  onSignIn: () => void;
  onSignUp: () => void;
  onSignOut: () => void;
}

export default function MobileNavMenu({
  isLoggedIn,
  compareCount,
  firstName,
  onClose,
  onSignIn,
  onSignUp,
  onSignOut,
}: MobileNavMenuProps) {
  return (
    <div className="absolute top-[70px] left-0 w-full bg-white border-b border-[#f0f2f5] shadow-lg lg:hidden flex flex-col p-6 gap-6 text-[#4b5563] font-medium animate-in slide-in-from-top-2 z-50">
      {NAV_LINKS.map((link) =>
        link.showCompareBadge ? (
          <Link
            key={link.href}
            href={link.href}
            onClick={onClose}
            className="flex items-center justify-between w-full"
          >
            <span>{link.label}</span>
            {isLoggedIn && compareCount > 0 && (
              <CompareBadge count={compareCount} />
            )}
          </Link>
        ) : (
          <Link key={link.href} href={link.href} onClick={onClose}>
            {link.label}
          </Link>
        ),
      )}
      <hr className="border-[#f0f2f5]" />
      {isLoggedIn ? (
        <>
          <span className="text-slate-600 font-semibold">Hi, {firstName}</span>
          <Link href="/profile" onClick={onClose}>
            My Profile
          </Link>
          <Link href="/profile#reports_section" onClick={onClose}>
            My Reports
          </Link>
          <button
            onClick={onSignOut}
            className="text-left text-[#f43f5e] font-semibold cursor-pointer"
          >
            Sign Out
          </button>
        </>
      ) : (
        <>
          <button
            onClick={onSignIn}
            className="text-left text-[16px] font-medium text-[#4b5563] hover:text-[#2b55ff] transition-colors cursor-pointer"
          >
            Sign In
          </button>
          <button
            onClick={onSignUp}
            className="text-left text-[#3b5bdb] font-semibold cursor-pointer"
          >
            Get Started
          </button>
        </>
      )}
    </div>
  );
}
