"use client";

import { MapPin, Trash2 } from "lucide-react";
import { Button } from "antd";
import { College } from "@/types/university/ComparisonTable";
import CollegeAvatar from "../shared/CollegeAvatar";
import CollegeBadges from "../shared/CollegeBadges";
import ActionButtons from "../shared/ActionButtons";

interface MobileCollegeCardProps {
  college: College;
  isBestValue: boolean;
  isHighSalary: boolean;
  isLowestCost: boolean;
  onRemove: (id: string) => void;
  onViewDetails: (id: string) => void;
}

/** One card in the horizontally-scrolling "school directory" strip at the top of the mobile view. */
export default function MobileCollegeCard({
  college,
  isBestValue,
  isHighSalary,
  isLowestCost,
  onRemove,
  onViewDetails,
}: MobileCollegeCardProps) {
  return (
    <div className="min-w-[260px] max-w-[280px] bg-white border border-gray-100 rounded-2xl p-4 shadow-sm snap-start flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <CollegeAvatar name={college.name} logo={college.logo} size="md" />
            <div className="min-w-0">
              <h4
                className="font-black text-slate-900 text-sm truncate leading-snug hover:text-[#3F51B5] cursor-pointer transition-colors"
                onClick={() => onViewDetails(college.id)}
              >
                {college.shortName}
              </h4>
              <p className="text-[10px] text-gray-400 font-bold flex items-center gap-0.5 truncate mt-0.5">
                <MapPin className="w-3 h-3 flex-shrink-0" />
                {college.location}
              </p>
            </div>
          </div>
          <Button
            type="text"
            shape="circle"
            size="small"
            icon={<Trash2 className="w-3.5 h-3.5 text-gray-300 hover:text-red-500" />}
            onClick={() => onRemove(college.id)}
          />
        </div>

        <div className="flex flex-wrap gap-1.5 mt-3">
          <CollegeBadges
            isPrivate={college.isPrivate}
            isBestValue={isBestValue}
            isHighSalary={isHighSalary}
            isLowestCost={isLowestCost}
            size="sm"
          />
        </div>
      </div>

      <ActionButtons
        schoolUrl={college.schoolUrl}
        onViewDetails={() => onViewDetails(college.id)}
        layout="mobile"
      />
    </div>
  );
}
