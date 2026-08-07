"use client";

import Link from "next/link";
import {
  Home,
  Scale,
  User,
  Heart,
  FileText,
  LogOut,
  LogIn,
  Sparkles,
  ChevronRight,
} from "lucide-react";

import { NAV_LINKS } from "@/constants/navigation";
import CompareBadge from "./CompareBadge";

interface MobileNavMenuProps {
  isOpen: boolean;
  isLoggedIn: boolean;
  compareCount: number;
  firstName: string;
  onClose: () => void;
  onSignIn: () => void;
  onSignUp: () => void;
  onSignOut: () => void;
}

export default function MobileNavMenu({
  isOpen,
  isLoggedIn,
  compareCount,
  firstName,
  onClose,
  onSignIn,
  onSignUp,
  onSignOut,
}: MobileNavMenuProps) {
  return (
    <div
      className={`fixed inset-0 top-[70px] z-40 lg:hidden transition-all duration-300 ease-in-out ${
        isOpen
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Backdrop overlay */}
      <div
        className="absolute inset-0 bg-slate-900/30 backdrop-blur-xs"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Mobile Drawer Sheet */}
      <div
        className={`relative w-full z-50 transition-all duration-300 ease-in-out ${
          isOpen ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
        }`}
      >
        <div className="bg-white border-b border-slate-100 shadow-xl rounded-b-2xl overflow-hidden max-h-[75vh] overflow-y-auto">
          <div className="p-3.5 flex flex-col gap-2">
            {/* Header profile banner (Logged In) */}
            {isLoggedIn && (
              <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-slate-50 border border-slate-100 mb-0.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 select-none">
                    {firstName ? firstName.charAt(0).toUpperCase() : "U"}
                  </div>
                  <span className="text-xs font-bold text-slate-800 truncate">
                    Hi, {firstName || "Student"}
                  </span>
                </div>
                <Link
                  href="/profile"
                  onClick={onClose}
                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-semibold text-blue-600 hover:bg-blue-50 transition-colors shadow-2xs whitespace-nowrap"
                >
                  Profile
                </Link>
              </div>
            )}

            {/* Main Navigation Links */}
            <div className="flex flex-col gap-0.5">
              {NAV_LINKS.map((link) => {
                const isHome = link.href === "/";
                const isCompare = link.href === "/compare";
                const IconComponent = isHome ? Home : isCompare ? Scale : Home;
                const iconColor = isHome
                  ? "bg-blue-50 text-blue-600"
                  : "bg-indigo-50 text-indigo-600";

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={onClose}
                    className="flex items-center justify-between py-2 px-2.5 rounded-xl hover:bg-slate-50 transition-all font-semibold text-slate-700 text-xs group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-lg ${iconColor} flex items-center justify-center shrink-0`}
                      >
                        <IconComponent className="w-3.5 h-3.5" />
                      </div>
                      <span>{link.label}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {link.showCompareBadge &&
                        isLoggedIn &&
                        compareCount > 0 && (
                          <CompareBadge count={compareCount} />
                        )}
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 transition-all" />
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Logged-In User Links */}
            {isLoggedIn ? (
              <div className="flex flex-col gap-0.5 border-t border-slate-100 pt-1.5">
                <Link
                  href="/profile"
                  onClick={onClose}
                  className="flex items-center justify-between py-2 px-2.5 rounded-xl hover:bg-slate-50 transition-all font-semibold text-slate-700 text-xs group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <span>My Profile</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 transition-all" />
                </Link>

                <Link
                  href="/profile#saved_colleges_section"
                  onClick={onClose}
                  className="flex items-center justify-between py-2 px-2.5 rounded-xl hover:bg-slate-50 transition-all font-semibold text-slate-700 text-xs group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
                      <Heart className="w-3.5 h-3.5 fill-rose-500/20" />
                    </div>
                    <span>Saved Colleges</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 transition-all" />
                </Link>

                <Link
                  href="/profile#reports_section"
                  onClick={onClose}
                  className="flex items-center justify-between py-2 px-2.5 rounded-xl hover:bg-slate-50 transition-all font-semibold text-slate-700 text-xs group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                      <FileText className="w-3.5 h-3.5" />
                    </div>
                    <span>My Reports</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 transition-all" />
                </Link>

                <button
                  onClick={onSignOut}
                  className="w-full flex items-center justify-between py-2 px-2.5 rounded-xl text-rose-600 hover:bg-rose-50 transition-all font-semibold text-xs cursor-pointer group mt-0.5"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                      <LogOut className="w-3.5 h-3.5" />
                    </div>
                    <span>Sign Out</span>
                  </div>
                </button>
              </div>
            ) : (
              /* Logged Out Actions - Side-by-side grid */
              <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-2.5 mt-0.5">
                <button
                  onClick={onSignIn}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-all active:scale-[0.98] cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5 text-slate-600" />
                  <span>Sign In</span>
                </button>
                <button
                  onClick={onSignUp}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-xs active:scale-[0.98] cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
                  <span>Get Started</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
