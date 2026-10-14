import React from "react";
import { useAuth } from "../../context/AuthContext";
import { useChild } from "../../context/ChildContext";
import { Menu, Bell, Baby, ChevronDown, ShieldCheck } from "lucide-react";

export default function TopHeader({ setMobileOpen, setCurrentPage }) {
  const { user } = useAuth();
  const { childrenList, activeChild, setActiveChildId, setIsAddChildModalOpen } = useChild();

  const handleChildSelect = (val) => {
    if (val === "__ADD_NEW__") {
      if (setIsAddChildModalOpen) setIsAddChildModalOpen(true);
    } else {
      setActiveChildId(val);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100 px-3 sm:px-6 md:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-2 w-full max-w-full overflow-hidden">
      {/* Mobile Menu Button & Brand */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <button
          onClick={() => setMobileOpen && setMobileOpen((prev) => !prev)}
          className="p-1.5 sm:p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition md:hidden cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <span className="font-bold text-slate-800 text-xs sm:text-sm hidden xs:inline sm:inline">ChildCare</span>
        </div>
      </div>

      {/* Child Profile Quick Switcher */}
      <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 shrink">
        <span className="text-xs font-semibold text-slate-400 hidden md:inline shrink-0">Active Child:</span>
        <div className="relative inline-block max-w-[140px] xs:max-w-[170px] sm:max-w-xs">
          <select
            value={activeChild?.id || ""}
            onChange={(e) => handleChildSelect(e.target.value)}
            className="appearance-none bg-sky-50/80 hover:bg-sky-100/80 text-sky-700 text-xs font-bold pl-7 pr-7 py-1.5 rounded-full border border-sky-200/80 cursor-pointer outline-none transition w-full truncate"
          >
            {childrenList.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.ageMonths !== undefined ? c.ageMonths : c.age_months} mos)
              </option>
            ))}
            <option value="__ADD_NEW__">+ Add New Child...</option>
          </select>
          <Baby className="w-3.5 h-3.5 text-sky-500 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          <ChevronDown className="w-3.5 h-3.5 text-sky-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>


      {/* Right Action Icons */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        <div className="hidden lg:flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-2.5 py-1 rounded-full text-[11px] font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          AI Model Engine: Online
        </div>

        <button
          onClick={() => setCurrentPage("history")}
          title="View Notification / Prediction History"
          className="relative p-1.5 sm:p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition cursor-pointer"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-pink-500 rounded-full"></span>
        </button>

        {user && (
          <div
            onClick={() => setCurrentPage("profile")}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-pink-100 text-pink-700 font-bold text-xs flex items-center justify-center cursor-pointer border border-pink-200 hover:ring-2 hover:ring-pink-300 transition shrink-0"
          >
            {user.full_name ? user.full_name[0] : "P"}
          </div>
        )}
      </div>
    </header>
  );
}
