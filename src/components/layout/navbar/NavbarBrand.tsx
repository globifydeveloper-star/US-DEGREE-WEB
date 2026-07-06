import Link from "next/link";
import Image from "next/image";

export default function NavbarBrand() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2 hover:opacity-80 transition-opacity"
    >
      <Image
        src="/images/logo2.png"
        alt="US Degrees"
        width={185}
        height={70}
        priority
        className="h-[20px] sm:h-[32px] w-auto object-contain"
      />
    </Link>
  );
}
