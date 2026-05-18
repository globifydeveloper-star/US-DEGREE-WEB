import React from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "How do I determine if a university is accredited?",
    a: "You can verify a university's accreditation status by checking the U.S. Department of Education's Database of Accredited Postsecondary Institutions and Programs (DAPIP) or the Council for Higher Education Accreditation (CHEA) directories."
  },
  {
    q: "What is the difference between a college and a university?",
    a: "In the U.S., 'college' and 'university' are often used interchangeably. Generally, colleges tend to be smaller and focus on undergraduate education, while universities are larger institutions that offer both undergraduate and graduate degree programs."
  },
  {
    q: "Can international students apply for financial aid?",
    a: "Yes, many U.S. universities offer financial aid or scholarships to international students, though federal aid is typically restricted to U.S. citizens. You should check the specific financial aid policies of each institution."
  },
  {
    q: "How long does the student visa process typically take?",
    a: "The student visa process can take anywhere from a few weeks to several months. It is recommended to apply as soon as you receive your I-20 form from your accepted university, ideally 3-5 months before your program starts."
  }
];

export default function FAQ() {
  return (
    <section className="px-6 sm:px-10 lg:px-[86px] py-20 bg-gray-50 flex justify-center">
      <div className="w-full max-w-[2380px]">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Common Questions</h2>
          <p className="text-gray-500">Everything you need to know about your upcoming degree search.</p>
        </div>

      <div className="space-y-4">
        {faqs.map((faq, i) => (
          <details key={i} className="group bg-gray-50 rounded-2xl border border-gray-100 open:bg-white open:ring-1 open:ring-gray-200 open:shadow-lg transition-all duration-200">
            <summary className="flex items-center justify-between p-6 cursor-pointer list-none font-semibold text-gray-900">
              {faq.q}
              <span className="transition group-open:rotate-180">
                <ChevronDown size={20} className="text-gray-400" />
              </span>
            </summary>
            <div className="px-6 pb-6 text-gray-600 text-sm leading-relaxed">
              {faq.a}
            </div>
          </details>
        ))}
        </div>
      </div>
    </section>
  );
}
