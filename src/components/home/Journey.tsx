import React from "react";
import {
  SearchOutlined,
  FileDoneOutlined,
  BulbOutlined,
  CalculatorOutlined,
} from "@ant-design/icons";

const steps = [
  {
    num: "1",
    title: "Search",
    desc: "Browse thousands of programs across every major U.S. state and city.",
    icon: <SearchOutlined />,
  },
  {
    num: "2",
    title: "Find",
    desc: "Filter results by tuition cost, campus culture, and future career outcomes.",
    icon: <FileDoneOutlined />,
  },
  {
    num: "3",
    title: "Understand",
    desc: "Get deep insights into accreditation, alumni network, and faculty expertise.",
    icon: <BulbOutlined />,
  },
  {
    num: "4",
    title: "Estimate",
    desc: "Calculate your total cost of attendance and potential return on investment.",
    icon: <CalculatorOutlined />,
  },
];

export default function Journey() {
  return (
    <section className="bg-[#f5f7fb] py-16 md:py-20 lg:py-24
px-5 sm:px-8 lg:px-[86px]">
      <div className="max-w-[1400px] mx-auto">
        {/* Heading */}
        <div className="text-center mb-16 lg:mb-24">
          <h2 className="text-[32px] sm:text-[40px] lg:text-[56px] leading-none font-black text-[#111827] mb-6">
            Your Journey to Success
          </h2>

          <p className="text-[18px] text-[#4b5563] max-w-[800px] mx-auto">
            Four simple steps to find, fund, and enroll in your dream U.S.
            degree program.
          </p>
        </div>

        {/* Steps */}
        <div
          className="
    flex
    flex-wrap
    justify-center
    gap-y-14
    gap-x-8
    lg:gap-x-12
    xl:gap-x-16
  "
        >
          {steps.map((step) => (
            <div
              key={step.num}
              className="
    w-full
    sm:w-[280px]
    md:w-[240px]
    lg:w-[260px]
    xl:w-[280px]
  "
            >
              {/* Number + Icon */}
              <div
                className="
    flex
    items-center
    gap-4
    sm:gap-6
    lg:gap-8
    mb-6
    justify-center
    md:justify-start
  "
              >                {/* Number Circle */}
                <div className="relative flex items-center justify-center">
                  {/* Soft Purple Glow */}
                  <div
                    className="
                      absolute
                      -inset-4
                      rounded-full
                      bg-[#dbe2ff]
                      opacity-40
                      blur-xl
                    "
                  />

                  {/* Circle */}
                  <div
                    className="
                     relative w-[64px] h-[64px] sm:w-[72px] sm:h-[72px] lg:w-[84px] lg:h-[84px] rounded-full  border border-white/70  flex
                    items-center  justify-center shadow-[0_8px_24px_rgba(99,102,241,0.06)]  "
                    style={{
                      background:
                        "radial-gradient(circle at center, #ffffff 0%, #fbfbfb 65%, #eef2ff 100%)",
                    }}
                  >
                    <span
                      className="
                        text-[#2956ff]
                        text-[28px]
                        sm:text-[34px]
                        lg:text-[42px]
                        font-semibold
                        leading-none
                      "
                    >
                      {step.num}
                    </span>
                  </div>
                </div>

                {/* Icon */}
                <div
                  className="
                    text-[48px]
                    sm:text-[60px]
                    lg:text-[76px]
                    text-[#d8def8]
                    leading-none
                    opacity-90
                  "
                >
                  {step.icon}
                </div>
              </div>

              {/* Title */}
              <h3
                className="
                  text-[24px]
                  lg:text-[28px]
                  font-extrabold
                  text-[#111827]
                  decoration-[2px]
                  mb-4
                  text-center
                  md:text-left
                "
              >
                {step.title}
              </h3>

              {/* Description */}
              <p
                className="
                  text-[15px]
                  lg:text-[16px]
                  leading-[1.8]
                  text-[#4b5563]
                  decoration-[1px]
                  max-w-full
                  sm:max-w-[240px]
                  text-center
                  md:text-left
                "
              >
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}