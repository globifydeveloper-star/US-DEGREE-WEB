"use client";

import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

export default function TopSearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const urlTitle = searchParams.get("title") || "";
  const [query, setQuery] = useState(urlTitle);

  // Keep the input in sync when the URL changes externally, using the
  // render-time reset pattern (no effect needed): when the URL-derived title
  // changes, adopt it as the new input value.
  const [prevUrlTitle, setPrevUrlTitle] = useState(urlTitle);
  if (urlTitle !== prevUrlTitle) {
    setPrevUrlTitle(urlTitle);
    setQuery(urlTitle);
  }

  // Debounce URL update while typing so rapid keystrokes don't flood API calls
  useEffect(() => {
    if (query.trim() === urlTitle.trim()) return;

    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (query.trim()) {
        params.set("title", query.trim());
      } else {
        params.delete("title");
      }
      router.replace(`${pathname}?${params.toString()}`);
    }, 400);

    return () => clearTimeout(timer);
  }, [query, urlTitle, pathname, router, searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (query.trim()) {
      params.set("title", query.trim());
    } else {
      params.delete("title");
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="w-full max-w-[2380px] mx-auto px-6 sm:px-10 lg:px-[86px] py-4">
      <form
        onSubmit={handleSearch}
        className="flex items-center bg-gray-100 rounded-lg px-4 py-3 max-w-xl border border-gray-200 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all shadow-sm"
      >
        <Search size={18} className="text-gray-400 mr-3" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for degrees (e.g. Computer Science)..."
          className="bg-transparent border-none outline-none text-sm w-full text-gray-700 placeholder-gray-500"
        />
        <button type="submit" className="hidden">
          Search
        </button>
      </form>
    </div>
  );
}

