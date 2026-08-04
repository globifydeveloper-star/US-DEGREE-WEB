"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";
import Link from "next/link";

/**
 * Route-level error boundary. Wraps every page below the root layout, so a
 * render-time throw in any client component shows this instead of Next's raw
 * error screen.
 *
 * `error.message` is deliberately not rendered: in production Next replaces
 * server error messages with a generic string plus a `digest`, and showing raw
 * client-side messages just surfaces stack noise to users. The digest is shown
 * because it's the only handle support can correlate against server logs.
 */
export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#FAFBFD] px-6 text-center">
      <h1 className="text-2xl font-semibold text-slate-900">
        Something went wrong
      </h1>
      <p className="mt-3 max-w-md text-sm text-slate-600">
        We hit an unexpected error loading this page. Trying again will re-fetch
        it.
      </p>
      {error.digest && (
        <p className="mt-4 font-mono text-xs text-slate-400">
          Reference: {error.digest}
        </p>
      )}
      <div className="mt-8 flex gap-3">
        <button
          onClick={() => retry()}
          className="rounded-lg bg-[#2563EB] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#1d4ed8]"
        >
          Try again
        </button>
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
