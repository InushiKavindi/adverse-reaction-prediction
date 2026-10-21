import React from "react";
import { useChild } from "../../context/ChildContext";
import { Menu, Baby, ChevronDown } from "lucide-react";

export default function TopHeader({ setMobileOpen, setCurrentPage }) {
  const { childrenList, activeChild, setActiveChildId, setIsAddChildModalOpen } = useChild();

  const handleChildSelect = (val) => {
    if (val === "__ADD_NEW__") {
      if (setIsAddChildModalOpen) setIsAddChildModalOpen(true);
    } else {
      setActiveChildId(val);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100 px-3 sm:px-6 md:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-3 w-full max-w-full overflow-hidden">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileOpen && setMobileOpen((prev) => !prev)}
        className="p-1.5 sm:p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition md:hidden cursor-pointer shrink-0"
        aria-label="Toggle navigation menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Child Profile Quick Switcher on the right */}
      <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 ml-auto">
        <span className="text-xs font-semibold text-slate-400 hidden sm:inline shrink-0">Active Child:</span>
        <div className="relative inline-block max-w-[170px] sm:max-w-xs">
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
    </header>
  );
}
