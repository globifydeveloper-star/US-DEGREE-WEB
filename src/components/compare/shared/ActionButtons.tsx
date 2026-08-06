"use client";

import { Button } from "antd";

interface ActionButtonsProps {
  schoolUrl?: string;
  onViewDetails: () => void;
  /** "desktop" is the taller stacked layout, "mobile" the compact side-by-side layout. */
  layout?: "desktop" | "mobile";
}

/**
 * The "View Details" + "Visit Website" buttons shown for each college,
 * used on the desktop table's action row and the mobile school cards.
 */
export default function ActionButtons({
  schoolUrl,
  onViewDetails,
  layout = "desktop",
}: ActionButtonsProps) {
  const isDesktop = layout === "desktop";

  return (
    <div
      className={
        isDesktop
          ? "flex flex-col gap-1.5 max-w-[120px] md:max-w-[160px] mx-auto"
          : "flex gap-2 mt-4"
      }
    >
      <Button
        type="primary"
        onClick={onViewDetails}
        className={
          isDesktop
            ? "bg-[#3F51B5] hover:bg-[#303F9F] border-none font-bold rounded-xl h-11 shadow-sm w-full text-sm flex items-center justify-center"
            : "flex-1 bg-[#3F51B5] hover:bg-[#303F9F] border-none font-bold rounded-lg h-9 text-xs shadow-sm flex items-center justify-center"
        }
      >
        View Details
      </Button>

      {schoolUrl ? (
        <a
          href={schoolUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={
            isDesktop
              ? "border border-blue-400 text-blue-600 hover:bg-blue-50 font-bold rounded-xl h-11 w-full text-sm transition flex items-center justify-center"
              : "flex-1 border border-blue-100 text-blue-600 hover:bg-blue-50 rounded-lg h-9 text-xs font-bold transition flex items-center justify-center"
          }
        >
          Visit Website
        </a>
      ) : (
        <button
          disabled
          className={
            isDesktop
              ? "border border-gray-200 text-gray-400 font-bold rounded-xl h-11 w-full text-sm cursor-not-allowed flex items-center justify-center"
              : "flex-1 border border-gray-200 text-gray-400 rounded-lg h-9 text-xs font-bold cursor-not-allowed flex items-center justify-center"
          }
        >
          Visit Website
        </button>
      )}
    </div>
  );
}
