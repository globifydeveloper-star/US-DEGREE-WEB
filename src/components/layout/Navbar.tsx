"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import LoginModal from "../auth/LoginModal";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  const checkAuth = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem("auth_token") : null;
    const email = typeof window !== 'undefined' ? localStorage.getItem("user_email") : null;
    if (token) {
      setIsLoggedIn(true);
      setUserEmail(email || "User");
    } else {
      setIsLoggedIn(false);
      setUserEmail("");
    }
  };

  useEffect(() => {
    checkAuth();
    window.addEventListener("auth-state-changed", checkAuth);
    return () => {
      window.removeEventListener("auth-state-changed", checkAuth);
    };
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_email");
    localStorage.removeItem("user_name");
    window.dispatchEvent(new Event("auth-state-changed"));
    setIsLoggedIn(false);
    setUserEmail("");
    setIsMobileMenuOpen(false);
  };

  const openAuthModal = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setIsLoginModalOpen(true);
  };

  return (
    <>
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
              <Link href="/compare" className="hover:text-[#2b55ff] transition-colors">
                Compare Colleges
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
                  Hi, {userEmail.split('@')[0]}
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
            <Link href="/compare" onClick={() => setIsMobileMenuOpen(false)}>Compare Colleges</Link>
            <Link href="/courses" onClick={() => setIsMobileMenuOpen(false)}>Courses</Link>
            <Link href="/categories" onClick={() => setIsMobileMenuOpen(false)}>Categories</Link>
            <Link href="/mentors" onClick={() => setIsMobileMenuOpen(false)}>Mentors</Link>
            <Link href="/pricing" onClick={() => setIsMobileMenuOpen(false)}>Pricing</Link>
            <Link href="/blogs" onClick={() => setIsMobileMenuOpen(false)}>Blogs</Link>
            <hr className="border-[#f0f2f5]" />
            {isLoggedIn ? (
              <>
                <span className="text-slate-600 font-semibold">Hi, {userEmail}</span>
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
        onSuccess={() => checkAuth()} 
      />
    </>
  );
};

export default Navbar;
