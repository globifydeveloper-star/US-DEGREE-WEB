import React from "react";

const testimonials = [
  {
    text: "Discovering the projected 10-year ROI on my computer science degree helped me confidently choose my university without fear of debt.",
    name: "Sarah Jenkins",
    role: "NYU '25",
    color: "bg-blue-600",
  },
  {
    text: "The admissions predictability tool gave me a realistic look at my chances and helped me build a smarter college list.",
    name: "Michael Chen",
    role: "UCLA '26",
    color: "bg-blue-700",
  },
  {
    text: "Finding hidden scholarships specific to my major was a game-changer. It made out-of-state tuition actually affordable for my family.",
    name: "Priya Thompson",
    role: "UT Austin '24",
    color: "bg-blue-600",
  },
];

export default function Testimonials() {
  return (
    <section className="pb-20 px-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((t, i) => (
          <div key={i} className={`${t.color} rounded-3xl p-8 text-white shadow-xl shadow-blue-900/10 flex flex-col justify-between min-h-[220px]`}>
            <p className="text-sm md:text-base leading-relaxed font-medium mb-8">
              "{t.text}"
            </p>
            <div className="flex items-center gap-3 mt-auto">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
                {t.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-bold">{t.name}</p>
                <p className="text-xs text-blue-200">{t.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
