import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useChild } from "../../context/ChildContext";
import AddChildModal from "./AddChildModal";
import EditChildModal from "./EditChildModal";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  User,
  Baby,
  Plus,
  Mail,
  Shield,
  Heart,
  Check,
  LogOut,
  Calendar,
  X,
  Sparkles,
  Pencil,
  Activity,
  Pill,
  ShieldAlert
} from "lucide-react";

export default function ProfileView() {
  const { user, logout, openLogin } = useAuth();
  const { childrenList, activeChild, setActiveChildId, addChild } = useChild();

  const { isAddChildModalOpen, setIsAddChildModalOpen } = useChild();
  const [isAddingLocal, setIsAddingLocal] = useState(false);
  const [editingChild, setEditingChild] = useState(null);

  const isAddingChild = isAddingLocal || isAddChildModalOpen;
  const setIsAddingChild = (val) => {
    setIsAddingLocal(val);
    if (setIsAddChildModalOpen) setIsAddChildModalOpen(val);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Parent & Child Profiles
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Manage your personal account, pediatric records, and linked family members.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Parent Card & Sign Out */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="bg-white border-slate-100 rounded-3xl p-6 sm:p-7 shadow-xs">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-3xl bg-pink-100 text-pink-600 font-extrabold text-xl flex items-center justify-center border-2 border-pink-200 shadow-sm">
                {user?.full_name
                  ? user.full_name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)
                  : "PB"}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">
                    {user?.full_name || "Parent Ben"}
                  </h3>
                  <Badge variant="pink" className="text-[10px] font-bold px-2.5 py-0.5">
                    Parent
                  </Badge>
                </div>
                <p className="text-xs text-slate-400">@{user?.username || "parent_ben"}</p>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-100 text-xs text-slate-600">
              <div className="flex items-center justify-between py-2 border-b border-slate-50">
                <span className="flex items-center gap-2 text-slate-400 font-medium">
                  <Mail className="w-4 h-4 text-slate-400" /> Email
                </span>
                <span className="font-semibold text-slate-800">
                  {user?.email && user.email !== "sarah@example.com" ? user.email : "sarah@gmail.com"}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-50">
                <span className="flex items-center gap-2 text-slate-400 font-medium">
                  <Shield className="w-4 h-4 text-slate-400" /> Account Status
                </span>
                <span className="font-bold text-emerald-600 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Active Verified
                </span>
              </div>
            </div>

            <div className="pt-6">
              <Button
                variant="destructive"
                onClick={logout}
                className="w-full h-auto py-2.5 px-4 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-none"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out of Account</span>
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Column: Children Profiles */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="bg-white border-slate-100 rounded-3xl p-6 sm:p-7 shadow-xs">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Registered Child Profiles
                </h3>
                <p className="text-xs text-slate-400">
                  Select which child profile is active or edit health notes & medications.
                </p>
              </div>

              <Button
                onClick={() => setIsAddingChild(true)}
                className="h-auto py-2 px-3 bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Child</span>
              </Button>
            </div>

            <div className="space-y-3.5">
              {childrenList.map((child) => {
                const isActive = child.id === activeChild?.id;
                const hasIllness = child.currentIllness && child.currentIllness.trim() !== "" && !["none", "no", "none reported"].includes(child.currentIllness.trim().toLowerCase());
                const hasMedication = child.currentMedication && child.currentMedication.trim() !== "" && !["none", "no", "none reported"].includes(child.currentMedication.trim().toLowerCase());

                return (
                  <Card
                    key={child.id}
                    onClick={() => setActiveChildId(child.id)}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
                      isActive
                        ? "bg-sky-50/70 border-sky-300 ring-2 ring-sky-200/50 shadow-xs"
                        : "bg-slate-50/50 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    {/* Header Row: Avatar, Name, Badges, and Edit Button */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 ${
                            isActive
                              ? "bg-sky-500 text-white shadow-xs"
                              : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          <Baby className="w-5 h-5" />
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-bold text-slate-900">{child.name}</h4>
                            {isActive && (
                              <Badge variant="sky" className="text-[10px] font-extrabold px-2 py-0.5">
                                Active Profile
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Age: {child.ageMonths} months • Sex: {child.sex === "M" ? "Male" : "Female"}
                          </p>
                        </div>
                      </div>

                      {/* Edit Button */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingChild(child);
                        }}
                        className="h-auto p-1.5 sm:px-2.5 sm:py-1.5 bg-white hover:bg-sky-50 text-slate-600 hover:text-sky-600 border-slate-200 hover:border-sky-300 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-2xs shrink-0"
                        title="Edit child profile and health notes"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Edit Details</span>
                      </Button>
                    </div>

                    {/* Clinical Details Section */}
                    <div className="mt-3.5 pt-3 border-t border-slate-200/60 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                      {/* Allergies */}
                      <div className="bg-white/80 border border-slate-200/70 rounded-xl p-2.5 flex flex-col justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 mb-1">
                          <ShieldAlert className="w-3 h-3 text-slate-400" /> Allergies
                        </span>
                        <span className="font-semibold text-slate-700 truncate" title={child.allergies || "None reported"}>
                          {child.allergies || "None reported"}
                        </span>
                      </div>

                      {/* Current Illness */}
                      <div className={`rounded-xl p-2.5 border flex flex-col justify-between ${
                        hasIllness
                          ? "bg-amber-50/80 border-amber-200/80 text-amber-900"
                          : "bg-white/80 border-slate-200/70"
                      }`}>
                        <span className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 mb-1 ${
                          hasIllness ? "text-amber-700" : "text-slate-400"
                        }`}>
                          <Activity className={`w-3 h-3 ${hasIllness ? "text-amber-600" : "text-slate-400"}`} /> Current Illness
                        </span>
                        {hasIllness ? (
                          <span className="font-bold text-amber-800 truncate" title={child.currentIllness}>
                            {child.currentIllness}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">None reported</span>
                        )}
                      </div>

                      {/* Current Medication */}
                      <div className={`rounded-xl p-2.5 border flex flex-col justify-between ${
                        hasMedication
                          ? "bg-purple-50/80 border-purple-200/80 text-purple-900"
                          : "bg-white/80 border-slate-200/70"
                      }`}>
                        <span className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 mb-1 ${
                          hasMedication ? "text-purple-700" : "text-slate-400"
                        }`}>
                          <Pill className={`w-3 h-3 ${hasMedication ? "text-purple-600" : "text-slate-400"}`} /> Medication
                        </span>
                        {hasMedication ? (
                          <span className="font-bold text-purple-800 truncate" title={child.currentMedication}>
                            {child.currentMedication}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">None reported</span>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </Card>
        </div>
      </div>

      {/* Add Child Modal */}
      <AddChildModal
        isOpen={isAddingChild}
        onClose={() => setIsAddingChild(false)}
      />

      {/* Edit Child Modal */}
      <EditChildModal
        isOpen={!!editingChild}
        child={editingChild}
        onClose={() => setEditingChild(null)}
      />

    </div>
  );
}

