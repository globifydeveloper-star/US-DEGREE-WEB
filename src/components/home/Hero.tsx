"use client";

import Image from "next/image";

import HeroIntro from "./HeroIntro";
import HeroSearchCard from "./HeroSearchCard";
import { useHeroSearch } from "./useHeroSearch";

export default function Hero() {
  const search = useHeroSearch();

  return (
    <section className="relative overflow-hidden bg-[#f5f8fc] px-4 sm:px-10 lg:px-[49px] pb-10 sm:pb-12 lg:pb-16 pt-[30px] flex justify-center">
      <div
        className="
          pointer-events-none
          absolute
          inset-0
          bg-[radial-gradient(circle_at_58%_38%,rgba(186,235,227,0.85)_0%,rgba(186,235,227,0.55)_25%,rgba(186,235,227,0.22)_45%,rgba(255,255,255,0)_72%)]
        "
      />
      <div className="relative w-full max-w-[2380px]">
        {/* Hero Row */}
        <div className="grid gap-14 lg:grid-cols-[0.98fr_1fr] lg:gap-[62px]">
          {/* Left Content */}
          <div className="flex flex-col items-start pt-[10px]">
            <div className="w-full">
              <HeroIntro />

              {/* Mobile-only Image (Upside of the search bar on mobile) */}
              <div className="relative mb-6 block lg:hidden w-full">
                <div className="relative z-10 overflow-hidden rounded-[24px] w-full h-[220px] sm:h-[300px]">
                  <Image
                    src="/images/collage.webp"
                    alt="Students sitting under a tree"
                    fill
                    sizes="100vw"
                    className="object-cover object-center"
                  />
                </div>
              </div>

              {/* Search Card (Mobile/Tablet only) */}
              <HeroSearchCard variant="mobile" search={search} />
            </div>
          </div>

          {/* Right Image */}
          <div className="relative min-h-[220px] lg:min-h-[320px] hidden lg:block">
            <div className="relative z-10 overflow-hidden rounded-[48px] w-full h-[220px] lg:h-[420px]">
              <Image
                src="/images/collage.webp"
                alt="Students sitting under a tree"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover object-center"
              />
            </div>
          </div>
        </div>

        {/* Centered Search Card (Desktop only) */}
        <div
          id="search-programs-section"
          className="hidden lg:flex justify-center mt-12"
        >
          <HeroSearchCard variant="desktop" search={search} />
        </div>
      </div>
    </section>
  );
}
