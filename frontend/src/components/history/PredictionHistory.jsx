import React, { useState, useEffect } from "react";
import { useChild } from "../../context/ChildContext";
import { api } from "../../services/api";
import {
  mapVaccineToModelType,
  calculateAgeMonthsAtDate
} from "../schedule/vaccineUtils";
import {
  History,
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  HeartPulse,
  Baby,
  ShieldCheck,
  AlertCircle,
  AlertTriangle
} from "lucide-react";

export default function PredictionHistory({ onNewScreening }) {
  const { activeChild, schedule, loadingSchedule } = useChild();
  const [predictionsMap, setPredictionsMap] = useState({});
  const [loadingPredictions, setLoadingPredictions] = useState(false);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'logged' | 'due'
  const [filterRisk, setFilterRisk] = useState("all");
  const [selectedRecord, setSelectedRecord] = useState(null);

  const vax1Item = (schedule || []).find(
    (s) =>
      s.id === "vax-1" ||
      (s.vaccineName?.toLowerCase().includes("bcg") &&
        !s.vaccineName?.toLowerCase().includes("bcg 2") &&
        !s.vaccineName?.toLowerCase().includes("bcg2"))
  );
  const bcgScarStatus = vax1Item?.reaction?.bcgScarStatus;

  // Filter only unlocked vaccines according to child profile
  const unlockedSchedule = (schedule || []).filter((item) => {
    if (
      item.id === "vax-bcg2" ||
      item.vaccineName?.toLowerCase().includes("bcg 2") ||
      item.vaccineName?.toLowerCase().includes("bcg2")
    ) {
      if (bcgScarStatus === "present" || bcgScarStatus !== "absent") {
        return false;
      }
    }
    const isUnlocked =
      item.isClickable !== undefined
        ? Boolean(item.isClickable)
        : item.is_clickable !== undefined
        ? Boolean(item.is_clickable)
        : item.status === "completed" || item.status === "due";
    return isUnlocked;
  });

  // Auto-evaluate predictions for child vaccines (excluding BCG1 which is general reaction only)
  useEffect(() => {
    if (!unlockedSchedule || unlockedSchedule.length === 0 || !activeChild) {
      setPredictionsMap({});
      return;
    }

    let isMounted = true;
    const fetchAllPredictions = async () => {
      setLoadingPredictions(true);
      try {
        const promises = unlockedSchedule.map(async (vax) => {
          const isBcg1 =
            vax.id === "vax-1" ||
            (vax.vaccineName || "").trim().toLowerCase() === "bcg" ||
            (vax.vaccineName || "").trim().toLowerCase().startsWith("bcg1");

          // BCG1 does not use model predictions; it has general WHO educational reactions
          if (isBcg1) {
            return { vaxId: vax.id, prediction: null };
          }

          const isBcg2 =
            vax.id === "vax-bcg2" ||
            (vax.vaccineName || "").toLowerCase().includes("bcg 2") ||
            (vax.vaccineName || "").toLowerCase().includes("bcg2");

          let effectiveAgeMonths =
            vax.targetAgeMonths !== undefined
              ? Number(vax.targetAgeMonths)
              : Number(activeChild?.ageMonths || 0);

          if (vax.dueDate && activeChild?.birthDate) {
            effectiveAgeMonths = calculateAgeMonthsAtDate(activeChild.birthDate, vax.dueDate);
          }
          if (isBcg2) {
            effectiveAgeMonths = Math.max(1.5, Math.min(6.0, Number(effectiveAgeMonths.toFixed(1))));
          }

          const hasPriorReaction = schedule.some(
            (s) => s.id !== vax.id && s.status === "completed" && s.reaction?.hasReaction === true
          );

          const illnessVal =
            activeChild?.currentIllness && activeChild.currentIllness !== "None"
              ? activeChild.currentIllness
              : "No";
          const medVal =
            activeChild?.currentMedication && activeChild.currentMedication !== "None"
              ? activeChild.currentMedication
              : "No";

          const payload = {
            patient_identifier: activeChild?.name || "Active Child",
            age_months: effectiveAgeMonths,
            sex: activeChild?.sex || "M",
            vaccine_type: mapVaccineToModelType(vax),
            previous_reaction: hasPriorReaction ? "Yes" : "No",
            allergy: activeChild?.allergies || "No",
            current_illness: illnessVal,
            medication: medVal,
            notes: `Clinical evaluation for milestone ${vax.milestone || ""} (${vax.vaccineName || ""})`
          };

          const res = await api.predict(payload, false);
          return { vaxId: vax.id, prediction: res.success ? res.data : null };
        });

        const results = await Promise.all(promises);
        if (isMounted) {
          const map = {};
          results.forEach(({ vaxId, prediction }) => {
            if (prediction) map[vaxId] = prediction;
          });
          setPredictionsMap(map);
        }
      } catch (err) {
        console.error("Failed to load predictions for schedule:", err);
      } finally {
        if (isMounted) setLoadingPredictions(false);
      }
    };

    fetchAllPredictions();
    return () => {
      isMounted = false;
    };
  }, [
    activeChild?.id,
    activeChild?.birthDate,
    activeChild?.ageMonths,
    activeChild?.currentIllness,
    activeChild?.currentMedication,
    schedule
  ]);

  // Map each unlocked vaccine with its prediction / general reaction and logged reaction
  const vaccineCards = unlockedSchedule.map((vax) => {
    const isBcg1 =
      vax.id === "vax-1" ||
      (vax.vaccineName || "").trim().toLowerCase() === "bcg" ||
      (vax.vaccineName || "").trim().toLowerCase().startsWith("bcg1");

    const isBcg2 =
      vax.id === "vax-bcg2" ||
      (vax.vaccineName || "").toLowerCase().includes("bcg 2") ||
      (vax.vaccineName || "").toLowerCase().includes("bcg2");

    let effectiveAgeMonths =
      vax.targetAgeMonths !== undefined
        ? Number(vax.targetAgeMonths)
        : Number(activeChild?.ageMonths || 0);

    if (vax.dueDate && activeChild?.birthDate) {
      effectiveAgeMonths = calculateAgeMonthsAtDate(activeChild.birthDate, vax.dueDate);
    }
    if (isBcg2) {
      effectiveAgeMonths = Math.max(1.5, Math.min(6.0, Number(effectiveAgeMonths.toFixed(1))));
    }

    const prediction = predictionsMap[vax.id] || null;
    const isCompleted = vax.status === "completed";
    const rx = vax.reaction || null;
    const hasRx = rx?.hasReaction === true;
    const isScarAbsent = rx?.bcgScarStatus === "absent";
    const isScarPresent = rx?.bcgScarStatus === "present";

    let loggedReaction = null;
    if (isCompleted || rx != null) {
      let statusText = "No Reaction";
      let summary = "Completed with no adverse reactions reported. Patient tolerated the vaccination well.";

      if (hasRx) {
        statusText = "Reaction Observed";
        const syms = (rx.symptoms || []).filter((s) => s !== "no_reaction");
        const parts = syms.map((s) => {
          const onset = rx.onsets && rx.onsets[s];
          const display = s.charAt(0).toUpperCase() + s.slice(1);
          return onset ? `${display} (~${onset}h onset)` : display;
        });
        summary = parts.length > 0 ? `Observed: ${parts.join(", ")}` : "Adverse symptoms logged.";
        if (rx.otherDescription) {
          summary += ` (${rx.otherDescription})`;
        }
      } else if (isScarAbsent) {
        statusText = "BCG Scar Absent";
        summary = "BCG scar assessment completed: No scar detected. BCG2 revaccination indicated.";
      } else if (isScarPresent) {
        statusText = "BCG Scar Present";
        summary = "BCG scar assessment completed: Normal healthy scar developed.";
      }

      loggedReaction = {
        hasReaction: hasRx,
        bcgScarStatus: rx?.bcgScarStatus,
        statusText,
        summary,
        dateCompleted: vax.dateCompleted,
        symptoms: (rx?.symptoms || []).filter((s) => s !== "no_reaction"),
        onsets: rx?.onsets || {},
        otherDescription: rx?.otherDescription,
        currentIllness: rx?.currentIllness || activeChild?.currentIllness,
        currentMedication: rx?.currentMedication || activeChild?.currentMedication
      };
    }

    // BCG1 is a general expected neonatal reaction, not an ML risk model prediction
    if (isBcg1) {
      return {
        vaxId: vax.id,
        isBcg1: true,
        vaccineName: vax.vaccineName,
        milestone: vax.milestone || "Birth",
        targetAgeMonths: 0,
        effectiveAgeMonths: 0,
        dueDate: vax.dueDate,
        dateCompleted: vax.dateCompleted,
        status: vax.status,
        isCompleted,
        patientName: activeChild?.name || "Child",
        riskLevel: "Normal",
        statusBadgeText: "Normal / Expected",
        summary:
          "After BCG vaccination, a small bump may appear at the injection site after about 2-4 weeks. It may develop into a small sore or shallow ulcer, which heals naturally and leaves a small scar.",
        prediction: null,
        predictedPositiveSymptoms: [],
        loggedReaction,
        rawVaccine: vax
      };
    }

    // Routine & BCG2 vaccines use ML model predictions
    const predictedPositiveSymptoms = (prediction?.symptoms || []).filter(
      (s) => s.predicted && s.symptom !== "no_reaction"
    );

    const riskLevel = prediction?.risk_level || "Low";

    return {
      vaxId: vax.id,
      isBcg1: false,
      vaccineName: vax.vaccineName,
      milestone: vax.milestone,
      targetAgeMonths: vax.targetAgeMonths,
      effectiveAgeMonths,
      dueDate: vax.dueDate,
      dateCompleted: vax.dateCompleted,
      status: vax.status,
      isCompleted,
      patientName: activeChild?.name || "Child",
      riskLevel,
      statusBadgeText: `${riskLevel} Risk`,
      summary: prediction?.summary || "",
      prediction,
      predictedPositiveSymptoms,
      loggedReaction,
      rawVaccine: vax
    };
  });

  // Filter cards by tab, risk, and search
  const filteredCards = vaccineCards.filter((card) => {
    if (activeTab === "logged" && !card.loggedReaction) return false;
    if (activeTab === "due" && card.isCompleted) return false;

    if (filterRisk !== "all") {
      if (card.isBcg1) {
        if (filterRisk !== "Low") return false;
      } else if (card.riskLevel !== filterRisk) {
        return false;
      }
    }

    const q = search.trim().toLowerCase();
    if (!q) return true;

    const matchesName = card.vaccineName.toLowerCase().includes(q);
    const matchesMilestone = (card.milestone || "").toLowerCase().includes(q);
    const matchesSummary = card.summary.toLowerCase().includes(q);
    const matchesSymptoms = (card.prediction?.symptoms || []).some((s) =>
      (s.display_name || s.symptom).toLowerCase().includes(q)
    );
    const matchesLogged = card.loggedReaction?.summary.toLowerCase().includes(q);

    return matchesName || matchesMilestone || matchesSummary || matchesSymptoms || matchesLogged;
  });

  const isLoading = loadingSchedule || (loadingPredictions && Object.keys(predictionsMap).length === 0);
  const loggedCount = vaccineCards.filter((c) => c.loggedReaction).length;
  const dueCount = vaccineCards.filter((c) => !c.isCompleted).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Prediction History
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Adverse reaction assessments, symptom forecasts with onset times, and logged reactions for each child milestone.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => {
            setActiveTab("all");
            setFilterRisk("all");
          }}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition cursor-pointer flex items-center gap-2 border ${
            activeTab === "all"
              ? "bg-slate-900 text-white border-slate-900 shadow-xs"
              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
          }`}
        >
          <span>All Unlocked Vaccines</span>
          <span
            className={`px-1.5 py-0.5 rounded-full text-[10px] ${
              activeTab === "all" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
            }`}
          >
            {vaccineCards.length}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab("logged");
            setFilterRisk("all");
          }}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition cursor-pointer flex items-center gap-2 border ${
            activeTab === "logged"
              ? "bg-pink-600 text-white border-pink-600 shadow-xs"
              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
          }`}
        >
          <HeartPulse className="w-3.5 h-3.5" />
          <span>With Logged Reactions</span>
          <span
            className={`px-1.5 py-0.5 rounded-full text-[10px] ${
              activeTab === "logged" ? "bg-white/20 text-white" : "bg-pink-100 text-pink-700"
            }`}
          >
            {loggedCount}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab("due");
            setFilterRisk("all");
          }}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition cursor-pointer flex items-center gap-2 border ${
            activeTab === "due"
              ? "bg-[#0284c7] text-white border-[#0284c7] shadow-xs"
              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Due / Upcoming</span>
          <span
            className={`px-1.5 py-0.5 rounded-full text-[10px] ${
              activeTab === "due" ? "bg-white/20 text-white" : "bg-sky-100 text-sky-700"
            }`}
          >
            {dueCount}
          </span>
        </button>
      </div>

      {/* Search and Risk Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white border border-slate-100 p-3 rounded-2xl shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={`Search ${activeChild ? activeChild.name + "'s" : "child"} vaccines or reactions (e.g. fever, pain)...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-sky-400 outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto flex-wrap">
          {["all", "Low", "Medium", "High"].map((level) => (
            <button
              key={level}
              onClick={() => setFilterRisk(level)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer ${
                filterRisk === level
                  ? "bg-slate-800 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {level === "all" ? "All Risks" : `${level} Risk`}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="text-center py-12 bg-white rounded-3xl border border-slate-100 p-8 shadow-xs space-y-3">
          <div className="w-8 h-8 mx-auto border-3 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-semibold text-slate-500">
            Loading reaction history for {activeChild?.name || "child"}...
          </p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredCards.length === 0 && (
        <div className="text-center py-12 bg-white rounded-3xl border border-slate-100 p-8 shadow-xs">
          <History className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 mb-1">No Vaccine Records Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            No vaccines match your current search or risk filter for {activeChild?.name || "this child"}.
          </p>
          <button
            onClick={() => {
              setSearch("");
              setFilterRisk("all");
              setActiveTab("all");
            }}
            className="py-2 px-4 bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Cards Grid */}
      {!isLoading && filteredCards.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCards.map((card) => {
            const isBcg1 = card.isBcg1;
            const isHigh = card.riskLevel === "High";
            const isMed = card.riskLevel === "Medium";

            return (
              <div
                key={card.vaxId}
                onClick={() => setSelectedRecord(card)}
                className="bg-white border border-slate-100 hover:border-sky-300 rounded-3xl p-5 shadow-xs hover:shadow-md transition cursor-pointer flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Top row: Milestone + Risk / Expected Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {card.milestone || "Vaccine"}
                    </span>

                    {isBcg1 ? (
                      <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Normal / Expected Reaction
                      </span>
                    ) : (
                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 ${
                          isHigh
                            ? "bg-rose-100 text-rose-700 border border-rose-200"
                            : isMed
                            ? "bg-amber-100 text-amber-700 border border-amber-200"
                            : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                        }`}
                      >
                        {isHigh ? (
                          <AlertTriangle className="w-3 h-3" />
                        ) : isMed ? (
                          <AlertCircle className="w-3 h-3" />
                        ) : (
                          <CheckCircle2 className="w-3 h-3" />
                        )}
                        {card.riskLevel} Risk
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-slate-900">
                    {card.vaccineName}
                  </h3>

                  {/* Reaction details */}
                  {isBcg1 ? (
                    <div className="space-y-2">
                      <p className="text-xs text-slate-600 leading-relaxed font-normal">
                        {card.summary}
                      </p>
                      <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <span className="font-semibold text-slate-700 block mb-0.5">Expected Progression:</span>
                        Small papule appears after 2–4 weeks, may form a tiny ulcer, and heals naturally leaving a scar.
                      </div>
                    </div>
                  ) : card.predictedPositiveSymptoms.length > 0 ? (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block flex items-center gap-1">
                        <Clock className="w-3 h-3 text-sky-500" />
                        Predicted Reactions & Onsets:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {card.predictedPositiveSymptoms.map((s) => (
                          <span
                            key={s.symptom}
                            className="text-[11px] font-semibold px-2.5 py-1 rounded-xl bg-sky-50 text-sky-800 border border-sky-100 flex items-center gap-1.5"
                          >
                            <span>{s.display_name}</span>
                            <span className="text-sky-600 font-bold">
                              ({Math.round(s.probability * 100)}%)
                            </span>
                            {s.onset_hours !== null && s.onset_hours !== undefined && (
                              <span className="text-slate-500 text-[10px] font-medium border-l border-sky-200 pl-1.5">
                                ~{Math.round(s.onset_hours)} hrs
                              </span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-[11px] text-emerald-700 font-medium px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-100 inline-block">
                      No adverse reactions predicted. Patient is likely to tolerate well.
                    </div>
                  )}
                </div>

                {/* Footer details row */}
                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span
                      className={
                        card.isCompleted
                          ? "text-emerald-600 font-bold"
                          : "text-slate-500 font-medium"
                      }
                    >
                      {card.isCompleted ? `Given: ${card.dateCompleted}` : `Due: ${card.dueDate}`}
                    </span>
                  </div>

                  <span className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1">
                    Details <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal with Backdrop Click to Close (without top right X icon) */}
      {selectedRecord && (
        <div
          onClick={() => setSelectedRecord(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-7 shadow-xl border border-slate-100 cursor-default space-y-4"
          >
            {/* Modal Header without top right X close icon */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  {selectedRecord.milestone} Milestone
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  {selectedRecord.vaccineName}
                </h3>
              </div>

              <div>
                {selectedRecord.isBcg1 ? (
                  <span className="text-xs font-bold px-3 py-1 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-300">
                    Normal / Expected Reaction
                  </span>
                ) : (
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full border ${
                      selectedRecord.riskLevel === "High"
                        ? "bg-rose-50 text-rose-700 border-rose-300"
                        : selectedRecord.riskLevel === "Medium"
                        ? "bg-amber-50 text-amber-700 border-amber-300"
                        : "bg-emerald-50 text-emerald-700 border-emerald-300"
                    }`}
                  >
                    {selectedRecord.riskLevel} Risk
                  </span>
                )}
              </div>
            </div>

            {/* Modal Content: BCG1 (General WHO reactions) vs Routine (Model Predictions) */}
            {selectedRecord.isBcg1 ? (
              <div className="space-y-3.5">
                <div className="p-4 bg-pink-50/70 border border-pink-100 rounded-2xl space-y-2">
                  <h4 className="text-xs font-bold text-[#ff2d78] uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Normal / Expected Reaction</span>
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                    {selectedRecord.summary}
                  </p>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    This is a normal part of the healing process after neonatal BCG administration. The timing and appearance can vary from child to child.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Typical Healing Progression
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                      <span className="text-[10px] font-bold text-sky-600 uppercase block">Weeks 2 – 4</span>
                      <p className="font-bold text-slate-800 text-[11px]">Small bump appears</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                      <span className="text-[10px] font-bold text-amber-600 uppercase block">Following weeks</span>
                      <p className="font-bold text-slate-800 text-[11px]">Small sore may form</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                      <span className="text-[10px] font-bold text-emerald-600 uppercase block">Over months</span>
                      <p className="font-bold text-slate-800 text-[11px]">Heals leaving scar</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-sky-500" />
                  <span>Reactions, Probabilities & Onset Times</span>
                </h4>

                <div className="space-y-2">
                  {selectedRecord.prediction?.symptoms
                    ?.filter((s) => s.symptom !== "no_reaction")
                    .map((item) => {
                      const probPercent = Math.round((item.probability || 0) * 100);
                      return (
                        <div
                          key={item.symptom}
                          className={`flex items-center justify-between p-3 rounded-2xl border text-xs ${
                            item.predicted
                              ? "bg-rose-50/60 border-rose-200"
                              : "bg-slate-50/70 border-slate-200/80"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-xs sm:text-sm">
                              {item.display_name}
                            </span>
                            {item.predicted && (
                              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 flex items-center gap-1">
                                <AlertTriangle className="w-2.5 h-2.5 text-rose-600" />
                                Predicted
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="font-bold text-slate-700 text-xs">
                              {probPercent}% probability
                            </span>
                            {item.onset_hours !== null && item.onset_hours !== undefined ? (
                              <span className="font-bold text-sky-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs text-[11px]">
                                Onset: ~{Math.round(item.onset_hours)} hrs
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[11px]">—</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Logged Post-Vaccination Record */}
            {selectedRecord.loggedReaction && (
              <div
                className={`p-3.5 rounded-2xl space-y-2 text-xs border ${
                  selectedRecord.loggedReaction.hasReaction || selectedRecord.loggedReaction.bcgScarStatus === "absent"
                    ? "bg-amber-50/90 border-amber-200 text-amber-950"
                    : "bg-emerald-50/90 border-emerald-200 text-emerald-950"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold flex items-center gap-1.5 text-xs">
                    <HeartPulse className="w-3.5 h-3.5 text-pink-600" />
                    Logged Reaction Record:
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      selectedRecord.loggedReaction.hasReaction || selectedRecord.loggedReaction.bcgScarStatus === "absent"
                        ? "bg-amber-200 text-amber-900"
                        : "bg-emerald-200 text-emerald-900"
                    }`}
                  >
                    {selectedRecord.loggedReaction.statusText}
                  </span>
                </div>

                <p className="text-slate-700 text-[11px] leading-relaxed">
                  {selectedRecord.loggedReaction.summary}
                </p>

                <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-200/60 flex flex-wrap gap-4">
                  <span>Given Date: {selectedRecord.dateCompleted || "Completed"}</span>
                  {selectedRecord.loggedReaction.currentIllness && (
                    <span>Illness: {selectedRecord.loggedReaction.currentIllness}</span>
                  )}
                  {selectedRecord.loggedReaction.currentMedication && (
                    <span>Medication: {selectedRecord.loggedReaction.currentMedication}</span>
                  )}
                </div>
              </div>
            )}

            {/* Modal Footer */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
