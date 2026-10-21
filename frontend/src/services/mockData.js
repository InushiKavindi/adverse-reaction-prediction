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
    ageRange: "Birth",
    vaccineName: "BCG",
    route: "Intradermal (into the skin)",
    fullRoute: "Intradermal (into the skin)",
    diseases: "Tuberculosis (TB), particularly severe childhood TB such as TB meningitis and disseminated TB",
    status: "completed",
    dateCompleted: "2024-04-15",
    expectedReactions: "Small papule after 2-4 weeks developing into tiny ulcer, heals with scar.",
    severityLevel: "Normal / Expected",
    batchNumber: "BCG-2024-A9",
    vaccines: [
      {
        name: "BCG",
        route: "Intradermal (into the skin)",
        diseases: "Tuberculosis (TB), particularly severe childhood TB such as TB meningitis and disseminated TB"
      }
    ]
  },
  {
    id: "vax-bcg2",
    milestone: "2 - 6 Months",
    ageRange: "6 weeks - 6 months",
    targetAgeMonths: 2,
    vaccineName: "BCG 2 (Revaccination)",
    route: "Intradermal (into the skin)",
    fullRoute: "Intradermal (into the skin)",
    diseases: "Tuberculosis (TB), particularly severe childhood TB such as TB meningitis and disseminated TB (revaccination)",
    status: "due",
    expectedReactions: "Mild papule, temporary low-grade temperature or slight swelling.",
    severityLevel: "Low to Moderate Risk",
    batchNumber: "BCG-2024-B2",
    vaccines: [
      {
        name: "BCG 2 (Revaccination)",
        route: "Intradermal (into the skin)",
        diseases: "Tuberculosis (TB), particularly severe childhood TB such as TB meningitis and disseminated TB (revaccination)"
      }
    ]
  },
  {
    id: "vax-2",
    milestone: "2 Months",
    ageRange: "2 months",
    vaccineName: "Pentavalent 1 + OPV 1",
    route: "Pentavalent 1: Intramuscular (into a muscle) | OPV 1: Oral (by mouth)",
    fullRoute: "Pentavalent 1: Intramuscular (into a muscle) | OPV 1: Oral (by mouth)",
    diseases: "Pentavalent 1: Diphtheria, tetanus, pertussis (whooping cough), hepatitis B, and Haemophilus influenzae type b (Hib) infections | OPV 1: Poliomyelitis (polio)",
    status: "completed",
    dateCompleted: "2024-06-18",
    expectedReactions: "Mild fever (38°C), soreness, redness at injection site within 6-12 hours.",
    severityLevel: "Low Risk",
    batchNumber: "PNT-8812-B",
    vaccines: [
      {
        name: "Pentavalent 1",
        route: "Intramuscular (into a muscle)",
        diseases: "Diphtheria, tetanus, pertussis (whooping cough), hepatitis B, and Haemophilus influenzae type b (Hib) infections"
      },
      {
        name: "OPV 1",
        route: "Oral (by mouth)",
        diseases: "Poliomyelitis (polio)"
      }
    ]
  },
  {
    id: "vax-3",
    milestone: "4 Months",
    ageRange: "4 months",
    vaccineName: "Pentavalent 2 + OPV 2 + IPV",
    route: "Pentavalent 2: Intramuscular | OPV 2: Oral | IPV: Intradermal",
    fullRoute: "Pentavalent 2: Intramuscular | OPV 2: Oral | IPV: Intradermal",
    diseases: "Pentavalent 2: Diphtheria, tetanus, pertussis, hepatitis B, and Hib infections | OPV 2 & IPV: Poliomyelitis (polio)",
    status: "completed",
    dateCompleted: "2024-08-20",
    expectedReactions: "Low-grade fever in 8-12 hours, mild swelling. Manageable with paracetamol if advised.",
    severityLevel: "Low Risk",
    batchNumber: "PNT-9043-C",
    vaccines: [
      {
        name: "Pentavalent 2",
        route: "Intramuscular",
        diseases: "Diphtheria, tetanus, pertussis, hepatitis B, and Hib infections"
      },
      {
        name: "OPV 2",
        route: "Oral",
        diseases: "Poliomyelitis (polio)"
      },
      {
        name: "IPV",
        route: "Intradermal",
        diseases: "Poliomyelitis (polio)"
      }
    ]
  },
  {
    id: "vax-4",
    milestone: "6 Months",
    ageRange: "6 months",
    vaccineName: "Pentavalent 3 + OPV 3",
    route: "Pentavalent 3: Intramuscular | OPV 3: Oral",
    fullRoute: "Pentavalent 3: Intramuscular | OPV 3: Oral",
    diseases: "Pentavalent 3: Diphtheria, tetanus, pertussis, hepatitis B, and Hib infections | OPV 3: Poliomyelitis (polio)",
    status: "completed",
    dateCompleted: "2024-10-22",
    expectedReactions: "Slight tenderness at injection site, irritability lasting <24 hours.",
    severityLevel: "Low Risk",
    batchNumber: "PNT-9921-A",
    vaccines: [
      {
        name: "Pentavalent 3",
        route: "Intramuscular",
        diseases: "Diphtheria, tetanus, pertussis, hepatitis B, and Hib infections"
      },
      {
        name: "OPV 3",
        route: "Oral",
        diseases: "Poliomyelitis (polio)"
      }
    ]
  },
  {
    id: "vax-5",
    milestone: "9 Months",
    ageRange: "9 months",
    vaccineName: "MMR 1",
    route: "Subcutaneous (under the skin)",
    fullRoute: "Subcutaneous (under the skin)",
    diseases: "Measles, mumps, and rubella",
    status: "completed",
    dateCompleted: "2025-01-16",
    expectedReactions: "Delayed mild rash or fever 6-10 days later. Rare immediate symptoms.",
    severityLevel: "Low Risk",
    batchNumber: "MMR-2025-X1",
    vaccines: [
      {
        name: "MMR 1",
        route: "Subcutaneous (under the skin)",
        diseases: "Measles, mumps, and rubella"
      }
    ]
  },
  {
    id: "vax-6",
    milestone: "12 Months",
    ageRange: "12 months",
    vaccineName: "JE (live vaccine)",
    route: "Subcutaneous",
    fullRoute: "Subcutaneous",
    diseases: "Japanese encephalitis",
    status: "completed",
    dateCompleted: "2025-04-18",
    expectedReactions: "Local headache or low-grade fever within 24-48 hours.",
    severityLevel: "Low Risk",
    batchNumber: "JE-8820-K",
    vaccines: [
      {
        name: "JE (live vaccine)",
        route: "Subcutaneous",
        diseases: "Japanese encephalitis"
      }
    ]
  },
  {
    id: "vax-7",
    milestone: "18 Months (Current)",
    ageRange: "18 months",
    vaccineName: "DTP + OPV 4",
    route: "DTP: Intramuscular | OPV 4: Oral",
    fullRoute: "DTP: Intramuscular | OPV 4: Oral",
    diseases: "DTP: Diphtheria, tetanus, and pertussis | OPV 4: Poliomyelitis (polio)",
    status: "due",
    dueDate: "2025-10-20",
    expectedReactions: "Localized swelling, transient irritability, fever peak ~8-14 hours.",
    severityLevel: "Moderate Assessment Advised",
    batchNumber: "Pending Allocation",
    vaccines: [
      {
        name: "DTP",
        route: "Intramuscular",
        diseases: "Diphtheria, tetanus, and pertussis"
      },
      {
        name: "OPV 4",
        route: "Oral",
        diseases: "Poliomyelitis (polio)"
      }
    ]
  },
  {
    id: "vax-8",
    milestone: "36 Months (3 Years)",
    ageRange: "36 months (3 years)",
    vaccineName: "MMR 2",
    route: "Subcutaneous",
    fullRoute: "Subcutaneous",
    diseases: "Measles, mumps, and rubella",
    status: "upcoming",
    dueDate: "2027-04-14",
    expectedReactions: "Rare mild arm tenderness.",
    severityLevel: "Low Risk",
    batchNumber: "Pending",
    vaccines: [
      {
        name: "MMR 2",
        route: "Subcutaneous",
        diseases: "Measles, mumps, and rubella"
      }
    ]
  },
  {
    id: "vax-9",
    milestone: "60 Months (5 Years)",
    ageRange: "60 months (5 years)",
    vaccineName: "DT + OPV 5",
    route: "DT: Intramuscular | OPV 5: Oral",
    fullRoute: "DT: Intramuscular | OPV 5: Oral",
    diseases: "DT: Diphtheria and tetanus | OPV 5: Poliomyelitis (polio)",
    status: "upcoming",
    dueDate: "2029-04-14",
    expectedReactions: "Localized stiffness in arm, redness, low-grade temperature.",
    severityLevel: "Low Risk",
    batchNumber: "Pending",
    vaccines: [
      {
        name: "DT",
        route: "Intramuscular",
        diseases: "Diphtheria and tetanus"
      },
      {
        name: "OPV 5",
        route: "Oral",
        diseases: "Poliomyelitis (polio)"
      }
    ]
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
