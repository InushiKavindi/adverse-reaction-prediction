from datetime import date, datetime
import calendar
from typing import List, Dict, Any, Optional
from backend.app.schemas.child import VaccineScheduleItem

NATIONAL_VACCINE_DEFINITIONS = [
    {
        "id": "vax-1",
        "milestone": "BIRTH",
        "ageRange": "0 - 2 weeks",
        "targetAgeMonths": 0,
        "vaccineName": "BCG",
        "fullVaccineName": "BCG1 (Bacillus Calmette-Guérin)",
        "route": "Upper Arm Injection",
        "fullRoute": "Intradermal (Right upper arm)",
        "diseases": "Tuberculosis (Miliary TB & Tubercular Meningitis)",
        "expectedReactions": "Small papule after 2-4 weeks developing into tiny ulcer, heals with scar.",
        "severityLevel": "Normal / Expected",
        "batchNumber": "BCG-2024-A9",
        "dosage": "0.05 ml (infant < 1 month) / 0.1 ml"
    },
    {
        "id": "vax-bcg2",
        "milestone": "2 - 6 MONTHS",
        "ageRange": "6 weeks - 6 months",
        "targetAgeMonths": 2,
        "vaccineName": "BCG 2 (Revaccination)",
        "fullVaccineName": "BCG 2nd Dose (Revaccination if Scar Absent)",
        "route": "Upper Arm Injection",
        "fullRoute": "Intradermal (Right upper arm)",
        "diseases": "Tuberculosis (Miliary TB & Tubercular Meningitis revaccination)",
        "expectedReactions": "Mild fever, localized redness or swelling, papule formation.",
        "severityLevel": "Low to Moderate Risk",
        "batchNumber": "BCG-2024-B2",
        "dosage": "0.1 ml Intradermal"
    },
    {
        "id": "vax-2",
        "milestone": "2 MONTHS",
        "ageRange": "8 weeks",
        "targetAgeMonths": 2,
        "vaccineName": "OPV 1 + Pentavalent 1",
        "fullVaccineName": "Pentavalent 1, OPV 1 & IPV",
        "route": "Thigh Injection & Oral Drops",
        "fullRoute": "Intramuscular & Oral Drops",
        "diseases": "Diphtheria, Tetanus, Pertussis, Hepatitis B, Hib + Polio",
        "expectedReactions": "Mild fever (38°C), soreness, redness at injection site within 6-12 hours.",
        "severityLevel": "Low Risk",
        "batchNumber": "PNT-8812-B",
        "dosage": "0.5 ml IM + 2 drops oral OPV"
    },
    {
        "id": "vax-3",
        "milestone": "4 MONTHS",
        "ageRange": "16 weeks",
        "targetAgeMonths": 4,
        "vaccineName": "OPV 2 + IPV + Pentavalent 2",
        "fullVaccineName": "Pentavalent 2, OPV 2 & IPV Booster",
        "route": "Thigh Injection & Oral Drops",
        "fullRoute": "Intramuscular & Inactivated Polio",
        "diseases": "Diphtheria, Pertussis, Tetanus, Hep B, Hib & Polio Booster",
        "expectedReactions": "Low-grade fever in 8-12 hours, mild swelling. Manageable with paracetamol if advised.",
        "severityLevel": "Low Risk",
        "batchNumber": "PNT-9043-C",
        "dosage": "0.5 ml IM + 2 drops oral OPV + 0.5 ml IPV"
    },
    {
        "id": "vax-4",
        "milestone": "6 MONTHS",
        "ageRange": "24 weeks",
        "targetAgeMonths": 6,
        "vaccineName": "OPV 3 + Pentavalent 3",
        "fullVaccineName": "Pentavalent 3 & OPV 3",
        "route": "Thigh Injection & Oral Drops",
        "fullRoute": "Intramuscular & Oral Drops",
        "diseases": "Diphtheria, Pertussis, Tetanus, Hep B, Hib & Polio 3",
        "expectedReactions": "Slight tenderness at injection site, irritability lasting <24 hours.",
        "severityLevel": "Low Risk",
        "batchNumber": "PNT-9921-A",
        "dosage": "0.5 ml IM + 2 drops oral OPV"
    },
    {
        "id": "vax-5",
        "milestone": "9 MONTHS",
        "ageRange": "9 - 12 months",
        "targetAgeMonths": 9,
        "vaccineName": "MMR 1",
        "fullVaccineName": "MMR 1 (Measles, Mumps, Rubella)",
        "route": "Upper Arm Injection",
        "fullRoute": "Subcutaneous (Upper arm)",
        "diseases": "Measles, Mumps and Rubella prevention",
        "expectedReactions": "Delayed mild rash or fever 6-10 days later. Rare immediate symptoms.",
        "severityLevel": "Low Risk",
        "batchNumber": "MMR-2025-X1",
        "dosage": "0.5 ml Subcutaneous"
    },
    {
        "id": "vax-6",
        "milestone": "12 MONTHS",
        "ageRange": "12 months",
        "targetAgeMonths": 12,
        "vaccineName": "Live JE (Japanese Encephalitis)",
        "fullVaccineName": "JE (Live Japanese Encephalitis)",
        "route": "Subcutaneous Injection",
        "fullRoute": "Subcutaneous",
        "diseases": "Viral encephalitis transmitted by mosquitoes",
        "expectedReactions": "Local headache or low-grade fever within 24-48 hours.",
        "severityLevel": "Low Risk",
        "batchNumber": "JE-8820-K",
        "dosage": "0.5 ml Subcutaneous"
    },
    {
        "id": "vax-7",
        "milestone": "18 MONTHS",
        "ageRange": "18 months",
        "targetAgeMonths": 18,
        "vaccineName": "DPT + OPV 4",
        "fullVaccineName": "DPT Booster & OPV 4",
        "route": "Thigh Injection & Oral Drops",
        "fullRoute": "Intramuscular (Anterolateral thigh / Deltoid)",
        "diseases": "Secondary MMR Booster & Whooping Cough Immunity",
        "expectedReactions": "Localized swelling, transient irritability, fever peak ~8-14 hours.",
        "severityLevel": "Moderate Assessment Advised",
        "batchNumber": "PNT-DPT-18",
        "dosage": "0.5 ml DPT IM + 0.5 ml MMR SC + 2 drops OPV"
    },
    {
        "id": "vax-8",
        "milestone": "3 YEARS",
        "ageRange": "36 months",
        "targetAgeMonths": 36,
        "vaccineName": "MMR 2",
        "fullVaccineName": "JE Booster (if required)",
        "route": "Subcutaneous Injection",
        "fullRoute": "Subcutaneous",
        "diseases": "Long-term immunity maintenance against JE",
        "expectedReactions": "Rare mild arm tenderness.",
        "severityLevel": "Low Risk",
        "batchNumber": "JE-BST-3Y",
        "dosage": "0.5 ml Subcutaneous"
    },
    {
        "id": "vax-9",
        "milestone": "5 YEARS",
        "ageRange": "Prior to school entry",
        "targetAgeMonths": 60,
        "vaccineName": "DT + OPV 5 Booster",
        "fullVaccineName": "DT & OPV 5 Booster",
        "route": "Arm Injection & Oral Drops",
        "fullRoute": "Intramuscular & Oral",
        "diseases": "Diphtheria, Tetanus school-age defense",
        "expectedReactions": "Localized stiffness in arm, redness, low-grade temperature.",
        "severityLevel": "Low Risk",
        "batchNumber": "DT-OPV-5Y",
        "dosage": "0.5 ml DT IM + 2 drops OPV"
    }
]

