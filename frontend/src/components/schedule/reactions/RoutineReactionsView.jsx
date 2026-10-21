import React from "react";
import {
  HeartPulse,
  Clock,
  AlertCircle,
  AlertTriangle
} from "lucide-react";
import { Card, CardTitle, CardDescription } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import ForecastExplanation from "./ForecastExplanation";

export default function RoutineReactionsView({
  vaccine,
  modelPrediction,
  loadingPrediction,
  predictionError,
  fetchModelPrediction
}) {
  return (
    <div className="space-y-4">
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


            {/* Symptoms Probabilities & Onset Times */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Predicted Symptoms Probabilities & Onset Times
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {modelPrediction.symptoms?.map((item) => {
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
                            {Math.round(item.onset_hours) < 24
                              ? `~${Math.round(item.onset_hours)} hrs post-vax`
                              : `~${Math.round(item.onset_hours)} hrs (~${Math.round(Math.round(item.onset_hours) / 24)} ${Math.round(Math.round(item.onset_hours) / 24) === 1 ? "day" : "days"})`}
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

      {/* Unified Parent-Friendly XAI Explanation */}
      {(modelPrediction || loadingPrediction) && (
        <ForecastExplanation
          explanation={modelPrediction?.explanation}
          modelPrediction={modelPrediction}
          loading={loadingPrediction}
          onRetry={fetchModelPrediction}
        />
      )}
    </div>
  );
}
