import React, { useState } from "react";
import { useChild } from "../../context/ChildContext";
import { api } from "../../services/api";
import {
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  ShieldCheck,
  Activity,
  ArrowRight,
  Filter,
  Info
} from "lucide-react";

export default function VaccineSchedule({ onPredictVaccine }) {
  const { activeChild } = useChild();
  const [schedule, setSchedule] = useState(() => api.getSchedule());
  const [activeFilter, setActiveFilter] = useState("all"); // 'all' | 'completed' | 'due' | 'upcoming'
  const [selectedVax, setSelectedVax] = useState(null);

  const filteredSchedule = schedule.filter((item) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "due") return item.status === "due";
    if (activeFilter === "completed") return item.status === "completed";
    if (activeFilter === "upcoming") return item.status === "upcoming";
    return true;
  });

  const toggleStatus = (id, currentStatus) => {
    const nextStatus = currentStatus === "completed" ? "due" : "completed";
    const updated = api.updateScheduleStatus(id, nextStatus);
    setSchedule([...updated]);
  };

  const completedCount = schedule.filter((s) => s.status === "completed").length;
  const dueCount = schedule.filter((s) => s.status === "due").length;
  const upcomingCount = schedule.filter((s) => s.status === "upcoming").length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-pink-50 border border-pink-200 text-pink-600 rounded-full text-xs font-bold mb-2">
            <Calendar className="w-3.5 h-3.5" />
            <span>National Pediatric Immunization Schedule</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Vaccine Milestones for {activeChild?.name || "Child Ben"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Adheres to National Ministry of Health & WHO guidelines for infant & toddler immunization.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 bg-slate-100/80 p-1.5 rounded-2xl self-start sm:self-auto">
          {[
            { id: "all", label: "All" },
            { id: "completed", label: `Completed (${completedCount})` },
            { id: "due", label: `Due (${dueCount})` },
            { id: "upcoming", label: `Upcoming (${upcomingCount})` }
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => setActiveFilter(btn.id)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition ${
                activeFilter === btn.id
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-xs">
          <p className="text-[11px] font-bold text-slate-400 uppercase">Total Milestones</p>
          <p className="text-2xl font-extrabold text-slate-800 mt-1">{schedule.length}</p>
        </div>
        <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-4 shadow-xs">
          <p className="text-[11px] font-bold text-emerald-600 uppercase">Completed</p>
          <p className="text-2xl font-extrabold text-emerald-700 mt-1">{completedCount}</p>
        </div>
        <div className="bg-amber-50/60 border border-amber-100 rounded-2xl p-4 shadow-xs">
          <p className="text-[11px] font-bold text-amber-600 uppercase">Due Now</p>
          <p className="text-2xl font-extrabold text-amber-700 mt-1">{dueCount}</p>
        </div>
        <div className="bg-sky-50/60 border border-sky-100 rounded-2xl p-4 shadow-xs">
          <p className="text-[11px] font-bold text-sky-600 uppercase">Pending Upcoming</p>
          <p className="text-2xl font-extrabold text-sky-700 mt-1">{upcomingCount}</p>
        </div>
      </div>

      {/* Vaccine Timeline Cards */}
      <div className="space-y-4">
        {filteredSchedule.map((item, index) => {
          const isCompleted = item.status === "completed";
          const isDue = item.status === "due";

          return (
            <div
              key={item.id}
              className={`p-5 sm:p-6 rounded-3xl border transition-all ${
                isDue
                  ? "bg-[#fffdf7] border-amber-200/90 shadow-sm"
                  : isCompleted
                  ? "bg-white border-slate-100 shadow-xs"
                  : "bg-slate-50/50 border-slate-200/60"
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Left Info */}
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-extrabold text-slate-800 px-3 py-1 bg-slate-100 rounded-full">
                      {item.milestone}
                    </span>
                    <span className="text-xs font-medium text-slate-400">
                      Age Window: {item.ageRange}
                    </span>

                    {/* Status Pill */}
                    {isCompleted ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Completed ({item.dateCompleted})
                      </span>
                    ) : isDue ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 bg-amber-100 text-amber-700 rounded-full animate-pulse">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Due for Administration
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 bg-slate-200 text-slate-600 rounded-full">
                        <Clock className="w-3.5 h-3.5" />
                        Upcoming ({item.dueDate})
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-slate-900">
                    {item.vaccineName}
                  </h3>

                  <p className="text-xs text-slate-600 font-medium">
                    <span className="text-slate-400">Diseases Prevented:</span> {item.diseases}
                  </p>

                  <div className="text-xs text-slate-500 flex items-center gap-3">
                    <span>Route: <strong className="text-slate-700">{item.route}</strong></span>
                    <span>•</span>
                    <span>Batch: <strong className="text-slate-700">{item.batchNumber}</strong></span>
                  </div>

                  {/* Clinical expected reaction guidance */}
                  <div className="mt-2 text-xs p-3 bg-pink-50/70 border border-pink-100 rounded-2xl text-slate-700 flex items-start gap-2">
                    <Info className="w-4 h-4 text-pink-500 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-pink-700 font-bold">Expected Benign Reactions:</strong>{" "}
                      {item.expectedReactions}
                    </div>
                  </div>
                </div>

                {/* Right Action Buttons */}
                <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0 justify-center">
                  <button
                    onClick={() => onPredictVaccine(item.vaccineName)}
                    className="py-2.5 px-4 bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    <Activity className="w-3.5 h-3.5" />
                    <span>Run AI Reaction Risk</span>
                  </button>

                  <button
                    onClick={() => toggleStatus(item.id, item.status)}
                    className={`py-2 px-4 border text-xs font-bold rounded-xl transition cursor-pointer text-center ${
                      isCompleted
                        ? "border-slate-200 text-slate-600 hover:bg-slate-50"
                        : "border-emerald-300 text-emerald-700 bg-emerald-50/60 hover:bg-emerald-100"
                    }`}
                  >
                    {isCompleted ? "Mark as Incomplete" : "Mark as Completed ✓"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
