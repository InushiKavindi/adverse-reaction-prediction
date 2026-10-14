import React, { useState, useEffect } from "react";
import { useChild } from "../../context/ChildContext";
import { api } from "../../services/api";
import { VACCINE_DROPDOWN_OPTIONS } from "../../services/mockData";
import {
  Activity,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Thermometer,
  FileText,
  RotateCcw,
  Printer
} from "lucide-react";

export default function PredictionScreening({ initialVaccine = "", onPredictionSaved }) {
  const { activeChild } = useChild();

  const [formData, setFormData] = useState({
    patient_identifier: activeChild?.name || "Child Ben",
    age_months: activeChild?.ageMonths || 18,
    sex: activeChild?.sex || "M",
    vaccine_type: initialVaccine || "Pentavalent2,OPV2,IPV",
    previous_reaction: "No",
    allergy: activeChild?.allergies && activeChild.allergies !== "None reported" ? "Yes" : "No",
    current_illness: "No",
    medication: "No",
    notes: ""
  });

  useEffect(() => {
    if (initialVaccine) {
      setFormData((prev) => ({ ...prev, vaccine_type: initialVaccine }));
    }
  }, [initialVaccine]);

  useEffect(() => {
    if (activeChild) {
      setFormData((prev) => ({
        ...prev,
        patient_identifier: activeChild.name || prev.patient_identifier,
        age_months: activeChild.ageMonths !== undefined ? activeChild.ageMonths : (activeChild.age_months !== undefined ? activeChild.age_months : prev.age_months),
        sex: activeChild.sex || prev.sex,
        allergy: activeChild.allergies && activeChild.allergies !== "None reported" ? "Yes" : "No"
      }));
    }
  }, [activeChild]);


  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.predict({
        ...formData,
        age_months: parseFloat(formData.age_months)
      });
      if (response.success) {
        setResult(response.data);
        if (onPredictionSaved) onPredictionSaved();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-50 border border-sky-200 text-sky-600 rounded-full text-xs font-bold mb-2">
          <Sparkles className="w-3.5 h-3.5 text-sky-500" />
          <span>Machine Learning Adverse Reaction Predictor</span>
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Adverse Reaction & Onset Hours Screening
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Powered by CatBoost & Hybrid Stacking regression models to foresee adverse events before vaccination.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Form Container (5 or 6 cols) */}
        <div className={`${result ? "lg:col-span-5" : "lg:col-span-8 lg:col-start-3"} transition-all`}>
          <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-7 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-sky-600" />
              <span>Clinical Input Parameters</span>
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Patient and Age */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Child Reference
                  </label>
                  <input
                    type="text"
                    value={formData.patient_identifier}
                    onChange={(e) => setFormData({ ...formData, patient_identifier: e.target.value })}
                    required
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-sky-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Age in Months
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="240"
                    value={formData.age_months}
                    onChange={(e) => setFormData({ ...formData, age_months: e.target.value })}
                    required
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-sky-400 outline-none"
                  />
                </div>
              </div>

              {/* Sex and Vaccine Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Sex
                  </label>
                  <select
                    value={formData.sex}
                    onChange={(e) => setFormData({ ...formData, sex: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-sky-400 outline-none"
                  >
                    <option value="M">Male (M)</option>
                    <option value="F">Female (F)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Vaccine to Administer
                  </label>
                  <select
                    value={formData.vaccine_type}
                    onChange={(e) => setFormData({ ...formData, vaccine_type: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-sky-400 outline-none font-semibold text-sky-800"
                  >
                    {VACCINE_DROPDOWN_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Clinical Binary Factors */}
              <div className="pt-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Health Indicators & History
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Previous Reaction?
                    </label>
                    <div className="flex gap-2">
                      {["No", "Yes"].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setFormData({ ...formData, previous_reaction: val })}
                          className={`flex-1 py-1 text-xs font-bold rounded-lg border transition ${
                            formData.previous_reaction === val
                              ? val === "Yes"
                                ? "bg-rose-500 text-white border-rose-500 shadow-xs"
                                : "bg-sky-500 text-white border-sky-500 shadow-xs"
                              : "bg-white text-slate-600 border-slate-200"
                          }`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Allergy History?
                    </label>
                    <div className="flex gap-2">
                      {["No", "Yes"].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setFormData({ ...formData, allergy: val })}
                          className={`flex-1 py-1 text-xs font-bold rounded-lg border transition ${
                            formData.allergy === val
                              ? val === "Yes"
                                ? "bg-rose-500 text-white border-rose-500 shadow-xs"
                                : "bg-sky-500 text-white border-sky-500 shadow-xs"
                              : "bg-white text-slate-600 border-slate-200"
                          }`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Current Illness / Fever?
                    </label>
                    <div className="flex gap-2">
                      {["No", "Yes"].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setFormData({ ...formData, current_illness: val })}
                          className={`flex-1 py-1 text-xs font-bold rounded-lg border transition ${
                            formData.current_illness === val
                              ? val === "Yes"
                                ? "bg-rose-500 text-white border-rose-500 shadow-xs"
                                : "bg-sky-500 text-white border-sky-500 shadow-xs"
                              : "bg-white text-slate-600 border-slate-200"
                          }`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Current Medication?
                    </label>
                    <div className="flex gap-2">
                      {["No", "Yes"].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setFormData({ ...formData, medication: val })}
                          className={`flex-1 py-1 text-xs font-bold rounded-lg border transition ${
                            formData.medication === val
                              ? val === "Yes"
                                ? "bg-rose-500 text-white border-rose-500 shadow-xs"
                                : "bg-sky-500 text-white border-sky-500 shadow-xs"
                              : "bg-white text-slate-600 border-slate-200"
                          }`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Clinical Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Mild fussiness during previous visit..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-sky-400 outline-none"
                />
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-5 bg-[#0284c7] hover:bg-sky-600 text-white font-bold text-sm rounded-2xl shadow-md shadow-sky-200 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Evaluating ML Models...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Calculate Risk & Onset Hours</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Prediction Results Display */}
        {result && (
          <div className="lg:col-span-7 space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
              {/* Header result row */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase">
                    AI Clinical Evaluation
                  </span>
                  <h3 className="text-xl font-bold text-slate-900">
                    Results for {result.patient_identifier}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide flex items-center gap-1.5 ${
                      result.risk_level === "High"
                        ? "bg-rose-100 text-rose-700 border border-rose-200"
                        : result.risk_level === "Medium"
                        ? "bg-amber-100 text-amber-700 border border-amber-200"
                        : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                    }`}
                  >
                    {result.risk_level === "High" ? (
                      <AlertTriangle className="w-3.5 h-3.5" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    )}
                    {result.risk_level} Risk Level
                  </span>
                </div>
              </div>

              {/* Summary text */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-slate-700 text-sm leading-relaxed">
                <p className="font-semibold text-slate-800 mb-1">Clinical Summary:</p>
                <p>{result.summary}</p>
              </div>

              {/* Symptom Probabilities & Onset Hours */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Symptom Risk & Expected Onset Time
                </h4>

                <div className="space-y-3">
                  {result.symptoms?.map((s) => {
                    const percent = Math.round(s.probability * 100);
                    const isHigh = percent >= 50;

                    return (
                      <div
                        key={s.symptom}
                        className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-800">
                              {s.display_name}
                            </span>
                            {s.predicted && (
                              <span className="text-[10px] font-bold px-2 py-0.2 bg-amber-100 text-amber-800 rounded-full">
                                Predicted
                              </span>
                            )}
                          </div>

                          <div className="text-right">
                            <span className="text-xs font-extrabold text-slate-800">
                              {percent}% probability
                            </span>
                          </div>
                        </div>

                        {/* Probability Progress Bar */}
                        <div className="w-full h-2 bg-slate-200/80 rounded-full overflow-hidden mb-2">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isHigh
                                ? "bg-rose-500"
                                : percent >= 30
                                ? "bg-amber-500"
                                : "bg-sky-500"
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>

                        {/* Onset hours badge */}
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span className="flex items-center gap-1 font-medium">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            Onset: <strong className="text-slate-700">{s.onset_description}</strong>
                          </span>
                          {s.onset_hours && (
                            <span className="font-extrabold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-100">
                              ~{s.onset_hours}h post-dose
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Actionable Parental Advice */}
              <div className="p-4 bg-pink-50/80 border border-pink-200/80 rounded-2xl">
                <h4 className="text-xs font-extrabold text-pink-700 uppercase tracking-wide mb-1.5">
                  Actionable Pediatric Advice
                </h4>
                <ul className="text-xs text-slate-700 space-y-1 list-disc pl-4">
                  <li>Keep cool, damp compresses available for mild injection-site tenderness.</li>
                  <li>Maintain comfortable room temperature and adequate hydration (breastfeeding / fluids).</li>
                  <li>Do not administer paracetamol preventatively before vaccination without pediatric guidance.</li>
                  <li>Seek immediate clinical care if fever exceeds 39°C or if child exhibits persistent crying &gt;3 hours.</li>
                </ul>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Run Another Assessment</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
