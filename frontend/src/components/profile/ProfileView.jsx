import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useChild } from "../../context/ChildContext";
import {
  User,
  Baby,
  Plus,
  Mail,
  Phone,
  Shield,
  Heart,
  Check,
  LogOut,
  Calendar,
  X,
  Sparkles
} from "lucide-react";

export default function ProfileView() {
  const { user, logout, openLogin } = useAuth();
  const { childrenList, activeChild, setActiveChildId, addChild } = useChild();

  const [isAddingChild, setIsAddingChild] = useState(false);
  const [newChildData, setNewChildData] = useState({
    name: "",
    birthDate: "",
    ageMonths: "",
    sex: "M",
    bloodGroup: "O+",
    allergies: "None reported",
    pediatrician: "Dr. K. Perera"
  });

  const handleAddChildSubmit = (e) => {
    e.preventDefault();
    if (!newChildData.name || !newChildData.ageMonths) return;

    addChild({
      ...newChildData,
      ageMonths: parseFloat(newChildData.ageMonths)
    });
    setIsAddingChild(false);
    setNewChildData({
      name: "",
      birthDate: "",
      ageMonths: "",
      sex: "M",
      bloodGroup: "O+",
      allergies: "None reported",
      pediatrician: "Dr. K. Perera"
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-50 border border-sky-200 text-sky-600 rounded-full text-xs font-bold mb-2">
          <User className="w-3.5 h-3.5" />
          <span>Account & Family Profile</span>
        </div>
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
          <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-7 shadow-xs">
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
                  <span className="text-[10px] font-bold px-2.5 py-0.5 bg-pink-100 text-pink-600 rounded-full border border-pink-200">
                    Parent
                  </span>
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
                  {user?.email || "ben.parent@vaxcare.health"}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-50">
                <span className="flex items-center gap-2 text-slate-400 font-medium">
                  <Phone className="w-4 h-4 text-slate-400" /> Emergency Contact
                </span>
                <span className="font-semibold text-slate-800">+94 77 123 4567</span>
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
              <button
                onClick={logout}
                className="w-full py-2.5 px-4 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out of Account</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Children Profiles */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-7 shadow-xs">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Registered Child Profiles
                </h3>
                <p className="text-xs text-slate-400">
                  Select which child profile is currently active in the portal.
                </p>
              </div>

              <button
                onClick={() => setIsAddingChild(true)}
                className="py-2 px-3 bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Child</span>
              </button>
            </div>

            <div className="space-y-3">
              {childrenList.map((child) => {
                const isActive = child.id === activeChild?.id;

                return (
                  <div
                    key={child.id}
                    onClick={() => setActiveChildId(child.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isActive
                        ? "bg-sky-50/70 border-sky-300 ring-2 ring-sky-200/50 shadow-xs"
                        : "bg-slate-50/50 border-slate-100 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm ${
                            isActive
                              ? "bg-sky-500 text-white shadow-xs"
                              : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          <Baby className="w-5 h-5" />
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-900">{child.name}</h4>
                            {isActive && (
                              <span className="text-[10px] font-extrabold px-2 py-0.2 bg-sky-200/80 text-sky-800 rounded-full">
                                Active Profile
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500">
                            Age: {child.ageMonths} months • Sex: {child.sex === "M" ? "Male" : "Female"} • Blood: {child.bloodGroup || "O+"}
                          </p>
                        </div>
                      </div>

                      <div className="text-right text-xs">
                        <span className="text-slate-400 block text-[11px]">Allergies:</span>
                        <span className="font-semibold text-slate-700">{child.allergies}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Add Child Modal */}
      {isAddingChild && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Baby className="w-5 h-5 text-sky-600" /> Add New Child Profile
              </h3>
              <button
                onClick={() => setIsAddingChild(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddChildSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Child's Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Leo Ben"
                  value={newChildData.name}
                  onChange={(e) => setNewChildData({ ...newChildData, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-sky-400 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Age in Months
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    placeholder="18"
                    value={newChildData.ageMonths}
                    onChange={(e) =>
                      setNewChildData({ ...newChildData, ageMonths: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-sky-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Sex</label>
                  <select
                    value={newChildData.sex}
                    onChange={(e) => setNewChildData({ ...newChildData, sex: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-sky-400 outline-none"
                  >
                    <option value="M">Male (M)</option>
                    <option value="F">Female (F)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Known Allergies / Sensitivities
                </label>
                <input
                  type="text"
                  placeholder="e.g. None or egg protein sensitivity"
                  value={newChildData.allergies}
                  onChange={(e) =>
                    setNewChildData({ ...newChildData, allergies: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-sky-400 outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingChild(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-sky-500 hover:bg-sky-600 rounded-xl shadow-xs transition"
                >
                  Save Child Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
