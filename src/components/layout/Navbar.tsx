"use client";

import React, { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Dropdown, Avatar } from "antd";
import type { MenuProps } from "antd";
import {
  UserOutlined,
  HeartFilled,
  SyncOutlined,
  SettingOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useAuth } from "@/context/AuthContext";
import LoginModal from "../auth/LoginModal";
import MobileNavDock from "./MobileNavDock";

// Subscribe to the compared-colleges list stored in localStorage so the badge
// count stays in sync across tabs and in-app updates.
const subscribeCompareCount = (onChange: () => void) => {
  window.addEventListener("compared-colleges-updated", onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener("compared-colleges-updated", onChange);
    window.removeEventListener("storage", onChange);
  };
};
const getCompareCountSnapshot = () => {
  try {
    return JSON.parse(localStorage.getItem("compared_colleges") || "[]").length;
  } catch {
    return 0;
  }
};
const getCompareCountServerSnapshot = () => 0;

const Navbar = () => {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const compareCount = useSyncExternalStore(
    subscribeCompareCount,
    getCompareCountSnapshot,
    getCompareCountServerSnapshot,
  );
  //    useEffect(() => {
   
  //   const handleOpenAuth = (e: Event) => {
  //     const customEvent = e as CustomEvent<{ mode?: 'login' | 'signup' }>;
  //     const mode = customEvent.detail?.mode || 'signup';
  //     openAuthModal(mode);
  //   };
  //   window.addEventListener('open-auth-modal', handleOpenAuth);

  //   return () => {
  //     window.removeEventListener('open-auth-modal', handleOpenAuth);
  //   };
  // }, []);
  const { user, logout, resendVerificationEmail, checkVerificationStatus } =
    useAuth();
  const isLoggedIn = !!user;

  // Open the login modal when redirected here with ?login=1 (e.g. an
  // unauthenticated user was bounced off a protected page like /compare).
  // Read from window to avoid needing a useSearchParams Suspense boundary.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("login") === "1" && !user) {
      // Reading the URL is a client-only post-mount sync; a lazy useState
      // initializer would cause an SSR/hydration mismatch here.
      /* eslint-disable react-hooks/set-state-in-effect */
      setAuthMode("login");
      setIsLoginModalOpen(true);
      /* eslint-enable react-hooks/set-state-in-effect */
      params.delete("login");
      const query = params.toString();
      window.history.replaceState(
        null,
        "",
        window.location.pathname + (query ? `?${query}` : ""),
      );
    }
  }, [user]);

  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [resendError, setResendError] = useState("");

  const handleResendEmail = async () => {
    setResending(true);
    setResendError("");
    try {
      await resendVerificationEmail();
      setResent(true);
      setTimeout(() => setResent(false), 5000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "";
      if (errorMessage.includes("auth/too-many-requests")) {
        setResendError(
          "Please wait a minute before requesting another verification email.",
        );
      } else {
        setResendError(
          "Failed to resend verification email. Please try again.",
        );
      }
      setTimeout(() => setResendError(""), 5000);
    } finally {
      setResending(false);
    }
  };

  useEffect(() => {
    if (user && !user.emailVerified) {
      const interval = setInterval(async () => {
        try {
          await checkVerificationStatus();
        } catch (e) {
          console.error("Background check failed:", e);
        }
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [user, checkVerificationStatus]);

  const handleSignOut = async () => {
    await logout();
    setIsMobileMenuOpen(false);
    router.push("/");
  };

  const firstName =
    user?.displayName?.split(" ")[0] ?? user?.email?.split("@")[0] ?? "Account";
  const avatarInitial = (user?.displayName ?? user?.email ?? "U")
    .charAt(0)
    .toUpperCase();

  // User dropdown shown when clicking the avatar / "Hi, {name}" greeting.
  const userMenuItems: MenuProps["items"] = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "My Profile",
      onClick: () => router.push("/profile"),
    },
    {
      key: "saved",
      icon: <HeartFilled />,
      label: "Saved Colleges",
      onClick: () => router.push("/profile#saved_colleges_section"),
    },
    {
      key: "compare",
      icon: <SyncOutlined />,
      label: "Compare List",
      onClick: () => router.push("/compare"),
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Account Settings",
      onClick: () => router.push("/profile"),
    },
    { type: "divider" },
    {
      key: "signout",
      icon: <LogoutOutlined />,
      label: "Sign Out",
      danger: true,
      onClick: handleSignOut,
    },
  ];

  const openAuthModal = (mode: "login" | "signup") => {
    setAuthMode(mode);
    setIsLoginModalOpen(true);
  };

  return (
    <>
      {isLoggedIn && !user?.emailVerified && (
        <div className="bg-[#3b5bdb] text-white text-[13px] font-semibold py-2.5 px-4 flex items-center justify-center gap-2 select-none w-full relative z-[60] text-center flex-wrap">
          <span>Please verify your email address to secure your account.</span>
          <button
            onClick={handleResendEmail}
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
            <span className="text-rose-300 font-bold ml-2">
              ⚠️ {resendError}
            </span>
          )}
        </div>
      )}
      <nav className="h-[70px] bg-white sticky top-0 z-50 border-t-[4px] border-[#f0f2f5] shadow-sm flex justify-center w-full">
        <div className="w-full max-w-[2080px] px-6 sm:px-10 lg:px-[36px] h-full flex items-center justify-between">
          <div className="flex items-center gap-4 lg:gap-16">
            <Link
              href="/"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <Image
                src="/images/logo2.png"
                alt="US Degrees"
                width={185}
                height={70}
                priority
                className="h-[20px] sm:h-[32px] w-auto object-contain"
              />
            </Link>
            <div className="hidden lg:flex items-center gap-[32px] text-[16px] font-medium text-[#4b5563]">
              <Link href="/" className="hover:text-[#2b55ff] transition-colors">
                Home
              </Link>
              <Link
                href="/compare"
                className="hover:text-[#2b55ff] transition-colors flex items-center gap-1.5"
              >
                <span>Compare Colleges</span>
                {compareCount > 0 && (
                  <span className="bg-[#3b5bdb] text-white text-[11px] font-bold px-2 py-0.5 rounded-full min-w-[18px] text-center leading-none">
                    {compareCount}
                  </span>
                )}
              </Link>
              <Link
                href="/courses"
                className="hover:text-[#2b55ff] transition-colors"
              >
                Courses
              </Link>
              <Link
                href="/categories"
                className="hover:text-[#2b55ff] transition-colors"
              >
                Categories
              </Link>
              <Link
                href="/mentors"
                className="hover:text-[#2b55ff] transition-colors"
              >
                Mentors
              </Link>
              <Link
                href="/pricing"
                className="hover:text-[#2b55ff] transition-colors"
              >
                Pricing
              </Link>
              <Link
                href="/blogs"
                className="hover:text-[#2b55ff] transition-colors"
              >
                Blogs
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4 sm:gap-8">
            {isLoggedIn ? (
              <Dropdown
                menu={{ items: userMenuItems }}
                trigger={["click"]}
                placement="bottomRight"
              >
                <button
                  type="button"
                  className="hidden sm:inline-flex items-center gap-2.5 rounded-full border border-slate-200 hover:bg-slate-50 pl-2 pr-4 py-1.5 transition-colors cursor-pointer"
                >
                  <Avatar
                    size={32}
                    style={{ backgroundColor: "#3b5bdb", fontWeight: 600 }}
                  >
                    {avatarInitial}
                  </Avatar>
                  <span className="text-[15px] font-semibold text-slate-600">
                    Hi, {firstName}
                  </span>
                </button>
              </Dropdown>
            ) : (
              <>
                <button
                  onClick={() => openAuthModal("login")}
                  className="hidden sm:inline text-[16px] font-medium text-[#4b5563] hover:text-[#2b55ff] transition-colors cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => openAuthModal("signup")}
                  className="hidden sm:inline-flex bg-[#3b5bdb] hover:bg-[#364fc7] text-white px-6 sm:px-8 py-2.5 rounded-full text-[15px] font-semibold transition-colors shadow-md cursor-pointer"
                >
                  Get Started
                </button>
              </>
            )}

            {/* Hamburger Menu Icon */}
            <button
              className="lg:hidden text-[#4b5563] p-1 cursor-pointer"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="absolute top-[70px] left-0 w-full bg-white border-b border-[#f0f2f5] shadow-lg lg:hidden flex flex-col p-6 gap-6 text-[#4b5563] font-medium animate-in slide-in-from-top-2 z-50">
            <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
              Home
            </Link>
            <Link
              href="/compare"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-between w-full"
            >
              <span>Compare Colleges</span>
              {compareCount > 0 && (
                <span className="bg-[#3b5bdb] text-white text-[11px] font-bold px-2 py-0.5 rounded-full min-w-[18px] text-center leading-none">
                  {compareCount}
                </span>
              )}
            </Link>
            <Link href="/courses" onClick={() => setIsMobileMenuOpen(false)}>
              Courses
            </Link>
            <Link href="/categories" onClick={() => setIsMobileMenuOpen(false)}>
              Categories
            </Link>
            <Link href="/mentors" onClick={() => setIsMobileMenuOpen(false)}>
              Mentors
            </Link>
            <Link href="/pricing" onClick={() => setIsMobileMenuOpen(false)}>
              Pricing
            </Link>
            <Link href="/blogs" onClick={() => setIsMobileMenuOpen(false)}>
              Blogs
            </Link>
            <hr className="border-[#f0f2f5]" />
            {isLoggedIn ? (
              <>
                <span className="text-slate-600 font-semibold">
                  Hi, {firstName}
                </span>
                <Link
                  href="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  My Profile
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-left text-[#f43f5e] font-semibold cursor-pointer"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    openAuthModal("login");
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-left text-[16px] font-medium text-[#4b5563] hover:text-[#2b55ff] transition-colors cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    openAuthModal("signup");
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-left text-[#3b5bdb] font-semibold cursor-pointer"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        )}
      </nav>

      {/* Reusable Login/Signup Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        initialMode={authMode}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={() => setIsLoginModalOpen(false)}
      />

      {/* Floating Mobile Navigation Dock with Sliding Highlight */}
      <MobileNavDock onOpenAuthModal={openAuthModal} />
    </>
  );
};

export default Navbar;
