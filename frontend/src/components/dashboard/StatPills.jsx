import React from "react";
import { useChild } from "../../context/ChildContext";
import { CheckCircle2, ShieldAlert } from "lucide-react";

export default function StatPills() {
  const { activeChild } = useChild();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Active Profile (Blue card) */}
      <div className="bg-[#eff8ff] border border-sky-200/70 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
        <span className="text-[11px] font-extrabold tracking-wider uppercase text-sky-600 mb-2">
          Active Profile
        </span>
        <h3 className="text-xl font-bold text-slate-900 mb-3 truncate">
          {activeChild?.name || "Child Ben"}
        </h3>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">
            Age: {activeChild?.ageMonths || 18} mos
          </span>
          <span className="text-[10px] font-bold px-2.5 py-0.5 bg-white text-sky-600 rounded-full border border-sky-200 shadow-2xs">
            Parent
          </span>
        </div>
      </div>

      {/* 2. Detection Engine (Pink card) */}
      <div className="bg-[#fff0f4] border border-pink-200/70 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
        <span className="text-[11px] font-extrabold tracking-wider uppercase text-pink-600 mb-2">
          Detection Engine
        </span>
        <h3 className="text-xl font-bold text-slate-900 mb-3 truncate">
          CatBoost / Stacking ML
        </h3>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Ready
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 bg-white text-pink-600 rounded-full border border-pink-200 shadow-2xs">
            Online
          </span>
        </div>
      </div>

      {/* 3. Severity Classes (Blue card) */}
      <div className="bg-[#eff8ff] border border-sky-200/70 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
        <span className="text-[11px] font-extrabold tracking-wider uppercase text-sky-600 mb-2">
          Severity Classes
        </span>
        <h3 className="text-xl font-bold text-slate-900 mb-1 truncate">
          Low, Med & High
        </h3>
        <p className="text-[11px] font-medium text-slate-500 truncate">
          Multi-class clinical classification
        </p>
      </div>

      {/* 4. Parental Guidance (Pink card) */}
      <div className="bg-[#fff0f4] border border-pink-200/70 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
        <span className="text-[11px] font-extrabold tracking-wider uppercase text-pink-600 mb-2">
          Parental Guidance
        </span>
        <h3 className="text-xl font-bold text-slate-900 mb-1 truncate">
          Real-time Risk
        </h3>
        <p className="text-[11px] font-medium text-slate-500 truncate">
          Actionable clinical recommendations
        </p>
      </div>
    </div>
  );
}
