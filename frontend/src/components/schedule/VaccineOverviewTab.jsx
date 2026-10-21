import React from "react";
import { Calendar, Syringe, Activity, Clock, CheckCircle2, Plus } from "lucide-react";
import { Card, CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import { TabsContent } from "../ui/tabs";
import { formatDisplayDate, calculateScheduledDateFromDob } from "./vaccineUtils";
import { VACCINE_SCHEDULE } from "../../services/mockData";

export default function VaccineOverviewTab({
  vaccine,
  activeChild,
  isCompleted,
  recordedReaction,
  handleOpenLogReactions,
  onOpenDoctorDateModal
}) {
  const isBcg2 = vaccine?.id === "vax-bcg2" || vaccine?.vaccineName?.toLowerCase().includes("bcg 2") || vaccine?.vaccineName?.toLowerCase().includes("bcg2");
  const isFirstVaccine = !isBcg2 && (vaccine?.id === "vax-1" || (vaccine?.vaccineName?.toLowerCase().includes("bcg") && !vaccine?.vaccineName?.toLowerCase().includes("bcg 2") && !vaccine?.vaccineName?.toLowerCase().includes("bcg2")));
  const customDate = vaccine?.customScheduledDate || vaccine?.reaction?.scheduledDate || null;
  const hasCustomDate = Boolean(customDate);
  const vaxList = (vaccine?.vaccines && vaccine.vaccines.length > 0)
    ? vaccine.vaccines
    : (VACCINE_SCHEDULE.find((s) => s.id === vaccine?.id)?.vaccines)
    || (vaccine?.vaccineName ? [{ name: vaccine.vaccineName, route: vaccine.route, diseases: vaccine.diseases }] : []);

  return (
    <TabsContent value="overview" className="space-y-3.5 pt-1">
      {/* Vaccination Schedule & Administration Dates */}
      <Card className="p-4 sm:p-5 bg-white border-slate-100 rounded-2xl shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-sm sm:text-base font-bold text-slate-900">
                Vaccination Schedule & Administration Dates
              </CardTitle>
              <CardDescription className="text-[11px] text-slate-400">
                {isBcg2
                  ? "Doctor recommended revaccination date and milestone completion record"
                  : "Official milestone timeline, clinic scheduled date, and completion record"}
              </CardDescription>
            </div>
          </div>

          {!isFirstVaccine && onOpenDoctorDateModal && (
            <Button
              type="button"
              onClick={onOpenDoctorDateModal}
              className="bg-[#ff2d78] hover:bg-[#e02468] text-white text-xs font-bold px-3.5 py-2 rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0 self-start sm:self-auto active:scale-95"
            >
              {hasCustomDate ? (
                <Calendar className="w-3.5 h-3.5" />
              ) : (
                <Plus className="w-3.5 h-3.5" />
              )}
              <span>{hasCustomDate ? "Update Date" : "Add Date"}</span>
            </Button>
          )}
        </div>

        {/* The 3 Date Columns / Cards */}
        <div className={`grid grid-cols-1 ${isBcg2 ? "sm:grid-cols-2" : isFirstVaccine ? "sm:grid-cols-2" : "sm:grid-cols-3"} gap-3 pt-0.5`}>
          {/* 1. Scheduled Date (from DOB) - EXPLICITLY HIDDEN FOR BCG2 */}
          {!isBcg2 && (
            <div className="p-3.5 bg-slate-50/80 border border-slate-200/70 rounded-2xl space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-sky-500" />
                Scheduled Date (from DOB)
              </span>
              <p className="text-sm font-extrabold text-slate-800">
                {isFirstVaccine
                  ? formatDisplayDate(vaccine.scheduledDateDob || activeChild?.birthDate || vaccine.dueDate) || "At Birth (<24 hrs)"
                  : formatDisplayDate(vaccine.scheduledDateDob || calculateScheduledDateFromDob(activeChild?.birthDate, vaccine.targetAgeMonths)) || "Calculated from DOB"}
              </p>
              <p className="text-[10px] text-slate-400">
                {isFirstVaccine ? "Standard neonatal birth schedule" : "Calculated from child's birth date"}
              </p>
            </div>
          )}

          {/* 2. Clinic Date (or Doctor's Recommended Date for BCG2) - NOT SHOWN FOR BCG1 */}
          {!isFirstVaccine && (
            <div className={`p-3.5 rounded-2xl border space-y-1 ${
              hasCustomDate
                ? "bg-sky-50/70 border-sky-200/80"
                : "bg-slate-50/80 border-slate-200/70"
            }`}>
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] font-bold text-sky-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3 h-3 text-sky-600" />
                  {isBcg2 ? "Doctor's Recommended Date" : "Clinic Date"}
                </span>
              </div>
              <p className={`text-sm font-extrabold ${hasCustomDate ? "text-sky-950" : "text-slate-400 italic"}`}>
                {hasCustomDate ? formatDisplayDate(customDate) : "Not added yet"}
              </p>
              <p className="text-[10px] text-slate-500">
                {hasCustomDate
                  ? (isBcg2 ? "Doctor recommended revaccination appointment" : "Scheduled clinic appointment date")
                  : "Click 'Add Date' to set appointment"}
              </p>
            </div>
          )}

          {/* 3. Completed Date */}
          <div className={`p-3.5 rounded-2xl border space-y-1 ${
            isCompleted
              ? "bg-emerald-50/70 border-emerald-200/80"
              : "bg-slate-50/80 border-slate-200/70"
          }`}>
            <span className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
              isCompleted ? "text-emerald-700" : "text-slate-400"
            }`}>
              <CheckCircle2 className={`w-3 h-3 ${isCompleted ? "text-emerald-600" : "text-slate-400"}`} />
              Completed Date
            </span>
            <p className={`text-sm font-extrabold ${isCompleted ? "text-emerald-950" : "text-slate-400 italic"}`}>
              {isCompleted
                ? formatDisplayDate(vaccine.dateCompleted || vaccine.dueDate)
                : "Not completed yet"}
            </p>
            <p className="text-[10px] text-slate-400">
              {isCompleted ? "Verified administered" : "Awaiting milestone completion"}
            </p>
          </div>
        </div>
      </Card>

      {/* Specific Vaccines Breakdown */}
      {vaxList && vaxList.length > 0 && (
        <Card className="bg-white border-slate-100 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <div className="w-7 h-7 rounded-xl bg-pink-50 border border-pink-200/80 text-[#ff2d78] flex items-center justify-center font-bold shrink-0">
              <Syringe className="w-3.5 h-3.5" />
            </div>
            <div>
              <CardTitle className="text-sm sm:text-base font-bold text-slate-900">
                Vaccine Administration & Indications
              </CardTitle>
              <CardDescription className="text-[11px] text-slate-400">
                Route of administration and specific diseases protected against for each vaccine
              </CardDescription>
            </div>
          </div>

          <div className="space-y-3">
            {vaxList.map((vItem, idx) => (
              <div key={idx} className="p-3.5 bg-slate-50/80 border border-slate-200/70 rounded-xl space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs sm:text-sm font-bold text-slate-900">{vItem.name}</span>
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-pink-700 bg-pink-50 border border-pink-200/70 px-2.5 py-0.5 rounded-full">
                    <Syringe className="w-3 h-3 text-[#ff2d78]" />
                    <span>{vItem.route}</span>
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  <span className="font-semibold text-slate-700">Diseases protected against: </span>
                  {vItem.diseases}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

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
