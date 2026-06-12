"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import LoginModal from "../auth/LoginModal";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [compareCount, setCompareCount] = useState(0);
   const checkCompareCount = () => {
    const list = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem("compared_colleges") || "[]") : [];
    setCompareCount(list.length);
  };
   useEffect(() => {
   
    checkCompareCount();
    window.addEventListener("compared-colleges-updated", checkCompareCount);
    return () => {
      window.removeEventListener("compared-colleges-updated", checkCompareCount);
    };
  }, []);
  const { user, logout, resendVerificationEmail, checkVerificationStatus } = useAuth();
  const isLoggedIn = !!user;

  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  const handleResendEmail = async () => {
    setResending(true);
    try {
      await resendVerificationEmail();
      setResent(true);
      setTimeout(() => setResent(false), 5000);
    } catch (err) {
      console.error(err);
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
  };

  const openAuthModal = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setIsLoginModalOpen(true);
  };

  return (
    <>
      {isLoggedIn && !user?.emailVerified && (
        <div className="bg-[#3b5bdb] text-white text-[13px] font-semibold py-2.5 px-4 flex items-center justify-center gap-2 select-none w-full relative z-[60] text-center">
          <span>Please verify your email address to secure your account.</span>
          <button 
            onClick={handleResendEmail} 
            disabled={resending}
            className="underline hover:opacity-90 font-bold ml-2 cursor-pointer disabled:opacity-50"
          >
            {resending ? 'Sending...' : 'Resend link'}
          </button>
          {resent && <span className="text-emerald-300 font-bold ml-2">✓ Verification email sent!</span>}
        </div>
      )}
      <nav className="h-[70px] bg-white sticky top-0 z-50 border-t-[4px] border-[#f0f2f5] shadow-sm flex justify-center w-full">
        <div className="w-full max-w-[2080px] px-6 sm:px-10 lg:px-[36px] h-full flex items-center justify-between">
          <div className="flex items-center gap-4 lg:gap-16">
            <Link
              href="/"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <img
                src="/images/logo2.png"
                alt="US Degrees"
                className="h-[20px] sm:h-[32px] w-auto object-contain"
              />
            </Link>
            <div className="hidden lg:flex items-center gap-[32px] text-[16px] font-medium text-[#4b5563]">
              <Link href="/" className="hover:text-[#2b55ff] transition-colors">
                Home
              </Link>
              <Link href="/compare" className="hover:text-[#2b55ff] transition-colors flex items-center gap-1.5">
                <span>Compare Colleges</span>
                {compareCount > 0 && (
                  <span className="bg-[#3b5bdb] text-white text-[11px] font-bold px-2 py-0.5 rounded-full min-w-[18px] text-center leading-none">
                    {compareCount}
                  </span>
                )}
              </Link>
              <Link href="/courses" className="hover:text-[#2b55ff] transition-colors">
                Courses
              </Link>
              <Link href="/categories" className="hover:text-[#2b55ff] transition-colors">
                Categories
              </Link>
              <Link href="/mentors" className="hover:text-[#2b55ff] transition-colors">
                Mentors
              </Link>
              <Link href="/pricing" className="hover:text-[#2b55ff] transition-colors">
                Pricing
              </Link>
              <Link href="/blogs" className="hover:text-[#2b55ff] transition-colors">
                Blogs
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4 sm:gap-8">
            {isLoggedIn ? (
              <>
                <span className="hidden sm:inline text-[15px] font-semibold text-slate-600">
                  Hi, {user?.displayName?.split(' ')[0] ?? user?.email?.split('@')[0]}
                </span>
                <button
                  onClick={handleSignOut}
                  className="hidden sm:inline-flex border border-slate-200 hover:bg-slate-50 text-slate-700 px-5 py-2.5 rounded-full text-[15px] font-semibold transition-colors cursor-pointer"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => openAuthModal('login')}
                  className="hidden sm:inline text-[16px] font-medium text-[#4b5563] hover:text-[#2b55ff] transition-colors cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => openAuthModal('signup')}
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
            <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
            <Link href="/compare" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between w-full">
              <span>Compare Colleges</span>
              {compareCount > 0 && (
                <span className="bg-[#3b5bdb] text-white text-[11px] font-bold px-2 py-0.5 rounded-full min-w-[18px] text-center leading-none">
                  {compareCount}
                </span>
              )}
            </Link>
            <Link href="/courses" onClick={() => setIsMobileMenuOpen(false)}>Courses</Link>
            <Link href="/categories" onClick={() => setIsMobileMenuOpen(false)}>Categories</Link>
            <Link href="/mentors" onClick={() => setIsMobileMenuOpen(false)}>Mentors</Link>
            <Link href="/pricing" onClick={() => setIsMobileMenuOpen(false)}>Pricing</Link>
            <Link href="/blogs" onClick={() => setIsMobileMenuOpen(false)}>Blogs</Link>
            <hr className="border-[#f0f2f5]" />
            {isLoggedIn ? (
              <>
                <span className="text-slate-600 font-semibold">Hi, {user?.displayName ?? user?.email}</span>
                <button onClick={handleSignOut} className="text-left text-[#f43f5e] font-semibold cursor-pointer">Sign Out</button>
              </>
            ) : (
              <>
                <button
                  onClick={() => { openAuthModal('login'); setIsMobileMenuOpen(false); }}
                  className="text-left text-[16px] font-medium text-[#4b5563] hover:text-[#2b55ff] transition-colors cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => { openAuthModal('signup'); setIsMobileMenuOpen(false); }}
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
    </>
  );
};

export default Navbar;
