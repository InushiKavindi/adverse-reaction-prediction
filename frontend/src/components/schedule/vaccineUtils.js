/**
 * Utility functions for pediatric vaccine milestones and clinical predictions.
 */

export function mapVaccineToModelType(vaccine) {
  if (!vaccine) return "Pentavalent1,OPV1";
  const id = String(vaccine.id || "").toLowerCase();
  const name = String(vaccine.vaccineName || vaccine.name || "").toLowerCase();

  if (id === "vax-bcg2" || name.includes("bcg 2") || name.includes("bcg2")) return "BCG2";
  if (id === "vax-1" || name.includes("bcg")) return "BCG1";
  if (id === "vax-2" || name.includes("pentavalent 1") || name.includes("pentavalent1") || name.includes("opv 1 + ipv 1")) return "Pentavalent1,OPV1";
  if (id === "vax-3" || name.includes("pentavalent 2") || name.includes("pentavalent2") || name.includes("opv 2 + ipv 2")) return "Pentavalent2,OPV2,IPV";
  if (id === "vax-4" || name.includes("pentavalent 3") || name.includes("pentavalent3") || name.includes("opv 3 + pentavalent")) return "Pentavalent3,OPV3";
  if (id === "vax-5" || name.includes("mmr 1") || name.includes("mmr1")) return "MMR1";
  if (id === "vax-6" || name.includes("live je") || name.includes("je (live")) return "JE";
  if (id === "vax-7" || name.includes("dpt") || name.includes("opv 4")) return "DPT,OPV4";
  if (id === "vax-8" || name.includes("je booster") || name.includes("je")) return "JE";
  if (id === "vax-9" || name.includes("dt") || name.includes("opv 5")) return "DT,OPV5";

  if (name.includes("mmr 2") || name.includes("mmr2")) return "MMR2";
  return "JE";
}

export function formatDisplayDate(dateStr) {
  if (!dateStr) return "";
  try {
    if (typeof dateStr === "string" && dateStr.includes("/")) {
      const parts = dateStr.split("/");
      if (parts.length === 3) {
        const m = parts[0].padStart(2, "0");
        const d = parts[1].padStart(2, "0");
        const y = parts[2];
        return `${m}/${d}/${y}`;
      }
    }
    const parts = String(dateStr).split("-");
    if (parts.length === 3) {
      const year = parts[0];
      const month = parts[1].padStart(2, "0");
      const day = parts[2].padStart(2, "0");
      return `${month}/${day}/${year}`;
    }
  } catch {
    // fallback
  }
  return dateStr;
}

export function hasScheduledDateArrived(dueDateStr) {
  if (!dueDateStr) return true;
  try {
    let dueYear, dueMonth, dueDay;
    if (String(dueDateStr).includes("-")) {
      const parts = String(dueDateStr).split("-").map((p) => parseInt(p, 10));
      dueYear = parts[0];
      dueMonth = parts[1] - 1;
      dueDay = parts[2];
    } else if (String(dueDateStr).includes("/")) {
      const parts = String(dueDateStr).split("/").map((p) => parseInt(p, 10));
      dueMonth = parts[0] - 1;
      dueDay = parts[1];
      dueYear = parts[2];
    } else {
      return true;
    }
    const scheduledDayStart = new Date(dueYear, dueMonth, dueDay, 0, 0, 0);
    const now = new Date();
    return now >= scheduledDayStart;
  } catch {
    return true;
  }
}
