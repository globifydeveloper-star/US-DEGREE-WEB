"use client";

import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

export default function TopSearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  
  const [query, setQuery] = useState(searchParams.get("title") || "");

  // Keep input in sync if URL changes externally
  useEffect(() => {
    setQuery(searchParams.get("title") || "");
  }, [searchParams]);

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
      <form onSubmit={handleSearch} className="flex items-center bg-gray-100 rounded-lg px-4 py-3 max-w-xl border border-gray-200 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all shadow-sm">
        <Search size={18} className="text-gray-400 mr-3" />
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for degrees (e.g. Computer Science)..." 
          className="bg-transparent border-none outline-none text-sm w-full text-gray-700 placeholder-gray-500"
        />
        <button type="submit" className="hidden">Search</button>
      </form>
    </div>
  );
}
