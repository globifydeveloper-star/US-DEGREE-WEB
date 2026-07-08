import Link from "next/link";

import { NAV_LINKS } from "@/constants/navigation";
import CompareBadge from "./CompareBadge";

interface DesktopNavLinksProps {
  isLoggedIn: boolean;
  compareCount: number;
}

export default function DesktopNavLinks({
  isLoggedIn,
  compareCount,
}: DesktopNavLinksProps) {
  return (
    <div className="hidden lg:flex items-center gap-[32px] text-[16px] font-medium text-[#4b5563]">
      {NAV_LINKS.map((link) =>
        link.showCompareBadge ? (
          <Link
            key={link.href}
            href={link.href}
            className="hover:text-[#2b55ff] transition-colors flex items-center gap-1.5"
          >
            <span>{link.label}</span>
            {isLoggedIn && compareCount > 0 && (
              <CompareBadge count={compareCount} />
            )}
          </Link>
        ) : (
          <Link
            key={link.href}
            href={link.href}
            className="hover:text-[#2b55ff] transition-colors"
          >
            {link.label}
          </Link>
        ),
      )}
    </div>
  );
}
