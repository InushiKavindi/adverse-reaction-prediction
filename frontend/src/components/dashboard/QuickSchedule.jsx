import React from "react";
import { useChild } from "../../context/ChildContext";
import { api } from "../../services/api";
import { Calendar, Clock, AlertCircle, CheckCircle, ArrowUpRight } from "lucide-react";

export default function QuickSchedule({ onSelectVaccineForScreening, onViewFullSchedule }) {
  const { activeChild, schedule = [] } = useChild();

  const completedCount = schedule.filter((s) => s.status === "completed").length;
  const totalCount = schedule.length || 1;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  const dueVaccines = schedule.filter((s) => s.status === "due" || s.status === "upcoming").slice(0, 3);


  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            Immunization Progress for {activeChild?.name || "Child Ben"}
          </h3>
          <p className="text-xs text-slate-500">
            {completedCount} of {schedule.length} milestone vaccinations completed ({progressPercent}%)
          </p>
        </div>

        <button
          onClick={onViewFullSchedule}
          className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 self-start sm:self-auto"
        >
          Full Timeline <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden mb-6 p-0.5">
        <div
          className="h-full bg-gradient-to-r from-sky-400 to-pink-500 rounded-full transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Due / Upcoming Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {dueVaccines.map((vax) => {
          const isDue = vax.status === "due";

          return (
            <div
              key={vax.id}
              className={`p-4 rounded-2xl border transition-all ${
                isDue
                  ? "bg-amber-50/50 border-amber-200/80 shadow-xs"
                  : "bg-slate-50/60 border-slate-200/60"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-500">
                  {vax.milestone}
                </span>
                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                    isDue
                      ? "bg-amber-100 text-amber-700 border border-amber-200"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {isDue ? "Due Now" : "Upcoming"}
                </span>
              </div>

              <h4 className="text-sm font-bold text-slate-800 mb-1 truncate" title={vax.vaccineName}>
                {vax.vaccineName}
              </h4>
              <p className="text-[11px] text-slate-500 line-clamp-2 mb-3">
                {vax.diseases}
              </p>

              <button
                onClick={() => onSelectVaccineForScreening(vax.vaccineName)}
                className="w-full py-1.5 px-3 bg-white hover:bg-sky-50 border border-sky-200 text-sky-700 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <span>Check Reaction Risk</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
