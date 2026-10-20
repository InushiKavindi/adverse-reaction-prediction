import React, { useState, useEffect, useCallback } from "react";
import {
  HeartPulse,
  Activity,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Clock,
  ArrowRight,
  Sparkles,
  Stethoscope,
  RefreshCw,
  Info
} from "lucide-react";
import { Card, CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { TabsContent } from "../ui/tabs";
import { api } from "../../services/api";

/**
 * Reactions & Care Tab Component
 * Handles 3 distinct clinical contexts:
 * 1. BCG1 (neonatal dose within 24h of birth, simplified physiological response without ML clutter)
 * 2. BCG2 (revaccination dose administered between 2–6 months if scar absent, full ML predictions with timing & clinical factor scenarios)
 * 3. Subsequent routine milestones (Pentavalent, MMR, JE, etc. with ML predictions and comfort care)
 */
export default function VaccineReactionsTab({
  isFirstVaccine,
  isBcg2,
  vaccine,
  activeChild,
  schedule = [],
  modelPrediction,
  loadingPrediction,
  predictionError,
  fetchModelPrediction,
  onUpdateVaccineStatus,
  onSelectVaccine
}) {
  const currentReaction = vaccine?.reaction || {};
  const [scarStatus, setScarStatus] = useState(currentReaction.bcgScarStatus || null);
  const [savingBcg, setSavingBcg] = useState(false);

  useEffect(() => {
    const rx = vaccine?.reaction || {};
    setScarStatus(rx.bcgScarStatus || null);
  }, [vaccine?.reaction]);

  // Handle BCG1 scar assessment
  const handleSelectScarStatus = async (status) => {
    const nextStatus = scarStatus === status ? null : status;
    setScarStatus(nextStatus);
    const updatedReaction = {
      ...(vaccine?.reaction || {}),
      bcgScarStatus: nextStatus
    };

    if (onUpdateVaccineStatus) {
      setSavingBcg(true);
      const statusToKeep = vaccine.status || "completed";
      const dateToKeep = statusToKeep === "completed" ? (vaccine.dateCompleted || new Date().toISOString().split("T")[0]) : null;
      await onUpdateVaccineStatus(statusToKeep, dateToKeep, updatedReaction);
      setSavingBcg(false);
    }
  };

  // --- BCG 2nd Dose (Revaccination) Live Timing & Clinical Scenarios ---
  const [bcg2Timing, setBcg2Timing] = useState("after_2m"); // "before_2m" | "after_2m" | "at_6m"
  const [overridePrevReaction, setOverridePrevReaction] = useState(null); // null (auto) | "Yes" | "No"
  const [overrideIllness, setOverrideIllness] = useState(
    activeChild?.currentIllness && activeChild.currentIllness !== "No" && activeChild.currentIllness !== "None" ? "Yes" : "No"
  );
  const [overrideMedication, setOverrideMedication] = useState(
    activeChild?.currentMedication && activeChild.currentMedication !== "No" && activeChild.currentMedication !== "None" ? "Yes" : "No"
  );
  const [bcg2Prediction, setBcg2Prediction] = useState(null);
  const [loadingBcg2Prediction, setLoadingBcg2Prediction] = useState(false);
  const [bcg2PredictionError, setBcg2PredictionError] = useState(null);

  // Identify prior vaccine reactions across the child's recorded schedule
  const bcg1Item = schedule.find(
    (s) => s.id === "vax-1" || (s.vaccineName?.toLowerCase().includes("bcg") && !s.vaccineName?.toLowerCase().includes("2"))
  );
  const penta1Item = schedule.find(
    (s) => s.id === "vax-2" || s.vaccineName?.toLowerCase().includes("pentavalent 1") || s.vaccineName?.toLowerCase().includes("pentavalent1")
  );
  const penta2Item = schedule.find(
    (s) => s.id === "vax-3" || s.vaccineName?.toLowerCase().includes("pentavalent 2") || s.vaccineName?.toLowerCase().includes("pentavalent2")
  );

  const hadBcg1Reaction = Boolean(bcg1Item?.status === "completed" && bcg1Item?.reaction?.hasReaction);
  const hadPenta1Reaction = Boolean(penta1Item?.status === "completed" && penta1Item?.reaction?.hasReaction);
  const hadPenta2Reaction = Boolean(penta2Item?.status === "completed" && penta2Item?.reaction?.hasReaction);

  let autoPrevReaction = "No";
  let timingLabel = "After 2 Months (2–4 Months)";
  let timingAgeMonths = 3;
  let timingExplanation = "";

  if (bcg2Timing === "before_2m") {
    timingLabel = "Before 2 Months (~6–8 Weeks)";
    timingAgeMonths = 2;
    autoPrevReaction = hadBcg1Reaction ? "Yes" : "No";
    timingExplanation = "Administered at 6–8 weeks before routine 2-month Pentavalent vaccines. Evaluates previous reaction specifically from BCG1.";
  } else if (bcg2Timing === "after_2m") {
    timingLabel = "After 2 Months (2–4 Months)";
    timingAgeMonths = 3;
    autoPrevReaction = (hadBcg1Reaction || hadPenta1Reaction) ? "Yes" : "No";
    timingExplanation = "Administered between 2–4 months. Child may have received Pentavalent 1 at 2 months; evaluates previous reactions from BCG1 and Pentavalent 1.";
  } else {
    // at_6m
    timingLabel = "After 4 Months / At 6 Months";
    timingAgeMonths = 6;
    autoPrevReaction = (hadBcg1Reaction || hadPenta1Reaction || hadPenta2Reaction) ? "Yes" : "No";
    timingExplanation = "Administered up to 6 months (evaluated for persistent scar absence by 6 months). Evaluates reactions across BCG1, Pentavalent 1, and Pentavalent 2.";
  }

  const effectivePrevReaction = overridePrevReaction !== null ? overridePrevReaction : autoPrevReaction;

  const fetchBcg2LivePrediction = useCallback(async (timing, prevRxn, illness, med) => {
    setLoadingBcg2Prediction(true);
    setBcg2PredictionError(null);

    const targetAge = timing === "before_2m" ? 2 : timing === "after_2m" ? 3 : 6;
    const payload = {
      patient_identifier: activeChild?.name || "Active Child",
      age_months: targetAge,
      sex: activeChild?.sex || "M",
      vaccine_type: "BCG2",
      previous_reaction: prevRxn,
      allergy: activeChild?.allergies || "No",
      current_illness: illness,
      medication: med,
      notes: `BCG2 clinical prediction (${timing})`
    };

    try {
      const res = await api.predict(payload, false);
      if (res.success && res.data) {
        setBcg2Prediction(res.data);
      } else {
        setBcg2PredictionError(res.error || "Unable to fetch prediction");
      }
    } catch (err) {
      setBcg2PredictionError(err.message || "Failed to connect to ML model");
    } finally {
      setLoadingBcg2Prediction(false);
    }
  }, [activeChild?.name, activeChild?.sex, activeChild?.allergies]);

  useEffect(() => {
    if (isBcg2) {
      fetchBcg2LivePrediction(bcg2Timing, effectivePrevReaction, overrideIllness, overrideMedication);
    }
  }, [isBcg2, bcg2Timing, effectivePrevReaction, overrideIllness, overrideMedication, fetchBcg2LivePrediction]);

  const activeBcg2Prediction = bcg2Prediction || modelPrediction;
  const isBcg2Loading = loadingBcg2Prediction || (loadingPrediction && !activeBcg2Prediction);
  const activeBcg2Error = bcg2PredictionError || predictionError;

  return (
    <TabsContent value="care" className="space-y-4 pt-1">
      {/* CASE 1: BCG1 (Neonatal dose within 24 hours of birth) - AUTHORITATIVE WHO CLINICAL GUIDANCE */}
      {isFirstVaccine && !isBcg2 ? (
        <div className="space-y-4">
          {/* Main Card: Expected Reactions & Care Overview */}
          <Card className="bg-white border-slate-100 rounded-3xl p-4 sm:p-6 shadow-xs space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-pink-500 to-[#ff2d78] text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                  <HeartPulse className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-base sm:text-lg font-bold text-slate-900">
                    Expected Reactions and Care
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    General information for parents and caregivers
                  </CardDescription>
                </div>
              </div>

              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-bold px-3 py-1 rounded-full self-start sm:self-auto">
                Normal / Expected Reaction
              </Badge>
            </div>

            {/* Normal / Expected Reaction Description */}
            <div className="p-4 bg-pink-50/70 border border-pink-100 rounded-2xl space-y-2">
              <h4 className="text-xs font-bold text-[#ff2d78] uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" />
                <span>Normal / Expected Reaction</span>
              </h4>
              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                After BCG vaccination, a small bump may appear at the injection site after about 2-4 weeks. It may gradually develop into a small sore or shallow ulcer, which then heals naturally and usually leaves a small scar.
              </p>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                This is a normal part of the healing process. The timing and appearance can vary from child to child. A scar does not guarantee complete or lifelong protection against tuberculosis.
              </p>
            </div>

            {/* Typical Healing Progression */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Typical Healing Progression
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-1">
                  <span className="text-[10px] font-bold text-sky-600 uppercase tracking-wider block">Weeks 2 – 4</span>
                  <p className="font-bold text-slate-800 text-xs">A small bump appears</p>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    A small red or raised bump may develop at the injection site. This is an expected local reaction.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-1">
                  <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">Following weeks</span>
                  <p className="font-bold text-slate-800 text-xs">A small sore may form</p>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    The bump may soften, open into a shallow sore and develop a crust. A small amount of discharge can occur during normal healing.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-1">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">Over several months</span>
                  <p className="font-bold text-slate-800 text-xs">The sore heals</p>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    The area gradually heals and usually leaves a small scar. Complete healing may take several months.
                  </p>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 italic pt-0.5">
                The timeline is approximate, not a strict schedule. Source: WHO and official public health BCG guidance.
              </p>
            </div>

            {/* BCG Scar Formation Assessment (Week 6 – 12) */}
            <div className="pt-3 border-t border-slate-100 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>BCG Scar Formation Assessment (Week 6 – 12)</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Check your baby's right upper arm injection site to verify whether a permanent BCG scar has developed.
                  </p>
                </div>

                {scarStatus && (
                  <Badge
                    variant="outline"
                    className={`self-start sm:self-auto text-[11px] font-bold px-2.5 py-0.5 rounded-full ${scarStatus === "present"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                      : "bg-amber-50 text-amber-700 border-amber-300"
                      }`}
                  >
                    {scarStatus === "present" ? "✓ Scar Present" : "⚠ Scar Absent"}
                  </Badge>
                )}
              </div>

              {/* Assessment Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleSelectScarStatus("present")}
                  disabled={savingBcg}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${scarStatus === "present"
                    ? "bg-emerald-50/80 border-emerald-400 ring-2 ring-emerald-400/20 shadow-xs"
                    : "bg-slate-50/60 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                    }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
                      <CheckCircle2 className={`w-4 h-4 ${scarStatus === "present" ? "text-emerald-600" : "text-slate-400"}`} />
                      Scar Present
                    </span>
                    {scarStatus === "present" && (
                      <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        Marked Present
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Permanent white scar has developed. Confirms effective cellular immunity. No 2nd dose needed.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectScarStatus("absent")}
                  disabled={savingBcg}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${scarStatus === "absent"
                    ? "bg-amber-50/80 border-amber-400 ring-2 ring-amber-400/20 shadow-xs"
                    : "bg-slate-50/60 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                    }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
                      <AlertCircle className={`w-4 h-4 ${scarStatus === "absent" ? "text-amber-600" : "text-slate-400"}`} />
                      Scar Absent
                    </span>
                    {scarStatus === "absent" && (
                      <span className="text-[10px] font-extrabold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                        Marked Absent
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    No scar visible after 6–12 weeks. Clinical protocol advises BCG 2nd dose revaccination.
                  </p>
                </button>
              </div>

              {/* If Scar Absent: Clean, high-visibility callout with DIRECT link to the dedicated BCG2 page */}
              {scarStatus === "absent" && (
                <div className="p-4 bg-amber-50/90 border border-amber-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-200">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="w-6 h-6 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <p className="font-bold text-xs sm:text-sm text-amber-950">
                        BCG 2nd Dose Revaccination Recommended
                      </p>
                      <p className="text-[11px] text-amber-800 leading-relaxed">
                        Because a scar did not develop, repeat BCG vaccination is advised within 2 to 6 months. View the separate BCG 2nd dose page for AI adverse reaction forecasts and clinical guidance.
                      </p>
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={() => {
                      const bcg2Item = schedule.find(
                        (s) => s.id === "vax-bcg2" || s.vaccineName?.toLowerCase().includes("bcg 2") || s.vaccineName?.toLowerCase().includes("bcg2")
                      ) || {
                        id: "vax-bcg2",
                        milestone: "2 - 6 Months",
                        ageRange: "6 weeks - 6 months",
                        targetAgeMonths: 2,
                        vaccineName: "BCG 2 (Revaccination)",
                        route: "Intradermal (Right upper arm)",
                        fullRoute: "Intradermal (Right upper arm)",
                        diseases: "Tuberculosis (Miliary TB & Tubercular Meningitis revaccination)",
                        status: "due",
                        isClickable: true,
                        expectedReactions: "Mild papule, temporary low-grade temperature or slight swelling.",
                        severityLevel: "Low to Moderate Risk",
                        batchNumber: "BCG-2024-B2"
                      };
                      if (onSelectVaccine) {
                        onSelectVaccine(bcg2Item);
                      }
                    }}
                    className="bg-[#ff2d78] hover:bg-[#e02468] text-white font-bold text-xs rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0 self-start sm:self-auto"
                  >
                    <span>View BCG 2nd Dose Page & Predictions</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              )}

              {/* If Scar Present: Confirmation message */}
              {scarStatus === "present" && (
                <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-900 animate-in fade-in duration-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <p className="font-medium text-[11px] leading-relaxed">
                    <strong>Immunity Confirmed:</strong> BCG scar presence is verified. Effective life-long immunity against severe childhood tuberculosis has been established. No 2nd dose required.
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* BCG Injection-Site Care Card */}
          <Card className="bg-white border-slate-100 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center font-bold shrink-0">
                <HeartPulse className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-sm sm:text-base font-bold text-slate-900">
                  BCG Injection-Site Care
                </CardTitle>
                <CardDescription className="text-[11px] text-slate-400">
                  Recommended daily care for your baby's injection site
                </CardDescription>
              </div>
            </div>

            <ul className="text-xs text-slate-600 space-y-2 pl-1">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff2d78] shrink-0 mt-1.5" />
                <p>
                  <strong className="text-slate-800">Keep it clean and dry:</strong> Bathe your baby as usual and gently pat the area dry.
                </p>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff2d78] shrink-0 mt-1.5" />
                <p>
                  <strong className="text-slate-800">Avoid creams and ointments:</strong> Do not apply antiseptics, oils, herbal products or other medicines unless a healthcare professional advises you to.
                </p>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff2d78] shrink-0 mt-1.5" />
                <p>
                  <strong className="text-slate-800">Do not disturb the sore:</strong> Avoid squeezing, scratching, rubbing or removing the crust.
                </p>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff2d78] shrink-0 mt-1.5" />
                <p>
                  <strong className="text-slate-800">Avoid adhesive plasters:</strong> Leave the area uncovered where possible. If it is discharging, ask a healthcare professional how to protect it with a suitable loose, dry dressing.
                </p>
              </li>
            </ul>
          </Card>

          {/* When to Seek Medical Advice Card */}
          <Card className="bg-white border-amber-100 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold shrink-0">
                <AlertCircle className="w-4 h-4 text-amber-700" />
              </div>
              <div>
                <CardTitle className="text-sm sm:text-base font-bold text-slate-900">
                  When to Seek Medical Advice
                </CardTitle>
                <CardDescription className="text-[11px] text-slate-400">
                  Important symptoms requiring professional clinical evaluation
                </CardDescription>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-slate-600">
              <p className="font-semibold text-slate-800">Contact a healthcare professional if:</p>
              <ul className="space-y-1.5 pl-1">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                  <span>The injection site becomes increasingly red, hot, painful or swollen.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                  <span>A large swelling, abscess or substantial amount of pus develops.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                  <span>The sore appears unusually quickly after vaccination or does not heal as expected.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                  <span>Swollen glands develop in the armpit or near the injection site, particularly if they are large, painful or contain pus.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                  <span>Your baby develops a fever or seems unusually unwell.</span>
                </li>
              </ul>

              {/* Urgent medical attention alert */}
              <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-rose-900">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <p className="text-xs font-semibold leading-relaxed">
                  Seek urgent medical attention if your baby has difficulty breathing, becomes difficult to wake, or appears seriously ill.
                </p>
              </div>
            </div>
          </Card>
        </div>
      ) : isBcg2 ? (
        /* CASE 2: DEDICATED BCG2 REVACCINATION PAGE WITH TRAINED ML MODEL PREDICTIONS */
        <div className="space-y-4">
          <Card className="bg-white border-slate-100 rounded-3xl p-4 sm:p-6 shadow-xs space-y-4">
            {/* Header: Title & Clinical Context */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-indigo-500 via-sky-500 to-[#ff2d78] text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base sm:text-lg font-bold text-slate-900">
                      BCG 2nd Dose Adverse Reaction & Onset Forecast
                    </CardTitle>
                    <Badge variant="outline" className="border-sky-300 bg-sky-50 text-sky-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Revaccination (2–6 Months)
                    </Badge>
                  </div>
                  <CardDescription className="text-xs text-slate-500">
                    AI model prediction evaluating individual reactogenicity for BCG revaccination
                  </CardDescription>
                </div>
              </div>

              {activeBcg2Prediction && (
                <Badge
                  variant="outline"
                  className={`self-start sm:self-auto text-xs font-bold px-3 py-1 rounded-full ${activeBcg2Prediction.risk_level === "High"
                    ? "bg-rose-50 text-rose-700 border-rose-300"
                    : activeBcg2Prediction.risk_level === "Moderate"
                      ? "bg-amber-50 text-amber-700 border-amber-300"
                      : "bg-emerald-50 text-emerald-700 border-emerald-300"
                    }`}
                >
                  {activeBcg2Prediction.risk_level} Clinical Risk
                </Badge>
              )}
            </div>

            {/* Clinical Background Notice */}
            <div className="p-3.5 bg-sky-50/70 border border-sky-100 rounded-2xl flex items-start gap-3 text-xs text-sky-950">
              <div className="w-6 h-6 rounded-full bg-sky-200 text-sky-800 flex items-center justify-center shrink-0 mt-0.5">
                <Info className="w-3.5 h-3.5" />
              </div>
              <div className="space-y-0.5">
                <p className="font-bold text-sky-950">Why BCG 2nd Dose Has Individual Risk Predictions</p>
                <p className="text-sky-800 text-[11px] leading-relaxed">
                  BCG2 is administered between 6 weeks and 6 months of age if no scar developed after the birth dose. Because the infant is older, factors such as <strong>current illness</strong>, <strong>active medication</strong>, and <strong>prior adverse reactions</strong> (from BCG1 or 2-to-4 month Pentavalent doses) establish clinical risk variables. The machine learning model forecasts symptom probabilities and onset times based on these parameters.
                </p>
              </div>
            </div>

            {/* Clinical Scenario Selector: Administration Timing & Risk Factors */}
            <div className="p-4 bg-slate-50/80 border border-slate-200/80 rounded-2xl space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <Sparkles className="w-3.5 h-3.5 text-[#ff2d78]" />
                  <span>Clinical Administration Timing Scenario</span>
                </div>
                <span className="text-[11px] font-semibold text-slate-500">
                  Simulating evaluation at: <strong className="text-slate-800">{timingLabel}</strong>
                </span>
              </div>

              {/* 3 Timing Scenario Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  {
                    id: "before_2m",
                    title: "Before 2 Months",
                    subtitle: "~6 – 8 Weeks",
                    desc: "Checks BCG1 reaction only"
                  },
                  {
                    id: "after_2m",
                    title: "After 2 Months",
                    subtitle: "2 – 4 Months",
                    desc: "Checks BCG1 + Pentavalent 1"
                  },
                  {
                    id: "at_6m",
                    title: "After 4 Mos / At 6 Mos",
                    subtitle: "No scar at 6 Months",
                    desc: "Checks BCG1 + Penta 1 & 2"
                  }
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setBcg2Timing(t.id);
                      setOverridePrevReaction(null); // reset to auto-detected for this timing
                    }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${bcg2Timing === t.id
                      ? "bg-white border-[#ff2d78] ring-2 ring-pink-100 shadow-xs text-slate-900"
                      : "bg-white/60 border-slate-200 hover:bg-white text-slate-600"
                      }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="font-bold text-xs text-slate-900">{t.title}</span>
                      <span className="text-[10px] text-slate-400 font-medium">{t.subtitle}</span>
                    </div>
                    <p className="text-[10px] text-slate-500">{t.desc}</p>
                  </button>
                ))}
              </div>

              {/* Timing Scenario Explanation */}
              <div className="p-2.5 bg-white border border-slate-200/70 rounded-xl text-[11px] text-slate-600 flex items-start gap-2">
                <Clock className="w-3.5 h-3.5 text-sky-500 shrink-0 mt-0.5" />
                <p className="leading-relaxed">{timingExplanation}</p>
              </div>

              {/* Live Factor Toggles */}
              <div className="pt-2 border-t border-slate-200/60 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Adjust Clinical Predictor Inputs
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">Click to test different patient conditions</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                  {/* Factor 1: Previous Vaccine Reaction */}
                  <div className="p-2.5 bg-white border border-slate-200 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-700">Prior Reaction:</span>
                      <Badge variant="outline" className={`text-[10px] px-1.5 py-0.2 rounded-full ${effectivePrevReaction === "Yes" ? "bg-rose-50 text-rose-700 border-rose-300" : "bg-emerald-50 text-emerald-700 border-emerald-300"
                        }`}>
                        {effectivePrevReaction === "Yes" ? "Yes (Reported)" : "No Reaction"}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      <button
                        type="button"
                        onClick={() => setOverridePrevReaction("No")}
                        className={`py-1 text-[11px] font-bold rounded-lg border transition cursor-pointer ${effectivePrevReaction === "No" ? "bg-emerald-600 text-white border-emerald-600" : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                          }`}
                      >
                        No
                      </button>
                      <button
                        type="button"
                        onClick={() => setOverridePrevReaction("Yes")}
                        className={`py-1 text-[11px] font-bold rounded-lg border transition cursor-pointer ${effectivePrevReaction === "Yes" ? "bg-rose-600 text-white border-rose-600" : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                          }`}
                      >
                        Yes
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400 truncate">
                      {bcg2Timing === "before_2m" ? "BCG1 dose" : bcg2Timing === "after_2m" ? "BCG1 / Penta 1" : "BCG1 / Penta 1 & 2"}
                    </p>
                  </div>

                  {/* Factor 2: Current Illness */}
                  <div className="p-2.5 bg-white border border-slate-200 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-700">Current Illness:</span>
                      <Badge variant="outline" className={`text-[10px] px-1.5 py-0.2 rounded-full ${overrideIllness === "Yes" ? "bg-amber-50 text-amber-800 border-amber-300" : "bg-emerald-50 text-emerald-700 border-emerald-300"
                        }`}>
                        {overrideIllness === "Yes" ? "Illness Present" : "None"}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      <button
                        type="button"
                        onClick={() => setOverrideIllness("No")}
                        className={`py-1 text-[11px] font-bold rounded-lg border transition cursor-pointer ${overrideIllness === "No" ? "bg-emerald-600 text-white border-emerald-600" : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                          }`}
                      >
                        No
                      </button>
                      <button
                        type="button"
                        onClick={() => setOverrideIllness("Yes")}
                        className={`py-1 text-[11px] font-bold rounded-lg border transition cursor-pointer ${overrideIllness === "Yes" ? "bg-amber-600 text-white border-amber-600" : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                          }`}
                      >
                        Yes
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400">e.g., mild cold, low fever</p>
                  </div>

                  {/* Factor 3: Current Medication */}
                  <div className="p-2.5 bg-white border border-slate-200 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-700">Medication:</span>
                      <Badge variant="outline" className={`text-[10px] px-1.5 py-0.2 rounded-full ${overrideMedication === "Yes" ? "bg-sky-50 text-sky-800 border-sky-300" : "bg-emerald-50 text-emerald-700 border-emerald-300"
                        }`}>
                        {overrideMedication === "Yes" ? "On Meds" : "None"}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      <button
                        type="button"
                        onClick={() => setOverrideMedication("No")}
                        className={`py-1 text-[11px] font-bold rounded-lg border transition cursor-pointer ${overrideMedication === "No" ? "bg-emerald-600 text-white border-emerald-600" : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                          }`}
                      >
                        No
                      </button>
                      <button
                        type="button"
                        onClick={() => setOverrideMedication("Yes")}
                        className={`py-1 text-[11px] font-bold rounded-lg border transition cursor-pointer ${overrideMedication === "Yes" ? "bg-sky-600 text-white border-sky-600" : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                          }`}
                      >
                        Yes
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400">e.g., paracetamol, antibiotics</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Model Loading State */}
            {isBcg2Loading && (
              <div className="p-8 text-center bg-slate-50/60 border border-slate-100 rounded-2xl space-y-2">
                <div className="w-7 h-7 mx-auto border-3 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs font-semibold text-slate-600">
                  Running AI prediction for BCG 2nd dose ({timingLabel})...
                </p>
              </div>
            )}

            {/* Model Error State */}
            {activeBcg2Error && !isBcg2Loading && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between gap-3 text-xs text-rose-800">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Unable to load BCG2 reaction forecast: {activeBcg2Error}</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => fetchBcg2LivePrediction(bcg2Timing, effectivePrevReaction, overrideIllness, overrideMedication)}
                  className="bg-white border-rose-300 text-rose-700 hover:bg-rose-100 text-xs font-bold rounded-lg cursor-pointer shrink-0"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Retry
                </Button>
              </div>
            )}

            {/* BCG2 Model Prediction Output */}
            {activeBcg2Prediction && !isBcg2Loading && (
              <div className="space-y-4 animate-in fade-in duration-200">
                {/* Clinical Risk Summary Banner */}
                <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${activeBcg2Prediction.risk_level === "High"
                  ? "bg-rose-50/70 border-rose-200"
                  : activeBcg2Prediction.risk_level === "Moderate"
                    ? "bg-amber-50/70 border-amber-200"
                    : "bg-emerald-50/70 border-emerald-200"
                  }`}>
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold uppercase tracking-wide text-slate-700">
                        AI Clinical Risk Assessment:
                      </span>
                      <Badge className={
                        activeBcg2Prediction.risk_level === "High"
                          ? "bg-rose-600 text-white"
                          : activeBcg2Prediction.risk_level === "Moderate"
                            ? "bg-amber-600 text-white"
                            : "bg-emerald-600 text-white"
                      }>
                        {activeBcg2Prediction.risk_level} Risk
                      </Badge>
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-relaxed">
                      {activeBcg2Prediction.summary}
                    </p>
                  </div>
                </div>

                {/* Symptoms Probabilities & Onset Times */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Predicted Symptoms Probabilities & Onset Times
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {activeBcg2Prediction.symptoms?.map((item) => {
                      const probPercent = Math.round((item.probability || 0) * 100);
                      const isNoRxn = item.symptom === "no_reaction";
                      const isHighProb = probPercent >= 50;
                      const isMedProb = probPercent >= 20;

                      return (
                        <div
                          key={item.symptom}
                          className={`p-3 sm:p-3.5 rounded-2xl border transition-all ${item.predicted
                            ? "bg-rose-50/50 border-rose-200 shadow-2xs"
                            : isNoRxn && probPercent >= 50
                              ? "bg-emerald-50/50 border-emerald-200 shadow-2xs"
                              : "bg-slate-50/60 border-slate-200/80"
                            }`}
                        >
                          {/* Row 1: Symptom Name & Status Badge */}
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="font-bold text-xs sm:text-sm text-slate-900">
                              {item.display_name}
                            </span>

                            {isNoRxn ? (
                              <Badge variant="outline" className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${probPercent >= 50
                                ? "bg-emerald-100/80 text-emerald-800 border-emerald-300"
                                : "bg-slate-100 text-slate-600 border-slate-200"
                                }`}>
                                {probPercent >= 50 ? "Tolerance Expected" : "Reaction Possible"}
                              </Badge>
                            ) : item.predicted ? (
                              <Badge variant="outline" className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border-rose-300 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3 text-rose-600" />
                                <span>Reaction Predicted</span>
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border-slate-200">
                                Low Likelihood
                              </Badge>
                            )}
                          </div>

                          {/* Row 2: Probability Bar & Value */}
                          <div className="space-y-1 mb-2.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-[11px] text-slate-500 font-medium">Probability</span>
                              <span className={`font-extrabold text-xs ${isHighProb ? "text-rose-600" : isMedProb ? "text-amber-600" : "text-slate-700"
                                }`}>
                                {probPercent}%
                              </span>
                            </div>
                            <div className="w-full h-2 bg-slate-200/80 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${isNoRxn
                                  ? "bg-emerald-500"
                                  : isHighProb
                                    ? "bg-rose-500"
                                    : isMedProb
                                      ? "bg-amber-500"
                                      : "bg-sky-500"
                                  }`}
                                style={{ width: `${Math.max(3, probPercent)}%` }}
                              />
                            </div>
                          </div>

                          {/* Row 3: Onset Time */}
                          <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                            <span className="text-slate-400 font-medium flex items-center gap-1 text-[11px]">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>Predicted Onset:</span>
                            </span>

                            {isNoRxn ? (
                              <span className="text-slate-400 italic text-[11px]">Not applicable</span>
                            ) : item.onset_hours !== null && item.onset_hours !== undefined ? (
                              <span className="font-extrabold text-slate-800 text-[11px]">
                                {item.onset_hours < 24
                                  ? `~${Number(item.onset_hours).toFixed(1)} hrs post-vax`
                                  : `~${Number(item.onset_hours).toFixed(1)} hrs (~${(item.onset_hours / 24).toFixed(1)} days)`}
                              </span>
                            ) : (
                              <span className="text-slate-400 italic text-[11px]">Immediate / 24h</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* BCG2 Revaccination Clinical Care & Guidance Card */}
          <Card className="bg-white border-slate-100 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center font-bold shrink-0">
                <HeartPulse className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-sm sm:text-base font-bold text-slate-900">
                  BCG 2nd Dose Care Guidelines & What to Expect
                </CardTitle>
                <CardDescription className="text-[11px] text-slate-400">
                  National Ministry of Health & WHO revaccination management
                </CardDescription>
              </div>
            </div>

            <div className="text-[11px] sm:text-xs text-slate-600 space-y-2">
              <ul className="list-disc pl-4 space-y-1.5 text-slate-600">
                <li><strong className="text-slate-800">Injection site:</strong> Administered intradermally on the right upper arm, just like the birth dose.</li>
                <li><strong className="text-slate-800">Second papule formation:</strong> A small papule will develop within 2–4 weeks and form a scar. Observe the site weekly.</li>
                <li><strong className="text-slate-800">Symptom comfort:</strong> If mild tenderness or slight low-grade fever occurs within the predicted onset window, keep baby hydrated and apply a cool, damp cloth.</li>
                <li><strong className="text-slate-800">Follow-up check:</strong> Recheck scar formation at 6–12 weeks following this 2nd dose to verify established cellular immunity.</li>
              </ul>
            </div>
          </Card>
        </div>
      ) : (
        /* CASE 3: ALL SUBSEQUENT ROUTINE VACCINE MILESTONES (Pentavalent, MMR, JE, DPT, DT) */
        <>
          {/* Main Card: Trained ML Model Predictions */}
          <Card className="bg-white border-slate-100 rounded-3xl p-4 sm:p-6 shadow-xs space-y-4">
            {/* Header: Title */}
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-pink-500 to-[#ff2d78] text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                  <HeartPulse className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-base sm:text-lg font-bold text-slate-900">
                    Adverse Reaction & Onset Forecast
                  </CardTitle>
                </div>
              </div>

              {modelPrediction && (
                <Badge
                  variant="outline"
                  className={`text-xs font-bold px-3 py-1 rounded-full ${modelPrediction.risk_level === "High"
                    ? "bg-rose-50 text-rose-700 border-rose-300"
                    : modelPrediction.risk_level === "Moderate"
                      ? "bg-amber-50 text-amber-700 border-amber-300"
                      : "bg-emerald-50 text-emerald-700 border-emerald-300"
                    }`}
                >
                  {modelPrediction.risk_level} Clinical Risk
                </Badge>
              )}
            </div>

            {/* Loading State */}
            {loadingPrediction && !modelPrediction && (
              <div className="p-8 text-center bg-slate-50/60 border border-slate-100 rounded-2xl space-y-3">
                <div className="w-7 h-7 mx-auto border-3 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs font-semibold text-slate-600">
                  Loading expected reaction forecast for {vaccine.vaccineName}...
                </p>
              </div>
            )}

            {/* Error State */}
            {predictionError && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between gap-3 text-xs text-rose-800">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Unable to load reaction forecast: {predictionError}</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={fetchModelPrediction}
                  className="bg-white border-rose-300 text-rose-700 hover:bg-rose-100 text-xs font-bold rounded-lg cursor-pointer shrink-0"
                >
                  Retry
                </Button>
              </div>
            )}

            {/* Model Prediction Results */}
            {modelPrediction && (
              <div className="space-y-4">
                {/* Clinical Risk Summary Banner */}
                <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${modelPrediction.risk_level === "High"
                  ? "bg-rose-50/70 border-rose-200"
                  : modelPrediction.risk_level === "Moderate"
                    ? "bg-amber-50/70 border-amber-200"
                    : "bg-emerald-50/70 border-emerald-200"
                  }`}>
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold uppercase tracking-wide text-slate-700">
                        AI Clinical Risk Assessment:
                      </span>
                      <Badge className={
                        modelPrediction.risk_level === "High"
                          ? "bg-rose-600 text-white"
                          : modelPrediction.risk_level === "Moderate"
                            ? "bg-amber-600 text-white"
                            : "bg-emerald-600 text-white"
                      }>
                        {modelPrediction.risk_level} Risk
                      </Badge>
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-relaxed">
                      {modelPrediction.summary}
                    </p>
                  </div>
                </div>

                {/* Symptoms Probabilities & Onset Times */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Predicted Symptoms Probabilities & Onset Times
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {modelPrediction.symptoms?.map((item) => {
                      const probPercent = Math.round((item.probability || 0) * 100);
                      const isNoRxn = item.symptom === "no_reaction";
                      const isHighProb = probPercent >= 50;
                      const isMedProb = probPercent >= 20;

                      return (
                        <div
                          key={item.symptom}
                          className={`p-3 sm:p-3.5 rounded-2xl border transition-all ${item.predicted
                            ? "bg-rose-50/50 border-rose-200 shadow-2xs"
                            : isNoRxn && probPercent >= 50
                              ? "bg-emerald-50/50 border-emerald-200 shadow-2xs"
                              : "bg-slate-50/60 border-slate-200/80"
                            }`}
                        >
                          {/* Row 1: Symptom Name & Status Badge */}
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="font-bold text-xs sm:text-sm text-slate-900">
                              {item.display_name}
                            </span>

                            {isNoRxn ? (
                              <Badge variant="outline" className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${probPercent >= 50
                                ? "bg-emerald-100/80 text-emerald-800 border-emerald-300"
                                : "bg-slate-100 text-slate-600 border-slate-200"
                                }`}>
                                {probPercent >= 50 ? "Tolerance Expected" : "Reaction Possible"}
                              </Badge>
                            ) : item.predicted ? (
                              <Badge variant="outline" className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border-rose-300 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3 text-rose-600" />
                                <span>Reaction Predicted</span>
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border-slate-200">
                                Low Likelihood
                              </Badge>
                            )}
                          </div>

                          {/* Row 2: Probability Bar & Value */}
                          <div className="space-y-1 mb-2.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-[11px] text-slate-500 font-medium">Probability</span>
                              <span className={`font-extrabold text-xs ${isHighProb ? "text-rose-600" : isMedProb ? "text-amber-600" : "text-slate-700"
                                }`}>
                                {probPercent}%
                              </span>
                            </div>
                            <div className="w-full h-2 bg-slate-200/80 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${isNoRxn
                                  ? "bg-emerald-500"
                                  : isHighProb
                                    ? "bg-rose-500"
                                    : isMedProb
                                      ? "bg-amber-500"
                                      : "bg-sky-500"
                                  }`}
                                style={{ width: `${Math.max(3, probPercent)}%` }}
                              />
                            </div>
                          </div>

                          {/* Row 3: Onset Time */}
                          <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                            <span className="text-slate-400 font-medium flex items-center gap-1 text-[11px]">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>Predicted Onset:</span>
                            </span>

                            {isNoRxn ? (
                              <span className="text-slate-400 italic text-[11px]">Not applicable</span>
                            ) : item.onset_hours !== null && item.onset_hours !== undefined ? (
                              <span className="font-extrabold text-slate-800 text-[11px]">
                                {item.onset_hours < 24
                                  ? `~${Number(item.onset_hours).toFixed(1)} hrs post-vax`
                                  : `~${Number(item.onset_hours).toFixed(1)} hrs (~${(item.onset_hours / 24).toFixed(1)} days)`}
                              </span>
                            ) : (
                              <span className="text-slate-400 italic text-[11px]">Immediate / 24h</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Standard Comfort Measures & Clinical Home Care Card */}
          <Card className="bg-white border-slate-100 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center font-bold shrink-0">
                <HeartPulse className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-sm sm:text-base font-bold text-slate-900">
                  Pediatric Care Guidelines & Comfort Measures
                </CardTitle>
                <CardDescription className="text-[11px] text-slate-400">
                  Recommended post-immunization care from Ministry of Health & WHO
                </CardDescription>
              </div>
            </div>

            <div className="p-3 bg-pink-50/70 border border-pink-100 rounded-xl">
              <p className="text-xs sm:text-sm font-semibold text-pink-900 leading-relaxed">
                {vaccine.expectedReactions}
              </p>
            </div>

            <div className="text-[11px] sm:text-xs text-slate-600 space-y-1.5">
              <p className="font-semibold text-slate-700">Recommended Comfort Measures:</p>
              <ul className="list-disc pl-4 space-y-1 text-slate-500">
                <li>Apply cool, damp cloth to injection area to soothe localized tenderness.</li>
                <li>Offer plenty of fluids and maintain a comfortable room temperature.</li>
                <li>Administer infant paracetamol only if advised by your medical practitioner.</li>
                <li>Seek immediate medical advice if high fever (&gt;39°C) or persistent crying lasts over 24 hours.</li>
              </ul>
            </div>
          </Card>
        </>
      )}
    </TabsContent>
  );
}
