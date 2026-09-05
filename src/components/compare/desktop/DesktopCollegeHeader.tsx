"use client";

import { MapPin, Trash2 } from "lucide-react";
import { Button, Spin, Tooltip } from "antd";
import { College } from "@/types/university/ComparisonTable";
import CollegeAvatar from "../shared/CollegeAvatar";
import CollegeBadges from "../shared/CollegeBadges";

interface DesktopCollegeHeaderProps {
  college: College;
  isBestValue: boolean;
  isHighSalary: boolean;
  isLowestCost: boolean;
  isRemoving?: boolean;
  onRemove: (id: string) => void;
  onViewDetails: (id: string) => void;
}

/** One column header in the desktop comparison table: logo, name, location, badges and a remove button. */
export default function DesktopCollegeHeader({
  college,
  isBestValue,
  isHighSalary,
  isLowestCost,
  isRemoving = false,
  onRemove,
  onViewDetails,
}: DesktopCollegeHeaderProps) {
  return (
    <th className="p-4 md:p-8 relative min-w-[140px] md:min-w-[200px] sticky bg-[#FAFBFD] z-20">
      {isRemoving && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-[1px]">
          <Spin size="small" />
        </div>
      )}

      <div className="absolute top-2 right-2 md:top-4 md:right-4 z-40">
        <Tooltip title={isRemoving ? "Removing..." : "Remove college"}>
          <Button
            type="text"
            shape="circle"
            size="small"
            loading={isRemoving}
            disabled={isRemoving}
            icon={
              isRemoving ? undefined : (
                <Trash2 className="w-3.5 h-3.5 text-gray-300 hover:text-red-500" />
              )
            }
            onClick={() => onRemove(college.id)}
          />
        </Tooltip>
      </div>

      <div className="flex flex-col items-center text-center pt-2">
        <CollegeAvatar name={college.name} size="lg" />

        <h3
          className="text-xs md:text-lg font-black text-slate-900 line-clamp-1 hover:text-[#3F51B5] cursor-pointer transition-colors"
          onClick={() => onViewDetails(college.id)}
        >
          {college.shortName}
        </h3>
        <p className="text-[9px] md:text-xs text-gray-400 font-bold flex items-center gap-0.5 md:gap-1 mt-0.5 md:mt-1 justify-center">
          <MapPin className="w-2.5 h-2.5 md:w-3.5 md:h-3.5" />
          {college.location}
        </p>

        <div className="flex flex-col items-center gap-1 mt-2 md:mt-4">
          <CollegeBadges
            isPrivate={college.isPrivate}
            isBestValue={isBestValue}
            isHighSalary={isHighSalary}
            isLowestCost={isLowestCost}
            size="lg"
          />
        </div>
      </div>
    </th>
  );
}
