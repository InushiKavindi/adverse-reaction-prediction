import React from "react";
import {
  HeartPulse,
  Sparkles,
  RefreshCw,
  Activity,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Clock
} from "lucide-react";
import { Card, CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { TabsContent } from "../ui/tabs";

/**
 * Reactions & Care Tab Component
 * Handles both:
 * 1. BCG (neonatal dose within 24h of birth, standard physiological healing without probabilities/onsets)
 * 2. Subsequent milestones (trained ML model predictions with probabilities and onset times)
 */
export default function VaccineReactionsTab({
  isFirstVaccine,
  vaccine,
  activeChild,
  schedule = [],
  modelPrediction,
  loadingPrediction,
  predictionError,
  fetchModelPrediction
}) {
  return (
    <TabsContent value="care" className="space-y-4 pt-1">
      {isFirstVaccine ? (
        /* --- BCG GENERAL PREDICTION (First vaccine given within 24h of birth, no probabilities or onset times) --- */
        <div className="space-y-4">
          <Card className="bg-white border-slate-100 rounded-3xl p-4 sm:p-6 shadow-xs space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-pink-500 to-[#ff2d78] text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                  <HeartPulse className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base sm:text-lg font-bold text-slate-900">
                      Neonatal Expected Reaction & General Care
                    </CardTitle>
                    <Badge variant="outline" className="border-sky-200 bg-sky-50 text-sky-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Standard Neonatal Protocol
                    </Badge>
                  </div>
                  <CardDescription className="text-xs text-slate-500">
                    General physiological response for BCG (administered within 24 hours of birth)
                  </CardDescription>
                </div>
              </div>

              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold self-start sm:self-auto">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Normal Toleration Expected</span>
              </div>
            </div>

            {/* Clinical Context Notice */}
            <div className="p-3.5 bg-sky-50/70 border border-sky-100 rounded-2xl flex items-start gap-3 text-xs text-sky-900">
              <div className="w-6 h-6 rounded-full bg-sky-200 text-sky-800 flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <div className="space-y-0.5">
                <p className="font-bold text-sky-950">Neonatal Immunization (Within 24 Hours of Birth)</p>
                <p className="text-sky-800 leading-relaxed">
                  BCG is the newborn's very first vaccine, administered within 24 hours after birth. At this stage, maternal antibodies are present, and infant allergic history, current illnesses, or ongoing medications are not yet established. As a result, individual statistical risk probabilities and onset regressors do not apply; the reaction follows the expected physiological immune healing progression.
                </p>
              </div>
            </div>

            {/* General Expected Reaction Box */}
            <div className="p-4 bg-pink-50/70 border border-pink-100 rounded-2xl space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[#ff2d78] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" />
                  General Expected Physiological Reaction
                </span>
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-bold">
                  {vaccine.severityLevel || "Normal / Expected"}
                </Badge>
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-800 leading-relaxed">
                {vaccine.expectedReactions || "Small papule after 2-4 weeks developing into tiny ulcer, heals with scar."}
              </p>
              <p className="text-[11px] text-slate-500">
                This localized reaction confirms that your baby's immune system is actively establishing strong, cell-mediated cellular immunity against severe childhood tuberculosis.
              </p>
            </div>

            {/* Normal Healing Progression Timeline */}
            <div className="space-y-2 pt-1">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Typical Healing Progression
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-1">
                  <span className="text-[10px] font-bold text-sky-600 uppercase tracking-wider block">Week 2 – 4</span>
                  <p className="font-bold text-slate-800">Small Papule Forms</p>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    A small, slightly raised pink papule appears on the right upper arm injection site.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-1">
                  <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">Week 4 – 6</span>
                  <p className="font-bold text-slate-800">Superficial Ulceration</p>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    The papule may form a small, shallow ulcer with minimal crusting. This is normal and benign.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-1">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">Week 6 – 12</span>
                  <p className="font-bold text-slate-800">Natural Scarring</p>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    The ulcer dries completely, leaving a tiny permanent white scar confirming life-long protection.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Recommended Routine Home Care for BCG */}
          <Card className="bg-white border-slate-100 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center font-bold shrink-0">
                <HeartPulse className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-sm sm:text-base font-bold text-slate-900">
                  BCG Routine Care & Comfort Measures
                </CardTitle>
                <CardDescription className="text-[11px] text-slate-400">
                  Standard neonatal immunization care guidelines from Ministry of Health & WHO
                </CardDescription>
              </div>
            </div>

            <div className="text-[11px] sm:text-xs text-slate-600 space-y-2">
              <ul className="list-disc pl-4 space-y-1.5 text-slate-600">
                <li><strong className="text-slate-800">Keep the area clean and dry:</strong> Normal infant bathing with clean water is completely safe. Gently pat the arm dry with a soft towel.</li>
                <li><strong className="text-slate-800">Do not apply ointments or band-aids:</strong> Avoid applying antiseptic creams, oils, or adhesive plasters over the injection site.</li>
                <li><strong className="text-slate-800">Allow natural healing:</strong> Do not squeeze, scratch, or scrub the papule.</li>
                <li><strong className="text-slate-800">When to seek medical advice:</strong> Consult your pediatrician only if severe redness spreads beyond the upper arm, extensive swelling occurs, or swollen lymph nodes develop in the armpit.</li>
              </ul>
            </div>
          </Card>
        </div>
      ) : (
        /* --- TRAINED ML MODEL PREDICTIONS (For all subsequent vaccines) --- */
        <>
          {/* Main Card: Trained ML Model Predictions */}
          <Card className="bg-white border-slate-100 rounded-3xl p-4 sm:p-6 shadow-xs space-y-4">
            {/* Header: Title, Engine Status & Refresh */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-pink-500 to-[#ff2d78] text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                  <HeartPulse className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base sm:text-lg font-bold text-slate-900">
                      Adverse Reaction & Onset Forecast
                    </CardTitle>
                    <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                      <Sparkles className="w-3 h-3 text-sky-500" />
                      Trained AI Model
                    </span>
                  </div>
                  <CardDescription className="text-xs text-slate-500">
                    Predictions generated from clinical adverse reaction model based on active child profile
                  </CardDescription>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Model Online</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchModelPrediction}
                  disabled={loadingPrediction}
                  className="h-8 px-2.5 text-xs text-slate-600 hover:text-slate-900 border-slate-200 rounded-xl cursor-pointer"
                  title="Refresh ML Model Prediction"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingPrediction ? "animate-spin text-sky-600" : ""}`} />
                  <span className="sr-only">Refresh</span>
                </Button>
              </div>
            </div>

            {/* Profile Clinical Factors Driving Predictions */}
            <div className="p-3.5 bg-slate-50/90 border border-slate-200/80 rounded-2xl space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <Activity className="w-3.5 h-3.5 text-sky-600" />
                  <span>Child Profile Health Factors (Input to Model)</span>
                </div>
                <span className="text-[11px] text-slate-500 font-medium">
                  {activeChild?.name} ({vaccine.targetAgeMonths !== undefined ? `${vaccine.targetAgeMonths} mos milestone` : `${activeChild?.ageMonths} mos`}, {activeChild?.sex === "M" ? "Male" : "Female"})
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="bg-white p-2.5 rounded-xl border border-slate-200/70 shadow-2xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Allergies</span>
                  <span className={`font-bold truncate block ${activeChild?.allergies && !["none", "no", "none reported", ""].includes(activeChild.allergies.toLowerCase()) ? "text-amber-700" : "text-slate-700"}`} title={activeChild?.allergies || "None reported"}>
                    {activeChild?.allergies || "None reported"}
                  </span>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-slate-200/70 shadow-2xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Current Illness</span>
                  <span className={`font-bold truncate block ${activeChild?.currentIllness && !["none", "no", ""].includes(activeChild.currentIllness.toLowerCase()) ? "text-amber-700" : "text-slate-700"}`} title={activeChild?.currentIllness || "None"}>
                    {activeChild?.currentIllness || "None"}
                  </span>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-slate-200/70 shadow-2xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Current Medication</span>
                  <span className={`font-bold truncate block ${activeChild?.currentMedication && !["none", "no", ""].includes(activeChild.currentMedication.toLowerCase()) ? "text-amber-700" : "text-slate-700"}`} title={activeChild?.currentMedication || "None"}>
                    {activeChild?.currentMedication || "None"}
                  </span>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-slate-200/70 shadow-2xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Prior Reactions</span>
                  <span className={`font-bold truncate block ${schedule.some(s => s.status === "completed" && s.reaction?.hasReaction === true) ? "text-amber-700" : "text-slate-700"}`}>
                    {schedule.some(s => s.status === "completed" && s.reaction?.hasReaction === true) ? "Recorded" : "None"}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 leading-normal">
                Any illness or medication updates made when completing milestone vaccinations will automatically recalculate this prediction.
              </p>
            </div>

            {/* Loading State */}
            {loadingPrediction && !modelPrediction && (
              <div className="p-8 text-center bg-slate-50/60 border border-slate-100 rounded-2xl space-y-3">
                <div className="w-7 h-7 mx-auto border-3 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs font-semibold text-slate-600">
                  Running machine learning model inference for {vaccine.vaccineName}...
                </p>
              </div>
            )}

            {/* Error State */}
            {predictionError && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between gap-3 text-xs text-rose-800">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Failed to load ML model predictions: {predictionError}</span>
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
                {/* Risk Level & Clinical Summary Banner */}
                <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  modelPrediction.risk_level === "High"
                    ? "bg-rose-50/70 border-rose-200"
                    : modelPrediction.risk_level === "Medium"
                    ? "bg-amber-50/70 border-amber-200"
                    : "bg-emerald-50/70 border-emerald-200"
                }`}>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                        Predicted Risk Level:
                      </span>
                      <Badge className={`font-extrabold text-xs px-2.5 py-0.5 rounded-full ${
                        modelPrediction.risk_level === "High"
                          ? "bg-rose-600 text-white"
                          : modelPrediction.risk_level === "Medium"
                          ? "bg-amber-500 text-white"
                          : "bg-emerald-600 text-white"
                      }`}>
                        {modelPrediction.risk_level} Risk
                      </Badge>
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-slate-800">
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
                    <span className="text-[11px] text-slate-400">
                      Trained Multi-Output & Onset Regressor
                    </span>
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
                          className={`p-3 sm:p-3.5 rounded-2xl border transition-all ${
                            item.predicted
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
                              <Badge variant="outline" className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                probPercent >= 50
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
                              <span className="text-[11px] text-slate-500 font-medium">Model Probability</span>
                              <span className={`font-extrabold text-xs ${
                                isHighProb ? "text-rose-600" : isMedProb ? "text-amber-600" : "text-slate-700"
                              }`}>
                                {probPercent}%
                              </span>
                            </div>
                            <div className="w-full h-2 bg-slate-200/80 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  isNoRxn
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
