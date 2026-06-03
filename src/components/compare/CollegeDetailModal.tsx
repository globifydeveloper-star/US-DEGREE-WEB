'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Spin } from 'antd';
import Image from 'next/image';
import {
  X,
  MapPin,
  ExternalLink,
  Users,
  BookOpen,
  GraduationCap,
  DollarSign,
  TrendingUp,
  UserCheck,
  Award,
  BarChart2,
  Percent,
  Home,
  Briefcase,
} from 'lucide-react';
import { College } from '@/types/compare';

interface CollegeDetailModalProps {
  college: College | null;
  onClose: () => void;
}

// ── Formatting helpers ────────────────────────────────────────────
const fmt$ = (v: number | null | undefined) =>
  v != null ? `$${Math.round(v).toLocaleString()}` : 'N/A';

const fmtNum = (v: number | null | undefined) =>
  v != null ? Math.round(v).toLocaleString() : 'N/A';

// Handles both decimal (0.43) and whole-number (43) percentage values
const fmtPct = (v: number | null | undefined) => {
  if (v == null) return 'N/A';
  const pct = v > 1 ? v : v * 100;
  return `${pct.toFixed(1)}%`;
};

const fmtPct0 = (v: number | null | undefined) => {
  if (v == null) return 'N/A';
  const pct = v > 1 ? v : v * 100;
  return `${Math.round(pct)}%`;
};

