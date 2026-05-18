import React from "react";
import Link from "next/link";
import { 
  Briefcase, 
  Monitor, 
  BrainCircuit, 
  Settings, 
  HeartPulse, 
  PenTool 
} from "lucide-react";

const categories = [
  {
    title: "Business",
    desc: "MBA, Finance, Management, and Entrepreneurship programs.",
    icon: Briefcase,
    iconColor: "text-orange-600",
    bg: "bg-orange-50",
  },
  {
    title: "Computer Science",
    desc: "AI, Software Engineering, Cybersecurity, and Data Science.",
    icon: Monitor,
    iconColor: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    title: "Psychology",
    desc: "Clinical, Behavioral Sciences, and Counseling specializations.",
    icon: BrainCircuit,
    iconColor: "text-pink-600",
    bg: "bg-pink-50",
  },
  {
    title: "Mechanical Engineering",
    desc: "Robotics, Aerospace, and Material design programs.",
    icon: Settings,
    iconColor: "text-gray-600",
    bg: "bg-gray-100",
  },
  {
    title: "Public Health",
    desc: "Epidemiology, Health Policy, and Global Health studies.",
    icon: HeartPulse,
    iconColor: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    title: "Graphic Design",
    desc: "Visual Arts, Digital Design, and Multimedia programs.",
    icon: PenTool,
    iconColor: "text-yellow-600",
    bg: "bg-yellow-50",
  },
];

export default function Categories() {
  return (
    <section className="px-6 sm:px-10 lg:px-[86px] py-16 flex justify-center">
      <div className="w-full max-w-[2380px]">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-10">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Popular Categories</h2>
          <p className="text-sm text-gray-500">Explore the most in-demand fields of study across the United States.</p>
        </div>
        <Link href="/categories" className="text-blue-600 font-medium text-sm hover:underline mt-4 sm:mt-0 flex items-center gap-1">
          Browse all 40+ categories ↗
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat, i) => {
          const Icon = cat.icon;
          return (
            <div 
              key={i} 
              className={`p-8 rounded-3xl transition-transform hover:-translate-y-1 cursor-pointer ${cat.bg}`}
            >
              <div className="mb-6">
                <Icon className={cat.iconColor} size={28} strokeWidth={1.5} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{cat.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {cat.desc}
              </p>
            </div>
          );
        })}
        </div>
      </div>
    </section>
  );
}
