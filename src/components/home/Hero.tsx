"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Brain, GraduationCap, Search } from "lucide-react";
import { Select } from "antd";

export default function Hero() {
  const router = useRouter();

  const [levels, setLevels] = useState<{ value: string; label: string }[]>([]);
  const [states, setStates] = useState<{ value: string; label: string }[]>([]);
  const [courses, setCourses] = useState<{ value: string; label: string }[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCoursesLoading, setIsCoursesLoading] = useState(false);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

        const statesRes = await fetch(`${apiUrl}/states`);
        if (statesRes.ok) {
          const data = await statesRes.json();
          setStates(
            data.map((state: { state_code: string; state_title: string }) => ({
              value: state.state_code,
              label: state.state_title,
            }))
          );
        } else {
          console.error("Failed to fetch states:", await statesRes.text());
        }

        const credsRes = await fetch(`${apiUrl}/credentials`);
        if (credsRes.ok) {
          const data = await credsRes.json();
          setLevels(
            data.map((credential: { id: number; name: string }) => ({
              value: credential.name,
              label: credential.name,
            }))
          );
        } else {
          console.error("Failed to fetch credentials:", await credsRes.text());
        }
      } catch (error) {
        console.error("Error fetching options:", error);
      }
    };

    fetchOptions();
  }, []);

  const fetchCourses = useCallback(async () => {
    setIsCoursesLoading(true);
    setSelectedCourse(null);

    try {
      const queryParams = new URLSearchParams();
      if (selectedLevel) queryParams.append("credential_title", selectedLevel);
      if (selectedState) queryParams.append("state", selectedState);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const res = await fetch(`${apiUrl}/courses?${queryParams.toString()}`);

      if (res.ok) {
        const data = await res.json();
        setCourses(
          data.map((item: { title: string }) => ({
            value: item.title,
            label: item.title,
          }))
        );
      }
    } catch (err) {
      console.error("Error fetching courses:", err);
    } finally {
      setIsCoursesLoading(false);
    }
  }, [selectedLevel, selectedState]);

  useEffect(() => {
    if (selectedLevel || selectedState) {
      fetchCourses();
    } else {
      setCourses([]);
    }
  }, [selectedLevel, selectedState, fetchCourses]);

  const handleSearch = () => {
    setIsLoading(true);

    const params = new URLSearchParams();
    if (selectedLevel) params.append("credential_title", selectedLevel);
    if (selectedState) params.append("state", selectedState);
    if (selectedCourse) params.append("title", selectedCourse);

    router.push(`/search?${params.toString()}`);
  };

  return (
    <section className="relative overflow-hidden bg-[#f5f8fc] px-6 pb-0 pt-[30px] sm:px-10 lg:px-[49px] flex justify-center">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[42%] bg-[radial-gradient(circle_at_45%_72%,rgba(144,224,206,0.52),rgba(144,224,206,0.16)_26%,rgba(245,248,252,0)_57%)]" />

      <div className="relative w-full max-w-[2380px] grid gap-14 lg:grid-cols-[0.98fr_1fr] lg:gap-[62px]">
        <div className="flex flex-col items-start pt-[10px]">
          <div>

            <span className="mb-5 inline-block rounded-full bg-[#ff3b30] px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-white">
              TOP-TIER EDUCATION
            </span>

            <h1 className="
  mb-6
  max-w-[600px]
  text-[64px]
  lg:text-[78px]
  font-bold
  leading-[0.95]
  tracking-[-0.04em]
  text-[#111827]
">              The Neutral Way to 
             
              Choose a  <span className="text-[#3b5bdb]"> U.S. </span>
              <br />
              Degrees
            </h1>

            <p className="
  mb-8
  max-w-[650px]
  text-[18px]
  leading-[1.3]
  text-[#4b5563]
">              Navigate the complex world of American higher education with ease. Our
              mission is to connect ambitious students with programs that fuel passion and
              guarantee success.
            </p>

            <div className="w-full max-w-[620px] rounded-[32px] md:rounded-[40px] bg-white p-4 sm:p-3 sm:pt-3 shadow-[0_12px_40px_rgba(0,0,0,0.04)]">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="flex flex-col">
                  <label className="pl-1 text-[9px] font-bold uppercase tracking-[0.1em] text-[#0c1724]">
                    Credential Level
                  </label>
                  <div className="flex h-[40px] items-center bg-white px-1">
                    <Select
                      showSearch
                      className="w-full text-[#2f3b4c]"
                      variant="borderless"
                      placeholder="Select credential Level"
                      options={levels}
                      onChange={(value) => setSelectedLevel(value)}
                      filterOption={(input, option) =>
                        (option?.label ?? "")
                          .toString()
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="pl-1 text-[9px] font-bold uppercase tracking-[0.1em] text-[#0c1724]">
                    States
                  </label>
                  <div className="flex h-[36px] items-center bg-white px-1">
                    <Select
                      showSearch
                      className="w-full text-[#2f3b4c]"
                      variant="borderless"
                      placeholder="Select a State"
                      options={states}
                      onChange={(value) => setSelectedState(value)}
                      filterOption={(input, option) =>
                        (option?.label ?? "")
                          .toString()
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="pl-1 text-[9px] font-bold uppercase tracking-[0.1em] text-[#0c1724]">
                    Course / Field of study
                  </label>
                  <div className="flex h-[36px] items-center bg-white px-1">
                    <Select
                      showSearch
                      className="w-full text-[#2f3b4c]"
                      variant="borderless"
                      placeholder="Select a Course"
                      options={courses}
                      value={selectedCourse}
                      loading={isCoursesLoading}
                      onChange={(value) => setSelectedCourse(value)}
                      disabled={!selectedLevel && !selectedState}
                      filterOption={(input, option) =>
                        (option?.label ?? "")
                          .toString()
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleSearch}
                disabled={isLoading}
                className="mt-3 md:mt-1 flex h-[40px] md:h-[26px] w-full md:w-[200px] items-center justify-center gap-2 rounded-full bg-[#3b5bdb] text-[15px] font-semibold text-white shadow-[0_8px_20px_rgba(59,91,219,0.24)] transition-all hover:bg-[#364fc7] disabled:cursor-not-allowed disabled:opacity-70 mx-auto lg:mx-0 lg:ml-[160px]"
              >
                <Search className="h-4 w-4" strokeWidth={2.4} />
                {isLoading ? "Searching..." : "Search Degrees"}
              </button>
            </div>
          </div>
        </div>
        <div className="relative min-h-[220px] lg:min-h-[320px]">
          <div className="relative z-10 overflow-hidden rounded-[48px]">
            <img
              src="/images/collage.webp"
              alt="Students sitting under a tree"
              className="h-[220px] w-full object-cover object-center lg:h-[420px]"
            />
          </div>

          {/* <div className="absolute bottom-[120px] right-[-20px] z-20 hidden h-[70px] w-[210px] items-center gap-4 rounded-full bg-white px-6 shadow-[0_18px_46px_rgba(25,35,55,0.08)] xl:flex">
            <div className="flex -space-x-3">
              <div className="grid h-[42px] w-[42px] place-items-center overflow-hidden rounded-full border-[2px] border-white bg-[#e0f2fe]">
                <img src="https://ui-avatars.com/api/?name=J&background=d9f1ee&color=000" alt="Avatar" className="h-full w-full object-cover" />
              </div>
              <div className="grid h-[42px] w-[42px] place-items-center overflow-hidden rounded-full border-[2px] border-white bg-[#dcfce7]">
                <img src="https://ui-avatars.com/api/?name=S&background=d7e9d2&color=000" alt="Avatar" className="h-full w-full object-cover" />
              </div>
            </div>
            <div>
              <p className="text-[17px] font-extrabold leading-tight text-[#111827]">
                2M+
                <br />
                Students
              </p>
              <p className="mt-0.5 text-[12px] leading-none text-[#6b7280]">
                Already joined SkillUp
              </p>
            </div>
          </div> */}

          {/* <div className="absolute bottom-10 right-[-60px] z-20 hidden h-[60px] w-[60px] place-items-center rounded-full bg-white shadow-[0_14px_36px_rgba(25,35,55,0.12)] xl:grid">
            <Brain className="h-7 w-7 text-[#b64bff]" />
          </div> */}
        </div>
      </div>
    </section>
  );
}
