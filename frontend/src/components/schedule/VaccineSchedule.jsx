import React, { useState } from "react";
import { useChild } from "../../context/ChildContext";
import {
  Calendar,
  Lock,
  ArrowUpRight,
  Baby,
  Plus,
  Check,
  CheckCircle2,
  AlertCircle,
  Syringe,
  Sparkles
} from "lucide-react";
import { Card, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

function formatDisplayDate(dateStr) {
  if (!dateStr) return "";
  try {
    if (typeof dateStr === "string" && dateStr.includes("/")) {
      const parts = dateStr.split("/");
      if (parts.length === 3) {
        const m = parts[0].padStart(2, "0");
        const d = parts[1].padStart(2, "0");
        const y = parts[2];
        return `${m}/${d}/${y}`;
      }
    }
    const parts = String(dateStr).split("-");
    if (parts.length === 3) {
      const year = parts[0];
      const month = parts[1].padStart(2, "0");
      const day = parts[2].padStart(2, "0");
      return `${month}/${day}/${year}`;
    }
  } catch {
    // fallback to original string
  }
  return dateStr;
}

export default function VaccineSchedule({ onSelectVaccine }) {
  const { activeChild, schedule, loadingSchedule, setIsAddChildModalOpen } = useChild();
  const [activeFilter, setActiveFilter] = useState("all"); // 'all' | 'completed' | 'due' | 'upcoming'
  const [lockedNotice, setLockedNotice] = useState(null);

  const vax1Item = schedule.find(
    (s) =>
      s.id === "vax-1" ||
      (s.vaccineName?.toLowerCase().includes("bcg") &&
        !s.vaccineName?.toLowerCase().includes("bcg 2") &&
        !s.vaccineName?.toLowerCase().includes("bcg2"))
  );
  const bcgScarStatus = vax1Item?.reaction?.bcgScarStatus;

  // BCG2 should display ONLY when selected scar absent, if scar is present then BCG2 is no need
  const visibleSchedule = schedule.filter((item) => {
    if (
      item.id === "vax-bcg2" ||
      item.vaccineName?.toLowerCase().includes("bcg 2") ||
      item.vaccineName?.toLowerCase().includes("bcg2")
    ) {
      if (bcgScarStatus === "present") return false;
      return bcgScarStatus === "absent";
    }
    return true;
  });

  const filteredSchedule = visibleSchedule.filter((item) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "due") return item.status === "due";
    if (activeFilter === "completed") return item.status === "completed";
    if (activeFilter === "upcoming") return item.status === "upcoming";
    return true;
  });

  const completedCount = visibleSchedule.filter((s) => s.status === "completed").length;
  const dueCount = visibleSchedule.filter((s) => s.status === "due").length;
  const upcomingCount = visibleSchedule.filter((s) => s.status === "upcoming").length;

  const handleCardClick = (item, isClickable) => {
    if (isClickable) {
      if (onSelectVaccine) onSelectVaccine(item);
    } else {
      setLockedNotice(`Locked: ${item.vaccineName} is scheduled for ${formatDisplayDate(item.dueDate)}. Mark previous milestones as completed or wait for the due date to unlock.`);
      setTimeout(() => setLockedNotice(null), 4000);
    }
  };

  return (
    <div className="space-y-6 w-full min-w-0">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-pink-50 border border-pink-200 text-[#ff2d78] rounded-full text-xs font-bold mb-2 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#ff2d78]" />
            <span>National Pediatric Immunization Schedule</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight break-words">
            Vaccination Schedule for {activeChild?.name || "Active Child"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Adheres to National Ministry of Health & WHO guidelines for infant & toddler immunization.
          </p>
        </div>

        {/* Filter buttons - Horizontally scrollable on small screens */}
        <div className="flex items-center gap-1.5 bg-slate-100/90 p-1.5 rounded-2xl overflow-x-auto no-scrollbar max-w-full shrink-0 self-start sm:self-auto border border-slate-200/50">
          {[
            { id: "all", label: "All" },
            { id: "completed", label: `Completed (${completedCount})` },
            { id: "due", label: `Due (${dueCount})` },
            { id: "upcoming", label: `Upcoming (${upcomingCount})` }
          ].map((btn) => (
            <Button
              key={btn.id}
              size="sm"
              variant={activeFilter === btn.id ? "default" : "ghost"}
              onClick={() => setActiveFilter(btn.id)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer shrink-0 h-8 ${
                activeFilter === btn.id
                  ? "bg-white text-slate-900 shadow-xs hover:bg-white"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50"
              }`}
            >
              {btn.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Locked Notice Alert Banner */}
      {lockedNotice && (
        <div className="p-3.5 bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded-2xl flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2">
          <Lock className="w-4 h-4 text-amber-600 shrink-0" />
          <span className="font-medium">{lockedNotice}</span>
        </div>
      )}

      {/* Summary KPI Cards using Shadcn Card */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="bg-white border-slate-100 p-4 shadow-xs">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Total Milestones</p>
          <p className="text-2xl font-extrabold text-slate-800 mt-1">{visibleSchedule.length}</p>
        </Card>
        <Card className="bg-emerald-50/70 border-emerald-100 p-4 shadow-xs">
          <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wide">Completed</p>
          <p className="text-2xl font-extrabold text-emerald-700 mt-1">{completedCount}</p>
        </Card>
        <Card className="bg-amber-50/70 border-amber-100 p-4 shadow-xs">
          <p className="text-[11px] font-bold text-amber-600 uppercase tracking-wide">Due Now</p>
          <p className="text-2xl font-extrabold text-amber-700 mt-1">{dueCount}</p>
        </Card>
        <Card className="bg-sky-50/70 border-sky-100 p-4 shadow-xs">
          <p className="text-[11px] font-bold text-sky-600 uppercase tracking-wide">Pending Upcoming</p>
          <p className="text-2xl font-extrabold text-sky-700 mt-1">{upcomingCount}</p>
        </Card>
      </div>

      {/* Empty State if no child exists */}
      {!activeChild && (
        <Card className="p-8 text-center bg-white border-slate-100 rounded-3xl shadow-xs space-y-3">
          <Baby className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Child Profile Selected</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Please register your child's profile to auto-calculate their personalized national immunization schedule based on their Date of Birth.
          </p>
          <Button
            onClick={() => setIsAddChildModalOpen(true)}
            className="bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Child Profile</span>
          </Button>
        </Card>
      )}

      {/* Elegant 2-Column Dedicated Timeline Rail & Cards */}
      {loadingSchedule ? (
        <div className="p-12 text-center text-xs text-slate-400">
          Calculating vaccine milestones from DOB...
        </div>
      ) : (
        <div className="space-y-0 pt-2 pb-6 min-w-0 w-full">
          {filteredSchedule.map((item, index) => {
            const isCompleted = item.status === "completed";
            const isDue = item.status === "due";
            const isClickable = item.isClickable;
            const isFirst = index === 0;
            const isLast = index === filteredSchedule.length - 1;

            const cardDate = formatDisplayDate(item.dueDate);

            return (
              <div key={item.id} className="flex gap-3 sm:gap-6 min-w-0 group">
                {/* 1. Dedicated Timeline Rail Column (Guaranteed to NEVER overlap card or text) */}
                <div className="flex flex-col items-center shrink-0 w-7 sm:w-10">
                  {/* Top line connecting from previous item */}
                  <div
                    className={`w-1 rounded-full ${
                      isFirst ? "bg-transparent h-6 sm:h-7" : "bg-[#ff2d78] h-6 sm:h-7"
                    }`}
                  />

                  {/* Circular Node Indicator on the line */}
                  <div
                    className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 border-white shadow-sm flex items-center justify-center shrink-0 z-10 transition-transform duration-200 ${
                      isCompleted
                        ? "bg-[#0ea5e9] text-white ring-2 ring-sky-200"
                        : isDue
                        ? "bg-[#0ea5e9] text-white ring-4 ring-sky-300"
                        : "bg-slate-200 text-slate-400 border-slate-300"
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                    ) : isDue ? (
                      <div className="w-2.5 h-2.5 rounded-full bg-white" />
                    ) : (
                      <Lock className="w-3 h-3 text-slate-400" />
                    )}
                  </div>

                  {/* Bottom line connecting to next item */}
                  <div
                    className={`w-1 flex-1 min-h-[36px] rounded-full ${
                      isLast ? "bg-transparent" : "bg-[#ff2d78]"
                    }`}
                  />
                </div>

                {/* 2. Timeline Card Column */}
                <div className="flex-1 min-w-0 pb-5 sm:pb-6">
                  <Card
                    onClick={() => handleCardClick(item, isClickable)}
                    className={`rounded-2xl sm:rounded-3xl border transition-all duration-200 p-5 sm:p-6 shadow-xs min-w-0 w-full ${
                      !isClickable
                        ? "border-slate-200/80 bg-slate-50/40 opacity-70 cursor-not-allowed select-none"
                        : isDue
                        ? "border-sky-300 ring-4 ring-sky-100/70 shadow-sm bg-white hover:border-sky-400 hover:shadow-md cursor-pointer active:scale-[0.99]"
                        : isCompleted
                        ? "border-pink-100 bg-white hover:border-pink-200 hover:shadow-md cursor-pointer active:scale-[0.99]"
                        : "border-pink-100 bg-white hover:border-pink-200 hover:shadow-md cursor-pointer active:scale-[0.99]"
                    }`}
                  >
                    {/* Top Header: Uppercase Pink Milestone + Status Badge */}
                    <div className="flex items-center justify-between pb-3.5 border-b border-pink-50/90 gap-2">
                      <span className="px-3 py-1 rounded-full text-xs sm:text-sm font-extrabold uppercase tracking-wider bg-pink-50 text-[#ff2d78] border border-pink-200/80">
                        {item.milestone}
                      </span>

                      {/* Status Badges */}
                      {isCompleted ? (
                        <Badge
                          variant="outline"
                          className="border-emerald-400 bg-emerald-50 text-emerald-600 font-semibold px-3 py-1 text-xs rounded-full gap-1.5 shrink-0"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Completed</span>
                        </Badge>
                      ) : isDue ? (
                        <Badge
                          variant="outline"
                          className={`${
                            item.id === "vax-bcg2"
                              ? "border-amber-400 bg-amber-50 text-amber-700"
                              : "border-sky-400 bg-sky-50 text-sky-600"
                          } font-semibold px-3 py-1 text-xs rounded-full gap-1.5 shrink-0`}
                        >
                          <AlertCircle className={`w-3.5 h-3.5 ${item.id === "vax-bcg2" ? "text-amber-600" : "text-sky-600"}`} />
                          <span>{item.id === "vax-bcg2" ? "Revaccination Due" : "Due Now"}</span>
                        </Badge>
                      ) : !isClickable ? (
                        <Badge
                          variant="outline"
                          className="border-slate-200 bg-slate-100 text-slate-500 font-semibold px-2.5 py-1 text-xs rounded-full gap-1.5 shrink-0"
                        >
                          <Lock className="w-3 h-3 text-slate-400" />
                          <span>Locked</span>
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="border-slate-200 bg-slate-50 text-slate-500 font-semibold px-3 py-1 text-xs rounded-full shrink-0"
                        >
                          <span>Upcoming</span>
                        </Badge>
                      )}
                    </div>

                    {/* Vaccine Title & Protective Indication */}
                    <div className="pt-3.5 pb-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <CardTitle className="text-base sm:text-lg font-bold text-slate-900 tracking-tight group-hover:text-sky-600 transition-colors">
                          {item.vaccineName}
                        </CardTitle>
                        {item.id === "vax-bcg2" && (
                          <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-800 text-[10px] font-bold">
                            Scar Absent Revaccination
                          </Badge>
                        )}
                      </div>
                      {item.diseases && (
                        <p className="text-xs sm:text-sm text-slate-500 mt-1 line-clamp-1">
                          <span className="text-slate-400 font-normal">Protects against: </span>
                          <span className="font-semibold text-slate-700">{item.diseases}</span>
                        </p>
                      )}
                    </div>

                    {/* Clinical Details Row (2-column responsive strip) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 pt-3 mt-1 border-t border-slate-100 text-xs text-slate-600 font-medium">
                      <div className="flex items-center gap-2 min-w-0">
                        <Syringe className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                        <span className="truncate">
                          <span className="text-slate-400">Route:</span> {item.route}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 min-w-0">
                        <Calendar className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                        <span className="truncate">
                          <span className="text-slate-400">Date:</span> {cardDate}
                        </span>
                      </div>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="pt-3.5 mt-3 border-t border-pink-50/80 flex items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold text-slate-400 truncate">
                        {isCompleted
                          ? "✓ Recorded in child's health journal"
                          : item.id === "vax-bcg2"
                          ? "⚠️ Revaccination if no scar developed after birth dose"
                          : isDue
                          ? "⚠️ Recommended for administration this month"
                          : "Scheduled milestone"}
                      </span>

                      {isClickable ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onSelectVaccine) onSelectVaccine(item);
                          }}
                          className="border-sky-200 text-sky-600 hover:bg-sky-50 hover:text-sky-700 hover:border-sky-300 font-bold text-xs rounded-xl shadow-2xs inline-flex items-center gap-1.5 cursor-pointer shrink-0 h-8"
                        >
                          <span>View Details</span>
                          <ArrowUpRight className="w-3.5 h-3.5 text-sky-600" />
                        </Button>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 font-medium shrink-0">
                          <Lock className="w-3.5 h-3.5 text-slate-400" />
                          <span>Complete previous milestone</span>
                        </span>
                      )}
                    </div>
                  </Card>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
