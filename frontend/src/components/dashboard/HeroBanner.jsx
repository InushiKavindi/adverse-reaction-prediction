import React from "react";
import { useAuth } from "../../context/AuthContext";
import { useChild } from "../../context/ChildContext";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Sparkles, Calendar, Activity, ArrowRight } from "lucide-react";

export default function HeroBanner({ onViewSchedule, onViewHistory }) {
  const { user } = useAuth();
  const { activeChild } = useChild();

  const parentName = user?.full_name || "Parent Ben";
  const childName = activeChild?.name || "Child Ben";

  return (
    <Card className="relative overflow-hidden rounded-3xl bg-[#fff0f4] border-pink-200/80 p-6 sm:p-8 shadow-xs">
      {/* Decorative background shapes */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-pink-200/40 via-pink-100/20 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 right-1/4 w-48 h-48 bg-sky-100/50 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 max-w-2xl">
        {/* AI Pill Badge */}
        <Badge variant="pink" className="inline-flex items-center gap-2 px-3 py-1 bg-white/90 border-pink-200 text-pink-600 rounded-full text-xs font-bold mb-4 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-pink-500" />
          <span>Pediatric Immunization & Safety Portal</span>
        </Badge>

        {/* Big Greeting */}
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2.5">
          Welcome back, {parentName}!
        </h2>

        {/* Subtitle with highlighted child name */}
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-6 font-normal">
          Monitor immunization milestones, track post-vaccination wellness, and manage{" "}
          <span className="font-bold text-pink-600">{childName}'s</span> pediatric health journey.
        </p>

        {/* CTA Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <Button
            onClick={onViewSchedule}
            className="h-auto px-5 py-2.5 bg-[#0793E8] hover:bg-[#0682cf] text-white font-bold text-sm rounded-full shadow-md shadow-sky-200 hover:shadow-lg hover:shadow-sky-300 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Calendar className="w-4 h-4" />
            <span>Assess Vaccine Schedule</span>
          </Button>

          {onViewHistory && (
            <Button
              variant="outline"
              onClick={onViewHistory}
              className="h-auto px-5 py-2.5 bg-white hover:bg-pink-50 border-pink-300 text-pink-600 hover:text-pink-700 font-bold text-sm rounded-full shadow-xs hover:border-pink-400 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <span>Prediction History</span>
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
