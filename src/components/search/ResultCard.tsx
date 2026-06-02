import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, Clock, BookOpen, MapPin, X } from 'lucide-react';
import UserSatPopup from './UserSatPopup';
import StickerPrice from './StickerPrice';

export interface ResultCardProps {
  id?: number | string;
  cipCode?: string;
  university: string;
  location: string;
  degree: string;
  schoolType?: string;
  admissionRate: string;
  avgGpa: string;
  satAct: string;
  duration: string;
  specializations: string;
  matchScore: number;
  gradRate: number;
  avgSalary?: string;
  estCost?: string;
  medianSalary?: string;
  roi?: string;
  logoColor: string;
}

const parseAdmissionRate = (rateStr: string): number | null => {
  if (!rateStr || rateStr === 'N/A') return null;
  const num = parseFloat(rateStr.replace('%', ''));
  return isNaN(num) ? null : num / 100;
};

const parseSatRange = (satStr: string): { min: number; max: number } | null => {
  if (!satStr || satStr === 'N/A') return null;
  const parts = satStr.split('-');
  if (parts.length === 2) {
    const min = parseInt(parts[0].trim());
    const max = parseInt(parts[1].trim());
    if (!isNaN(min) && !isNaN(max)) {
      return { min, max };
    }
  }
  return null;
};

const calculateFitScore = (
  userGpa: number,
  userSat: number,
  admissionRateStr: string,
  satActStr: string
): number => {
  let score = 75; // base score

  // GPA factor
  if (userGpa >= 3.8) {
    score += 15;
  } else if (userGpa >= 3.5) {
    score += 8;
  } else if (userGpa >= 3.0) {
    score += 0;
  } else if (userGpa >= 2.5) {
    score -= 10;
  } else {
    score -= 20;
  }

  // SAT factor
  const satRange = parseSatRange(satActStr);
  if (satRange) {
    const { min, max } = satRange;
    if (userSat >= max) {
      score += 15;
    } else if (userSat >= min) {
      score += 8;
    } else {
      const diff = min - userSat;
      if (diff > 200) {
        score -= 20;
      } else {
        score -= 10;
      }
    }
  } else if (userSat > 0) {
    if (userSat >= 1400) {
      score += 10;
    } else if (userSat >= 1200) {
      score += 5;
    } else if (userSat < 1000) {
      score -= 10;
    }
  }

  // Admission rate selectivity factor
  const admRate = parseAdmissionRate(admissionRateStr);
  if (admRate !== null) {
    if (admRate < 0.15) {
      const isStellar = userGpa >= 3.9 && userSat >= 1500;
      if (!isStellar) {
        score -= 15;
      } else {
        score += 5;
      }
    } else if (admRate < 0.35) {
      const isVeryGood = userGpa >= 3.7 && (userSat >= 1400 || userSat === 0);
      if (!isVeryGood) {
        score -= 8;
      }
    }
  }

  return Math.min(99, Math.max(45, score));
};