// ── Progress bar ──────────────────────────────────────────────────
function ProgressBar({ value, color = 'bg-[#3F51B5]' }: { value: number; color?: string }) {
  const pct = Math.min(value > 1 ? value : value * 100, 100);
  return (
    <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1.5">
      <div className={`h-1.5 rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
    </div>
  );
}

// ── Stat card ─────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  sub,
  icon,
  colorClasses,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  colorClasses: string; // e.g. "bg-blue-50 text-blue-600 border-blue-100"
}) {
  const [bg, text, border] = colorClasses.split(' ');
  return (
    <div className={`flex items-center gap-3 p-4 rounded-2xl border ${border} bg-white shadow-sm`}>
      <div className={`p-2.5 rounded-xl ${bg} ${text} flex-shrink-0`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 leading-none">{label}</p>
        <p className="text-base font-black text-slate-900 leading-tight mt-0.5">{value}</p>
        {sub && <p className="text-[10px] text-gray-400 font-semibold mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ── Row inside a detail section ───────────────────────────────────
function Row({
  label,
  value,
  highlight,
  bar,
  barValue,
  barColor,
}: {
  label: string;
  value: string;
  highlight?: string;
  bar?: boolean;
  barValue?: number;
  barColor?: string;
}) {
  return (
    <div className="border-t border-gray-50 pt-3 first:border-0 first:pt-0">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-500">{label}</span>
        <span className={`text-sm font-black ${highlight ?? 'text-slate-900'}`}>{value}</span>
      </div>
      {bar && barValue != null && (
        <ProgressBar value={barValue} color={barColor} />
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────
export default function CollegeDetailModal({ college, onClose }: CollegeDetailModalProps) {
  const [loading, setLoading] = useState(false);
  const [overview, setOverview] = useState<any>(null);
  const [campus, setCampus] = useState<any>(null);
  const [tuition, setTuition] = useState<any>(null);
  const [outcomes, setOutcomes] = useState<any>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

  useEffect(() => {
    if (!college) return;
    setLoading(true);
    setOverview(null);
    setCampus(null);
    setTuition(null);
    setOutcomes(null);

    const safe = (p: Promise<Response>) =>
      p.then(r => (r.ok ? r.json() : null)).catch(() => null);

    Promise.all([
      safe(fetch(`${apiUrl}/overview/${college.id}/default`)),
      safe(fetch(`${apiUrl}/campus/${college.id}`)),
      safe(fetch(`${apiUrl}/tuition/${college.id}`)),
      safe(fetch(`${apiUrl}/outcomes/${college.id}/default`)),
    ]).then(([ov, ca, tu, ou]) => {
      setOverview(ov);
      setCampus(ca);
      setTuition(tu);
      setOutcomes(ou);
    }).finally(() => setLoading(false));
  }, [college?.id]);

  if (!college) return null;

  // ── Helpers ─────────────────────────────────────────────────────
  // Normalise any rate to 0-1 decimal (handles APIs that return 94 OR 0.94)
  const toRate = (v: number | null | undefined): number | null => {
    if (v == null) return null;
    return Number(v) > 1 ? Number(v) / 100 : Number(v);
  };

  // ── Derived values ──────────────────────────────────────────────

  // Institution overview — use college prop values as fallbacks for fields
  // already computed by the compare page's own API calls
  const totalStudents =
    campus?.campus?.size ??
    overview?.students?.size ??
    college.studentPopulation;

  const facultyRatio = overview?.students?.student_faculty_ratio ?? null;

  // retention_rate may be decimal (0.98) or whole (98) — normalise to 0-1
  const retentionRate = toRate(overview?.students?.retention_rate);

  const programCount = overview?.school?.program_count ?? null;
  const fafsaApps = overview?.students?.fafsa_applications ?? null;

  // completion_rate may be decimal (0.94) or whole (94) — normalise to 0-1
  // Fall back to college.graduationRate which is already 0-1
  const rawCompletion = overview?.completion?.completion_rate;
  const graduationRate: number | null =
    rawCompletion != null ? toRate(rawCompletion) : college.graduationRate;

  // Campus / demographics
  const gradStudents = campus?.students?.grad_students ?? null;
  const menPct: number | null = campus?.students?.demographics?.men ?? null;
  const womenPct: number | null = campus?.students?.demographics?.women ?? null;
  const sizeCategory: string | null = campus?.campus?.size_category ?? null;
  // repayment may be decimal or whole — normalise via toRate
  const repayment3yr = toRate(campus?.repayment?.all_borrowers_3yr);

  // Admissions — fall back to compare-page College props
  const admissionRate: number | null =
    overview?.admissions?.admission_rate != null
      ? Number(overview.admissions.admission_rate)   // already decimal (0.04)
      : college.acceptanceRate;

  const satRwMin = overview?.admissions?.sat_rw_min;
  const satMathMin = overview?.admissions?.sat_math_min;
  const satRwMax = overview?.admissions?.sat_rw_max;
  const satMathMax = overview?.admissions?.sat_math_max;
  const satMin =
    satRwMin != null && satMathMin != null
      ? Number(satRwMin) + Number(satMathMin)
      : college.satMin;
  const satMax =
    satRwMax != null && satMathMax != null
      ? Number(satRwMax) + Number(satMathMax)
      : college.satMax;

  // Tuition & Aid — fall back to compare-page College props
  const tuitionInState =
    tuition?.tuition?.tuition_in_state ?? college.tuitionInState;
  const tuitionOutState =
    tuition?.tuition?.tuition_out_state ?? college.tuitionOutOfState;
  const booksupply = tuition?.tuition?.booksupply ?? 1200;
  const roomboard = tuition?.housing?.roomboard_oncampus ?? 7348;
  const otherExp = tuition?.expenses?.otherexpense_oncampus ?? 2832;
  const stickerPrice =
    tuitionInState != null ? tuitionInState + booksupply + roomboard + otherExp : null;
  const aidPct = tuition?.financial_aid?.aid_percentage ?? null;
  // students_with_any_loan is a decimal (0.50 → 50%)
  const loanPct = tuition?.financial_aid?.students_with_any_loan ?? null;

  const netPrices = [
    { label: '$0 – $30k', value: tuition?.net_price?.income_0_30000 },
    { label: '$30k – $48k', value: tuition?.net_price?.income_30001_48000 },
    { label: '$48k – $75k', value: tuition?.net_price?.income_48001_75000 },
    { label: '$75k – $110k', value: tuition?.net_price?.income_75001_110000 },
    { label: '$110k+', value: tuition?.net_price?.income_110001_plus },
  ];
  const hasNetPrices = netPrices.some(np => np.value != null);

  // Outcomes — fall back to college.medianSalary (10yr from compare page)
  const salary1yr = outcomes?.earnings?.year_1 ?? overview?.earnings?.year_1 ?? null;
  const salary10yr =
    outcomes?.earnings?.year_10 ??
    overview?.earnings?.year_10 ??
    college.medianSalary;
  const growthRate = outcomes?.earnings?.growth_rate ?? null;
  // emp_factor is a decimal (0.95 → 95%)
  const empFactor = outcomes?.completion?.emp_factor ?? null;
  const roi20yr = outcomes?.roi?.roi_20yr ?? overview?.roi?.roi_20yr ?? null;

  // ── Stat cards data ─────────────────────────────────────────────
  const statCards = [
    {
      label: 'Total Students',
      value: fmtNum(totalStudents),
      sub: sizeCategory ?? undefined,
      icon: <Users className="w-4.5 h-4.5" />,
      colorClasses: 'bg-blue-50 text-blue-600 border-blue-100',
    },
    {
      label: 'Faculty Ratio',
      value: facultyRatio != null
        ? (String(facultyRatio).includes(':') ? String(facultyRatio) : `${facultyRatio}:1`)
        : 'N/A',
      icon: <UserCheck className="w-4.5 h-4.5" />,
      colorClasses: 'bg-violet-50 text-violet-600 border-violet-100',
    },
    {
      label: 'Retention Rate',
      value: fmtPct0(retentionRate),
      icon: <Award className="w-4.5 h-4.5" />,
      colorClasses: 'bg-green-50 text-green-600 border-green-100',
    },
    {
      label: 'Total Programs',
      value: fmtNum(programCount),
      icon: <BookOpen className="w-4.5 h-4.5" />,
      colorClasses: 'bg-amber-50 text-amber-600 border-amber-100',
    },
    {
      label: 'FAFSA Applications',
      value: fmtNum(fafsaApps),
      icon: <GraduationCap className="w-4.5 h-4.5" />,
      colorClasses: 'bg-teal-50 text-teal-600 border-teal-100',
    },
    {
      label: 'Completion Rate',
      value: fmtPct0(graduationRate),
      icon: <BarChart2 className="w-4.5 h-4.5" />,
      colorClasses: 'bg-rose-50 text-rose-600 border-rose-100',
    },
  ];

  return (
    <Modal
      open={!!college}
      onCancel={onClose}
      footer={null}
      centered
      width="min(920px, 95vw)"
      className="college-detail-modal font-sans"
      closeIcon={<X className="w-5 h-5 text-white/70 hover:text-white" />}
      styles={{
        body: { padding: 0 },
        mask: { backdropFilter: 'blur(4px)', background: 'rgba(0,0,0,0.45)' },
      }}
      style={{ padding: 0, borderRadius: '1.25rem', overflow: 'hidden' }}
    >
      {/* ── Header ───────────────────────────────────────────────── */}
      <div className="relative bg-gradient-to-br from-[#3F51B5] via-[#283593] to-[#1a237e] px-6 py-7 md:px-9 md:py-8">
        <div className="flex items-start gap-5">

          {/* Logo */}
          <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-2xl p-2 flex items-center justify-center shadow-lg flex-shrink-0 overflow-hidden">
            {college.logo ? (
              <Image
                src={college.logo}
                alt={college.name}
                width={64}
                height={64}
                className="object-contain w-full h-full"
                referrerPolicy="no-referrer"
                unoptimized
              />
            ) : (
              <span className="font-black text-2xl text-[#3F51B5]">{college.name?.charAt(0) ?? 'U'}</span>
            )}
          </div>

          {/* Name + badges */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${college.isPrivate ? 'border-violet-300/40 bg-violet-400/20 text-violet-100' : 'border-blue-300/40 bg-blue-400/20 text-blue-100'}`}>
                {college.isPrivate ? 'Private' : 'Public'}
              </span>
              {sizeCategory && (
                <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full border border-white/20 bg-white/10 text-white/75">
                  {sizeCategory}
                </span>
              )}
            </div>
            <h2 className="text-xl md:text-2xl font-black text-white leading-tight">{college.name}</h2>
            <p className="flex items-center gap-1.5 text-blue-200 text-sm mt-1.5 font-semibold">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
              {college.location}
            </p>
          </div>

          {/* Website CTA */}
          {college.website && college.website !== 'https://www.google.com' && (
            <a
              href={college.website}
              target="_blank"
              rel="noreferrer"
              className="flex-shrink-0 flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Visit Site</span>
            </a>
          )}
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────────── */}
      <div
        className="overflow-y-auto"
        style={{ maxHeight: 'calc(85vh - 140px)' }}
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Spin size="large" />
            <p className="text-gray-400 text-sm font-semibold">Loading institutional data…</p>
          </div>
        ) : (
          <div className="p-5 md:p-7 space-y-6">

            {/* ── Stats grid ───────────────────────────────────────── */}
            <section>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Institution Overview</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {statCards.map(card => (
                  <StatCard key={card.label} {...card} />
                ))}
              </div>
            </section>

            {/* ── Two-column detail sections ───────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* Admissions */}
              <section className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Admissions</p>
                <Row
                  label="Acceptance Rate"
                  value={admissionRate != null ? `${(admissionRate * 100).toFixed(1)}%` : 'N/A'}
                  highlight={admissionRate != null && admissionRate < 0.15 ? 'text-red-500' : 'text-slate-900'}
                  bar
                  barValue={admissionRate ?? 0}
                  barColor={admissionRate != null && admissionRate < 0.15 ? 'bg-red-400' : 'bg-[#3F51B5]'}
                />
                <Row
                  label="SAT Score Range"
                  value={satMin != null && satMax != null ? `${satMin} – ${satMax}` : 'N/A'}
                />
                <Row
                  label="Graduation Rate"
                  value={fmtPct0(graduationRate)}
                  highlight="text-green-600"
                  bar
                  barValue={graduationRate ?? 0}
                  barColor="bg-green-400"
                />
              </section>

              {/* Campus & Demographics */}
              <section className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Campus & Demographics</p>
                {gradStudents != null && (
                  <Row label="Graduate Students" value={fmtNum(gradStudents)} />
                )}
                {(menPct != null || womenPct != null) && (
                  <div className="border-t border-gray-50 pt-3 first:border-0 first:pt-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-slate-500">Gender Split</span>
                      <span className="text-xs font-black text-slate-700">
                        {menPct != null ? `${fmtPct0(menPct)} M` : ''} / {womenPct != null ? `${fmtPct0(womenPct)} F` : ''}
                      </span>
                    </div>
                    <div className="flex h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-400 transition-all"
                        style={{ width: `${menPct != null ? (menPct > 1 ? menPct : menPct * 100) : 50}%` }}
                      />
                      <div className="bg-pink-400 flex-1" />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-[10px] text-blue-400 font-bold">Male</span>
                      <span className="text-[10px] text-pink-400 font-bold">Female</span>
                    </div>
                  </div>
                )}
                {repayment3yr != null && (
                  <Row
                    label="Loan Repayment (3yr)"
                    value={fmtPct0(repayment3yr)}
                    bar
                    barValue={repayment3yr}
                    barColor="bg-teal-400"
                  />
                )}
              </section>

              {/* Tuition & Aid */}
              <section className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Tuition & Financial Aid</p>
                <Row label="In-State Tuition" value={fmt$(tuitionInState)} />
                <Row label="Out-of-State Tuition" value={fmt$(tuitionOutState)} />
                {stickerPrice != null && (
                  <Row
                    label="Est. Cost of Attendance"
                    value={`${fmt$(stickerPrice)}/yr`}
                    highlight="text-[#3F51B5] font-black"
                  />
                )}
                {aidPct != null && (
                  <Row
                    label="Students Receiving Aid"
                    value={fmtPct0(aidPct)}
                    highlight="text-green-600"
                    bar
                    barValue={aidPct}
                    barColor="bg-green-400"
                  />
                )}
                {loanPct != null && (
                  <Row
                    label="Students with Loans"
                    value={fmtPct0(loanPct)}
                    bar
                    barValue={loanPct}
                    barColor="bg-amber-400"
                  />
                )}

                {/* Net price by income bracket */}
                {hasNetPrices && (
                  <div className="border-t border-gray-50 pt-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2.5">Net Price by Family Income</p>
                    <div className="space-y-2">
                      {netPrices.filter(np => np.value != null).map(np => {
                        const maxVal = Math.max(...netPrices.filter(x => x.value != null).map(x => x.value));
                        const barW = maxVal > 0 ? (np.value / maxVal) * 100 : 0;
                        return (
                          <div key={np.label} className="flex items-center gap-2">
                            <span className="text-[11px] text-gray-500 font-semibold w-24 flex-shrink-0">{np.label}</span>
                            <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                              <div className="h-1.5 rounded-full bg-[#3F51B5]/60" style={{ width: `${barW}%` }} />
                            </div>
                            <span className="text-[11px] font-black text-slate-800 w-20 text-right flex-shrink-0">{fmt$(np.value)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </section>

              {/* Career Outcomes */}
              <section className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Career Outcomes</p>
                {salary1yr != null && (
                  <Row label="Median Salary (Year 1)" value={fmt$(salary1yr)} />
                )}
                {salary10yr != null && (
                  <Row
                    label="Median Salary (Year 10)"
                    value={fmt$(salary10yr)}
                    highlight="text-[#3F51B5]"
                  />
                )}
                {growthRate != null && (
                  <Row
                    label="Salary Growth"
                    value={fmtPct(growthRate)}
                    highlight="text-green-600"
                  />
                )}
                {empFactor != null && (
                  <Row
                    label="Employment Rate"
                    value={fmtPct0(empFactor)}
                    bar
                    barValue={empFactor}
                    barColor="bg-blue-400"
                  />
                )}
                {roi20yr != null && (
                  <div className="border-t border-gray-50 pt-3 rounded-xl bg-green-50 -mx-1 px-3 py-3 mt-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-bold text-green-700">20-Year ROI</span>
                      </div>
                      <span className="text-base font-black text-green-600">{fmt$(roi20yr)}</span>
                    </div>
                  </div>
                )}
              </section>
            </div>

            {/* ── Footer note ─────────────────────────────────────── */}
            <p className="text-center text-[11px] text-gray-400 font-semibold pt-1 pb-1">
              Institutional-level data only · Program-specific details available on the full university profile via Search
            </p>

          </div>
        )}
      </div>
    </Modal>
  );
}
