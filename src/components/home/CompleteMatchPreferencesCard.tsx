"use client";

import Link from "next/link";
import { Card, Button } from "antd";
import { CompassOutlined, ArrowRightOutlined } from "@ant-design/icons";

// Same brand accent as the profile-page Match Preferences Board
// (src/components/userprofile/cards/PreferencesCard.tsx) so this soft-gate
// prompt reads as the same feature, not a new visual language.
const BRAND_BLUE = "#3b5bdb";

/**
 * Soft-gate prompt shown above the Popular Categories grid when the user is
 * logged in but hasn't completed their Match Preferences yet. The grid
 * still renders the default categories below this, unchanged.
 */
export default function CompleteMatchPreferencesCard() {
  return (
    <Card
      variant="borderless"
      className="shadow-md rounded-2xl border border-neutral-100 mb-6 sm:mb-8"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
            <CompassOutlined />
          </span>
          <div>
            <h3 className="font-bold text-gray-900">
              Complete your Match Preferences
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Tell us your preferred states, majors, and degree level so we
              can personalize these categories to you.
            </p>
          </div>
        </div>
        <Link href="/profile" className="sm:shrink-0">
          <Button
            icon={<ArrowRightOutlined />}
            iconPosition="end"
            className="w-full sm:w-auto"
            style={{
              borderRadius: "8px",
              borderColor: BRAND_BLUE,
              color: BRAND_BLUE,
            }}
          >
            Complete Preferences
          </Button>
        </Link>
      </div>
    </Card>
  );
}
