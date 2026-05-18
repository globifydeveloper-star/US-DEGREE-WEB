import React from "react";
import { Search, FileCheck, Lightbulb, Calculator } from "lucide-react";

const steps = [
  {
    num: "1",
    title: "Search",
    desc: "Browse hundreds of programs across every major U.S. state instantly.",
    icon: Search,
  },
  {
    num: "2",
    title: "Find",
    desc: "Filter results by tuition, test, campus safety, and more visual criteria.",
    icon: FileCheck,
  },
  {
    num: "3",
    title: "Understand",
    desc: "Discover insights like international student services and hidden fees.",
    icon: Lightbulb,
  },
  {
    num: "4",
    title: "Estimate",
    desc: "Calculate your total cost of attendance and potential return on investment.",
    icon: Calculator,
  },
];

export default function Journey() {
  return (
    <section className="px-6 sm:px-10 lg:px-[86px] py-20 flex justify-center">
      <div className="w-full max-w-[2380px] text-center">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Your Journey to Success</h2>
        <p className="text-gray-500 mb-16 max-w-2xl mx-auto">
          Four simple steps to find, fund, and enroll in your dream U.S. degree program.
        </p>

      <div className="relative grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Connecting line for desktop */}
        <div className="hidden md:block absolute top-6 left-[12.5%] right-[12.5%] h-px bg-blue-100 -z-10"></div>

        {steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <div key={i} className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-white border-2 border-blue-100 flex items-center justify-center mb-6 shadow-sm relative text-blue-600 font-bold text-lg bg-clip-padding">
                {step.num}
                {/* Floating icon */}
                <div className="absolute -right-3 -top-3 w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center text-blue-500">
                  <Icon size={14} />
                </div>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed max-w-[200px]">
                {step.desc}
              </p>
            </div>
          );
        })}
        </div>
      </div>
    </section>
  );
}
