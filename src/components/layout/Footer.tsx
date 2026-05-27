import React from 'react';
import Link from 'next/link';
import { Globe, Share2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#295af6] text-white pt-16 pb-8 px-6 sm:px-10 lg:px-[86px] mt-12 flex justify-center">
      <div className="w-full max-w-[2380px]">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          {/* Brand & Description */}
          <div className="md:col-span-5">
            <Link href="/" className="inline-block bg-white p-2 rounded mb-6">
              <img
                src="/images/logo2.png"
                alt="US Degrees"
                className="h-8 w-auto object-contain"
              />
            </Link>
            <p className="text-blue-100 text-sm max-w-sm mb-6 leading-relaxed">
              Empowering global learners to reach their full potential in U.S. higher education.
            </p>
            {/* <div className="flex items-center gap-4 text-blue-100">
              <a href="#" className="hover:text-white transition-colors">
                <Globe size={18} />
              </a>
              <a href="#" className="hover:text-white transition-colors">
                <Share2 size={18} />
              </a>
            </div> */}
          </div>

          {/* Links Columns */}
          <div className="md:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-8">
            {/* Learn */}
            <div>
              <h3 className="font-semibold text-white mb-6">Learn</h3>
              <ul className="space-y-4 text-sm text-blue-100">
                <li><Link href="/design" className="hover:text-white transition-colors">Design</Link></li>
                <li><Link href="/development" className="hover:text-white transition-colors">Development</Link></li>
                <li><Link href="/marketing" className="hover:text-white transition-colors">Marketing</Link></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="font-semibold text-white mb-6">Resources</h3>
              <ul className="space-y-4 text-sm text-blue-100">
                <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
                <li><Link href="/support" className="hover:text-white transition-colors">Support</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="font-semibold text-white mb-6">Company</h3>
              <ul className="space-y-4 text-sm text-blue-100">
                <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/careers" className="hover:text-white transition-colors">Careers</Link></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/10 text-xs text-blue-200">
          <p>Copyright @2021-2026. USDegrees.com. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
