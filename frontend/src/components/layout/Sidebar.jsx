import React from "react";
import { useAuth } from "../../context/AuthContext";
import { useChild } from "../../context/ChildContext";
import {
  LayoutDashboard,
  Calendar,
  Sparkles,
  History,
  User,
  LogOut,
  Shield,
  Activity,
  Heart
} from "lucide-react";

export default function Sidebar({ currentPage, setCurrentPage, mobileOpen, setMobileOpen }) {
  const { user, logout, openLogin } = useAuth();
  const { activeChild } = useChild();

  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard
    },
    {
      id: "schedule",
      label: "Vaccine Schedule",
      icon: Calendar
    },
    {
      id: "screening",
      label: "Adverse Screening",
      icon: Activity,
      badge: "AI"
    },
    {
      id: "history",
      label: "Prediction History",
      icon: History
    },
    {
      id: "profile",
      label: "Profile",
      icon: User
    }
  ];

  const handleNavClick = (id) => {
    setCurrentPage(id);
    if (setMobileOpen) setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs md:hidden"
        />
      )}

      <aside
        className={`fixed md:relative top-0 left-0 z-40 h-screen h-[100dvh] w-72 shrink-0 bg-white border-r border-slate-100 flex flex-col justify-between p-5 transition-transform duration-300 md:translate-x-0 overflow-y-auto ${
          mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Brand / Logo */}
        <div>
          <div className="flex items-center gap-3 px-2 py-3 mb-6">
            <div className="w-11 h-11 rounded-2xl bg-sky-100/90 text-sky-600 flex items-center justify-center shadow-inner">
              <Shield className="w-6 h-6 fill-sky-500/20 text-sky-600" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-xl font-bold tracking-tight text-sky-600">ChildCare</h1>
              </div>
              <p className="text-[11px] font-medium text-slate-400">Pediatric Vaccine Safety Portal</p>
            </div>
          </div>

          {/* Navigation Section */}
          <div className="space-y-1">
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
              Navigation
            </p>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-[#0284c7] text-white shadow-md shadow-sky-200"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-slate-400"}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-pink-100 text-pink-600 font-extrabold"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Section: User Card & Sign Out */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          {user ? (
            <>
              {/* User Profile Pill matching screenshot */}
              <div
                onClick={() => handleNavClick("profile")}
                className="bg-[#fff1f5] border border-pink-200/70 rounded-2xl p-3 flex items-center justify-between cursor-pointer hover:bg-[#ffe6ee] transition"
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className="w-10 h-10 rounded-full bg-white border border-pink-200 text-pink-600 font-bold flex items-center justify-center shrink-0 shadow-xs text-xs">
                    {user.full_name
                      ? user.full_name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)
                      : "PB"}
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-slate-800 truncate">
                      {user.full_name || "Parent Ben"}
                    </p>
                    <p className="text-[11px] font-medium text-pink-600 truncate">
                      Child: {activeChild?.name || "Child Ben"}
                    </p>
                  </div>
                </div>

                <span className="text-[10px] font-bold px-2 py-0.5 bg-white text-pink-600 rounded-full border border-pink-100 shrink-0">
                  Parent
                </span>
              </div>

              {/* Sign Out Button */}
              <button
                onClick={logout}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-rose-500 hover:text-rose-600 hover:bg-rose-50/70 rounded-xl transition"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </>
          ) : (
            <button
              onClick={openLogin}
              className="w-full py-2.5 px-4 bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs rounded-xl shadow-sm transition"
            >
              Sign In to Your Account
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
