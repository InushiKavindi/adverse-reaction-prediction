import { History, Calendar, ArrowRight, ShieldCheck, HeartPulse } from "lucide-react";

export default function ActionCards({ onViewHistory, onViewSchedule }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* 1. Prediction History & Reports (Blue card) */}
      <div className="bg-[#eff8ff] border border-sky-200/80 rounded-3xl p-6 sm:p-7 shadow-xs flex flex-col justify-between hover:shadow-md transition">
        <div>
          {/* Round icon badge */}
          <div className="w-12 h-12 rounded-2xl bg-white border border-sky-200 text-sky-600 flex items-center justify-center mb-5 shadow-xs">
            <History className="w-6 h-6 text-[#0284c7]" />
          </div>

          <h3 className="text-xl font-extrabold text-slate-900 mb-2">
            Prediction History & Records
          </h3>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6 font-normal">
            Review past adverse reaction screenings, model risk assessments, and clinical evaluation logs for pediatric safety.
          </p>
        </div>

        <button
          onClick={onViewHistory}
          className="w-full py-3 px-5 bg-[#0284c7] hover:bg-sky-600 text-white font-bold text-sm rounded-full shadow-md shadow-sky-200 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
        >
          <span>View Prediction History</span>
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
