// Comprehensive pediatric vaccine schedule and sample data
export const INITIAL_CHILDREN = [
  {
    id: "child-1",
    name: "Child Ben",
    birthDate: "2024-04-14",
    ageMonths: 18,
    sex: "M",
    weightKg: 11.2,
    bloodGroup: "O+",
    allergies: "None reported",
    currentIllness: "",
    currentMedication: "None",
    pediatrician: "Dr. K. Perera (Lady Ridgeway Hospital)",
    emergencyContact: "+94 77 123 4567"
  },
  {
    id: "child-2",
    name: "Maya Ben",
    birthDate: "2025-10-10",
    ageMonths: 6,
    sex: "F",
    weightKg: 7.4,
    bloodGroup: "A+",
    allergies: "Mild lactose sensitivity",
    currentIllness: "",
    currentMedication: "None",
    pediatrician: "Dr. K. Perera",
    emergencyContact: "+94 77 123 4567"
  }
];

export const VACCINE_SCHEDULE = [
  {
    id: "vax-1",
    milestone: "At Birth",
    ageRange: "0 - 2 weeks",
    vaccineName: "BCG1 (Bacillus Calmette-Guérin)",
    route: "Intradermal (Right upper arm)",
    diseases: "Tuberculosis (Miliary TB & Tubercular Meningitis)",
    status: "completed",
    dateCompleted: "2024-04-15",
    expectedReactions: "Small papule after 2-4 weeks developing into tiny ulcer, heals with scar.",
    severityLevel: "Normal / Expected",
    batchNumber: "BCG-2024-A9"
  },
  {
    id: "vax-bcg2",
    milestone: "2 - 6 Months",
    ageRange: "6 weeks - 6 months",
    targetAgeMonths: 2,
    vaccineName: "BCG 2 (Revaccination)",
    route: "Intradermal (Right upper arm)",
    diseases: "Tuberculosis (Miliary TB & Tubercular Meningitis revaccination)",
    status: "due",
    expectedReactions: "Mild papule, temporary low-grade temperature or slight swelling.",
    severityLevel: "Low to Moderate Risk",
    batchNumber: "BCG-2024-B2"
  },
  {
    id: "vax-2",
    milestone: "2 Months",
    ageRange: "8 weeks",
    vaccineName: "Pentavalent 1 & OPV 1",
    route: "Intramuscular & Oral Drops",
    diseases: "Diphtheria, Tetanus, Pertussis, Hepatitis B, Hib + Polio",
    status: "completed",
    dateCompleted: "2024-06-18",
    expectedReactions: "Mild fever (38°C), soreness, redness at injection site within 6-12 hours.",
    severityLevel: "Low Risk",
    batchNumber: "PNT-8812-B"
  },
  {
    id: "vax-3",
    milestone: "4 Months",
    ageRange: "16 weeks",
    vaccineName: "Pentavalent 2, OPV 2 & IPV",
    route: "Intramuscular & Inactivated Polio",
    diseases: "Diphtheria, Pertussis, Tetanus, Hep B, Hib & Polio Booster",
    status: "completed",
    dateCompleted: "2024-08-20",
    expectedReactions: "Low-grade fever in 8-12 hours, mild swelling. Manageable with paracetamol if advised.",
    severityLevel: "Low Risk",
    batchNumber: "PNT-9043-C"
  },
  {
    id: "vax-4",
    milestone: "6 Months",
    ageRange: "24 weeks",
    vaccineName: "Pentavalent 3 & OPV 3",
    route: "Intramuscular & Oral Drops",
    diseases: "Diphtheria, Pertussis, Tetanus, Hep B, Hib & Polio 3",
    status: "completed",
    dateCompleted: "2024-10-22",
    expectedReactions: "Slight tenderness at injection site, irritability lasting <24 hours.",
    severityLevel: "Low Risk",
    batchNumber: "PNT-9921-A"
  },
  {
    id: "vax-5",
    milestone: "9 Months",
    ageRange: "9 - 12 months",
    vaccineName: "MMR 1 (Measles, Mumps, Rubella)",
    route: "Subcutaneous (Upper arm)",
    diseases: "Measles, Mumps and Rubella prevention",
    status: "completed",
    dateCompleted: "2025-01-16",
    expectedReactions: "Delayed mild rash or fever 6-10 days later. Rare immediate symptoms.",
    severityLevel: "Low Risk",
    batchNumber: "MMR-2025-X1"
  },
  {
    id: "vax-6",
    milestone: "12 Months",
    ageRange: "12 months",
    vaccineName: "JE (Live Japanese Encephalitis)",
    route: "Subcutaneous",
    diseases: "Viral encephalitis transmitted by mosquitoes",
    status: "completed",
    dateCompleted: "2025-04-18",
    expectedReactions: "Local headache or low-grade fever within 24-48 hours.",
    severityLevel: "Low Risk",
    batchNumber: "JE-8820-K"
  },
  {
    id: "vax-7",
    milestone: "18 Months (Current)",
    ageRange: "18 months",
    vaccineName: "MMR 2 & DPT Booster, OPV 4",
    route: "Intramuscular (Anterolateral thigh / Deltoid)",
    diseases: "Secondary MMR Booster & Whooping Cough Immunity",
    status: "due",
    dueDate: "2025-10-20",
    expectedReactions: "Localized swelling, transient irritability, fever peak ~8-14 hours.",
    severityLevel: "Moderate Assessment Advised",
    batchNumber: "Pending Allocation"
  },
  {
    id: "vax-8",
    milestone: "3 Years",
    ageRange: "36 months",
    vaccineName: "JE Booster (if required)",
    route: "Subcutaneous",
    diseases: "Long-term immunity maintenance against JE",
    status: "upcoming",
    dueDate: "2027-04-14",
    expectedReactions: "Rare mild arm tenderness.",
    severityLevel: "Low Risk",
    batchNumber: "Pending"
  },
  {
    id: "vax-9",
    milestone: "5 Years",
    ageRange: "Prior to school entry",
    vaccineName: "DT & OPV 5 Booster",
    route: "Intramuscular & Oral",
    diseases: "Diphtheria, Tetanus school-age defense",
    status: "upcoming",
    dueDate: "2029-04-14",
    expectedReactions: "Localized stiffness in arm, redness, low-grade temperature.",
    severityLevel: "Low Risk",
    batchNumber: "Pending"
  }
];

