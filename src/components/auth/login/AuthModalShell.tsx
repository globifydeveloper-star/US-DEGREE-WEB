import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";

/** Shared with AuthModalHeader/VerificationSentView so aria-labelledby
 * resolves to whichever of them renders the dialog's visible title. */
export const AUTH_MODAL_TITLE_ID = "auth-modal-title";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

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
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  // Focus trap: move focus into the dialog on mount, cycle Tab/Shift+Tab
  // between its own focusable elements only, and give focus back to
  // whatever opened it once the dialog unmounts.
  useEffect(() => {
    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;

    const getFocusable = () => {
      const panel = modalRef.current;
      return panel
        ? Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
        : [];
    };

    getFocusable()[0]?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const elements = getFocusable();
      if (elements.length === 0) return;
      const first = elements[0];
      const last = elements[elements.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocusedRef.current?.focus?.();
    };
  }, [modalRef]);

  return (
    <div
      onClick={onOverlayClick}
      role="presentation"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md px-4 py-6 overflow-y-auto animate-fade-in"
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={AUTH_MODAL_TITLE_ID}
        className={`w-full max-w-[480px] bg-white rounded-[24px] sm:rounded-[32px] border border-gray-100 shadow-2xl p-5 sm:p-6 md:p-8 relative my-auto overflow-hidden animate-scale-up select-none font-['Poppins']${
          centered ? " text-center" : ""
        }`}
      >
        {/* Decorative corner element */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -z-10"></div>

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 active:scale-90 transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {children}
      </div>
    </div>
  );
}
