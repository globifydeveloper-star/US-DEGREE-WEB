import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function Footer({
  className = "mt-12",
}: {
  className?: string;
}) {
  return (
    <footer
      // Reserve space for the mobile bottom nav dock below `lg` (where it
      // renders) so the last content above the footer is never hidden behind
      // it; reverts to the original pb-8 at `lg`+ where the dock is hidden.
      className={`bg-[#295af6] text-white pt-10 pb-[calc(var(--mobile-nav-height)+24px)] lg:pb-8 px-6 sm:px-10 lg:px-[86px] flex justify-center ${className}`}
    >
      <div className="w-full max-w-[2380px]">
        {/* Brand & Description */}
        <div className="mb-8">
          <Link href="/" className="inline-block bg-white p-2 rounded mb-4">
            <Image
              src="/images/logo2.png"
              alt="US Degrees"
              width={185}
              height={70}
              className="h-8 w-auto object-contain"
            />
          </Link>
          <p className="text-blue-100 text-sm max-w-sm leading-relaxed">
            Empowering global learners to reach their full potential in U.S.
            higher education.
          </p>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-6 border-t border-white/10 text-xs text-blue-200">
          <p>Copyright @2021-2026. USDegrees.com. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link
              href="/privacy"
              className="hover:text-white transition-colors"
            >
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
