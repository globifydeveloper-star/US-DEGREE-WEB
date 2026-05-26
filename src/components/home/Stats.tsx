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
    <section className="px-6 lg:px-[86px] py-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((item, i) => (
          <div
            key={i}
            className="
              h-[178px]
              rounded-[28px]
              flex
              flex-col
              items-center
              justify-center
              text-center
            "
            style={{ backgroundColor: item.bg }}
          >
            {/* Icon */}
            <div
              className="
                text-[48px]
                text-[#4F46E5]
                leading-none
                mb-5
              "
            >
              {item.icon}
            </div>

            {/* Title */}
            <h3
              className="
                text-[22px]
                md:text-[24px]
                font-extrabold
                text-[#111827]
                leading-none
                decoration-[2px]
                mb-2
              "
            >
              {item.title}
            </h3>

            {/* Description */}
            <div
              className="
                text-[15px]
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