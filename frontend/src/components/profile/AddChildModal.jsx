import React, { useState } from "react";
import { useChild } from "../../context/ChildContext";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Baby, X } from "lucide-react";

export default function AddChildModal({ isOpen, onClose }) {
  const { addChild } = useChild();

  const [formData, setFormData] = useState({
    name: "",
    birthDate: "",
    ageMonths: 0,
    sex: "M",
    bloodGroup: "O+",
    allergies: "None reported",
    currentIllness: "",
    currentMedication: "",
    pediatrician: "Dr. K. Perera"
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const calculateAgeFromDob = (dobString) => {
    if (!dobString) return 0;
    const dob = new Date(dobString);
    if (isNaN(dob.getTime())) return 0;
    const now = new Date();
    let months = (now.getFullYear() - dob.getFullYear()) * 12 + (now.getMonth() - dob.getMonth());
    if (now.getDate() < dob.getDate()) {
      months -= 1;
    }
    return Math.max(0, months);
  };

  const handleDobChange = (e) => {
    const dob = e.target.value;
    const calculated = calculateAgeFromDob(dob);
    setFormData((prev) => ({
      ...prev,
      birthDate: dob,
      ageMonths: calculated
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!formData.name.trim()) {
      setError("Please enter the child's full name");
      return;
    }
    if (!formData.birthDate) {
      setError("Please select the child's Date of Birth");
      return;
    }

    setSubmitting(true);
    try {
      const res = await addChild({
        ...formData,
        ageMonths: parseFloat(formData.ageMonths) || 0
      });

      if (res && res.success === false) {
        setError(res.error || "Failed to save child profile");
      } else {
        setFormData({
          name: "",
          birthDate: "",
          ageMonths: 0,
          sex: "M",
          bloodGroup: "O+",
          allergies: "None reported",
          currentIllness: "",
          currentMedication: "",
          pediatrician: "Dr. K. Perera"
        });
        if (onClose) onClose();
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200 cursor-pointer"
    >
      <Card
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border-slate-100 max-h-[90vh] overflow-y-auto cursor-default"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4 sticky top-0 bg-white z-10">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Baby className="w-5 h-5 text-sky-600" /> Add New Child Profile
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 cursor-pointer transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-3 p-2.5 text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Child's Full Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Leo Ben"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-sky-400 outline-none transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Date of Birth (DOB)
              </label>
              <input
                type="date"
                required
                max={new Date().toISOString().split("T")[0]}
                value={formData.birthDate}
                onChange={handleDobChange}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-sky-400 outline-none transition cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Sex</label>
              <select
                value={formData.sex}
                onChange={(e) => setFormData({ ...formData, sex: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-sky-400 outline-none transition cursor-pointer"
              >
                <option value="M">Male (M)</option>
                <option value="F">Female (F)</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Age in Months
              </label>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-sky-100 text-sky-700 rounded-full">
                Auto-calculated from DOB
              </span>
            </div>
            <input
              type="text"
              readOnly
              value={formData.birthDate ? `${formData.ageMonths} months` : "Please select Date of Birth"}
              className="w-full px-3.5 py-2 text-xs bg-slate-100/80 text-slate-700 font-semibold border border-slate-200 rounded-xl cursor-not-allowed outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Known Allergies / Sensitivities
            </label>
            <input
              type="text"
              placeholder="e.g. None or egg protein sensitivity"
              value={formData.allergies}
              onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-sky-400 outline-none transition"
            />
          </div>

          <div className="pt-1 border-t border-slate-100 space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Current Illness <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <span className="text-[10px] text-slate-400">Can be empty</span>
              </div>
              <input
                type="text"
                placeholder="e.g. Mild cold, slight cough, or leave empty if healthy"
                value={formData.currentIllness}
                onChange={(e) => setFormData({ ...formData, currentIllness: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-sky-400 outline-none transition"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Current Medication <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <span className="text-[10px] text-slate-400">Can be empty</span>
              </div>
              <input
                type="text"
                placeholder="e.g. Paracetamol 2.5ml, Antibiotic, or leave empty if none"
                value={formData.currentMedication}
                onChange={(e) => setFormData({ ...formData, currentMedication: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-sky-400 outline-none transition"
              />
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={submitting}
              className="h-auto px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="h-auto px-5 py-2 text-xs font-bold text-white bg-sky-500 hover:bg-sky-600 rounded-xl shadow-xs transition cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {submitting ? "Saving..." : "Save Child Profile"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
