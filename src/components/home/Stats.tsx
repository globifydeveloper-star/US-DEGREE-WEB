import React from "react";
import { GraduationCap, Users, ShieldCheck, CircleDollarSign } from "lucide-react";

const stats = [
  {
    title: "5,000+",
    desc: "Universities Tracked",
    bg: "bg-blue-100",
    iconBg: "bg-blue-200",
    iconColor: "text-blue-600",
    icon: GraduationCap,
  },
  {
    title: "2 lakhs+",
    desc: "Degree Programs",
    bg: "bg-gray-100",
    iconBg: "bg-gray-200",
    iconColor: "text-gray-600",
    icon: Users,
  },
  {
    title: "100%",
    desc: "Accredited Degrees",
    bg: "bg-green-100",
    iconBg: "bg-green-200",
    iconColor: "text-green-600",
    icon: ShieldCheck,
  },
  {
    title: "$48K – $120K",
    desc: "Graduate Salary Range\nFor average program",
    bg: "bg-yellow-100",
    iconBg: "bg-yellow-200",
    iconColor: "text-yellow-600",
    icon: CircleDollarSign,
  },
];

export default function Stats() {
  return (
    <section className="px-6 sm:px-10 lg:px-[86px] py-12 flex justify-center">
      <div className="w-full max-w-[2380px]">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-10">
        {stats.map((item, i) => {
          const Icon = item.icon;
          return (
            <div
              key={i}
              className={`p-8 rounded-3xl text-center flex flex-col items-center justify-center transition-transform hover:-translate-y-1 cursor-default ${item.bg}`}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${item.iconBg}`}>
                <Icon className={item.iconColor} size={24} strokeWidth={2} />
              </div>
              <h3 className="text-2xl font-extrabold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-xs font-medium text-gray-600 whitespace-pre-line">{item.desc}</p>
            </div>
          );
        })}
        </div>
      </div>
    </section>
  );
}