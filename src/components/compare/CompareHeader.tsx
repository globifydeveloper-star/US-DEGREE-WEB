'use client';

import React, { useState } from 'react';
import { Button, message, Modal } from 'antd';
import Image from 'next/image';
import { FileText, MapPin, Sparkles, X } from 'lucide-react';
import { authedFetch } from '@/lib/auth/api';
import { College } from '@/types/university/ComparisonTable';

interface CompareHeaderProps {
  comparedIds: string[];
  comparedColleges: College[];
}

export default function CompareHeader({ comparedIds, comparedColleges }: CompareHeaderProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Open the confirmation modal listing the selected colleges. The actual
  // generation is deferred to handleGenerateReport (the modal's "Generate").
  const handleOpenConfirm = () => {
    if (!comparedIds || comparedIds.length === 0) {
      message.warning("Please select at least two college to compare before generating a report.");
      return;
    }
    setIsConfirmOpen(true);
  };

  const handleGenerateReport = async () => {
    if (!comparedIds || comparedIds.length === 0) {
      message.warning("Please select at least two college to compare before generating a report.");
      return;
    }

    setIsConfirmOpen(false);
    setIsGenerating(true);
    const key = 'generate-report';
    message.open({
      key,
      type: 'loading',
      content: 'Analyzing metrics & generating your AI decision report...',
      duration: 0,
    });

    try {
      const res = await authedFetch('/report/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selectedColleges: comparedIds.map((id) => Number(id)),
          programId: 20015, // Default to Computer Science
        }),
      });

      if (!res.ok) {
        throw new Error(`Report generation failed: ${res.status}`);
      }

      const result = await res.json() as { pdfUrl: string };

      message.open({
        key,
        type: 'success',
        content: 'Premium PDF report generated successfully!',
        duration: 2,
      });

      // Open PDF in a new tab
      if (result.pdfUrl) {
        window.open(result.pdfUrl, '_blank');
      }
    } catch (err) {
      console.error("Report generation error:", err);
      message.open({
        key,
        type: 'error',
        content: 'Failed to generate the report. Please try again.',
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
          loading={isGenerating}
          disabled={comparedIds.length === 0}
          onClick={handleOpenConfirm}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-none font-bold rounded-xl h-12 px-6 shadow-md hover:shadow-lg transition-all flex items-center gap-2 text-sm cursor-pointer"
        >
          {isGenerating ? 'Generating Report...' : 'Generate AI Report'}
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
          container: { padding: 0, borderRadius: 20, overflow: 'hidden' },
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
            We&apos;ll analyze the {comparedColleges.length} college{comparedColleges.length === 1 ? '' : 's'} below and build your premium PDF report.
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
                      {college.name ? college.name.charAt(0) : 'U'}
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
    </div>
  );
}