def add_months_to_date(base_date: date, months: int) -> date:
    """Adds exact month count to a given date, handling leap years and month boundaries."""
    year = base_date.year + (base_date.month + months - 1) // 12
    month = (base_date.month + months - 1) % 12 + 1
    max_day = calendar.monthrange(year, month)[1]
    day = min(base_date.day, max_day)
    return date(year, month, day)

def format_clean_date(date_obj: date) -> str:
    """Formats date cleanly as '1 January 2023' or '14 August 2024'."""
    return f"{date_obj.day} {date_obj.strftime('%B %Y')}"

def generate_vaccine_schedule(birth_date_str: str, vaccine_records: Optional[Dict[str, Any]] = None) -> List[VaccineScheduleItem]:
    """
    Auto-calculates the complete vaccination schedule for a child based on DOB.
    Sequential rule: When a vaccine is marked as completed, the next vaccine is unlocked and can be seen!
    """
    records = vaccine_records or {}
    dob = None
    if birth_date_str:
        for fmt in ("%Y-%m-%d", "%m/%d/%Y", "%d/%m/%Y", "%Y/%m/%d"):
            try:
                dob = datetime.strptime(birth_date_str.strip(), fmt).date()
                break
            except Exception:
                pass
    if not dob:
        dob = date.today()

    today = date.today()
    schedule_items: List[VaccineScheduleItem] = []
    prev_is_completed = False

    for index, vax in enumerate(NATIONAL_VACCINE_DEFINITIONS):
        due_date = add_months_to_date(dob, vax["targetAgeMonths"])
        due_date_str = due_date.isoformat()
        
        # Check override in records
        rec = records.get(vax["id"], {})
        custom_status = rec.get("status")
        date_completed = rec.get("dateCompleted")

        # Special handling for conditional revaccination: BCG 2nd dose
        # BCG2 should display ONLY when selected scar absent; if scar is present then BCG2 is no need
        if vax["id"] == "vax-bcg2":
            vax1_rec = records.get("vax-1", {})
            vax1_rx = vax1_rec.get("reaction") or {}
            scar_status = vax1_rx.get("bcgScarStatus")
            
            # If scar is NOT absent (or scar is present) and BCG2 is not already recorded, do NOT display BCG2
            if scar_status != "absent" and custom_status != "completed":
                continue

            status = "completed" if custom_status == "completed" else "due"
            is_clickable = True
            date_completed = (date_completed or due_date_str) if custom_status == "completed" else None

            schedule_items.append(
                VaccineScheduleItem(
                    id=vax["id"],
                    milestone=vax["milestone"],
                    ageRange=vax["ageRange"],
                    targetAgeMonths=float(vax["targetAgeMonths"]),
                    vaccineName=vax["vaccineName"],
                    route=vax["route"],
                    diseases=vax["diseases"],
                    status=status,
                    dueDate=due_date_str,
                    dateCompleted=date_completed,
                    expectedReactions=vax["expectedReactions"],
                    severityLevel=vax["severityLevel"],
                    batchNumber=vax["batchNumber"],
                    dosage=vax.get("dosage"),
                    isClickable=is_clickable,
                    reaction=rec.get("reaction")
                )
            )
            # Crucial: continue without consuming or altering prev_is_completed,
            # ensuring routine schedule milestones (vax-1 -> vax-2 -> ...) unlock seamlessly.
            continue

        # Determine status and clickability
        # Constraint: A vaccine cannot be completed until the scheduled day comes (due_date <= today)
        if custom_status == "completed" and due_date <= today:
            status = "completed"
            is_clickable = True
            if not date_completed:
                date_completed = due_date_str
            prev_is_completed = True
        elif prev_is_completed:
            # "if the child is ony 18 months then next vaccine should be available, it is correctly working now"
            # Previous milestone completed => NEXT milestone unlocked & available to see!
            status = "due"
            is_clickable = True
            date_completed = None
            prev_is_completed = False
        elif index == 0:
            status = "due" if due_date <= today else "upcoming"
            is_clickable = True
            date_completed = None
            prev_is_completed = False
        elif due_date <= today:
            status = "due"
            is_clickable = True
            date_completed = None
            prev_is_completed = False
        else:
            status = "upcoming"
            is_clickable = False
            date_completed = None
            prev_is_completed = False

        schedule_items.append(
            VaccineScheduleItem(
                id=vax["id"],
                milestone=vax["milestone"],
                ageRange=vax["ageRange"],
                targetAgeMonths=float(vax["targetAgeMonths"]),
                vaccineName=vax["vaccineName"],
                route=vax["route"],
                diseases=vax["diseases"],
                status=status,
                dueDate=due_date_str,
                dateCompleted=date_completed,
                expectedReactions=vax["expectedReactions"],
                severityLevel=vax["severityLevel"],
                batchNumber=vax["batchNumber"],
                dosage=vax.get("dosage"),
                isClickable=is_clickable,
                reaction=rec.get("reaction")
            )
        )

    return schedule_items
