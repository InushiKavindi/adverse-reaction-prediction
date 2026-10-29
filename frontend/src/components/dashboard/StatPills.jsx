import React from "react";
import { useChild } from "../../context/ChildContext";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";

export default function StatPills() {
  const { activeChild } = useChild();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* 1. Active Profile (Blue card) */}
      <Card className="bg-[#eff8ff] border-sky-200/70 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
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
          <Badge variant="sky" className="text-[10px] font-bold px-2.5 py-0.5 bg-white border-sky-200 shadow-2xs">
            Parent
          </Badge>
        </div>
      </Card>

      {/* 2. Severity Classes (Blue card) */}
      <Card className="bg-[#eff8ff] border-sky-200/70 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
        <span className="text-[11px] font-extrabold tracking-wider uppercase text-sky-600 mb-2">
          Severity Classes
        </span>
        <h3 className="text-xl font-bold text-slate-900 mb-1 truncate">
          Low, Med & High
        </h3>
        <p className="text-[11px] font-medium text-slate-500 truncate">
          Multi-class clinical classification
        </p>
      </Card>

      {/* 3. Parental Guidance (Pink card) */}
      <Card className="bg-[#fff0f4] border-pink-200/70 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
        <span className="text-[11px] font-extrabold tracking-wider uppercase text-pink-600 mb-2">
          Parental Guidance
        </span>
        <h3 className="text-xl font-bold text-slate-900 mb-1 truncate">
          Real-time Risk
        </h3>
        <p className="text-[11px] font-medium text-slate-500 truncate">
          Actionable clinical recommendations
        </p>
      </Card>
    </div>
  );
}
