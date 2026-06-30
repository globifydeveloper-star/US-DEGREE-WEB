"use client";

import React, { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Scale, Search, Heart, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { SAVED_EVENT } from "@/components/search/useSavedColleges";

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

interface MobileNavDockProps {
  onOpenAuthModal?: (mode: "login" | "signup") => void;
}

export default function MobileNavDock({ onOpenAuthModal }: MobileNavDockProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();

  const compareCount = useSyncExternalStore(
    subscribeCompareCount,
    getCompareCountSnapshot,
    getCompareCountServerSnapshot,
  );

  const [savedCount, setSavedCount] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Track page scroll progress for top slender indicator bar
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(Math.min(100, Math.max(0, progress)));
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Keep the saved-colleges badge in sync: fetch the count for a signed-in user
  // and refresh it whenever a save/unsave happens anywhere this session.
  useEffect(() => {
    let active = true;
    const updateSavedState = async () => {
      if (!user) {
        if (active) setSavedCount(0);
        return;
      }
      try {
        const { fetchSavedColleges } = await import("@/lib/auth/api");
        const list = await fetchSavedColleges();
        if (active) setSavedCount(list.length);
      } catch {
        if (active) setSavedCount(0);
      }
    };

    updateSavedState();
    window.addEventListener(SAVED_EVENT, updateSavedState);
    return () => {
      active = false;
      window.removeEventListener(SAVED_EVENT, updateSavedState);
    };
  }, [user]);

  const navItems = [
    { id: "home", label: "Home", href: "/", icon: Home },
    {
      id: "compare",
      label: "Compare",
      href: "/compare",
      icon: Scale,
      badge: compareCount,
    },
    { id: "search", label: "Search", href: "/search", icon: Search },
    {
      id: "saved",
      label: "Saved",
      href: "/profile#saved_colleges_section",
      icon: Heart,
      hasNotification: savedCount > 0,
    },
    {
      id: "profile",
      label: "Account",
      href: "/profile",
      icon: User,
      requiresAuth: true,
    },
  ];

  const getActiveIndex = () => {
    if (pathname === "/compare") return 1;
    if (pathname === "/search") return 2;
    if (pathname.includes("/profile") || pathname.includes("/account"))
      return 4;
    return 0; // default Home
  };

  const activeIndex = getActiveIndex();

  const handleItemClick = (e: React.MouseEvent, item: (typeof navItems)[0]) => {
    if (item.id === "search") {
      e.preventDefault();
      router.push("/search");
      return;
    }

    if (item.requiresAuth && !user) {
      e.preventDefault();
      if (onOpenAuthModal) {
        onOpenAuthModal("login");
      } else {
        router.push("/?login=1");
      }
    }
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[90] w-[92%] max-w-[420px] lg:hidden select-none animate-fade-in pointer-events-auto">
      {/* Top Slim Scroll Progress Bar */}
      <div className="w-full h-[3px] bg-slate-200/60 rounded-full mb-2 overflow-hidden backdrop-blur-md shadow-sm">
        <div
          className="h-full bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 transition-all duration-150 ease-out rounded-full shadow-[0_0_10px_rgba(37,99,235,0.6)]"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Floating iOS Whitish Liquid Glass Dock Container */}
      <div className="relative bg-white/75 backdrop-blur-2xl backdrop-saturate-200 border border-white/90 shadow-[0_12px_40px_rgba(31,38,135,0.15)] rounded-full px-2.5 py-2 flex items-center justify-between overflow-hidden ring-1 ring-black/5">
        {/* Subtle Ambient Gloss Rim */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none" />

        {/* Sliding Whitish iOS Liquid Glass Highlight Bubble */}
        <div
          className="absolute top-1.5 bottom-1.5 w-[18%] bg-blue-600/10 border border-blue-600/25 rounded-full transition-all duration-300 ease-out backdrop-blur-md shadow-sm ring-1 ring-blue-500/10"
          style={{
            left: `calc(${activeIndex * 20}% + 1%)`,
          }}
        />

        {/* Navigation Tabs */}
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = activeIndex === index;

          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={(e) => handleItemClick(e, item)}
              className={`relative z-10 flex-1 flex flex-col items-center justify-center py-2 transition-all active:scale-90 cursor-pointer ${
                isActive
                  ? "text-blue-600 drop-shadow-sm font-bold"
                  : "text-slate-400 hover:text-slate-700"
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Icon
                  className={`w-6 h-6 transition-all duration-200 ${isActive ? "stroke-[2.5px] scale-110" : "stroke-[1.8px]"}`}
                />

                {/* Compare Count Badge */}
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded-full min-w-[16px] text-center leading-tight shadow-md border border-white/40 animate-scale-up">
                    {item.badge}
                  </span>
                )}

                {/* Red Notification Dot - Only shown when saved colleges exist */}
                {item.hasNotification && (
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white shadow-md animate-pulse" />
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
