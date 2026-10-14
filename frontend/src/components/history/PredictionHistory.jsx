import React, { useState, useEffect } from "react";
import { api } from "../../services/api";
import {
  History,
  Search,
  Filter,
  Trash2,
  Eye,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  X
} from "lucide-react";

export default function PredictionHistory({ onNewScreening }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRisk, setFilterRisk] = useState("all"); // 'all' | 'Low' | 'Medium' | 'High'
  const [selectedRecord, setSelectedRecord] = useState(null);

  const refreshHistory = async () => {
    setLoading(true);
    try {
      const records = await api.getPredictionHistory();
      setHistory(records || []);
    } catch {
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshHistory();
  }, []);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this prediction record?")) {
      await api.deletePrediction(id);
      refreshHistory();
      if (selectedRecord?.id === id) setSelectedRecord(null);
    }
  };


  const filtered = history.filter((item) => {
    const matchesRisk = filterRisk === "all" || item.risk_level === filterRisk;
    const matchesSearch =
      (item.patient_identifier || "").toLowerCase().includes(search.toLowerCase()) ||
      (item.vaccine_type || "").toLowerCase().includes(search.toLowerCase());
    return matchesRisk && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-pink-50 border border-pink-200 text-pink-600 rounded-full text-xs font-bold mb-2">
            <History className="w-3.5 h-3.5" />
            <span>Audit Trail & Records</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Prediction History
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Past adverse reaction assessments, symptom forecasts, and onset time records.
          </p>
        </div>

        {onNewScreening && (
          <button
            onClick={onNewScreening}
            className="py-2.5 px-4 bg-[#0284c7] hover:bg-sky-600 text-white font-bold text-xs rounded-full shadow-md shadow-sky-200 transition flex items-center gap-2 self-start sm:self-auto cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>New AI Screening</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white border border-slate-100 p-3 rounded-2xl shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by child name or vaccine (e.g. MMR, Pentavalent)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-sky-400 outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          {["all", "Low", "Medium", "High"].map((level) => (
            <button
              key={level}
              onClick={() => setFilterRisk(level)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition ${
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

      {/* History List Cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-slate-100 p-8 shadow-xs">
          <History className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 mb-1">No Prediction Records Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            No past predictions match your search criteria. Start a new screening to generate a prediction report.
          </p>
          {onNewScreening && (
            <button
              onClick={onNewScreening}
              className="py-2 px-4 bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
            >
              Start Screening Now
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((record) => {
            const isHigh = record.risk_level === "High";
            const isMed = record.risk_level === "Medium";
            const dateStr = record.created_at
              ? new Date(record.created_at).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit"
                })
              : "Recent";

            return (
              <div
                key={record.id}
                onClick={() => setSelectedRecord(record)}
                className="bg-white border border-slate-100 hover:border-sky-300 rounded-3xl p-5 shadow-xs hover:shadow-md transition cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-bold text-slate-400">
                      {dateStr}
                    </span>

                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 ${
                        isHigh
                          ? "bg-rose-100 text-rose-700 border border-rose-200"
                          : isMed
                          ? "bg-amber-100 text-amber-700 border border-amber-200"
                          : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                      }`}
                    >
                      {isHigh ? <AlertTriangle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                      {record.risk_level} Risk
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mb-1">
                    {record.patient_identifier || "Child"} — {record.vaccine_type}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-2 mb-4 font-normal">
                    {record.summary}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span>Age: {record.age_months} mos</span>
                    <span>•</span>
                    <span>Sex: {record.sex}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => handleDelete(record.id, e)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                      title="Delete record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 pl-2">
                      Details <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Record Details Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-7 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase">
                  Prediction Record #{selectedRecord.id}
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  {selectedRecord.patient_identifier} — {selectedRecord.vaccine_type}
                </h3>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-700 leading-relaxed">
                <p className="font-bold text-slate-800 mb-1">Clinical Assessment:</p>
                <p>{selectedRecord.summary}</p>
              </div>

              {/* Symptom list */}
              <div>
                <h4 className="text-xs font-bold uppercase text-slate-400 mb-2">
                  Symptom Occurrence & Expected Onset
                </h4>
                <div className="space-y-2">
                  {selectedRecord.symptoms?.map((s) => (
                    <div
                      key={s.symptom}
                      className="p-3 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-800">{s.display_name}</span>
                        <p className="text-[11px] text-slate-500">{s.onset_description}</p>
                      </div>
                      <span className="font-extrabold text-sky-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
                        {Math.round(s.probability * 100)}% prob
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedRecord.notes && (
                <div className="text-xs p-3 bg-pink-50/70 border border-pink-100 rounded-xl text-slate-700">
                  <strong className="text-pink-700">Notes:</strong> {selectedRecord.notes}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
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