export default function ResultCard({
  id = 1,
  cipCode,
  university,
  location,
  degree,
  schoolType,
  admissionRate,
  avgGpa,
  satAct,
  duration,
  specializations,
  matchScore,
  gradRate,
  roi,
  estCost,
  avgSalary,
  medianSalary,
  logoColor
}: ResultCardProps) {
  const hasSatData = satAct && satAct !== 'N/A';

  const [isCalculated, setIsCalculated] = useState(false);
  const [currentScore, setCurrentScore] = useState(matchScore);
  const [showModal, setShowModal] = useState(false);
  const [tempGpa, setTempGpa] = useState<string>("");
  const [tempSat, setTempSat] = useState<string>("");
  const [satError, setSatError] = useState("");
  const [gpaError, setGpaError] = useState("");

  const shouldShowFit = isCalculated && hasSatData;

  const [isCompared, setIsCompared] = useState(false);

  useEffect(() => {
    const list = JSON.parse(localStorage.getItem('compared_colleges') || '[]');
    setIsCompared(list.includes(String(id)));

    const handleUpdate = () => {
      const updatedList = JSON.parse(localStorage.getItem('compared_colleges') || '[]');
      setIsCompared(updatedList.includes(String(id)));
    };

    window.addEventListener('compared-colleges-updated', handleUpdate);
    return () => window.removeEventListener('compared-colleges-updated', handleUpdate);
  }, [id]);

  const handleCompareChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    let list = JSON.parse(localStorage.getItem('compared_colleges') || '[]');
    if (checked) {
      if (list.length >= 5) {
        alert("You can compare a maximum of 5 colleges simultaneously.");
        return;
      }
      if (!list.includes(String(id))) {
        list.push(String(id));
      }
    } else {
      list = list.filter((cid: string) => cid !== String(id));
    }
    localStorage.setItem('compared_colleges', JSON.stringify(list));
    setIsCompared(checked);
    window.dispatchEvent(new Event('compared-colleges-updated'));
  };

  useEffect(() => {
    // Load from localStorage if present
    const savedGpa = localStorage.getItem("fit_score_gpa");
    const savedSat = localStorage.getItem("fit_score_sat");
    if (savedGpa) {
      const gpaNum = parseFloat(savedGpa);
      const satNum = parseInt(savedSat || "0") || 0;
      if (!isNaN(gpaNum)) {
        const computed = calculateFitScore(gpaNum, satNum, admissionRate, satAct);
        setCurrentScore(computed);
        setIsCalculated(true);
        setTempGpa(savedGpa);
        setTempSat(savedSat || "");
      }
    }

    const handleUpdate = () => {
      const gpa = localStorage.getItem("fit_score_gpa");
      const sat = localStorage.getItem("fit_score_sat");
      if (gpa) {
        const gpaNum = parseFloat(gpa);
        const satNum = parseInt(sat || "0") || 0;
        if (!isNaN(gpaNum)) {
          const computed = calculateFitScore(gpaNum, satNum, admissionRate, satAct);
          setCurrentScore(computed);
          setIsCalculated(true);
          setTempGpa(gpa);
          setTempSat(sat || "");
        }
      } else {
        setIsCalculated(false);
        setCurrentScore(matchScore);
        setTempGpa("");
        setTempSat("");
      }
    };

    window.addEventListener("fit-score-updated", handleUpdate);
    return () => {
      window.removeEventListener("fit-score-updated", handleUpdate);
    };
  }, [admissionRate, satAct, matchScore]);

  const handleCalculate = () => {
    const gpaNum = parseFloat(tempGpa);
    const satNum = parseInt(tempSat) || 0;

    if (isNaN(gpaNum) || gpaNum < 0 || gpaNum > 4.0) {
      setGpaError("Enter a value between 0.0 and 4.0 only");
      return;
    }

    if (tempSat) {
      if (isNaN(satNum) || satNum < 400 || satNum > 1600) {
        setSatError("Enter a value between 400 and 1600 only");
        return;
      }
    }

    localStorage.setItem("fit_score_gpa", tempGpa);
    localStorage.setItem("fit_score_sat", tempSat || "");

    const computed = calculateFitScore(gpaNum, satNum, admissionRate, satAct);
    setCurrentScore(computed);
    setIsCalculated(true);
    setShowModal(false);

    window.dispatchEvent(new Event("fit-score-updated"));
  };

  const handleClear = () => {
    localStorage.removeItem("fit_score_gpa");
    localStorage.removeItem("fit_score_sat");
    setIsCalculated(false);
    setCurrentScore(matchScore);
    setTempGpa("");
    setTempSat("");
    setSatError("");
    setGpaError("");
    setShowModal(false);
    window.dispatchEvent(new Event("fit-score-updated"));
  };

  const universityHref = {
    pathname: `/university/${id}`,
    query: {
      cip: cipCode,
      name: university,
      city: location.split(", ")[0] || "",
      state: location.split(", ")[1] || "",
      degree: degree,
      type: schoolType,
      admissionRate: admissionRate,
      tuition: estCost,
      avgSalary: avgSalary || medianSalary,
      roi: roi,
    }
  };
  const validateSat = (value: string) => {
    if (!value) {
      setSatError("");
      return;
    }

    const sat = Number(value);

    if (sat < 400 || sat > 1600) {
      setSatError("Enter a value between 400 and 1600 only");
    } else {
      setSatError("");
    }
  };

  const validateGpa = (value: string) => {
    if (!value) {
      setGpaError("Enter a value between 0.0 and 4.0 only");
      return;
    }

    const gpa = Number(value);

    if (isNaN(gpa) || gpa < 0 || gpa > 4.0) {
      setGpaError("Enter a value between 0.0 and 4.0 only");
    } else {
      setGpaError("");
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">

      {/* Top Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex gap-4 items-start">
          <div className={`w-10 h-10 rounded-lg ${logoColor} flex items-center justify-center text-white font-bold text-xl shrink-0`}>
            {university.charAt(0)}
          </div>
          <div>
            <Link href={universityHref}>
              <h2 className="text-base font-bold text-gray-900 hover:text-blue-600 transition-colors cursor-pointer">{university}</h2>
            </Link>
            <div className="flex items-center text-gray-500 text-xs mt-0.5">
              <MapPin size={12} className="mr-1" />
              {location}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <button className="text-gray-300 hover:text-red-500 transition">
            <Heart size={20} />
          </button>
        </div>
      </div>

      {/* Match Badge (Absolute on Desktop, regular flow on mobile) */}
      <div className="hidden md:flex absolute top-5 right-5 flex-col items-center bg-blue-50/50 border border-blue-100 rounded-xl p-2 w-28 transition-all duration-300 hover:border-blue-200">
        <button
          onClick={() => setShowModal(true)}
          className="w-full text-[9px] bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-1 px-1 rounded-lg mb-1.5 text-center transition-all duration-200 shadow-sm leading-tight hover:scale-105 active:scale-95 whitespace-nowrap"
        >
          {shouldShowFit ? "Update Fit" : "Find your fit score"}
        </button>
        <span className="text-[8px] font-bold text-blue-600 uppercase mb-1 text-center leading-tight">
          {shouldShowFit ? "Your Fit Score" : "Match Score"}
        </span>
        <div className={`relative w-11 h-11 flex items-center justify-center transition-all duration-500 ${!shouldShowFit ? 'filter blur-[1.5px] opacity-80' : ''}`}>
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-gray-200 stroke-current"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none" strokeWidth="3"
            />
            <path
              className="text-blue-600 stroke-current"
              strokeDasharray={`${shouldShowFit ? currentScore : matchScore}, 100`}
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none" strokeWidth="3"
            />
          </svg>
          <span className="absolute text-[10px] font-extrabold text-blue-900">{shouldShowFit ? currentScore : matchScore}%</span>
        </div>
      </div>

      {/* Degree Info */}
      <div className="mb-5 md:pr-28">
        <h3 className="text-sm text-red-500 font-bold mb-2">{degree}</h3>

        <div className="flex flex-wrap gap-5 mb-3">
          <div>
            <p className="text-[9px] text-gray-500 uppercase font-semibold">Admission Rate</p>
            <p className="font-bold text-gray-900 text-xs">{admissionRate}</p>
          </div>
          <div>
            <p className="text-[9px] text-gray-500 uppercase font-semibold">Avg. GPA</p>
            <p className="font-bold text-gray-900 text-xs">{avgGpa}</p>
          </div>
          <div>
            <p className="text-[9px] text-gray-500 uppercase font-semibold">SAT/ACT</p>
            <p className="font-bold text-gray-900 text-xs">{satAct}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-600">
          <span className="flex items-center gap-1 bg-gray-50 px-1.5 py-1 rounded-md border border-gray-100">
            <Clock size={10} className="text-gray-400" />
            {duration}
          </span>
          {schoolType && (
            <span className={`flex items-center gap-1 px-1.5 py-1 rounded-md border font-bold ${schoolType.toLowerCase().includes('public')
              ? 'bg-green-50 border-green-100 text-green-700'
              : 'bg-purple-50 border-purple-100 text-purple-700'
              }`}>
              {schoolType.split(',')[0]}
            </span>
          )}
          <span className="flex items-center gap-1 bg-gray-50 px-1.5 py-1 rounded-md border border-gray-100">
            <BookOpen size={10} className="text-gray-400" />
            Specializations: {specializations}
          </span>
        </div>
      </div>

      {/* Stat Tiles */}
      <div className="flex flex-wrap gap-3 py-4 border-y border-gray-100 mb-4">

        {/* Employment Rate */}
        <div className="flex-1 min-w-[80px] flex flex-col bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5">
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide mb-1">Employment Rate</span>
          <span className="text-sm font-extrabold text-gray-900">
            {gradRate > 0 ? `${gradRate}%` : 'N/A'}
          </span>
        </div>

        <div className="flex-1 min-w-[80px] flex flex-col bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5">
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide mb-1">Median Salary</span>
          <span className="text-sm font-extrabold text-green-600">{medianSalary ?? 'N/A'}</span>
        </div>

        {/* 20yr ROI */}
        <div className="flex-1 min-w-[80px] flex flex-col bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5">
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide mb-1">20yr ROI</span>
          <span className="text-sm font-extrabold text-blue-600">
            {roi ?? 'N/A'}
          </span>
        </div>

        {/* Mobile Fit Score */}
        <div className="md:hidden flex flex-col bg-blue-50 border border-blue-100 rounded-xl px-4 py-2.5 min-w-[90px]">
          <span className="text-[9px] font-bold text-blue-500 uppercase tracking-wide mb-1">
            {shouldShowFit ? "Fit Score" : "Match Score"}
          </span>

          <div className="flex items-center gap-2">
            <div className="relative w-8 h-8">
              <svg
                className="w-full h-full transform -rotate-90"
                viewBox="0 0 36 36"
              >
                <path
                  className="text-gray-200 stroke-current"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  strokeWidth="3"
                />

                <path
                  className="text-blue-600 stroke-current"
                  strokeDasharray={`${shouldShowFit ? currentScore : matchScore
                    }, 100`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  strokeWidth="3"
                />
              </svg>

              <span className="absolute inset-0 flex items-center justify-center text-[8px] font-extrabold text-blue-900">
                {shouldShowFit ? currentScore : matchScore}%
              </span>
            </div>

            <button
              onClick={() => setShowModal(true)}
              className="text-[9px] font-bold text-blue-600 hover:text-blue-700"
            >
              {shouldShowFit ? "Update" : "Find"}
            </button>
          </div>
        </div>

        {/* Sticker Price */}
        <StickerPrice id={id} estCost={estCost} />

      </div>

      {/* Footer Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isCompared}
            onChange={handleCompareChange}
            className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
          />
          <span className="text-[11px] font-medium text-gray-600">Compare</span>
        </label>

        <div className="flex gap-2 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none border border-blue-600 text-blue-600 hover:bg-blue-50 px-4 py-1.5 rounded-full text-[11px] font-bold transition">
            Visit Website
          </button>
          <Link
            href={universityHref}
            className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-full text-[11px] font-bold transition text-center"
          >
            View Full Details
          </Link>
        </div>
      </div>

      {/* Profile/Fit Score Modal */}
      {showModal && <UserSatPopup setShowModal={setShowModal}
        tempGpa={tempGpa}
        setTempGpa={setTempGpa}
        validateGpa={validateGpa}
        gpaError={gpaError}
        satError={satError}
        setSatError={setSatError}
        setTempSat={setTempSat}
        tempSat={tempSat}
        validateSat={validateSat}
        isCalculated={isCalculated}
        handleClear={handleClear}
        handleCalculate={handleCalculate}
        university={university} admissionRate={admissionRate} satAct={satAct} hasSatData={hasSatData} />}

    </div>
  );
}
