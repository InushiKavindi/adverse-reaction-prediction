import React, { useState } from "react";
import {
  Lightbulb,
  ChevronDown,
  ChevronUp,
  ArrowUp,
  ArrowDown,
  Info,
  TrendingUp,
  Clock,
} from "lucide-react";
import { Card, CardTitle } from "../../ui/card";
import { Badge } from "../../ui/badge";

/**
 * ForecastExplanation
 * ───────────────────
 * Unified, parent-friendly "Understanding Your Child's Forecast" card.
 *
 * Displays concise, scannable bullet points for:
 *   A. forecast_summary      → What does the forecast mean?
 *   B. influence_explanation → What influenced the forecast?
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
            <p className="text-xs font-bold text-slate-800">Generating Child Safety & Forecast Explanation...</p>
            <p className="text-[11px] text-slate-400">Analyzing clinical influences with explainability models</p>
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
              <p className="text-[11px] text-slate-400">Detailed AI explanations are currently not loaded for this forecast.</p>
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

  const { forecast_summary, influence_explanation } = explanation;

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
            <p className="text-[11px] text-slate-400 mt-0.5">
              AI-powered explanation of the prediction results
            </p>
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
          className="px-4 sm:px-5 pb-5 space-y-5 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          {/* ── Section A: What does the forecast mean? ── */}
          {forecast_summary && (
            <ExplanationSection
              icon={<TrendingUp className="w-4 h-4" />}
              iconBg="bg-sky-100 text-sky-700"
              title={forecast_summary.title}
            >
              {forecast_summary.points && forecast_summary.points.length > 0 ? (
                <ul className="space-y-1.5">
                  {forecast_summary.points.map((pt, idx) => (
                    <BulletItem key={idx} text={pt} dotColor="bg-sky-500" />
                  ))}
                </ul>
              ) : (
                <p className="text-xs sm:text-[13px] text-slate-700 leading-relaxed">
                  {forecast_summary.summary}
                </p>
              )}

              {forecast_summary.disclaimer && (
                <p className="mt-2 text-[11px] text-slate-400 italic leading-relaxed">
                  {forecast_summary.disclaimer}
                </p>
              )}
            </ExplanationSection>
          )}

          {/* ── Section B: What influenced the forecast? ── */}
          {influence_explanation && (
            <ExplanationSection
              icon={<Lightbulb className="w-4 h-4" />}
              iconBg="bg-amber-100 text-amber-700"
              title={influence_explanation.title}
            >
              {influence_explanation.paragraphs?.map((para, idx) => (
                <div key={idx} className="mb-3.5 last:mb-0">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    {para.type === "symptom" ? (
                      <TrendingUp className="w-3 h-3 text-rose-500" />
                    ) : para.type === "onset" ? (
                      <Clock className="w-3 h-3 text-sky-500" />
                    ) : (
                      <Info className="w-3 h-3 text-slate-400" />
                    )}
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      {para.subtitle}
                    </span>
                  </div>

                  {para.points && para.points.length > 0 ? (
                    <ul className="space-y-1.5">
                      {para.points.map((pt, pIdx) => (
                        <BulletItem
                          key={pIdx}
                          text={pt}
                          dotColor={para.type === "symptom" ? "bg-rose-400" : "bg-sky-400"}
                        />
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs sm:text-[13px] text-slate-700 leading-relaxed">
                      {para.text}
                    </p>
                  )}
                </div>
              ))}

              {/* Key influential factor chips (deduplicated) */}
              {((influence_explanation.key_factors && influence_explanation.key_factors.length > 0) ||
                (influence_explanation.per_reaction_detail && Object.keys(influence_explanation.per_reaction_detail).length > 0)) && (
                <div className="mt-3.5 pt-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Key Influencing Factors
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {(influence_explanation.key_factors && influence_explanation.key_factors.length > 0
                      ? influence_explanation.key_factors
                      : (() => {
                          const seen = new Set();
                          const list = [];
                          Object.values(influence_explanation.per_reaction_detail || {}).forEach((factors) => {
                            factors.forEach((f) => {
                              if (f.feature && !seen.has(f.feature) && !f.feature.startsWith("prior prediction")) {
                                seen.add(f.feature);
                                list.push(f);
                              }
                            });
                          });
                          return list;
                        })()
                    ).map((f, fi) => (
                      <Badge
                        key={fi}
                        variant="outline"
                        className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 ${
                          f.direction === "increases"
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : f.direction === "decreases"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-slate-50 text-slate-700 border-slate-200"
                        }`}
                      >
                        {f.direction === "increases" ? (
                          <ArrowUp className="w-2.5 h-2.5 text-rose-500" />
                        ) : f.direction === "decreases" ? (
                          <ArrowDown className="w-2.5 h-2.5 text-emerald-500" />
                        ) : (
                          <Info className="w-2.5 h-2.5 text-slate-400" />
                        )}
                        <span>{f.feature}</span>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
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
    <div className="space-y-2">
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

/**
 * Bullet item with bold prefix before colon and a colored dot.
 */
function BulletItem({ text, dotColor = "bg-sky-500" }) {
  const colonIndex = text.indexOf(":");
  if (colonIndex > 0 && colonIndex < 35) {
    const label = text.slice(0, colonIndex + 1);
    const rest = text.slice(colonIndex + 1);
    return (
      <li className="flex items-start gap-2 text-xs sm:text-[13px] text-slate-700 leading-relaxed">
        <span className={`w-1.5 h-1.5 rounded-full ${dotColor} mt-2 shrink-0`} />
        <span>
          <strong className="font-semibold text-slate-800">{label}</strong>
          {rest}
        </span>
      </li>
    );
  }
  return (
    <li className="flex items-start gap-2 text-xs sm:text-[13px] text-slate-700 leading-relaxed">
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor} mt-2 shrink-0`} />
      <span>{text}</span>
    </li>
  );
}
