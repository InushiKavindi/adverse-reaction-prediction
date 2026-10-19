import React from "react";
import { Calendar, Syringe, ShieldCheck, Activity } from "lucide-react";
import { Card, CardTitle, CardDescription } from "../ui/card";
import { TabsContent } from "../ui/tabs";
import { formatDisplayDate } from "./vaccineUtils";

export default function VaccineOverviewTab({
  vaccine,
  isCompleted,
  recordedReaction,
  handleOpenLogReactions
}) {
  return (
    <TabsContent value="overview" className="space-y-3.5 pt-1">
      {/* Clinical Administration Specs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Card className="p-4 bg-white border-slate-100 rounded-2xl shadow-xs">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold mb-1">
            <Calendar className="w-3.5 h-3.5 text-sky-500 shrink-0" />
            <span>{isCompleted ? "Administered Date" : "Scheduled Date"}</span>
          </div>
          <p className="text-sm font-extrabold text-slate-800">
            {formatDisplayDate(isCompleted ? (vaccine.dateCompleted || vaccine.dueDate) : vaccine.dueDate)}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Calculated from child's DOB</p>
        </Card>

        <Card className="p-4 bg-white border-slate-100 rounded-2xl shadow-xs">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold mb-1">
            <Syringe className="w-3.5 h-3.5 text-pink-500 shrink-0" />
            <span>Route & Administration Site</span>
          </div>
          <p className="text-sm font-extrabold text-slate-800">{vaccine.route}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">{vaccine.fullRoute || "Pediatric immunization protocol"}</p>
        </Card>
      </div>

      {/* Diseases Prevented & Coverage Strip */}
      <Card className="bg-white border-slate-100 rounded-2xl p-4 sm:p-5 shadow-xs space-y-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <CardTitle className="text-sm sm:text-base font-bold text-slate-900">Diseases Prevented & Coverage</CardTitle>
            <CardDescription className="text-[11px] text-slate-400">Target infectious pathogens and pediatric immunization coverage</CardDescription>
          </div>
        </div>

        <div className="p-3 bg-sky-50/70 border border-sky-100 rounded-xl">
          <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-relaxed">
            {vaccine.diseases}
          </p>
        </div>

        <p className="text-[11px] sm:text-xs text-slate-500 leading-normal">
          Primary immunization establishes long-lasting antibodies and cell-mediated immunity against severe pediatric morbidities. Routine adherence strictly prevents breakout infection cycles.
        </p>
      </Card>

      {/* Recorded Reaction Banner if present */}
      {recordedReaction && recordedReaction.hasReaction && (
        <Card className="p-4 bg-pink-50/70 border-pink-200/80 rounded-2xl shadow-none">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 text-[#ff2d78] text-xs font-bold">
              <Activity className="w-4 h-4 shrink-0" />
              <span>Recorded Post-Vaccination Reactions:</span>
            </div>
            <button
              type="button"
              onClick={handleOpenLogReactions}
              className="text-xs font-bold text-[#ff2d78] hover:underline cursor-pointer"
            >
              Edit Reactions
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {recordedReaction.symptoms?.map((s) => (
              <span key={s} className="px-2.5 py-1 bg-white border border-pink-200 text-pink-700 rounded-xl text-xs font-semibold">
                {s.replace("_", " ")}
                {recordedReaction.onsets?.[s] ? ` (${recordedReaction.onsets[s]} hrs)` : ""}
              </span>
            ))}
          </div>
          {recordedReaction.otherDescription && (
            <p className="text-xs text-slate-600 mt-2 font-medium">
              Note: {recordedReaction.otherDescription}
            </p>
          )}
        </Card>
      )}
    </TabsContent>
  );
}
