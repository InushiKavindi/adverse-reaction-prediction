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
  HeartPulse,
  ArrowRight,
  Check,
  X,
  User
} from "lucide-react";
import { useChild } from "../../context/ChildContext";
import { Card, CardTitle } from "../ui/card";
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

const SYMPTOM_OPTIONS = [
  {
    id: "no_reaction",
    label: "No Reaction",
    emoji: "😊",
    isNoReaction: true
  },
  {
    id: "fever",
    label: "Fever",
    emoji: "🌡️"
  },
  {
    id: "swelling",
    label: "Injection-site Swelling",
    emoji: "💉"
  },
  {
    id: "redness",
    label: "Redness",
    emoji: "🔴"
  },
  {
    id: "pain",
    label: "Pain",
    emoji: "⚡"
  },
  {
    id: "rash",
    label: "Rash",
    emoji: "🌸"
  },
  {
    id: "others",
    label: "Others",
    emoji: "➕"
  }
];

export default function VaccineDetailView({ vaccine: initialVaccine, onBack, onPredictVaccine, onSelectVaccine }) {
  const { activeChild, schedule = [], updateVaccineStatus } = useChild();
  const [updating, setUpdating] = useState(false);

  // Popups State
  const [showSymptomsConfirm, setShowSymptomsConfirm] = useState(false);
  const [showReactionForm, setShowReactionForm] = useState(false);

  // Reaction Recording Form State
  const [currentIllness, setCurrentIllness] = useState("No");
  const [currentMedication, setCurrentMedication] = useState("No");
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [symptomOnsets, setSymptomOnsets] = useState({});
  const [otherDescription, setOtherDescription] = useState("");

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
  const recordedReaction = vaccine.reaction;

  const handleToggleClick = () => {
    if (isCompleted) {
      // Mark back as incomplete (due) directly
      handleSaveStatus("due", null, null);
    } else {
      // Open Popup 1 (Image 3) to ask if child had symptoms
      setShowSymptomsConfirm(true);
    }
  };

  const handleSymptomsConfirmResponse = async (experiencedSymptoms) => {
    setShowSymptomsConfirm(false);
    if (experiencedSymptoms) {
      // Open Popup 2 (Image 2) to record reactions
      setShowReactionForm(true);
    } else {
      // Mark as completed with no reaction
      const todayStr = new Date().toISOString().split("T")[0];
      await handleSaveStatus("completed", todayStr, {
        hasReaction: false,
        symptoms: ["no_reaction"],
        currentIllness: "No",
        currentMedication: "No",
        recordedAt: new Date().toISOString()
      });
    }
  };

  const handleSaveStatus = async (status, dateCompleted, reaction) => {
    setUpdating(true);
    await updateVaccineStatus(vaccine.id, status, dateCompleted, reaction);
    setUpdating(false);
  };

  const toggleSymptom = (id) => {
    if (id === "no_reaction") {
      if (selectedSymptoms.includes("no_reaction")) {
        setSelectedSymptoms([]);
      } else {
        setSelectedSymptoms(["no_reaction"]);
        setSymptomOnsets({});
        setOtherDescription("");
      }
    } else {
      setSelectedSymptoms((prev) => {
        const withoutNoReaction = prev.filter((s) => s !== "no_reaction");
        if (withoutNoReaction.includes(id)) {
          const next = withoutNoReaction.filter((s) => s !== id);
          const nextOnsets = { ...symptomOnsets };
          delete nextOnsets[id];
          setSymptomOnsets(nextOnsets);
          return next;
        } else {
          return [...withoutNoReaction, id];
        }
      });
    }
  };

  const handleOnsetChange = (id, val) => {
    setSymptomOnsets((prev) => ({ ...prev, [id]: val }));
  };

  const handleReactionFormSubmit = async (e) => {
    e.preventDefault();
    const todayStr = new Date().toISOString().split("T")[0];
    const reactionPayload = {
      hasReaction: !selectedSymptoms.includes("no_reaction") && selectedSymptoms.length > 0,
      currentIllness,
      currentMedication,
      symptoms: selectedSymptoms.length > 0 ? selectedSymptoms : ["no_reaction"],
      onsets: symptomOnsets,
      otherDescription: otherDescription || null,
      recordedAt: new Date().toISOString()
    };
    setShowReactionForm(false);
    await handleSaveStatus("completed", todayStr, reactionPayload);
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

          {/* Quick Action: Mark Completed / Incomplete */}
          <div className="shrink-0">
            <Button
              onClick={handleToggleClick}
              disabled={updating}
              variant={isCompleted ? "outline" : "default"}
              className={`py-2.5 px-5 text-xs font-bold rounded-xl transition cursor-pointer text-center shadow-xs ${
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

        {/* Clean 2-Column Clinical Specs Strip (Dosage & Batch Removed as requested) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-6">
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
        </div>

        {/* Recorded Reaction Banner if present */}
        {recordedReaction && recordedReaction.hasReaction && (
          <div className="mt-4 p-4 bg-pink-50/70 border border-pink-200/80 rounded-2xl">
            <div className="flex items-center gap-2 text-[#ff2d78] text-xs font-bold mb-2">
              <Activity className="w-4 h-4" />
              <span>Recorded Post-Vaccination Reactions:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {recordedReaction.symptoms?.map((s) => (
                <span key={s} className="px-2.5 py-1 bg-white border border-pink-200 text-pink-700 rounded-xl text-xs font-semibold">
                  {s.replace("_", " ")}
                  {recordedReaction.onsets?.[s] ? ` (onset: ${recordedReaction.onsets[s]} hrs)` : ""}
                </span>
              ))}
            </div>
            {recordedReaction.otherDescription && (
              <p className="text-xs text-slate-600 mt-2 font-medium">
                Note: {recordedReaction.otherDescription}
              </p>
            )}
          </div>
        )}
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

      {/* POPUP 1: Symptoms Confirmation Dialog (Matching Image 3) */}
      {showSymptomsConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-base sm:text-lg font-bold text-slate-800 leading-snug mb-6">
              Did the child experience any symptoms following the vaccination?
            </h3>

            <div className="flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => handleSymptomsConfirmResponse(true)}
                className="w-28 py-2.5 rounded-full border border-pink-300 bg-pink-50/70 hover:bg-pink-100 text-pink-600 font-bold text-sm transition active:scale-95 cursor-pointer shadow-2xs"
              >
                Yes
              </button>

              <button
                type="button"
                onClick={() => handleSymptomsConfirmResponse(false)}
                className="w-28 py-2.5 rounded-full border border-sky-300 bg-sky-50/70 hover:bg-sky-100 text-sky-600 font-bold text-sm transition active:scale-95 cursor-pointer shadow-2xs"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP 2: Record a Reaction Form (Matching Image 2) */}
      {showReactionForm && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="relative bg-white rounded-3xl max-w-md w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200 overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowReactionForm(false)}
                  className="p-1 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h2 className="text-base font-bold text-slate-900">Record a Reaction</h2>
              </div>

              <div className="w-8 h-8 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center font-bold text-xs">
                <User className="w-4 h-4" />
              </div>
            </div>

            {/* Scrollable Modal Body */}
            <form onSubmit={handleReactionFormSubmit} className="p-5 overflow-y-auto space-y-4">
              {/* Question Headline */}
              <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                Did your child experience any of the following symptoms?
              </h3>

              {/* Clinical Context: Current Illness & Medication */}
              <div className="bg-slate-50/80 border border-slate-200/70 rounded-2xl p-3.5 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-slate-800">Current Illness</p>
                    <p className="text-[11px] text-slate-400">Child experiencing acute illness or fever?</p>
                  </div>
                  <div className="flex items-center bg-white border border-slate-200 rounded-full p-0.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setCurrentIllness("No")}
                      className={`px-3 py-1 text-xs font-bold rounded-full transition cursor-pointer ${
                        currentIllness === "No" ? "bg-slate-800 text-white shadow-xs" : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      No
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentIllness("Yes")}
                      className={`px-3 py-1 text-xs font-bold rounded-full transition cursor-pointer ${
                        currentIllness === "Yes" ? "bg-pink-500 text-white shadow-xs" : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      Yes
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 pt-2.5 border-t border-slate-200/60">
                  <div>
                    <p className="text-xs font-bold text-slate-800">Current Medication</p>
                    <p className="text-[11px] text-slate-400">Taking antibiotics or steroid medications?</p>
                  </div>
                  <div className="flex items-center bg-white border border-slate-200 rounded-full p-0.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setCurrentMedication("No")}
                      className={`px-3 py-1 text-xs font-bold rounded-full transition cursor-pointer ${
                        currentMedication === "No" ? "bg-slate-800 text-white shadow-xs" : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      No
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentMedication("Yes")}
                      className={`px-3 py-1 text-xs font-bold rounded-full transition cursor-pointer ${
                        currentMedication === "Yes" ? "bg-pink-500 text-white shadow-xs" : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      Yes
                    </button>
                  </div>
                </div>
              </div>

              {/* Symptoms List (Matching Image 2) */}
              <div className="space-y-2.5">
                {SYMPTOM_OPTIONS.map((sym) => {
                  const isChecked = selectedSymptoms.includes(sym.id);

                  return (
                    <div
                      key={sym.id}
                      className={`rounded-2xl border transition-all p-3.5 sm:p-4 bg-white ${
                        isChecked
                          ? "border-pink-300 ring-2 ring-pink-100/70 shadow-xs"
                          : "border-pink-100/90 hover:border-pink-200"
                      }`}
                    >
                      <div
                        onClick={() => toggleSymptom(sym.id)}
                        className="flex items-center justify-between cursor-pointer select-none"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg shrink-0">{sym.emoji}</span>
                          <span className="font-bold text-slate-800 text-sm">{sym.label}</span>
                        </div>

                        {/* Pink Checkbox */}
                        <div
                          className={`w-5 h-5 rounded-md border flex items-center justify-center transition ${
                            isChecked
                              ? "bg-[#ff2d78] border-[#ff2d78] text-white"
                              : "border-pink-300 bg-white"
                          }`}
                        >
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>

                      {/* Onset hours input when symptom is checked (except 'no_reaction') */}
                      {isChecked && !sym.isNoReaction && (
                        <div className="mt-3 pt-3 border-t border-pink-50 animate-in fade-in duration-200">
                          <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                            How many hours after vaccination did the symptom begin?
                          </label>
                          <div className="relative">
                            <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type="number"
                              min="0"
                              max="720"
                              step="0.5"
                              value={symptomOnsets[sym.id] || ""}
                              onChange={(e) => handleOnsetChange(sym.id, e.target.value)}
                              placeholder="e.g. 5 hours"
                              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50/80 border border-slate-200 rounded-xl focus:bg-white focus:border-sky-400 outline-none transition"
                            />
                          </div>

                          {sym.id === "others" && (
                            <div className="mt-2.5">
                              <input
                                type="text"
                                value={otherDescription}
                                onChange={(e) => setOtherDescription(e.target.value)}
                                placeholder="Describe other symptom (e.g. irritability, crying)..."
                                className="w-full px-3.5 py-2 text-xs bg-slate-50/80 border border-slate-200 rounded-xl focus:bg-white focus:border-sky-400 outline-none transition"
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Submit Button (Image 2 style) */}
              <div className="pt-2">
                <Button
                  type="submit"
                  className="w-full py-3 bg-[#0284c7] hover:bg-sky-600 text-white font-bold text-sm rounded-full shadow-md shadow-sky-200 transition cursor-pointer active:scale-98"
                >
                  Continue
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
