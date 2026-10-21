from datetime import date, datetime
import calendar
from typing import List, Dict, Any, Optional
from backend.app.schemas.child import VaccineScheduleItem

NATIONAL_VACCINE_DEFINITIONS = [
    {
        "id": "vax-1",
        "milestone": "BIRTH",
        "ageRange": "Birth",
        "targetAgeMonths": 0,
        "vaccineName": "BCG",
        "fullVaccineName": "BCG",
        "route": "Intradermal (into the skin)",
        "fullRoute": "Intradermal (into the skin)",
        "diseases": "Tuberculosis (TB), particularly severe childhood TB such as TB meningitis and disseminated TB",
        "expectedReactions": "Small papule after 2-4 weeks developing into tiny ulcer, heals with scar.",
        "severityLevel": "Normal / Expected",
        "batchNumber": "BCG-2024-A9",
        "dosage": "0.05 ml (infant < 1 month) / 0.1 ml",
        "vaccines": [
            {
                "name": "BCG",
                "route": "Intradermal (into the skin)",
                "diseases": "Tuberculosis (TB), particularly severe childhood TB such as TB meningitis and disseminated TB"
            }
        ]
    },
    {
        "id": "vax-bcg2",
        "milestone": "2 - 6 MONTHS",
        "ageRange": "6 weeks - 6 months",
        "targetAgeMonths": 2,
        "vaccineName": "BCG 2 (Revaccination)",
        "fullVaccineName": "BCG 2nd Dose (Revaccination if Scar Absent)",
        "route": "Intradermal (into the skin)",
        "fullRoute": "Intradermal (into the skin)",
        "diseases": "Tuberculosis (TB), particularly severe childhood TB such as TB meningitis and disseminated TB (revaccination)",
        "expectedReactions": "Mild fever, localized redness or swelling, papule formation.",
        "severityLevel": "Low to Moderate Risk",
        "batchNumber": "BCG-2024-B2",
        "dosage": "0.1 ml Intradermal",
        "vaccines": [
            {
                "name": "BCG 2 (Revaccination)",
                "route": "Intradermal (into the skin)",
                "diseases": "Tuberculosis (TB), particularly severe childhood TB such as TB meningitis and disseminated TB (revaccination)"
            }
        ]
    },
    {
        "id": "vax-2",
        "milestone": "2 MONTHS",
        "ageRange": "2 months",
        "targetAgeMonths": 2,
        "vaccineName": "Pentavalent 1 + OPV 1",
        "fullVaccineName": "Pentavalent 1 & OPV 1",
        "route": "Pentavalent 1: Intramuscular (into a muscle) | OPV 1: Oral (by mouth)",
        "fullRoute": "Pentavalent 1: Intramuscular (into a muscle) | OPV 1: Oral (by mouth)",
        "diseases": "Pentavalent 1: Diphtheria, tetanus, pertussis (whooping cough), hepatitis B, and Haemophilus influenzae type b (Hib) infections | OPV 1: Poliomyelitis (polio)",
        "expectedReactions": "Mild fever (38°C), soreness, redness at injection site within 6-12 hours.",
        "severityLevel": "Low Risk",
        "batchNumber": "PNT-8812-B",
        "dosage": "0.5 ml IM + 2 drops oral OPV",
        "vaccines": [
            {
                "name": "Pentavalent 1",
                "route": "Intramuscular (into a muscle)",
                "diseases": "Diphtheria, tetanus, pertussis (whooping cough), hepatitis B, and Haemophilus influenzae type b (Hib) infections"
            },
            {
                "name": "OPV 1",
                "route": "Oral (by mouth)",
                "diseases": "Poliomyelitis (polio)"
            }
        ]
    },
    {
        "id": "vax-3",
        "milestone": "4 MONTHS",
        "ageRange": "4 months",
        "targetAgeMonths": 4,
        "vaccineName": "Pentavalent 2 + OPV 2 + IPV",
        "fullVaccineName": "Pentavalent 2, OPV 2 & IPV",
        "route": "Pentavalent 2: Intramuscular | OPV 2: Oral | IPV: Intradermal",
        "fullRoute": "Pentavalent 2: Intramuscular | OPV 2: Oral | IPV: Intradermal",
        "diseases": "Pentavalent 2: Diphtheria, tetanus, pertussis, hepatitis B, and Hib infections | OPV 2 & IPV: Poliomyelitis (polio)",
        "expectedReactions": "Low-grade fever in 8-12 hours, mild swelling. Manageable with paracetamol if advised.",
        "severityLevel": "Low Risk",
        "batchNumber": "PNT-9043-C",
        "dosage": "0.5 ml IM + 2 drops oral OPV + 0.5 ml IPV",
        "vaccines": [
            {
                "name": "Pentavalent 2",
                "route": "Intramuscular",
                "diseases": "Diphtheria, tetanus, pertussis, hepatitis B, and Hib infections"
            },
            {
                "name": "OPV 2",
                "route": "Oral",
                "diseases": "Poliomyelitis (polio)"
            },
            {
                "name": "IPV",
                "route": "Intradermal",
                "diseases": "Poliomyelitis (polio)"
            }
        ]
    },
    {
        "id": "vax-4",
        "milestone": "6 MONTHS",
        "ageRange": "6 months",
        "targetAgeMonths": 6,
        "vaccineName": "Pentavalent 3 + OPV 3",
        "fullVaccineName": "Pentavalent 3 & OPV 3",
        "route": "Pentavalent 3: Intramuscular | OPV 3: Oral",
        "fullRoute": "Pentavalent 3: Intramuscular | OPV 3: Oral",
        "diseases": "Pentavalent 3: Diphtheria, tetanus, pertussis, hepatitis B, and Hib infections | OPV 3: Poliomyelitis (polio)",
        "expectedReactions": "Slight tenderness at injection site, irritability lasting <24 hours.",
        "severityLevel": "Low Risk",
        "batchNumber": "PNT-9921-A",
        "dosage": "0.5 ml IM + 2 drops oral OPV",
        "vaccines": [
            {
                "name": "Pentavalent 3",
                "route": "Intramuscular",
                "diseases": "Diphtheria, tetanus, pertussis, hepatitis B, and Hib infections"
            },
            {
                "name": "OPV 3",
                "route": "Oral",
                "diseases": "Poliomyelitis (polio)"
            }
        ]
    },
    {
        "id": "vax-5",
        "milestone": "9 MONTHS",
        "ageRange": "9 months",
        "targetAgeMonths": 9,
        "vaccineName": "MMR 1",
        "fullVaccineName": "MMR 1",
        "route": "Subcutaneous (under the skin)",
        "fullRoute": "Subcutaneous (under the skin)",
        "diseases": "Measles, mumps, and rubella",
        "expectedReactions": "Delayed mild rash or fever 6-10 days later. Rare immediate symptoms.",
        "severityLevel": "Low Risk",
        "batchNumber": "MMR-2025-X1",
        "dosage": "0.5 ml Subcutaneous",
        "vaccines": [
            {
                "name": "MMR 1",
                "route": "Subcutaneous (under the skin)",
                "diseases": "Measles, mumps, and rubella"
            }
        ]
    },
    {
        "id": "vax-6",
        "milestone": "12 MONTHS",
        "ageRange": "12 months",
        "targetAgeMonths": 12,
        "vaccineName": "JE (live vaccine)",
        "fullVaccineName": "JE (live vaccine)",
        "route": "Subcutaneous",
        "fullRoute": "Subcutaneous",
        "diseases": "Japanese encephalitis",
        "expectedReactions": "Local headache or low-grade fever within 24-48 hours.",
        "severityLevel": "Low Risk",
        "batchNumber": "JE-8820-K",
        "dosage": "0.5 ml Subcutaneous",
        "vaccines": [
            {
                "name": "JE (live vaccine)",
                "route": "Subcutaneous",
                "diseases": "Japanese encephalitis"
            }
        ]
    },
    {
        "id": "vax-7",
        "milestone": "18 MONTHS",
        "ageRange": "18 months",
        "targetAgeMonths": 18,
        "vaccineName": "DTP + OPV 4",
        "fullVaccineName": "DTP & OPV 4",
        "route": "DTP: Intramuscular | OPV 4: Oral",
        "fullRoute": "DTP: Intramuscular | OPV 4: Oral",
        "diseases": "DTP: Diphtheria, tetanus, and pertussis | OPV 4: Poliomyelitis (polio)",
        "expectedReactions": "Localized swelling, transient irritability, fever peak ~8-14 hours.",
        "severityLevel": "Moderate Assessment Advised",
        "batchNumber": "PNT-DPT-18",
        "dosage": "0.5 ml DTP IM + 2 drops OPV",
        "vaccines": [
            {
                "name": "DTP",
                "route": "Intramuscular",
                "diseases": "Diphtheria, tetanus, and pertussis"
            },
            {
                "name": "OPV 4",
                "route": "Oral",
                "diseases": "Poliomyelitis (polio)"
            }
        ]
    },
    {
        "id": "vax-8",
        "milestone": "36 MONTHS (3 YEARS)",
        "ageRange": "36 months (3 years)",
        "targetAgeMonths": 36,
        "vaccineName": "MMR 2",
        "fullVaccineName": "MMR 2",
        "route": "Subcutaneous",
        "fullRoute": "Subcutaneous",
        "diseases": "Measles, mumps, and rubella",
        "expectedReactions": "Rare mild arm tenderness.",
        "severityLevel": "Low Risk",
        "batchNumber": "MMR-BST-3Y",
        "dosage": "0.5 ml Subcutaneous",
        "vaccines": [
            {
                "name": "MMR 2",
                "route": "Subcutaneous",
                "diseases": "Measles, mumps, and rubella"
            }
        ]
    },
    {
        "id": "vax-9",
        "milestone": "60 MONTHS (5 YEARS)",
        "ageRange": "60 months (5 years)",
        "targetAgeMonths": 60,
        "vaccineName": "DT + OPV 5",
        "fullVaccineName": "DT & OPV 5",
        "route": "DT: Intramuscular | OPV 5: Oral",
        "fullRoute": "DT: Intramuscular | OPV 5: Oral",
        "diseases": "DT: Diphtheria and tetanus | OPV 5: Poliomyelitis (polio)",
        "expectedReactions": "Localized stiffness in arm, redness, low-grade temperature.",
        "severityLevel": "Low Risk",
        "batchNumber": "DT-OPV-5Y",
        "dosage": "0.5 ml DT IM + 2 drops OPV",
        "vaccines": [
            {
                "name": "DT",
                "route": "Intramuscular",
                "diseases": "Diphtheria and tetanus"
            },
            {
                "name": "OPV 5",
                "route": "Oral",
                "diseases": "Poliomyelitis (polio)"
            }
        ]
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
            
            # If scar is NOT absent (or scar is present), do NOT display BCG2
            if scar_status != "absent":
                continue

            # Allow parent to set/override scheduled date for BCG2 (recommended by doctor)
            custom_due_date = rec.get("dueDate") or (rec.get("reaction") or {}).get("scheduledDate")
            target_age = float(vax["targetAgeMonths"])
            if custom_due_date:
                due_date_str = custom_due_date
                try:
                    s_date = datetime.strptime(custom_due_date.strip(), "%Y-%m-%d").date()
                    calc_months = (s_date.year - dob.year) * 12 + (s_date.month - dob.month)
                    if s_date.day < dob.day:
                        calc_months -= 1
                    target_age = max(1.0, float(calc_months))
                except Exception:
                    pass

            if custom_status == "completed":
                status = "completed"
            elif custom_due_date:
                try:
                    s_date = datetime.strptime(custom_due_date.strip(), "%Y-%m-%d").date()
                    status = "due" if s_date <= today else "upcoming"
                except Exception:
                    status = "due"
            else:
                status = "due" if due_date <= today else "upcoming"

            is_clickable = True
            date_completed = (date_completed or due_date_str) if custom_status == "completed" else None

            schedule_items.append(
                VaccineScheduleItem(
                    id=vax["id"],
                    milestone=vax["milestone"],
                    ageRange=vax["ageRange"],
                    targetAgeMonths=target_age,
                    vaccineName=vax["vaccineName"],
                    route=vax["route"],
                    diseases=vax["diseases"],
                    status=status,
                    dueDate=due_date_str,
                    scheduledDateDob=None,
                    customScheduledDate=custom_due_date,
                    dateCompleted=date_completed,
                    expectedReactions=vax["expectedReactions"],
                    severityLevel=vax["severityLevel"],
                    batchNumber=vax["batchNumber"],
                    dosage=vax.get("dosage"),
                    isClickable=is_clickable,
                    reaction=rec.get("reaction"),
                    vaccines=vax.get("vaccines")
                )
            )
            # Crucial: continue without consuming or altering prev_is_completed,
            # ensuring routine schedule milestones (vax-1 -> vax-2 -> ...) unlock seamlessly.
            continue

        # Check if parent/doctor added a newly scheduled date
        custom_due_date = rec.get("dueDate") or (rec.get("reaction") or {}).get("scheduledDate")
        effective_due_date_str = custom_due_date if custom_due_date else due_date_str
        try:
            effective_due_date = datetime.strptime(effective_due_date_str.strip(), "%Y-%m-%d").date()
        except Exception:
            effective_due_date = due_date

        # Determine status and clickability
        # Constraint: A vaccine cannot be completed until the scheduled day comes
        if custom_status == "completed" and effective_due_date <= today:
            status = "completed"
            is_clickable = True
            if not date_completed:
                date_completed = effective_due_date_str
            prev_is_completed = True
        elif prev_is_completed:
            # Previous milestone completed => NEXT milestone unlocked & available to see!
            status = "due"
            is_clickable = True
            date_completed = None
            prev_is_completed = False
        elif index == 0:
            status = "due" if effective_due_date <= today else "upcoming"
            is_clickable = True
            date_completed = None
            prev_is_completed = False
        elif effective_due_date <= today:
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
                dueDate=effective_due_date_str,
                scheduledDateDob=due_date_str,
                customScheduledDate=custom_due_date,
                dateCompleted=date_completed,
                expectedReactions=vax["expectedReactions"],
                severityLevel=vax["severityLevel"],
                batchNumber=vax["batchNumber"],
                dosage=vax.get("dosage"),
                isClickable=is_clickable,
                reaction=rec.get("reaction"),
                vaccines=vax.get("vaccines")
            )
        )

    return schedule_items
