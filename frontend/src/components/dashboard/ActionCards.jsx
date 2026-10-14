import React from "react";
import { Activity, Calendar, ArrowRight, ShieldCheck, HeartPulse } from "lucide-react";

export default function ActionCards({ onStartScreening, onViewSchedule }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* 1. Adverse Reaction Screening (Blue card) */}
      <div className="bg-[#eff8ff] border border-sky-200/80 rounded-3xl p-6 sm:p-7 shadow-xs flex flex-col justify-between hover:shadow-md transition">
        <div>
          {/* Round icon badge */}
          <div className="w-12 h-12 rounded-2xl bg-white border border-sky-200 text-sky-600 flex items-center justify-center mb-5 shadow-xs">
            <Activity className="w-6 h-6 text-[#0284c7]" />
          </div>

          <h3 className="text-xl font-extrabold text-slate-900 mb-2">
            Adverse Reaction Screening
          </h3>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6 font-normal">
            Evaluate clinical risk factors regarding current health, previous allergies, and vaccine formulation.
            The AI model analyzes potential adverse reactions and predicts onset hours in milliseconds.
          </p>
        </div>

        <button
          onClick={onStartScreening}
          className="w-full py-3 px-5 bg-[#0284c7] hover:bg-sky-600 text-white font-bold text-sm rounded-full shadow-md shadow-sky-200 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
        >
          <span>Launch AI Screening</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Pediatric Vaccine Schedule (Pink card) */}
      <div className="bg-[#fff0f4] border border-pink-200/80 rounded-3xl p-6 sm:p-7 shadow-xs flex flex-col justify-between hover:shadow-md transition">
        <div>
          {/* Round icon badge */}
          <div className="w-12 h-12 rounded-2xl bg-white border border-pink-200 text-pink-600 flex items-center justify-center mb-5 shadow-xs">
            <HeartPulse className="w-6 h-6 text-pink-600" />
          </div>

          <h3 className="text-xl font-extrabold text-slate-900 mb-2">
            Pediatric Vaccine Schedule
          </h3>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6 font-normal">
            Review complete childhood immunization milestones (BCG, Pentavalent, OPV, IPV, MMR, JE) with
            clinical advice on expected benign reactions versus signs requiring doctor consultation.
          </p>
        </div>

        <button
          onClick={onViewSchedule}
          className="w-full py-3 px-5 bg-white hover:bg-pink-50 border border-pink-300 text-pink-600 font-bold text-sm rounded-full shadow-xs hover:border-pink-400 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
        >
          <span>View Vaccine Schedule</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
