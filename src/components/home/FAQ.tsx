"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "How do I determine if a university is accredited?",
    a: "You can verify a university's accreditation status by checking the U.S. Department of Education's Database of Accredited Postsecondary Institutions and Programs (DAPIP) or the Council for Higher Education Accreditation (CHEA) directories.",
  },
  {
    q: "What is the difference between a college and a university?",
    a: "In the U.S., 'college' and 'university' are often used interchangeably. Generally, colleges tend to be smaller and focus on undergraduate education, while universities are larger institutions that offer both undergraduate and graduate degree programs.",
  },
  {
    q: "Can international students apply for financial aid?",
    a: "Yes, many U.S. universities offer financial aid or scholarships to international students, though federal aid is typically restricted to U.S. citizens. You should check the specific financial aid policies of each institution.",
  },
  {
    q: "How long does the student visa process typically take?",
    a: "The student visa process can take anywhere from a few weeks to several months. It is recommended to apply as soon as you receive your I-20 form from your accepted university, ideally 3-5 months before your program starts.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="bg-gray-50 px-6 py-20 sm:px-10 lg:px-[86px] flex justify-center">
      <div className="w-full max-w-[2380px]">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-3xl font-extrabold text-gray-900">
            Common Questions
          </h2>
          <p className="text-gray-500">
            Everything you need to know about your upcoming degree search.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={index}
                className={`overflow-hidden rounded-2xl border shadow-sm transition-all duration-300 ease-in-out ${
                  isOpen
                    ? "border-gray-200 bg-white shadow-lg"
                    : "border-gray-100 bg-white"
                }`}
              >
                <button
                  onClick={() => handleToggle(index)}
                  className="flex w-full items-center justify-between p-6 text-left font-semibold text-gray-900"
                >
                  <span>{faq.q}</span>

                  <ChevronDown
                    size={20}
                    className={`text-gray-400 transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <div
                  className={`grid transition-all duration-500 ease-in-out ${
                    isOpen
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="px-6 pb-6 text-sm leading-relaxed text-gray-600">
                      {faq.a}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
