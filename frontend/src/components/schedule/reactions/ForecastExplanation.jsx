import React, { useState } from "react";
import {
  Lightbulb,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  ShieldCheck,
  ArrowUp,
  ArrowDown,
  Info,
} from "lucide-react";
import { Card, CardTitle } from "../../ui/card";

/**
 * ForecastExplanation
 * ───────────────────
 * Simplified, parent-friendly "Understanding Your Child's Forecast" card.
 *
 * Displays exactly three readable sections with clear bullet points:
 *   1. What does the forecast mean?
 *   2. What influenced the forecast?
 *   3. What should parents know?
 */
export default function ForecastExplanation({ explanation, modelPrediction, loading = false, onRetry }) {
  const [expanded, setExpanded] = useState(true);

  if (loading && !explanation) {
    return (
      <Card className="bg-white border-slate-100 rounded-3xl p-4 sm:p-5 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
            <div className="w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800">Generating Child Forecast Explanation...</p>
            <p className="text-[11px] text-slate-400">Analyzing predictions for parent guidance</p>
          </div>
        </div>
      </Card>
    );
  }

  if (!explanation) {
    if (modelPrediction) {
      return (
        <Card className="bg-white border-slate-100 rounded-3xl p-4 sm:p-5 shadow-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">Understanding Your Child's Forecast</p>
              <p className="text-[11px] text-slate-400">Forecast explanations are currently not loaded.</p>
            </div>
          </div>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="text-xs font-bold px-3 py-1.5 bg-violet-50 text-violet-700 hover:bg-violet-100 rounded-xl transition cursor-pointer"
            >
              Load Explanation
            </button>
          )}
        </Card>
      );
    }
    return null;
  }

  const { forecast_summary, influence_explanation, parent_guidance } = explanation;

  return (
    <Card className="bg-white border-slate-100 rounded-3xl shadow-xs overflow-hidden">
      {/* Expandable Header */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 sm:p-5 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-50/60 transition-colors"
        aria-expanded={expanded}
        aria-controls="forecast-explanation-content"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div className="text-left min-w-0">
            <CardTitle className="text-sm sm:text-base font-bold text-slate-900">
              Understanding Your Child's Forecast
            </CardTitle>
          </div>
        </div>

        <div className="flex items-center shrink-0">
          {expanded ? (
            <ChevronUp className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      {expanded && (
        <div
          id="forecast-explanation-content"
          className="px-4 sm:px-5 pb-5 space-y-6 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          {/* ── Section 1: What does the forecast mean? ── */}
          {forecast_summary && (
            <ExplanationSection
              icon={<TrendingUp className="w-4 h-4" />}
              iconBg="bg-sky-100 text-sky-700"
              title={forecast_summary.title || "What does the forecast mean?"}
            >
              <ul className="space-y-2 text-xs sm:text-[13px] text-slate-700 leading-relaxed">
                {forecast_summary.paragraphs && forecast_summary.paragraphs.length > 0 ? (
                  forecast_summary.paragraphs.map((p, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0" />
                      <span>{p}</span>
                    </li>
                  ))
                ) : (
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0" />
                    <span>{forecast_summary.summary}</span>
                  </li>
                )}
              </ul>
            </ExplanationSection>
          )}

          {/* ── Section 2: What influenced the forecast? ── */}
          {influence_explanation && (
            <ExplanationSection
              icon={<Lightbulb className="w-4 h-4" />}
              iconBg="bg-amber-100 text-amber-700"
              title={influence_explanation.title || "What influenced the forecast?"}
            >
              <div className="space-y-4 text-xs sm:text-[13px] text-slate-700 leading-relaxed">
                {/* ── Key Influencing Factors Chips (Image 1) ── */}
                {influence_explanation.key_factors && influence_explanation.key_factors.length > 0 && (
                  <div className="pb-3 border-b border-slate-100/80">
                    <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                      Key Influencing Factors
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      {influence_explanation.key_factors.map((f, idx) => (
                        <span
                          key={idx}
                          className={`text-[11px] font-medium px-2.5 py-1 rounded-full border inline-flex items-center gap-1.5 transition-colors ${
                            f.direction === "increases"
                              ? "bg-rose-50/80 text-rose-700 border-rose-200"
                              : f.direction === "decreases"
                              ? "bg-emerald-50/80 text-emerald-700 border-emerald-200"
                              : "bg-slate-50/90 text-slate-700 border-slate-200"
                          }`}
                        >
                          {f.direction === "increases" ? (
                            <ArrowUp className="w-3 h-3 text-rose-500 shrink-0" />
                          ) : f.direction === "decreases" ? (
                            <ArrowDown className="w-3 h-3 text-emerald-500 shrink-0" />
                          ) : (
                            <Info className="w-3 h-3 text-slate-400 shrink-0" />
                          )}
                          <span>{f.feature}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Factors Subsection */}
                <div className="space-y-2.5">
                  <p className="font-bold text-slate-900 text-xs sm:text-[13px]">
                    {influence_explanation.subtitle_factors || "Factors influencing the predicted reactions"}
                  </p>
                  <ul className="space-y-2.5">
                    {influence_explanation.factors && influence_explanation.factors.length > 0 ? (
                      influence_explanation.factors.map((f, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 leading-relaxed text-xs sm:text-[13px] text-slate-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0" />
                          <span>
                            <strong className="font-semibold text-slate-900">{f.label}:</strong>{" "}
                            {f.text}
                          </span>
                        </li>
                      ))
                    ) : (
                      influence_explanation.points?.map((pt, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 leading-relaxed text-xs sm:text-[13px] text-slate-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0" />
                          <span>{pt}</span>
                        </li>
                      ))
                    )}
                  </ul>
                </div>

                {/* Expected Timing Subsection */}
                <div className="space-y-1.5 pt-1">
                  <p className="font-bold text-slate-900 text-xs sm:text-[13px]">
                    {influence_explanation.subtitle_timing || "Expected timing"}
                  </p>
                  <p className="leading-relaxed">
                    {influence_explanation.timing_text ||
                      "The system estimates when each predicted reaction may begin. The estimated timing can differ between reactions and is not an exact time when symptoms will appear."}
                  </p>
                </div>
              </div>
            </ExplanationSection>
          )}

          {/* ── Section 3: What should parents know? ── */}
          {parent_guidance && (
            <ExplanationSection
              icon={<ShieldCheck className="w-4 h-4" />}
              iconBg="bg-emerald-100 text-emerald-700"
              title={parent_guidance.title || "What should parents know?"}
            >
              <ul className="space-y-2 text-xs sm:text-[13px] text-slate-700 leading-relaxed">
                {parent_guidance.paragraphs && parent_guidance.paragraphs.length > 0 ? (
                  parent_guidance.paragraphs.map((p, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0" />
                      <span>{p}</span>
                    </li>
                  ))
                ) : (
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0" />
                    <span>{parent_guidance.summary}</span>
                  </li>
                )}
              </ul>
            </ExplanationSection>
          )}
        </div>
      )}
    </Card>
  );
}

/**
 * Reusable section wrapper with icon and title.
 */
function ExplanationSection({ icon, iconBg, title, children }) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2">
        <div
          className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}
        >
          {icon}
        </div>
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          {title}
        </h4>
      </div>
      <div className="pl-8">{children}</div>
    </div>
  );
}
