"use client";

import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Slider, Switch } from 'antd';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

export default function SearchSidebar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [states, setStates] = useState<{ state_code: string; state_title: string }[]>([]);
  const [credentials, setCredentials] = useState<{ id: number; name: string }[]>([]);
  const [searchState, setSearchState] = useState("");

  const selectedState = searchParams.get("state");
  const selectedCredential = searchParams.get("credential_title");
  const selectedCollegeType = searchParams.get("school_type");
  
  const initialTuitionMin = searchParams.get("tuition_min") ? Number(searchParams.get("tuition_min")) / 2000 : 0;
  const initialTuitionMax = searchParams.get("tuition_max") ? Number(searchParams.get("tuition_max")) / 2000 : 25;
  const [tuitionRange, setTuitionRange] = useState<[number, number]>([initialTuitionMin, initialTuitionMax]);

  const handleTuitionChange = (val: number | number[]) => {
    if (Array.isArray(val)) setTuitionRange([val[0], val[1]]);
  };

  const handleTuitionAfterChange = (val: number | number[]) => {
    if (Array.isArray(val)) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tuition_min", (val[0] * 2000).toString());
      params.set("tuition_max", (val[1] * 2000).toString());
      router.push(`${pathname}?${params.toString()}`);
    }
  };

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        
        // Fetch States
        const statesRes = await fetch(`${apiUrl}/states`);
        if (statesRes.ok) {
          setStates(await statesRes.json());
        }

        // Fetch Credentials
        const credsRes = await fetch(`${apiUrl}/credentials`);
        if (credsRes.ok) {
          setCredentials(await credsRes.json());
        }
      } catch (error) {
        console.error("Error fetching sidebar options:", error);
      }
    };
    fetchOptions();
  }, []);

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // If the same value is clicked, we might want to toggle it off, 
    // but usually in sidebars, clicking a different one switches to it.
    if (params.get(key) === value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    
    router.push(`${pathname}?${params.toString()}`);
  };

  const filteredStates = states.filter(s => 
    s.state_title.toLowerCase().includes(searchState.toLowerCase()) ||
    s.state_code.toLowerCase().includes(searchState.toLowerCase())
  );

  return (
    <div className="w-full md:w-56 shrink-0 flex flex-col gap-6 md:sticky md:top-20 self-start max-h-[calc(100vh-6rem)] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-gray-200">
      
      {/* Degree & Credentials */}
      <div>
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Degree & Credentials</h3>
        <div className="flex flex-col gap-3">
          {credentials.map((cred) => (
            <label key={cred.id} className="flex items-center gap-3 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={selectedCredential === cred.name}
                onChange={() => handleFilterChange("credential_title", cred.name)}
                className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-600 cursor-pointer" 
              />
              <span className={`text-[13px] transition-colors ${selectedCredential === cred.name ? 'text-blue-600 font-bold' : 'text-gray-700 group-hover:text-gray-900'}`}>
                {cred.name}
              </span>
            </label>
          ))}
          {credentials.length === 0 && <p className="text-xs text-gray-400 italic">Loading levels...</p>}
        </div>
      </div>

      {/* Institution */}
      <div>
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Institution</h3>
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button 
            onClick={() => handleFilterChange("school_type", "public")}
            className={`flex-1 text-[13px] font-medium py-1 rounded-md transition ${selectedCollegeType === "public" ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
          >
            Public
          </button>
          <button 
            onClick={() => handleFilterChange("school_type", "private")}
            className={`flex-1 text-[13px] font-medium py-1 rounded-md transition ${selectedCollegeType === "private" ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
          >
            Private
          </button>
        </div>
      </div>

      {/* State */}
      <div>
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">State</h3>
        <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 mb-3">
          <Search size={14} className="text-gray-400 mr-2" />
          <input 
            type="text" 
            placeholder="Search States" 
            value={searchState}
            onChange={(e) => setSearchState(e.target.value)}
            className="bg-transparent border-none outline-none text-[13px] w-full text-gray-700"
          />
        </div>
        <div className="flex flex-col gap-3 max-h-64 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200">
          {filteredStates.map((s) => (
            <label key={s.state_code} className="flex items-center gap-3 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={selectedState === s.state_code}
                onChange={() => handleFilterChange("state", s.state_code)}
                className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-600 cursor-pointer" 
              />
              <span className={`text-[13px] transition-colors ${selectedState === s.state_code ? 'text-blue-600 font-bold' : 'text-gray-700 group-hover:text-gray-900'}`}>
                {s.state_title}
              </span>
            </label>
          ))}
          {states.length === 0 && <p className="text-xs text-gray-400 italic">Loading states...</p>}
          {states.length > 0 && filteredStates.length === 0 && <p className="text-xs text-gray-400 italic">No states found</p>}
        </div>
      </div>

      {/* Tuition & Fees */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tuition & Fees</h3>
          <span className="text-[13px] font-medium text-gray-900">${tuitionRange[0] * 2}K-${tuitionRange[1] * 2}K</span>
        </div>
        <Slider 
          range 
          value={tuitionRange}
          onChange={handleTuitionChange}
          onChangeComplete={handleTuitionAfterChange}
          tooltip={{ formatter: (val) => `$${(val || 0) * 2}K` }} 
        />
      </div>

      {/* Learning Pace */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Intl. Students</h3>
        <Switch defaultChecked />
      </div>

      {/* Ad Banner */}
      <div className="mt-4 bg-gradient-to-br from-[#5334A6] to-[#A053A8] rounded-xl p-5 text-white text-center shadow-lg relative overflow-hidden">
        <h4 className="font-bold text-base mb-2 relative z-10">Admissions Help?</h4>
        <p className="text-[11px] text-white/80 mb-4 relative z-10 leading-relaxed">
          Connect with expert advisors to perfect your college application.
        </p>
        <button className="bg-white text-[#5334A6] text-[11px] font-bold py-2 px-4 rounded-full w-full hover:bg-gray-50 transition relative z-10">
          Speak to an Advisor
        </button>
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -mr-8 -mt-8"></div>
      </div>

    </div>
  );
}
