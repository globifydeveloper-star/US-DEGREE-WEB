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
    slug: "business",
    desc: "MBA, Finance, Management, and Entrepreneurship programs.",
    icon: Briefcase,
    iconColor: "text-orange-600",
    bg: "bg-orange-50",
  },
  {
    title: "Computer Science",
    slug: "computer-science",
    desc: "AI, Software Engineering, Cybersecurity, and Data Science.",
    icon: Monitor,
    iconColor: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    title: "Psychology",
    slug: "psychology",
    desc: "Clinical, Behavioral Sciences, and Counseling specializations.",
    icon: BrainCircuit,
    iconColor: "text-pink-600",
    bg: "bg-pink-50",
  },
  {
    title: "Mechanical Engineering",
    slug: "mechanical-engineering",
    desc: "Robotics, Aerospace, and Material design programs.",
    icon: Settings,
    iconColor: "text-gray-600",
    bg: "bg-gray-100",
  },
  {
    title: "Public Health",
    slug: "public-health",
    desc: "Epidemiology, Health Policy, and Global Health studies.",
    icon: HeartPulse,
    iconColor: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    title: "Graphic Design",
    slug: "graphic-design",
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <Link
                key={i}
                href={`/search?category=${cat.slug}`}
                className={`block p-8 rounded-3xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer ${cat.bg}`}
              >
                <div className="mb-6">
                  <Icon className={cat.iconColor} size={28} strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{cat.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {cat.desc}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
