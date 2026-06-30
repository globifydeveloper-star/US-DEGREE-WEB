"use client";

import React from "react";
import {
  ReadOutlined,
  TeamOutlined,
  SafetyCertificateOutlined,
  DollarCircleOutlined,
} from "@ant-design/icons";

const stats = [
  {
    title: "5,000+",
    desc: "Universities Tracked",
    bg: "#DCEBFF",
    icon: <ReadOutlined />,
  },
  {
    title: "2 lakhs+",
    desc: "Degree Programs",
    bg: "#DCE3EE",
    icon: <TeamOutlined />,
  },
  {
    title: "100%",
    desc: "Accredited Degrees",
    bg: "#D9F5EA",
    icon: <SafetyCertificateOutlined />,
  },
  {
    title: "$48K – $120K",
    desc: (
      <>
        Graduate Salary Range
        <br />
        The #1 Parent Concern
      </>
    ),
    bg: "#F2E9C8",
    icon: <DollarCircleOutlined />,
  },
];

export default function Stats() {
  return (
    <section className="px-4 sm:px-6 lg:px-[86px] py-8 sm:py-12">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((item, i) => (
          <div
            key={i}
            className="
              h-[156px]
              sm:h-[178px]
              rounded-[20px]
              sm:rounded-[28px]
              flex
              flex-col
              items-center
              justify-center
              text-center
              px-3
              sm:px-4
            "
            style={{ backgroundColor: item.bg }}
          >
            {/* Icon */}
            <div
              className="
                text-[32px]
                sm:text-[48px]
                text-[#4F46E5]
                leading-none
                mb-3
                sm:mb-5
              "
            >
              {item.icon}
            </div>

            {/* Title */}
            <h3
              className="
                text-[18px]
                sm:text-[22px]
                md:text-[24px]
                font-extrabold
                text-[#111827]
                leading-none
                decoration-[2px]
                mb-1.5
                sm:mb-2
              "
            >
              {item.title}
            </h3>

            {/* Description */}
            <div
              className="
                text-[12px]
                sm:text-[15px]
                text-[#4B5563]
                leading-[1.3]
              "
            >
              {item.desc}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
