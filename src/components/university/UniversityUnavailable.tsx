import Link from "next/link";
import { AlertCircle } from "lucide-react";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

interface UniversityUnavailableProps {
  id: string;
}

export default function UniversityUnavailable({
  id,
}: UniversityUnavailableProps) {
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-20">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-8 text-center transition-all duration-300 hover:shadow-2xl">
          <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6 text-rose-500 animate-pulse">
            <AlertCircle size={32} />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-950 tracking-tight mb-3">
            University Details Unavailable
          </h1>
          <p className="text-slate-600 text-sm leading-relaxed mb-8">
            We couldn&apos;t retrieve the details for this university (ID:{" "}
            <span className="font-semibold text-slate-800">{id}</span>). It may
            not exist in our database, or there might be a temporary network
            issue.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/search"
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
            >
              Go to Search
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-medium rounded-xl transition-all duration-200 active:scale-95"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
      <Footer className="mt-0" />
    </main>
  );
}
