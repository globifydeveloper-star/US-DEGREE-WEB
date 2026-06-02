"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="h-[70px] bg-white sticky top-0 z-50 border-t-[4px] border-[#f0f2f5] shadow-sm flex justify-center">
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
          <Link href="/login" className="hidden sm:inline text-[16px] font-medium text-[#4b5563] hover:text-[#2b55ff] transition-colors">
            Sign In
          </Link>
          <Link href="/register" className="hidden sm:inline-flex bg-[#3b5bdb] hover:bg-[#364fc7] text-white px-6 sm:px-8 py-2.5 rounded-full text-[15px] font-semibold transition-colors shadow-md">
            Get Started
          </Link>

          {/* Hamburger Menu Icon */}
          <button
            className="lg:hidden text-[#4b5563] p-1"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="absolute top-[50px] left-0 w-full bg-white border-b border-[#f0f2f5] shadow-lg lg:hidden flex flex-col p-6 gap-6 text-[#4b5563] font-medium animate-in slide-in-from-top-2">
          <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
          <Link href="/compare" onClick={() => setIsMobileMenuOpen(false)}>Compare Colleges</Link>
          <Link href="/courses" onClick={() => setIsMobileMenuOpen(false)}>Courses</Link>
          <Link href="/categories" onClick={() => setIsMobileMenuOpen(false)}>Categories</Link>
          <Link href="/mentors" onClick={() => setIsMobileMenuOpen(false)}>Mentors</Link>
          <Link href="/pricing" onClick={() => setIsMobileMenuOpen(false)}>Pricing</Link>
          <Link href="/blogs" onClick={() => setIsMobileMenuOpen(false)}>Blogs</Link>
          <hr className="border-[#f0f2f5]" />
          <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>Sign In</Link>
          <Link href="/register" onClick={() => setIsMobileMenuOpen(false)} className="text-[#3b5bdb]">Get Started</Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
