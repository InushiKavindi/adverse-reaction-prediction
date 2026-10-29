import { History, ArrowRight, HeartPulse } from "lucide-react";
import { Card, CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";

export default function ActionCards({ onViewHistory, onViewSchedule }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* 1. Prediction History & Reports (Blue card) */}
      <Card className="bg-[#eff8ff] border-sky-200/80 rounded-3xl p-6 sm:p-7 shadow-xs flex flex-col justify-between hover:shadow-md transition">
        <div>
          <div className="flex items-center gap-3.5 mb-4">
            {/* Round icon badge */}
            <div className="w-12 h-12 rounded-2xl bg-white border border-sky-200 text-sky-600 flex items-center justify-center shadow-xs shrink-0">
              <History className="w-6 h-6 text-[#0284c7]" />
            </div>

            <CardTitle className="text-xl font-extrabold text-slate-900 leading-snug">
              Prediction History & Records
            </CardTitle>
          </div>

          <CardDescription className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6 font-normal">
            Review past adverse reaction screenings, model risk assessments, and clinical evaluation logs for pediatric safety.
          </CardDescription>
        </div>

        <Button
          onClick={onViewHistory}
          className="w-full h-auto py-3 px-5 bg-[#0793E8] hover:bg-[#0682cf] text-white font-bold text-sm rounded-full shadow-md shadow-sky-200 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
        >
          <span>View Prediction History</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </Card>

      {/* 2. Pediatric Vaccine Schedule (Pink card) */}
      <Card className="bg-[#fff0f4] border-pink-200/80 rounded-3xl p-6 sm:p-7 shadow-xs flex flex-col justify-between hover:shadow-md transition">
        <div>
          <div className="flex items-center gap-3.5 mb-4">
            {/* Round icon badge */}
            <div className="w-12 h-12 rounded-2xl bg-white border border-pink-200 text-pink-600 flex items-center justify-center shadow-xs shrink-0">
              <HeartPulse className="w-6 h-6 text-pink-600" />
            </div>

            <CardTitle className="text-xl font-extrabold text-slate-900 leading-snug">
              Pediatric Vaccine Schedule
            </CardTitle>
          </div>

          <CardDescription className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6 font-normal">
            Review complete childhood immunization milestones (BCG, Pentavalent, OPV, IPV, MMR, JE) with
            clinical advice on expected benign reactions versus signs requiring doctor consultation.
          </CardDescription>
        </div>

        <Button
          variant="outline"
          onClick={onViewSchedule}
          className="w-full h-auto py-3 px-5 bg-white hover:bg-pink-50 border-pink-300 text-pink-600 hover:text-pink-700 font-bold text-sm rounded-full shadow-xs hover:border-pink-400 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
        >
          <span>View Vaccine Schedule</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </Card>
    </div>
  );
}
