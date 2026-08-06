"use client";

import { ArrowUp } from "lucide-react";

const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

export default function BackToTopButton() {
  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-24 md:bottom-24 lg:bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-white border border-blue-200 shadow-md hover:shadow-xl transition-all duration-300 flex items-center justify-center text-blue-600 hover:text-white hover:bg-blue-600 hover:border-blue-600 hover:scale-110 active:scale-95 cursor-pointer"
      aria-label="Back to top"
    >
      <ArrowUp className="w-5 h-5 stroke-[2.5]" />
    </button>
  );
}

