import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page not found · US Degrees",
};

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#FAFBFD] px-6 text-center">
      <p className="text-sm font-semibold tracking-wide text-[#2563EB]">404</p>
      <h1 className="mt-2 text-2xl font-semibold text-slate-900">
        We couldn&apos;t find that page
      </h1>
      <p className="mt-3 max-w-md text-sm text-slate-600">
        The link may be out of date, or the university you&apos;re looking for
        may no longer be listed.
      </p>
      <div className="mt-8 flex gap-3">
        <Link
          href="/search"
          className="rounded-lg bg-[#2563EB] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#1d4ed8]"
        >
          Search universities
        </Link>
        <Link
          href="/"
          className="rounded-lg bg-[#EAEFF5] px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-[#E2E8F0]"
        >
          Go home
        </Link>
      </div>
    </main>
  );
}
