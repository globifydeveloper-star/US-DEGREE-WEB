'use client';

import React, { useState } from 'react';
import { Button, message } from 'antd';
import { FileText } from 'lucide-react';
import { authedFetch } from '@/lib/auth/api';

interface CompareHeaderProps {
  comparedIds: string[];
}

export default function CompareHeader({ comparedIds }: CompareHeaderProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateReport = async () => {
    if (!comparedIds || comparedIds.length === 0) {
      message.warning("Please select at least two college to compare before generating a report.");
      return;
    }

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
          onClick={handleGenerateReport}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-none font-bold rounded-xl h-12 px-6 shadow-md hover:shadow-lg transition-all flex items-center gap-2 text-sm cursor-pointer"
        >
          {isGenerating ? 'Generating Report...' : 'Generate AI Report'}
        </Button>
      </div>
    </div>
  );
}

