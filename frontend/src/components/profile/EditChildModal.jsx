import React, { useState, useEffect } from "react";
import { useChild } from "../../context/ChildContext";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Baby, X, Activity, Pill, ShieldAlert } from "lucide-react";

export default function EditChildModal({ isOpen, child, onClose }) {
  const { updateChild } = useChild();

  const [formData, setFormData] = useState({
    name: "",
    birthDate: "",
    ageMonths: 0,
    sex: "M",
    allergies: "None reported",
    currentIllness: "",
    currentMedication: ""
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Populate form with existing child data when opened
  useEffect(() => {
    if (child) {
      setFormData({
        name: child.name || "",
        birthDate: child.birthDate || child.birth_date || "",
        ageMonths: child.ageMonths !== undefined ? child.ageMonths : (child.age_months || 0),
        sex: child.sex || "M",
        allergies: child.allergies || "",
        currentIllness: child.currentIllness !== undefined ? child.currentIllness : (child.current_illness || ""),
        currentMedication: child.currentMedication !== undefined ? child.currentMedication : (child.current_medication || "")
      });
      setError("");
      setSuccessMsg("");
    }
  }, [child, isOpen]);

  if (!isOpen || !child) return null;

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
    setSuccessMsg("");

    if (!formData.name.trim()) {
      setError("Child name cannot be blank.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await updateChild(child.id, {
        name: formData.name.trim(),
        birthDate: formData.birthDate,
        ageMonths: parseFloat(formData.ageMonths) || 0,
        sex: formData.sex,
        allergies: formData.allergies.trim() || "None reported",
        currentIllness: formData.currentIllness.trim(),
        currentMedication: formData.currentMedication.trim(),
        bloodGroup: child.bloodGroup || child.blood_group || "O+",
        pediatrician: child.pediatrician,
        emergencyContact: child.emergencyContact || child.emergency_contact
      });

      if (res && res.success === false) {
        setError(res.error || "Failed to update child profile");
      } else {
        setSuccessMsg("Profile and medical records updated successfully!");
        setTimeout(() => {
          if (onClose) onClose();
        }, 600);
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred while updating profile");
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
        className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border-slate-100 max-h-[92vh] flex flex-col cursor-default"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center font-bold">
              <Baby className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Update Pediatric Record
              </h3>
              <p className="text-xs text-slate-400">
                Editing health profile for <span className="font-semibold text-slate-700">{child.name}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mt-3 p-3 text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-xl">
            {error}
          </div>
        )}
        {successMsg && (
          <div className="mt-3 p-3 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl">
            {successMsg}
          </div>
        )}

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto space-y-4 pt-4 pr-1 flex-1">
          {/* Basic Identity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Child's Full Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-sky-400 outline-none transition"
              />
            </div>

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

            <div className="sm:col-span-2">
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
                value={`${formData.ageMonths} months`}
                className="w-full px-3 py-2 text-xs bg-slate-100 text-slate-600 font-semibold border border-slate-200 rounded-xl cursor-not-allowed outline-none"
              />
            </div>
          </div>

          {/* Medical & Clinical Notes Section */}
          <div className="pt-3 border-t border-slate-100 space-y-3.5">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-sky-600 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
                Clinical Health Records
              </span>
            </div>

            {/* Current Illness */}
            <div className="bg-amber-50/40 border border-amber-200/60 rounded-2xl p-3.5">
              <div className="flex items-center justify-between mb-1.5">
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <Activity className="w-3.5 h-3.5 text-amber-600" />
                  <span>Current Illness</span>
                  <span className="text-[10px] text-slate-400 font-normal">(Optional text)</span>
                </label>
                {formData.currentIllness && (
                  <button
                    type="button"
                    onClick={() => setFormData((p) => ({ ...p, currentIllness: "" }))}
                    className="text-[11px] text-rose-500 hover:text-rose-700 font-semibold cursor-pointer underline"
                  >
                    Clear (Empty)
                  </button>
                )}
              </div>
              <textarea
                rows={2}
                placeholder="e.g. Mild cold, slight fever since yesterday, or leave blank if child has no illness"
                value={formData.currentIllness}
                onChange={(e) => setFormData({ ...formData, currentIllness: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-white border border-amber-200/80 rounded-xl focus:border-amber-400 focus:ring-1 focus:ring-amber-200 outline-none transition resize-none placeholder:text-slate-400"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Parent notes regarding any active symptoms, fever, or ongoing conditions. Can be left empty.
              </p>
            </div>

            {/* Current Medication */}
            <div className="bg-purple-50/40 border border-purple-200/60 rounded-2xl p-3.5">
              <div className="flex items-center justify-between mb-1.5">
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <Pill className="w-3.5 h-3.5 text-purple-600" />
                  <span>Current Medication</span>
                  <span className="text-[10px] text-slate-400 font-normal">(Optional text)</span>
                </label>
                {formData.currentMedication && (
                  <button
                    type="button"
                    onClick={() => setFormData((p) => ({ ...p, currentMedication: "" }))}
                    className="text-[11px] text-rose-500 hover:text-rose-700 font-semibold cursor-pointer underline"
                  >
                    Clear (Empty)
                  </button>
                )}
              </div>
              <textarea
                rows={2}
                placeholder="e.g. Paracetamol syrup 2.5ml twice daily, or leave blank if no medications"
                value={formData.currentMedication}
                onChange={(e) => setFormData({ ...formData, currentMedication: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-white border border-purple-200/80 rounded-xl focus:border-purple-400 focus:ring-1 focus:ring-purple-200 outline-none transition resize-none placeholder:text-slate-400"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Prescriptions, syrups, antibiotics, or vitamins currently being administered. Can be left empty.
              </p>
            </div>

            {/* Known Allergies */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1">
                <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
                <span>Known Allergies / Sensitivities</span>
              </label>
              <input
                type="text"
                placeholder="e.g. None reported or egg protein sensitivity"
                value={formData.allergies}
                onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-sky-400 outline-none transition"
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-4 pb-1 flex items-center justify-end gap-2.5 border-t border-slate-100 sticky bottom-0 bg-white">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={submitting}
              className="h-auto px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="h-auto px-5 py-2.5 text-xs font-bold text-white bg-sky-500 hover:bg-sky-600 rounded-xl shadow-xs hover:shadow-md transition cursor-pointer active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
            >
              {submitting ? "Saving Updates..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