export const INITIAL_PREDICTIONS = [
  {
    id: 101,
    patient_identifier: "Child Ben",
    age_months: 18,
    sex: "M",
    vaccine_type: "Pentavalent2,OPV2,IPV",
    previous_reaction: "No",
    allergy: "No",
    current_illness: "No",
    medication: "No",
    has_reaction: true,
    risk_level: "Low",
    summary: "Mild anticipated localized reaction; high probability of transient low-grade fever (<38.5°C) within 8 hours. No severe systemic distress detected.",
    created_at: "2026-04-10T09:30:00Z",
    symptoms: [
      { symptom: "fever", display_name: "Fever (>38°C)", predicted: true, probability: 0.38, onset_hours: 8.4, onset_description: "Expected ~8.4h post-vaccination" },
      { symptom: "pain", display_name: "Localized Pain / Tenderness", predicted: true, probability: 0.62, onset_hours: 2.8, onset_description: "Expected ~2.8h post-vaccination" },
      { symptom: "swelling", display_name: "Site Swelling", predicted: true, probability: 0.31, onset_hours: 5.1, onset_description: "Expected ~5.1h post-vaccination" },
      { symptom: "redness", display_name: "Erythema / Redness", predicted: false, probability: 0.18, onset_hours: null, onset_description: "Low likelihood" },
      { symptom: "rash", display_name: "Systemic Rash", predicted: false, probability: 0.04, onset_hours: null, onset_description: "Unlikely" },
      { symptom: "others", display_name: "Other Systemic Signs", predicted: false, probability: 0.08, onset_hours: null, onset_description: "Unlikely" }
    ],
    notes: "Prior Pentavalent 1 went smoothly with 4 hours of fussiness."
  },
  {
    id: 102,
    patient_identifier: "Child Ben",
    age_months: 9,
    sex: "M",
    vaccine_type: "MMR1",
    previous_reaction: "No",
    allergy: "No",
    current_illness: "No",
    medication: "No",
    has_reaction: false,
    risk_level: "Low",
    summary: "Clear profile with negligible probability of immediate acute adverse reaction. Typical benign delayed immune response may appear around Day 7-10.",
    created_at: "2025-01-16T11:15:00Z",
    symptoms: [
      { symptom: "fever", display_name: "Fever (>38°C)", predicted: false, probability: 0.12, onset_hours: null, onset_description: "Unlikely" },
      { symptom: "pain", display_name: "Localized Pain", predicted: false, probability: 0.15, onset_hours: null, onset_description: "Unlikely" },
      { symptom: "swelling", display_name: "Site Swelling", predicted: false, probability: 0.09, onset_hours: null, onset_description: "Unlikely" },
      { symptom: "rash", display_name: "Systemic Rash", predicted: false, probability: 0.07, onset_hours: null, onset_description: "Unlikely" }
    ],
    notes: "Routine 9-month MMR administration."
  }
];

export const VACCINE_DROPDOWN_OPTIONS = [
  "BCG1",
  "BCG2",
  "DPT,OPV4",
  "DT,OPV5",
  "JE",
  "MMR1",
  "MMR2",
  "Pentavalent1,OPV1",
  "Pentavalent2,OPV2,IPV",
  "Pentavalent3,OPV3"
];
