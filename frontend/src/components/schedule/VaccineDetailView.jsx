import React, { useState } from "react";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  ShieldCheck,
  Activity,
  Syringe,
  Layers,
  HeartPulse,
  Tag,
  ArrowRight
} from "lucide-react";
import { useChild } from "../../context/ChildContext";
import { Card, CardTitle, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

function formatDisplayDate(dateStr) {
  if (!dateStr) return "";
  try {
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const monthIndex = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];
      if (monthIndex >= 0 && monthIndex < 12) {
        return `${day} ${monthNames[monthIndex]} ${year}`;
      }
    }
  } catch {
    // fallback
  }
  return dateStr;
}

export default function VaccineDetailView({ vaccine: initialVaccine, onBack, onPredictVaccine, onSelectVaccine }) {
  const { activeChild, schedule = [], updateVaccineStatus } = useChild();
  const [updating, setUpdating] = useState(false);

  // Read current live record from schedule
  const vaccine = schedule.find((s) => s.id === initialVaccine?.id) || initialVaccine;

  if (!vaccine) {
    return (
      <Card className="p-8 text-center bg-white rounded-3xl border-slate-100 w-full">
        <p className="text-sm text-slate-500 mb-4">No vaccine selected.</p>
        <Button
          onClick={onBack}
          className="bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold cursor-pointer"
        >
          Return to Schedule
        </Button>
      </Card>
    );
  }

  const currentIndex = schedule.findIndex((s) => s.id === vaccine.id);
  const nextVaccine = (currentIndex >= 0 && currentIndex < schedule.length - 1) ? schedule[currentIndex + 1] : null;

  const isCompleted = vaccine.status === "completed";
  const isDue = vaccine.status === "due";

  const handleToggleStatus = async () => {
    setUpdating(true);
    const nextStatus = isCompleted ? "due" : "completed";
    const dateCompleted = nextStatus === "completed" ? new Date().toISOString().split("T")[0] : null;
    await updateVaccineStatus(vaccine.id, nextStatus, dateCompleted);
    setUpdating(false);
  };

  return (
    <div className="space-y-6 w-full min-w-0 animate-in fade-in duration-200">
      {/* Back Button & Milestone Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          onClick={onBack}
          variant="outline"
          size="sm"
          className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer active:scale-95 inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4 text-slate-500" />
          <span>Back to Vaccine Schedule</span>
        </Button>

        <span className="text-xs font-semibold text-slate-400">
          Active Child: <strong className="text-slate-700">{activeChild?.name || "Active Child"}</strong>
        </span>
      </div>

      {/* Main Title Banner Card using Shadcn Card */}
      <Card className="bg-white border-pink-100 rounded-3xl p-5 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-pink-50">
          <div className="space-y-2 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="border-pink-200 bg-pink-50 text-[#ff2d78] px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide">
                {vaccine.milestone}
              </Badge>
              <span className="text-xs font-medium text-slate-400">
                Age Window: {vaccine.ageRange}
              </span>

              {isCompleted ? (
                <Badge variant="outline" className="border-emerald-400 bg-emerald-50 text-emerald-600 font-semibold px-3 py-0.5 text-xs rounded-full inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Completed ({formatDisplayDate(vaccine.dateCompleted || vaccine.dueDate)})
                </Badge>
              ) : isDue ? (
                <Badge variant="outline" className="border-sky-400 bg-sky-50 text-sky-600 font-semibold px-3 py-0.5 text-xs rounded-full inline-flex items-center gap-1.5 animate-pulse">
                  <AlertCircle className="w-3.5 h-3.5 text-sky-600" />
                  Due for Administration
                </Badge>
              ) : (
                <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-500 font-semibold px-3 py-0.5 text-xs rounded-full inline-flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Upcoming ({formatDisplayDate(vaccine.dueDate)})
                </Badge>
              )}
            </div>

            <CardTitle className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight break-words">
              {vaccine.vaccineName}
            </CardTitle>
            <p className="text-xs sm:text-sm text-slate-500">
              National Ministry of Health & World Health Organization (WHO) Pediatric Immunization Protocol
            </p>
          </div>

          {/* Quick Actions using Shadcn Button */}
          <div className="flex flex-row md:flex-col gap-2 shrink-0">
            <Button
              onClick={() => onPredictVaccine(vaccine.vaccineName)}
              className="py-2.5 px-4 bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Activity className="w-4 h-4" />
              <span>Run AI Reaction Risk</span>
            </Button>

            <Button
              onClick={handleToggleStatus}
              disabled={updating}
              variant={isCompleted ? "outline" : "default"}
              className={`py-2 px-4 text-xs font-bold rounded-xl transition cursor-pointer text-center ${
                isCompleted
                  ? "border-slate-200 text-slate-600 hover:bg-slate-50"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
              }`}
            >
              {updating ? "Saving..." : isCompleted ? "Mark as Incomplete" : "Mark as Completed ✓"}
            </Button>
          </div>
        </div>

        {/* Next Vaccine Unlocked Notification Banner */}
        {isCompleted && nextVaccine && (
          <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-300">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-full bg-emerald-200 text-emerald-800 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="text-xs min-w-0">
                <p className="font-bold text-emerald-900">Vaccine Marked as Completed!</p>
                <p className="text-emerald-700">
                  The next milestone <strong className="font-bold text-emerald-950">{nextVaccine.milestone} ({nextVaccine.vaccineName})</strong> is now unlocked and available.
                </p>
              </div>
            </div>

            {onSelectVaccine && (
              <Button
                type="button"
                onClick={() => onSelectVaccine(nextVaccine)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition shadow-xs cursor-pointer self-start sm:self-auto shrink-0"
              >
                <span>View Next Milestone</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        )}

        {/* 4-Column Clinical Specs Strip using Shadcn Card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-6">
          <Card className="p-4 bg-slate-50/70 border-slate-100 rounded-2xl shadow-none">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold mb-1">
              <Calendar className="w-3.5 h-3.5 text-sky-500" />
              <span>{isCompleted ? "Administered Date" : "Scheduled Date"}</span>
            </div>
            <p className="text-sm font-extrabold text-slate-800">
              {formatDisplayDate(isCompleted ? (vaccine.dateCompleted || vaccine.dueDate) : vaccine.dueDate)}
            </p>
          </Card>

          <Card className="p-4 bg-slate-50/70 border-slate-100 rounded-2xl shadow-none">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold mb-1">
              <Syringe className="w-3.5 h-3.5 text-pink-500" />
              <span>Route & Site</span>
            </div>
            <p className="text-sm font-extrabold text-slate-800">{vaccine.route}</p>
          </Card>

          <Card className="p-4 bg-slate-50/70 border-slate-100 rounded-2xl shadow-none">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold mb-1">
              <Layers className="w-3.5 h-3.5 text-amber-500" />
              <span>Dosage Volume</span>
            </div>
            <p className="text-sm font-extrabold text-slate-800">{vaccine.dosage || "Standard Pediatric Dose"}</p>
          </Card>

          <Card className="p-4 bg-slate-50/70 border-slate-100 rounded-2xl shadow-none">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold mb-1">
              <Tag className="w-3.5 h-3.5 text-emerald-500" />
              <span>Assigned Batch</span>
            </div>
            <p className="text-sm font-extrabold text-slate-800">{vaccine.batchNumber}</p>
          </Card>
        </div>
      </Card>

      {/* Comprehensive Medical Guidance Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-start">
        {/* Diseases Prevented */}
        <Card className="bg-white border-slate-100 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Diseases Prevented</h3>
              <p className="text-xs text-slate-400">Target infectious pathogens and pediatric immunization coverage</p>
            </div>
          </div>

          <div className="p-4 bg-sky-50/60 border border-sky-100 rounded-2xl">
            <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-relaxed">
              {vaccine.diseases}
            </p>
          </div>

          <p className="text-xs text-slate-500 leading-normal">
            Primary immunization establishes long-lasting antibodies and cell-mediated immunity against severe pediatric morbidities. Routine adherence strictly prevents breakout infection cycles.
          </p>
        </Card>

        {/* Expected Reactions & Post-Vaccination Care */}
        <Card className="bg-white border-slate-100 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center font-bold">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Expected Reactions & Care</h3>
              <p className="text-xs text-slate-400">Normal physiological immune responses and home care</p>
            </div>
          </div>

          <div className="p-4 bg-pink-50/70 border border-pink-100 rounded-2xl">
            <p className="text-xs sm:text-sm font-semibold text-pink-900 leading-relaxed">
              {vaccine.expectedReactions}
            </p>
          </div>

          <div className="text-xs text-slate-600 space-y-2">
            <p className="font-semibold text-slate-700">Recommended Comfort Measures:</p>
            <ul className="list-disc pl-4 space-y-1 text-slate-500">
              <li>Apply cool, damp cloth to injection area to soothe localized tenderness.</li>
              <li>Offer plenty of fluids and maintain a comfortable room temperature.</li>
              <li>Administer infant paracetamol only if advised by your medical practitioner.</li>
              <li>Seek immediate medical advice if high fever (&gt;39°C) or persistent crying lasts over 24 hours.</li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
}
