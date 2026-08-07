"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";

export default function CTA() {
  const { user } = useAuth();
  const isLoggedIn = !!user;

  const handleGetStarted = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isLoggedIn) {
      const element =
        document.getElementById("search-programs-section-mobile") ||
        document.getElementById("search-programs-section");
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      } else {
        window.location.href = "/#search-programs-section-mobile";
      }
    } else {
      const event = new CustomEvent("open-auth-modal", {
        detail: { mode: "login" },
      });
      window.dispatchEvent(event);
    }
  };

  return (
    <section className="px-6 sm:px-10 lg:px-12 xl:px-[86px] py-12 flex justify-center">
      <div className="w-full max-w-[2380px] bg-[#edf2ff] rounded-[2rem] flex flex-col md:flex-row items-center overflow-hidden min-h-[400px]">
        {/* Left Content */}
        <div className="flex-1 min-w-0 p-8 sm:p-10 md:p-8 lg:p-10 xl:p-16 flex flex-col justify-center order-2 md:order-1">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 leading-tight">
            Ready to Find the Right
            <br />
            Program?
          </h2>
          <p className="text-gray-600 mb-8 max-w-md text-sm md:text-base">
            Join thousands of students who have already found their future with
            US degree Academy. Start your comparison today.
          </p>
          <div className="flex flex-col sm:flex-row md:flex-col xl:flex-row items-stretch sm:items-center md:items-stretch xl:items-center gap-3.5 w-full max-w-md md:max-w-none">
            <button
              onClick={handleGetStarted}
              className="inline-flex items-center justify-center w-full sm:w-auto md:w-full xl:w-auto text-center bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-7 xl:px-8 py-3.5 rounded-full font-semibold transition-all duration-200 shadow-sm cursor-pointer whitespace-nowrap text-sm sm:text-base"
            >
              Get Started Now
            </button>
            <Link
              href="/compare"
              className="inline-flex items-center justify-center w-full sm:w-auto md:w-full xl:w-auto text-center bg-white hover:bg-gray-50 text-blue-600 px-6 sm:px-7 xl:px-8 py-3.5 rounded-full font-semibold transition-all duration-200 shadow-sm whitespace-nowrap text-sm sm:text-base border border-blue-100/60"
            >
              Compare Programs
            </Link>
          </div>
        </div>

        {/* Right Image */}
        <div className="w-full md:flex-1 min-w-0 order-1 md:order-2 p-6 md:p-6 lg:p-8 xl:p-10">
          <div className="relative w-full aspect-[4/3] md:aspect-auto md:h-[320px] rounded-3xl overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
              alt="Students collaborating on campus"
              fill
              unoptimized
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
