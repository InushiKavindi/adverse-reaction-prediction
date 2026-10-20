import React, { useState, useEffect } from "react";
import {
  HeartPulse,
  Clock,
  AlertCircle,
  AlertTriangle,
  Stethoscope,
  RefreshCw,
  Info,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";
import { Card, CardTitle, CardDescription } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";

export default function Bcg2ReactionsView({
  vaccine,
  modelPrediction,
  loadingPrediction,
  predictionError,
  fetchModelPrediction,
  onUpdateVaccineStatus
}) {
  const activeBcg2Prediction = modelPrediction;
  const isBcg2Loading = loadingPrediction;
  const activeBcg2Error = predictionError;

  const currentReaction = vaccine?.reaction || {};
  const [scarStatus, setScarStatus] = useState(currentReaction.bcgScarStatus || null);
  const [savingBcg, setSavingBcg] = useState(false);

  useEffect(() => {
    const rx = vaccine?.reaction || {};
    setScarStatus(rx.bcgScarStatus || null);
  }, [vaccine?.reaction]);

  const handleSelectScarStatus = async (status) => {
    const nextStatus = scarStatus === status ? null : status;
    setScarStatus(nextStatus);
    const updatedReaction = {
      ...(vaccine?.reaction || {}),
      bcgScarStatus: nextStatus
    };

    if (onUpdateVaccineStatus) {
      setSavingBcg(true);
      const statusToKeep = vaccine.status || "due";
      const dateToKeep = statusToKeep === "completed" ? (vaccine.dateCompleted || new Date().toISOString().split("T")[0]) : null;
      await onUpdateVaccineStatus(statusToKeep, dateToKeep, updatedReaction);
      setSavingBcg(false);
    }
  };

  return (
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

        {/* Model Loading State */}
        {isBcg2Loading && (
          <div className="p-8 text-center bg-slate-50/60 border border-slate-100 rounded-2xl space-y-2">
            <div className="w-7 h-7 mx-auto border-3 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-semibold text-slate-600">
              Running AI prediction for BCG 2nd dose...
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
              onClick={fetchModelPrediction}
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


            {/* Symptoms Probabilities & Onset Times */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Predicted Symptoms Probabilities & Onset Times
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {activeBcg2Prediction.symptoms?.map((item) => {
                  const probPercent = Math.min(92, Math.round((item.probability || 0) * 100));
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

      {/* BCG Scar Formation Assessment (Week 6 – 12) */}
      <Card className="bg-white border-slate-100 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs space-y-3">
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
              className={`self-start sm:self-auto text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                scarStatus === "present"
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
            className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
              scarStatus === "present"
                ? "bg-emerald-50/80 border-emerald-400 ring-2 ring-emerald-400/20 shadow-xs"
                : "bg-slate-50/60 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
                <CheckCircle2
                  className={`w-4 h-4 ${
                    scarStatus === "present" ? "text-emerald-600" : "text-slate-400"
                  }`}
                />
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
            className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
              scarStatus === "absent"
                ? "bg-amber-50/80 border-amber-400 ring-2 ring-amber-400/20 shadow-xs"
                : "bg-slate-50/60 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
                <AlertCircle
                  className={`w-4 h-4 ${
                    scarStatus === "absent" ? "text-amber-600" : "text-slate-400"
                  }`}
                />
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
  );
}
