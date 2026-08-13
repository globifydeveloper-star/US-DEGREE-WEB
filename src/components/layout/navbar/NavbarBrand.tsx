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
        width={200}
        height={100}
        priority
        className="h-[36px] sm:h-[40px] w-auto object-contain"
      />
    </Link>
  );
}
