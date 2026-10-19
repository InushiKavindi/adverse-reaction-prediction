import React, { useState, useEffect, useCallback } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  AlertCircle,
  Activity,
  ArrowRight
} from "lucide-react";
import { useChild } from "../../context/ChildContext";
import { api } from "../../services/api";
import { Card, CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import {
  ReactionIllnessModal,
  LogReactionsModal
} from "./VaccineReactionModals";
import {
  mapVaccineToModelType,
  formatDisplayDate,
  hasScheduledDateArrived
} from "./vaccineUtils";
import VaccineOverviewTab from "./VaccineOverviewTab";
import VaccineReactionsTab from "./VaccineReactionsTab";

export default function VaccineDetailView({ vaccine: initialVaccine, onBack, onPredictVaccine, onSelectVaccine }) {
  const { activeChild, schedule = [], updateVaccineStatus, updateChild } = useChild();
  const [updating, setUpdating] = useState(false);

  // Popup 1: Clinical Context (Current Illness & Medication)
  const [showReactionForm, setShowReactionForm] = useState(false);
  const [currentIllness, setCurrentIllness] = useState("");
  const [currentMedication, setCurrentMedication] = useState("");

  // Popup 2: Post-Vaccination Reactions & Onset Times Form
  const [showLogReactionsModal, setShowLogReactionsModal] = useState(false);
  const [logSelectedSymptoms, setLogSelectedSymptoms] = useState([]);
  const [logSymptomOnsets, setLogSymptomOnsets] = useState({});
  const [logOtherDesc, setLogOtherDesc] = useState("");

  // Read current live record from schedule
  const vaccine = schedule.find((s) => s.id === initialVaccine?.id) || initialVaccine;
  const currentIndex = schedule.findIndex((s) => s.id === vaccine?.id);
  const isFirstVaccine = vaccine?.id === "vax-1" || currentIndex === 0 || vaccine?.vaccineName?.toLowerCase().includes("bcg");

  // ML Model Prediction State for this milestone
  const [modelPrediction, setModelPrediction] = useState(null);
  const [loadingPrediction, setLoadingPrediction] = useState(false);
  const [predictionError, setPredictionError] = useState(null);

  const fetchModelPrediction = useCallback(async () => {
    if (!vaccine) return;

    // BCG is administered within 24 hours of birth. At birth, clinical history (allergies,
    // current illness, medications) is not established, so individual probability forecasts and onsets do not apply.
    const isBcg = vaccine.id === "vax-1" || currentIndex === 0 || vaccine.vaccineName?.toLowerCase().includes("bcg");
    if (isBcg) {
      setModelPrediction(null);
      setLoadingPrediction(false);
      setPredictionError(null);
      return;
    }

    setLoadingPrediction(true);
    setPredictionError(null);

    // Check if any previous completed vaccine has an adverse reaction recorded
    const hasPriorReaction = schedule.some(
      (s) => s.status === "completed" && s.reaction?.hasReaction === true
    );

    const payload = {
      patient_identifier: activeChild?.name || "Active Child",
      age_months: vaccine.targetAgeMonths !== undefined ? Number(vaccine.targetAgeMonths) : Number(activeChild?.ageMonths || 0),
      sex: activeChild?.sex || "M",
      vaccine_type: mapVaccineToModelType(vaccine),
      previous_reaction: hasPriorReaction ? "Yes" : "No",
      allergy: activeChild?.allergies || "No",
      current_illness: activeChild?.currentIllness || "No",
      medication: activeChild?.currentMedication || "No",
      notes: `Clinical evaluation for milestone ${vaccine.milestone || ""} (${vaccine.vaccineName || ""})`
    };

    try {
      const res = await api.predict(payload, false);
      if (res.success && res.data) {
        setModelPrediction(res.data);
      } else {
        setPredictionError(res.error || "Unable to load prediction");
      }
    } catch (err) {
      setPredictionError(err.message || "Failed to connect to model");
    } finally {
      setLoadingPrediction(false);
    }
  }, [
    vaccine?.id,
    vaccine?.vaccineName,
    vaccine?.targetAgeMonths,
    activeChild?.id,
    activeChild?.name,
    activeChild?.ageMonths,
    activeChild?.sex,
    activeChild?.allergies,
    activeChild?.currentIllness,
    activeChild?.currentMedication,
    schedule,
    currentIndex
  ]);

  useEffect(() => {
    fetchModelPrediction();
  }, [fetchModelPrediction]);

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

  const nextVaccine = (currentIndex >= 0 && currentIndex < schedule.length - 1) ? schedule[currentIndex + 1] : null;

  const isCompleted = vaccine.status === "completed";
  const isDue = vaccine.status === "due";
  const recordedReaction = vaccine.reaction;
  const scheduledDayArrived = hasScheduledDateArrived(vaccine.dueDate);

  const handleToggleClick = async () => {
    if (isCompleted) {
      handleSaveStatus("due", null, null);
    } else {
      if (!scheduledDayArrived) {
        return;
      }
      if (isFirstVaccine) {
        // Very first vaccine (BCG) completes directly without illness/medication popup
        const todayStr = new Date().toISOString().split("T")[0];
        await handleSaveStatus("completed", todayStr, vaccine.reaction || null);
        return;
      }
      const prevIllness = vaccine.reaction?.currentIllness !== undefined
        ? vaccine.reaction.currentIllness
        : (activeChild?.currentIllness || "");
      const prevMedication = vaccine.reaction?.currentMedication !== undefined
        ? vaccine.reaction.currentMedication
        : (activeChild?.currentMedication || "");

      setCurrentIllness(prevIllness);
      setCurrentMedication(prevMedication);
      setShowReactionForm(true);
    }
  };

  const handleSaveStatus = async (status, dateCompleted, reaction) => {
    setUpdating(true);
    await updateVaccineStatus(vaccine.id, status, dateCompleted, reaction);
    setUpdating(false);
  };

  const handleReactionFormSubmit = async (e) => {
    e.preventDefault();
    const todayStr = new Date().toISOString().split("T")[0];
    const illnessVal = currentIllness.trim() || "None";
    const medicationVal = currentMedication.trim() || "None";

    const reactionPayload = {
      hasReaction: vaccine.reaction?.hasReaction || false,
      currentIllness: illnessVal,
      currentMedication: medicationVal,
      symptoms: vaccine.reaction?.symptoms || [],
      onsets: vaccine.reaction?.onsets || {},
      otherDescription: vaccine.reaction?.otherDescription || null,
      recordedAt: new Date().toISOString()
    };
    setShowReactionForm(false);

    await handleSaveStatus("completed", todayStr, reactionPayload);

    if (activeChild?.id && updateChild) {
      await updateChild(activeChild.id, {
        name: activeChild.name,
        birthDate: activeChild.birthDate || activeChild.birth_date,
        sex: activeChild.sex,
        ageMonths: activeChild.ageMonths !== undefined ? activeChild.ageMonths : activeChild.age_months,
        allergies: activeChild.allergies || "None reported",
        currentIllness: illnessVal,
        currentMedication: medicationVal,
        bloodGroup: activeChild.bloodGroup || activeChild.blood_group || "O+",
        pediatrician: activeChild.pediatrician,
        emergencyContact: activeChild.emergencyContact || activeChild.emergency_contact
      });
    }
  };

  const handleOpenLogReactions = () => {
    const existing = vaccine.reaction;
    if (existing && existing.symptoms && existing.symptoms.length > 0) {
      setLogSelectedSymptoms(existing.symptoms);
      setLogSymptomOnsets(existing.onsets || {});
      setLogOtherDesc(existing.otherDescription || "");
    } else {
      setLogSelectedSymptoms(["no_reaction"]);
      setLogSymptomOnsets({});
      setLogOtherDesc("");
    }
    setShowLogReactionsModal(true);
  };

  const toggleLogSymptom = (id) => {
    if (id === "no_reaction") {
      if (logSelectedSymptoms.includes("no_reaction")) {
        setLogSelectedSymptoms([]);
      } else {
        setLogSelectedSymptoms(["no_reaction"]);
        setLogSymptomOnsets({});
        setLogOtherDesc("");
      }
    } else {
      setLogSelectedSymptoms((prev) => {
        const withoutNoReaction = prev.filter((s) => s !== "no_reaction");
        if (withoutNoReaction.includes(id)) {
          const next = withoutNoReaction.filter((s) => s !== id);
          const nextOnsets = { ...logSymptomOnsets };
          delete nextOnsets[id];
          setLogSymptomOnsets(nextOnsets);
          return next;
        } else {
          return [...withoutNoReaction, id];
        }
      });
    }
  };

  const handleOnsetChange = (id, val) => {
    const cleanVal = val === "" ? "" : String(Math.max(0, parseInt(val, 10) || 0));
    setLogSymptomOnsets((prev) => ({ ...prev, [id]: cleanVal }));
  };

  const handleLogReactionsSubmit = async (e) => {
    e.preventDefault();
    const todayStr = new Date().toISOString().split("T")[0];
    const isNoReaction = logSelectedSymptoms.includes("no_reaction") || logSelectedSymptoms.length === 0;

    const reactionPayload = {
      hasReaction: !isNoReaction,
      currentIllness: vaccine.reaction?.currentIllness || activeChild?.currentIllness || "None",
      currentMedication: vaccine.reaction?.currentMedication || activeChild?.currentMedication || "None",
      symptoms: isNoReaction ? ["no_reaction"] : logSelectedSymptoms,
      onsets: logSymptomOnsets,
      otherDescription: logOtherDesc || null,
      recordedAt: new Date().toISOString()
    };

    setShowLogReactionsModal(false);
    await handleSaveStatus("completed", vaccine.dateCompleted || todayStr, reactionPayload);
  };

  return (
    <div className="space-y-4 sm:space-y-5 w-full min-w-0 animate-in fade-in duration-200">
      {/* Top Header Bar */}
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

      {/* Main Milestone Header Card */}
      <Card className="bg-white border-pink-100 rounded-3xl p-4 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-pink-50">
          <div className="space-y-1.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="border-pink-200 bg-pink-50 text-[#ff2d78] px-3 py-0.5 rounded-full text-xs font-extrabold uppercase tracking-wide">
                {vaccine.milestone}
              </Badge>
              <span className="text-xs font-medium text-slate-400">
                Age Window: {vaccine.ageRange}
              </span>

              {isCompleted ? (
                <Badge variant="outline" className="border-emerald-400 bg-emerald-50 text-emerald-600 font-semibold px-2.5 py-0.5 text-xs rounded-full inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Completed ({formatDisplayDate(vaccine.dateCompleted || vaccine.dueDate)})
                </Badge>
              ) : isDue && scheduledDayArrived ? (
                <Badge variant="outline" className="border-sky-400 bg-sky-50 text-sky-600 font-semibold px-2.5 py-0.5 text-xs rounded-full inline-flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-sky-600" />
                  Due for Administration
                </Badge>
              ) : (
                <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-500 font-semibold px-2.5 py-0.5 text-xs rounded-full inline-flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Upcoming ({formatDisplayDate(vaccine.dueDate)})
                </Badge>
              )}
            </div>

            <CardTitle className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight break-words">
              {vaccine.vaccineName}
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              National Ministry of Health & World Health Organization (WHO) Pediatric Immunization Protocol
            </CardDescription>
          </div>

          {/* Quick Action Buttons */}
          <div className="shrink-0 flex flex-wrap items-center gap-2">
            {isCompleted && (
              <Button
                type="button"
                onClick={handleOpenLogReactions}
                className="py-2 px-3.5 bg-[#ff2d78] hover:bg-[#e02468] text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Activity className="w-3.5 h-3.5" />
                <span>{recordedReaction?.hasReaction ? "Update Reactions" : "Log Reactions"}</span>
              </Button>
            )}

            {onPredictVaccine && !isFirstVaccine && (
              <Button
                type="button"
                onClick={() => onPredictVaccine(vaccine.vaccineName)}
                variant="outline"
                className="py-2 px-3.5 border-sky-200 bg-sky-50/70 text-sky-700 hover:bg-sky-100 font-bold text-xs rounded-xl transition shadow-2xs inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Activity className="w-3.5 h-3.5 text-sky-600" />
                <span>AI Risk Assessment</span>
              </Button>
            )}

            <Button
              onClick={handleToggleClick}
              disabled={updating || (!isCompleted && !scheduledDayArrived)}
              variant={isCompleted ? "outline" : "default"}
              className={`py-2 px-4 text-xs font-bold rounded-xl transition text-center shadow-xs ${
                isCompleted
                  ? "border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
                  : !scheduledDayArrived
                  ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-80"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
              }`}
              title={
                !isCompleted && !scheduledDayArrived
                  ? `Cannot be marked as completed until scheduled date (${formatDisplayDate(vaccine.dueDate)}) arrives`
                  : ""
              }
            >
              {updating
                ? "Saving..."
                : isCompleted
                ? "Mark as Incomplete"
                : !scheduledDayArrived
                ? `Available on ${formatDisplayDate(vaccine.dueDate)}`
                : "Mark as Completed ✓"}
            </Button>
          </div>
        </div>

        {/* Milestone scheduled for future date indicator */}
        {!isCompleted && !scheduledDayArrived && (
          <div className="mt-3 p-3.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl flex items-center gap-3 animate-in fade-in duration-200">
            <div className="w-6 h-6 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center shrink-0">
              <Clock className="w-3.5 h-3.5 text-amber-800" />
            </div>
            <div className="text-xs">
              <p className="font-bold text-amber-900">Vaccine Scheduled for Future Date</p>
              <p className="text-amber-700">
                This vaccine milestone is scheduled for <strong className="text-amber-950 font-bold">{formatDisplayDate(vaccine.dueDate)}</strong> based on child's date of birth. It is available to view, but cannot be completed until the scheduled day arrives.
              </p>
            </div>
          </div>
        )}

        {/* Next Vaccine Unlocked Notification Banner */}
        {isCompleted && nextVaccine && (
          <div className="mt-3 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-300">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-6 h-6 rounded-full bg-emerald-200 text-emerald-800 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
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
      </Card>

      {/* Exactly 2 Responsive Tabs: 1. Overview & Coverage, 2. Reactions & Care */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-2 w-full max-w-sm sm:max-w-md h-auto p-1 bg-slate-100/90 rounded-2xl border border-slate-200/60">
          <TabsTrigger value="overview" className="w-full py-2 px-2 text-xs font-bold rounded-xl text-center truncate">
            Overview & Coverage
          </TabsTrigger>
          <TabsTrigger value="care" className="w-full py-2 px-2 text-xs font-bold rounded-xl text-center truncate">
            Reactions & Care
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: Clinical Overview AND Diseases & Coverage Combined Together */}
        <VaccineOverviewTab
          vaccine={vaccine}
          isCompleted={isCompleted}
          recordedReaction={recordedReaction}
          handleOpenLogReactions={handleOpenLogReactions}
        />

        {/* TAB 2: Model Adverse Reaction Predictions & Comfort Care */}
        <VaccineReactionsTab
          isFirstVaccine={isFirstVaccine}
          vaccine={vaccine}
          activeChild={activeChild}
          schedule={schedule}
          modelPrediction={modelPrediction}
          loadingPrediction={loadingPrediction}
          predictionError={predictionError}
          fetchModelPrediction={fetchModelPrediction}
        />
      </Tabs>

      {/* POPUP 1: Record a Reaction (Current Illness & Medication) */}
      <ReactionIllnessModal
        open={showReactionForm}
        onOpenChange={setShowReactionForm}
        currentIllness={currentIllness}
        setCurrentIllness={setCurrentIllness}
        currentMedication={currentMedication}
        setCurrentMedication={setCurrentMedication}
        onSubmit={handleReactionFormSubmit}
        updating={updating}
      />

      {/* POPUP 2: Log Reactions & Onset Times */}
      <LogReactionsModal
        open={showLogReactionsModal}
        onOpenChange={setShowLogReactionsModal}
        selectedSymptoms={logSelectedSymptoms}
        toggleSymptom={toggleLogSymptom}
        symptomOnsets={logSymptomOnsets}
        onOnsetChange={handleOnsetChange}
        otherDesc={logOtherDesc}
        setOtherDesc={setLogOtherDesc}
        onSubmit={handleLogReactionsSubmit}
        updating={updating}
      />
    </div>
  );
}
