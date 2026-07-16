interface AthleticsSummaryParagraphProps {
  summaryParagraph: string | null;
}

export default function AthleticsSummaryParagraph({
  summaryParagraph,
}: AthleticsSummaryParagraphProps) {
  if (!summaryParagraph) return null;

  return (
    <div>
      <h2 className="text-2xl font-bold text-black font-poppins mb-4">
        About this program
      </h2>
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 sm:p-6">
        <p className="text-sm text-slate-700 font-poppins leading-relaxed">
          {summaryParagraph}
        </p>
      </div>
    </div>
  );
}
