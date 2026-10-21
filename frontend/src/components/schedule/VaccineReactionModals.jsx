import React from "react";
import { ArrowLeft, User, Clock, Check, Calendar } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { calculateAgeMonthsAtDate } from "./vaccineUtils";

export const SYMPTOM_OPTIONS = [
  { id: "no_reaction", label: "No Reaction", isNoReaction: true },
  { id: "fever", label: "Fever" },
  { id: "swelling", label: "Injection-site Swelling" },
  { id: "redness", label: "Redness" },
  { id: "pain", label: "Pain" },
  { id: "rash", label: "Rash" },
  { id: "others", label: "Other" }
];

export function ReactionIllnessModal({
  open,
  onOpenChange,
  currentIllness,
  setCurrentIllness,
  currentMedication,
  setCurrentMedication,
  onSubmit,
  updating
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-full p-5 sm:p-6 rounded-3xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="p-1 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <DialogTitle className="text-base font-bold text-slate-900">Record a Reaction</DialogTitle>
          </div>
          <div className="w-8 h-8 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center font-bold text-xs shrink-0">
            <User className="w-4 h-4" />
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 pt-1">
          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 leading-snug">
            Did your child experience any of the following symptoms?
          </h3>

          <div className="bg-slate-50/80 border border-slate-200/70 rounded-2xl p-4 space-y-3.5">
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <label htmlFor="modal-current-illness" className="text-xs font-bold text-slate-800">
                  Current Illness
                </label>
                <span className="text-[10px] font-semibold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-full">
                  Type "No" or "None" if none
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Child experiencing acute illness or fever?</p>
              <input
                id="modal-current-illness"
                type="text"
                value={currentIllness}
                onChange={(e) => setCurrentIllness(e.target.value)}
                placeholder="Type 'No' / 'None' or describe current illness..."
                className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition text-slate-800 placeholder:text-slate-400"
              />
            </div>

            <div className="space-y-1 pt-3 border-t border-slate-200/60">
              <div className="flex items-center justify-between gap-2">
                <label htmlFor="modal-current-medication" className="text-xs font-bold text-slate-800">
                  Current Medication
                </label>
                <span className="text-[10px] font-semibold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-full">
                  Type "No" or "None" if none
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Taking antibiotics or steroid medications?</p>
              <input
                id="modal-current-medication"
                type="text"
                value={currentMedication}
                onChange={(e) => setCurrentMedication(e.target.value)}
                placeholder="Type 'No' / 'None' or describe current medications..."
                className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition text-slate-800 placeholder:text-slate-400"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={updating}
            className="w-full py-2.5 bg-[#0284c7] hover:bg-sky-600 text-white font-bold text-sm rounded-full shadow-md shadow-sky-200 transition cursor-pointer active:scale-98"
          >
            {updating ? "Saving..." : "Continue"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function LogReactionsModal({
  open,
  onOpenChange,
  selectedSymptoms,
  toggleSymptom,
  symptomOnsets,
  onOnsetChange,
  otherDesc,
  setOtherDesc,
  onSubmit,
  updating
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-full p-5 sm:p-6 rounded-3xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="p-1 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <DialogTitle className="text-base font-bold text-slate-900">Record a Reaction</DialogTitle>
          </div>
          <div className="w-8 h-8 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center font-bold text-xs shrink-0">
            <User className="w-4 h-4" />
          </div>
        </div>

        <form onSubmit={onSubmit} className="overflow-y-auto space-y-3.5 pt-1 pr-1">
          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 leading-snug">
            Did your child experience any of the following symptoms?
          </h3>

          <div className="space-y-2">
            {SYMPTOM_OPTIONS.map((sym) => {
              const isChecked = selectedSymptoms.includes(sym.id);

              return (
                <div
                  key={sym.id}
                  className={`rounded-2xl border transition-all p-3 sm:p-3.5 bg-white ${
                    isChecked
                      ? "border-pink-300 ring-2 ring-pink-100/70 shadow-xs"
                      : "border-pink-100/90 hover:border-pink-200"
                  }`}
                >
                  <div
                    onClick={() => toggleSymptom(sym.id)}
                    className="flex items-center justify-between cursor-pointer select-none"
                  >
                    <span className="font-bold text-slate-800 text-xs sm:text-sm">{sym.label}</span>

                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition ${
                        isChecked
                          ? "bg-[#ff2d78] border-[#ff2d78] text-white"
                          : "border-pink-300 bg-white"
                      }`}
                    >
                      {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>

                  {isChecked && !sym.isNoReaction && (
                    <div className="mt-2.5 pt-2.5 border-t border-pink-50 animate-in fade-in duration-200">
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        How many hours after vaccination did the symptom begin?
                      </label>
                      <div className="relative">
                        <Clock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="number"
                          min="0"
                          max="720"
                          step="any"
                          value={symptomOnsets[sym.id] !== undefined ? symptomOnsets[sym.id] : ""}
                          onChange={(e) => onOnsetChange(sym.id, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "e" || e.key === "E" || e.key === "-" || e.key === "+") {
                              e.preventDefault();
                            }
                          }}
                          placeholder="e.g. 1.3 or 5 hours"
                          className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50/80 border border-slate-200 rounded-xl focus:bg-white focus:border-sky-400 outline-none transition text-slate-800 placeholder:text-slate-400"
                        />
                      </div>

                      {sym.id === "others" && (
                        <div className="mt-2">
                          <input
                            type="text"
                            value={otherDesc}
                            onChange={(e) => setOtherDesc(e.target.value)}
                            placeholder="Describe other symptom (optional)..."
                            className="w-full px-3 py-1.5 text-xs bg-slate-50/80 border border-slate-200 rounded-xl focus:bg-white focus:border-sky-400 outline-none transition text-slate-800 placeholder:text-slate-400"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              disabled={updating}
              className="w-full py-2.5 bg-[#0284c7] hover:bg-sky-600 text-white font-bold text-sm rounded-full shadow-md shadow-sky-200 transition cursor-pointer active:scale-98"
            >
              {updating ? "Saving..." : "Continue"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function DoctorScheduledDateModal({
  open,
  onOpenChange,
  vaccine,
  scheduledDate,
  setScheduledDate,
  birthDate,
  onSubmit,
  saving
}) {
  const isBcg2 = vaccine?.id === "vax-bcg2" || vaccine?.vaccineName?.toLowerCase().includes("bcg 2") || vaccine?.vaccineName?.toLowerCase().includes("bcg2");
  const hasCustomDate = Boolean(vaccine?.customScheduledDate || vaccine?.reaction?.scheduledDate);
  const ageMonths = calculateAgeMonthsAtDate(birthDate, scheduledDate);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-full p-5 sm:p-6 rounded-3xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="p-1 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <DialogTitle className="text-base font-bold text-slate-900">
              {isBcg2
                ? (hasCustomDate ? "Update Doctor's Recommended Date" : "Add Doctor's Recommended Date")
                : (hasCustomDate ? "Update Clinic Date" : "Add Clinic Date")}
            </DialogTitle>
          </div>
          <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center font-bold text-xs shrink-0">
            <Calendar className="w-4 h-4" />
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 pt-1">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 leading-snug">
              {isBcg2
                ? "When did the doctor recommend BCG revaccination?"
                : `When is the clinic appointment scheduled for ${vaccine?.vaccineName || "this vaccine"}?`}
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              {isBcg2
                ? "If your baby's BCG scar did not develop after 6–12 weeks, pediatricians normally schedule a 2nd dose within 2 to 6 months of age."
                : "Enter the scheduled clinic appointment date advised by your healthcare clinic for this immunization milestone."}
            </p>
          </div>

          <div className="bg-slate-50/80 border border-slate-200/70 rounded-2xl p-4 space-y-3">
            <div className="space-y-1.5">
              <label htmlFor="doctor-scheduled-date-input" className="text-xs font-bold text-slate-800 block">
                {isBcg2 ? "Doctor's Recommended Date" : "Clinic Appointment Date"}
              </label>
              <input
                id="doctor-scheduled-date-input"
                type="date"
                required
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition text-slate-800 font-medium"
              />
            </div>

            {scheduledDate && (
              <div className="p-3 bg-sky-50/70 border border-sky-100 rounded-xl flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">Estimated Infant Age:</span>
                <span className="font-extrabold text-sky-800">
                  ~{ageMonths} months ({Math.round(ageMonths * 4.3)} weeks)
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="text-xs font-bold rounded-xl border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving || !scheduledDate}
              className="bg-[#ff2d78] hover:bg-[#e02468] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
            >
              {saving ? "Saving..." : hasCustomDate ? "Update Date" : "Add Date"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export const Bcg2ScheduledDateModal = DoctorScheduledDateModal;
