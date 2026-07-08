import React from "react";
import { X } from "lucide-react";

interface AuthModalShellProps {
  modalRef: React.RefObject<HTMLDivElement | null>;
  onOverlayClick: (e: React.MouseEvent) => void;
  onClose: () => void;
  centered?: boolean;
  children: React.ReactNode;
}

export default function AuthModalShell({
  modalRef,
  onOverlayClick,
  onClose,
  centered = false,
  children,
}: AuthModalShellProps) {
  return (
    <div
      onClick={onOverlayClick}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md px-4 py-6 overflow-y-auto animate-fade-in"
    >
      <div
        ref={modalRef}
        className={`w-full max-w-[480px] bg-white rounded-[24px] sm:rounded-[32px] border border-gray-100 shadow-2xl p-5 sm:p-6 md:p-8 relative my-auto overflow-hidden animate-scale-up select-none font-['Poppins']${
          centered ? " text-center" : ""
        }`}
      >
        {/* Decorative corner element */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -z-10"></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 active:scale-90 transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {children}
      </div>
    </div>
  );
}
