"use client";

import React, { useState } from "react";
import { Button, message, Modal } from "antd";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FileText, MapPin, Sparkles, X } from "lucide-react";
import { authedFetch, fetchProfile } from "@/lib/auth/api";
import { College } from "@/types/university/ComparisonTable";
import { useAuth } from "@/context/AuthContext";
import { emptyProfile, mergeProfile } from "@/components/userprofile/ProfileDashboard";
import { calculateProfileCompletion } from "@/lib/profileCompletion";

// Below this, we ask the user to finish their profile before generating a
// report so the AI has enough signal (academics + preferences) to personalize it.
const MIN_PROFILE_COMPLETION_FOR_REPORT = 90;

interface CompareHeaderProps {
  comparedIds: string[];
  comparedColleges: College[];
}

export default function CompareHeader({
  comparedIds,
  comparedColleges,
}: CompareHeaderProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isCheckingProfile, setIsCheckingProfile] = useState(false);
  const [isProfileWarningOpen, setIsProfileWarningOpen] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  // Gate report generation on profile completeness, then open the
  // confirmation modal listing the selected colleges. The actual generation
  // is deferred to handleGenerateReport (the modal's "Generate").
  const handleOpenConfirm = async () => {
    if (!comparedIds || comparedIds.length === 0) {
      message.warning(
        "Please select at least two college to compare before generating a report.",
      );
      return;
    }

    setIsCheckingProfile(true);
    try {
      const data = await fetchProfile<Record<string, unknown>>();
      const profile = mergeProfile(emptyProfile(user), data);
      const completion = calculateProfileCompletion(profile);
      if (completion < MIN_PROFILE_COMPLETION_FOR_REPORT) {
        setIsProfileWarningOpen(true);
        return;
      }
    } catch (err) {
      console.error("Failed to check profile completion:", err);
      // Fail open — don't block report generation on a profile-check hiccup.
    } finally {
      setIsCheckingProfile(false);
    }

    setIsConfirmOpen(true);
  };

  const handleGenerateReport = async () => {
    if (!comparedIds || comparedIds.length === 0) {
      message.warning(
        "Please select at least two college to compare before generating a report.",
      );
      return;
    }

    setIsConfirmOpen(false);
    setIsGenerating(true);
    const key = "generate-report";
    message.open({
      key,
      type: "loading",
      content: "Analyzing metrics & generating your AI decision report...",
      duration: 0,
    });

    try {
      const res = await authedFetch("/report/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          selectedColleges: comparedIds.map((id) => Number(id)),
          programId: 20015, // Default to Computer Science
        }),
      });

      if (!res.ok) {
        throw new Error(`Report generation failed: ${res.status}`);
      }

      const result = (await res.json()) as {
        reportId?: string;
        pdfUrl: string;
      };

      message.open({
        key,
        type: "success",
        content: "Premium PDF report generated successfully!",
        duration: 2,
      });

      // Send the user to the "My Reports" section of their profile, where the
      // new report now shows up with a download button, instead of only
      // handing them a one-time link.
      if (result.reportId) {
        router.push("/profile#reports_section");
      } else if (result.pdfUrl) {
        window.open(result.pdfUrl, "_blank");
      }
    } catch (err) {
      console.error("Report generation error:", err);
      message.open({
        key,
        type: "error",
        content: "Failed to generate the report. Please try again.",
        duration: 3,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="mb-10 text-center lg:text-left flex flex-col lg:flex-row justify-between items-center gap-6">
      <div>
        <div className="flex items-center gap-2 justify-center lg:justify-start mb-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#3F51B5] bg-blue-50 px-3 py-1 rounded-full">
            Interactive Decision Engine
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-none">
          Compare <span className="text-[#3F51B5]">U.S. Colleges</span>
        </h1>
        <p className="text-gray-500 font-medium text-lg mt-2 tracking-tight">
          Compare academic metrics, annual tuition fees, and career outcomes.
        </p>
      </div>

      <div className="shrink-0">
        <Button
          type="primary"
          icon={<FileText className="w-4 h-4" />}
          loading={isGenerating || isCheckingProfile}
          disabled={comparedIds.length === 0}
          onClick={handleOpenConfirm}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-none font-bold rounded-xl h-12 px-6 shadow-md hover:shadow-lg transition-all flex items-center gap-2 text-sm cursor-pointer"
        >
          {isGenerating
            ? "Generating Report..."
            : isCheckingProfile
              ? "Checking Profile..."
              : "Generate AI Report"}
        </Button>
      </div>

      {/* Confirmation modal: review the selected colleges before generating. */}
      <Modal
        open={isConfirmOpen}
        onCancel={() => setIsConfirmOpen(false)}
        footer={null}
        closeIcon={null}
        centered
        width={460}
        styles={{
          body: { padding: 0 },
          container: { padding: 0, borderRadius: 20, overflow: "hidden" },
        }}
        className="font-sans"
      >
        {/* Header band (brand blue) */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 text-left relative">
          <button
            aria-label="Close"
            onClick={() => setIsConfirmOpen(false)}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-white" />
            <h3 className="text-lg font-black text-white tracking-tight">
              Generate AI Decision Report
            </h3>
          </div>
          <p className="text-blue-100 text-xs font-medium">
            We&apos;ll analyze the {comparedColleges.length} college
            {comparedColleges.length === 1 ? "" : "s"} below and build your
            premium PDF report.
          </p>
        </div>

        {/* Selected colleges list */}
        <div className="px-6 py-5 bg-white">
          <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-3">
            Colleges in this report
          </p>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {comparedColleges.map((college) => (
              <div
                key={college.id}
                className="flex items-center gap-3 p-2.5 rounded-xl border border-gray-100 bg-[#FAFBFD]"
              >
                <div className="w-9 h-9 bg-white border border-gray-100 rounded-lg p-1 flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
                  {college.logo ? (
                    <Image
                      src={college.logo}
                      alt={college.name}
                      width={28}
                      height={28}
                      className="object-contain max-h-full max-w-full"
                      referrerPolicy="no-referrer"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full rounded bg-blue-100 flex items-center justify-center font-bold text-[#3F51B5] text-sm">
                      {college.name ? college.name.charAt(0) : "U"}
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate leading-snug">
                    {college.shortName || college.name}
                  </p>
                  <p className="text-[11px] text-gray-400 font-semibold flex items-center gap-1 truncate">
                    <MapPin className="w-3 h-3 shrink-0" />
                    {college.location}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="px-6 py-4 bg-white border-t border-gray-100 flex items-center justify-end gap-3">
          <Button
            danger
            onClick={() => setIsConfirmOpen(false)}
            className="font-bold rounded-xl h-10 px-5 border border-red-200 text-red-500 hover:!text-red-600 hover:!border-red-400"
          >
            Cancel
          </Button>
          <Button
            type="primary"
            icon={<FileText className="w-4 h-4" />}
            onClick={handleGenerateReport}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-none font-bold rounded-xl h-10 px-5 shadow-md flex items-center gap-2"
          >
            Generate
          </Button>
        </div>
      </Modal>

      {/* Incomplete-profile gate: shown instead of the confirm modal when the
          profile is below the completion threshold. */}
      <Modal
        open={isProfileWarningOpen}
        onCancel={() => setIsProfileWarningOpen(false)}
        footer={null}
        closeIcon={null}
        centered
        width={440}
        styles={{
          body: { padding: 0 },
          container: { padding: 0, borderRadius: 20, overflow: "hidden" },
        }}
        className="font-sans"
      >
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 text-left relative">
          <button
            aria-label="Close"
            onClick={() => setIsProfileWarningOpen(false)}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-white" />
            <h3 className="text-lg font-black text-white tracking-tight">
             Complete Your Profile for Better Insights
            </h3>
          </div>
        </div>

        <div className="px-6 py-5 bg-white">
          <p className="text-sm text-slate-600 leading-relaxed">
           Your report will be generated based on the colleges in your Compare list. By completing your profile, 
           we can personalize the analysis to match your academic background, 
           interests, and career goals helping you make a more informed decision.
          </p>
        </div>

        <div className="px-6 py-4 bg-white border-t border-gray-100 flex items-center justify-end gap-3">
          <Button
            onClick={() => {
              setIsProfileWarningOpen(false);
              setIsConfirmOpen(true);
            }}
            className="font-bold rounded-xl h-10 px-5"
          >
            Not Now
          </Button>
          <Button
            type="primary"
            onClick={() => {
              setIsProfileWarningOpen(false);
              router.push("/profile#profile_info_card");
            }}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-none font-bold rounded-xl h-10 px-5 shadow-md"
          >
            Complete Profile
          </Button>
        </div>
      </Modal>
    </div>
  );
}
