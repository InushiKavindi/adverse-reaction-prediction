import React, { useState, useEffect } from "react";
import {
  HeartPulse,
  Activity,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  ArrowRight
} from "lucide-react";
import { Card, CardTitle, CardDescription } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";

export default function Bcg1ReactionsView({
  vaccine,
  schedule = [],
  onUpdateVaccineStatus,
  onSelectVaccine
}) {
  const currentReaction = vaccine?.reaction || {};
  const [scarStatus, setScarStatus] = useState(currentReaction.bcgScarStatus || null);
  const [savingBcg, setSavingBcg] = useState(false);

  useEffect(() => {
    const rx = vaccine?.reaction || {};
    setScarStatus(rx.bcgScarStatus || null);
  }, [vaccine?.reaction]);

  // Handle BCG1 scar assessment
  const handleSelectScarStatus = async (status) => {
    const nextStatus = scarStatus === status ? null : status;
    setScarStatus(nextStatus);
    const updatedReaction = {
      ...(vaccine?.reaction || {}),
      bcgScarStatus: nextStatus
    };

    if (onUpdateVaccineStatus) {
      setSavingBcg(true);
      const statusToKeep = vaccine.status || "completed";
      const dateToKeep = statusToKeep === "completed" ? (vaccine.dateCompleted || new Date().toISOString().split("T")[0]) : null;
      await onUpdateVaccineStatus(statusToKeep, dateToKeep, updatedReaction);
      setSavingBcg(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Main Card: Expected Reactions & Care Overview */}
      <Card className="bg-white border-slate-100 rounded-3xl p-4 sm:p-6 shadow-xs space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-pink-500 to-[#ff2d78] text-white flex items-center justify-center font-bold shadow-xs shrink-0">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-base sm:text-lg font-bold text-slate-900">
                Expected Reactions and Care
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                General information for parents and caregivers
              </CardDescription>
            </div>
          </div>

          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-bold px-3 py-1 rounded-full self-start sm:self-auto">
            Normal / Expected Reaction
          </Badge>
        </div>

        {/* Normal / Expected Reaction Description */}
        <div className="p-4 bg-pink-50/70 border border-pink-100 rounded-2xl space-y-2">
          <h4 className="text-xs font-bold text-[#ff2d78] uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5" />
            <span>Normal / Expected Reaction</span>
          </h4>
          <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
            After BCG vaccination, a small bump may appear at the injection site after about 2-4 weeks. It may gradually develop into a small sore or shallow ulcer, which then heals naturally and usually leaves a small scar.
          </p>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            This is a normal part of the healing process. The timing and appearance can vary from child to child. A scar does not guarantee complete or lifelong protection against tuberculosis.
          </p>
        </div>

        {/* Typical Healing Progression */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Typical Healing Progression
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-1">
              <span className="text-[10px] font-bold text-sky-600 uppercase tracking-wider block">Weeks 2 – 4</span>
              <p className="font-bold text-slate-800 text-xs">A small bump appears</p>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                A small red or raised bump may develop at the injection site. This is an expected local reaction.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-1">
              <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">Following weeks</span>
              <p className="font-bold text-slate-800 text-xs">A small sore may form</p>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                The bump may soften, open into a shallow sore and develop a crust. A small amount of discharge can occur during normal healing.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-1">
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">Over several months</span>
              <p className="font-bold text-slate-800 text-xs">The sore heals</p>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                The area gradually heals and usually leaves a small scar. Complete healing may take several months.
              </p>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 italic pt-0.5">
            The timeline is approximate, not a strict schedule. Source: WHO and official public health BCG guidance.
          </p>
        </div>

        {/* BCG Scar Formation Assessment (Week 6 – 12) */}
        <div className="pt-3 border-t border-slate-100 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>BCG Scar Formation Assessment</span>
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Check your baby's right upper arm injection site to verify whether a permanent BCG scar has developed.
              </p>
            </div>

            {scarStatus && (
              <Badge
                variant="outline"
                className={`self-start sm:self-auto text-[11px] font-bold px-2.5 py-0.5 rounded-full ${scarStatus === "present"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                  : "bg-amber-50 text-amber-700 border-amber-300"
                  }`}
              >
                {scarStatus === "present" ? "✓ Scar Present" : "⚠ Scar Absent"}
              </Badge>
            )}
          </div>

          {/* Assessment Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => handleSelectScarStatus("present")}
              disabled={savingBcg}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${scarStatus === "present"
                ? "bg-emerald-50/80 border-emerald-400 ring-2 ring-emerald-400/20 shadow-xs"
                : "bg-slate-50/60 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
                  <CheckCircle2 className={`w-4 h-4 ${scarStatus === "present" ? "text-emerald-600" : "text-slate-400"}`} />
                  Scar Present
                </span>
                {scarStatus === "present" && (
                  <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Marked Present
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Permanent white scar has developed. Confirms effective cellular immunity. No 2nd dose needed.
              </p>
            </button>

            <button
              type="button"
              onClick={() => handleSelectScarStatus("absent")}
              disabled={savingBcg}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${scarStatus === "absent"
                ? "bg-amber-50/80 border-amber-400 ring-2 ring-amber-400/20 shadow-xs"
                : "bg-slate-50/60 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
                  <AlertCircle className={`w-4 h-4 ${scarStatus === "absent" ? "text-amber-600" : "text-slate-400"}`} />
                  Scar Absent
                </span>
                {scarStatus === "absent" && (
                  <span className="text-[10px] font-extrabold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                    Marked Absent
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                No scar visible after 6–12 weeks. Clinical protocol advises BCG 2nd dose revaccination.
              </p>
            </button>
          </div>

          {/* If Scar Absent: Clean, high-visibility callout with DIRECT link to the dedicated BCG2 page */}
          {scarStatus === "absent" && (
            <div className="p-4 bg-amber-50/90 border border-amber-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-200">
              <div className="flex items-start gap-2.5 min-w-0">
                <div className="w-6 h-6 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                </div>
                <div className="space-y-0.5 min-w-0">
                  <p className="font-bold text-xs sm:text-sm text-amber-950">
                    BCG 2nd Dose Revaccination Recommended
                  </p>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    Because a scar did not develop, repeat BCG vaccination is advised within 2 to 6 months. View the separate BCG 2nd dose page for AI adverse reaction forecasts and clinical guidance.
                  </p>
                </div>
              </div>

              <Button
                type="button"
                onClick={() => {
                  const bcg2Item = schedule.find(
                    (s) => s.id === "vax-bcg2" || s.vaccineName?.toLowerCase().includes("bcg 2") || s.vaccineName?.toLowerCase().includes("bcg2")
                  ) || {
                    id: "vax-bcg2",
                    milestone: "2 - 6 Months",
                    ageRange: "6 weeks - 6 months",
                    targetAgeMonths: 2,
                    vaccineName: "BCG 2 (Revaccination)",
                    route: "Intradermal (into the skin)",
                    fullRoute: "Intradermal (into the skin)",
                    diseases: "Tuberculosis (TB), particularly severe childhood TB such as TB meningitis and disseminated TB (revaccination)",
                    status: "due",
                    isClickable: true,
                    expectedReactions: "Mild papule, temporary low-grade temperature or slight swelling.",
                    severityLevel: "Low to Moderate Risk",
                    batchNumber: "BCG-2024-B2"
                  };
                  if (onSelectVaccine) {
                    onSelectVaccine(bcg2Item);
                  }
                }}
                className="bg-[#ff2d78] hover:bg-[#e02468] text-white font-bold text-xs rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0 self-start sm:self-auto"
              >
                <span>View BCG 2nd Dose Page & Predictions</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          )}

          {/* If Scar Present: Confirmation message */}
          {scarStatus === "present" && (
            <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-900 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <p className="font-medium text-[11px] leading-relaxed">
                <strong>Immunity Confirmed:</strong> BCG scar presence is verified. Effective life-long immunity against severe childhood tuberculosis has been established. No 2nd dose required.
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* What Should Parents Know Card */}
      <Card className="bg-white border-slate-100 rounded-3xl p-4 sm:p-5 shadow-xs">
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 bg-emerald-100 text-emerald-700">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              WHAT SHOULD PARENTS KNOW?
            </h4>
          </div>
          <div className="pl-8">
            <ul className="space-y-2 text-xs sm:text-[13px] text-slate-700 leading-relaxed">
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0" />
                <span>
                  Monitor your child after vaccination and follow the recommended post-vaccination care guidance. Contact a healthcare professional if you are concerned about your child's symptoms.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0" />
                <span>
                  Seek urgent medical care if your child develops serious symptoms, following the relevant medical guidance.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
