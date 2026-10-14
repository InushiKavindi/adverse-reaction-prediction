import { INITIAL_PREDICTIONS, VACCINE_SCHEDULE } from "./mockData";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

const STORAGE_KEYS = {
  TOKEN: "vaxcare_token",
  USER: "vaxcare_user",
  PREDICTIONS: "vaxcare_predictions",
  SCHEDULE: "vaxcare_schedule",
  CHILDREN: "vaxcare_children",
  ACTIVE_CHILD: "vaxcare_active_child"
};

// Initialize localStorage fallback
function initStorage() {
  if (!localStorage.getItem(STORAGE_KEYS.PREDICTIONS)) {
    localStorage.setItem(STORAGE_KEYS.PREDICTIONS, JSON.stringify(INITIAL_PREDICTIONS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SCHEDULE)) {
    localStorage.setItem(STORAGE_KEYS.SCHEDULE, JSON.stringify(VACCINE_SCHEDULE));
  }
}
initStorage();

export const api = {
  // --- AUTHENTICATION ---
  async login(username, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem(STORAGE_KEYS.TOKEN, data.access_token);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user));
        return { success: true, user: data.user, token: data.access_token };
      }
    } catch {
      // Backend not running, fallback to demo auth
    }

    // Mock Login fallback
    const mockUser = {
      id: 1,
      username: username || "parent_ben",
      full_name: username === "parent_ben" ? "Parent Ben" : (username.charAt(0).toUpperCase() + username.slice(1)),
      email: `${username || "parent_ben"}@vaxcare.health`,
      role: "parent",
      is_active: true,
      created_at: new Date().toISOString()
    };
    const mockToken = "mock_jwt_token_" + Date.now();
    localStorage.setItem(STORAGE_KEYS.TOKEN, mockToken);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(mockUser));
    return { success: true, user: mockUser, token: mockToken };
  },

  async register(userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData)
      });
      if (response.ok) {
        const data = await response.json();
        return { success: true, user: data };
      }
      const err = await response.json();
      return { success: false, error: err.detail || "Registration failed" };
    } catch {
      // Mock registration fallback
      const mockUser = {
        id: Date.now(),
        username: userData.username,
        full_name: userData.full_name || userData.username,
        email: userData.email,
        role: userData.role || "parent",
        is_active: true,
        created_at: new Date().toISOString()
      };
      return { success: true, user: mockUser };
    }
  },

  getCurrentUser() {
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        return null;
      }
    }
    // Default logged in user matching screenshot
    const defaultUser = {
      id: 1,
      username: "parent_ben",
      full_name: "Parent Ben",
      email: "ben.parent@vaxcare.health",
      role: "parent",
      activeChild: "Child Ben",
      childAge: "18 mos"
    };
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(defaultUser));
    return defaultUser;
  },

  logout() {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  },

  // --- PREDICTIONS ---
  async predict(patientInput) {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    try {
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const response = await fetch(`${API_BASE_URL}/predict`, {
        method: "POST",
        headers,
        body: JSON.stringify(patientInput)
      });
      if (response.ok) {
        const result = await response.json();
        // save to local history as well
        this.saveLocalPrediction({ ...result, ...patientInput });
        return { success: true, data: result };
      }
    } catch {
      // Backend not running, use local ML heuristic engine
    }

    // Local clinical ML simulation based on CatBoost model rules
    const result = this.simulateMLPrediction(patientInput);
    this.saveLocalPrediction({ ...result, ...patientInput });
    return { success: true, data: result };
  },

  simulateMLPrediction(input) {
    const hasPriorReaction = input.previous_reaction === "Yes";
    const hasAllergy = input.allergy === "Yes";
    const hasCurrentIllness = input.current_illness === "Yes";
    const isPentavalent = input.vaccine_type?.includes("Pentavalent");
    const isDPT = input.vaccine_type?.includes("DPT");

    // Dynamic probabilities based on features
    let feverProb = 0.22;
    let painProb = 0.35;
    let swellingProb = 0.20;
    let rednessProb = 0.15;
    let rashProb = 0.05;

    if (isPentavalent || isDPT) {
      feverProb += 0.25;
      painProb += 0.30;
      swellingProb += 0.15;
    }
    if (hasPriorReaction) {
      feverProb += 0.20;
      swellingProb += 0.25;
      painProb += 0.15;
    }
    if (hasCurrentIllness) {
      feverProb += 0.22;
    }
    if (hasAllergy) {
      rashProb += 0.20;
      swellingProb += 0.15;
    }

    feverProb = Math.min(0.95, feverProb);
    painProb = Math.min(0.92, painProb);
    swellingProb = Math.min(0.88, swellingProb);
    rednessProb = Math.min(0.85, rednessProb);
    rashProb = Math.min(0.70, rashProb);

    const maxProb = Math.max(feverProb, painProb, swellingProb);
    let risk_level = "Low";
    if (maxProb > 0.70 || (hasPriorReaction && hasCurrentIllness)) {
      risk_level = "High";
    } else if (maxProb > 0.45) {
      risk_level = "Medium";
    }

    const feverOnset = +(4.0 + Math.random() * 6).toFixed(1);
    const painOnset = +(1.5 + Math.random() * 3).toFixed(1);
    const swellingOnset = +(3.0 + Math.random() * 4).toFixed(1);

    const symptoms = [
      {
        symptom: "fever",
        display_name: "Fever (>38°C)",
        predicted: feverProb > 0.4,
        probability: +feverProb.toFixed(2),
        onset_hours: feverProb > 0.4 ? feverOnset : null,
        onset_description: feverProb > 0.4 ? `Expected ~${feverOnset}h post-vaccination` : "Unlikely"
      },
      {
        symptom: "pain",
        display_name: "Localized Pain / Tenderness",
        predicted: painProb > 0.4,
        probability: +painProb.toFixed(2),
        onset_hours: painProb > 0.4 ? painOnset : null,
        onset_description: painProb > 0.4 ? `Expected ~${painOnset}h post-vaccination` : "Unlikely"
      },
      {
        symptom: "swelling",
        display_name: "Site Swelling & Induration",
        predicted: swellingProb > 0.4,
        probability: +swellingProb.toFixed(2),
        onset_hours: swellingProb > 0.4 ? swellingOnset : null,
        onset_description: swellingProb > 0.4 ? `Expected ~${swellingOnset}h post-vaccination` : "Unlikely"
      },
      {
        symptom: "redness",
        display_name: "Localized Erythema / Redness",
        predicted: rednessProb > 0.4,
        probability: +rednessProb.toFixed(2),
        onset_hours: null,
        onset_description: rednessProb > 0.4 ? "Mild transient flushing" : "Unlikely"
      },
      {
        symptom: "rash",
        display_name: "Systemic Urticaria / Rash",
        predicted: rashProb > 0.35,
        probability: +rashProb.toFixed(2),
        onset_hours: null,
        onset_description: rashProb > 0.35 ? "Monitor closely for allergic spread" : "Unlikely"
      }
    ];

    const has_reaction = symptoms.some((s) => s.predicted);

    let summary = "Mild physiological immune response anticipated. High safety profile.";
    if (risk_level === "High") {
      summary = "Elevated risk of localized tenderness and fever peak. Consult your pediatrician before administration.";
    } else if (risk_level === "Medium") {
      summary = "Moderate likelihood of transient post-immunization fever and local soreness. Keep cold compresses ready.";
    }

    return {
      id: Date.now(),
      patient_identifier: input.patient_identifier || "Child",
      has_reaction,
      risk_level,
      summary,
      symptoms,
      created_at: new Date().toISOString()
    };
  },

  saveLocalPrediction(record) {
    const list = this.getLocalPredictions();
    list.unshift({ ...record, id: record.id || Date.now(), created_at: record.created_at || new Date().toISOString() });
    localStorage.setItem(STORAGE_KEYS.PREDICTIONS, JSON.stringify(list));
  },

  getLocalPredictions() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PREDICTIONS);
      return data ? JSON.parse(data) : INITIAL_PREDICTIONS;
    } catch {
      return INITIAL_PREDICTIONS;
    }
  },

  deletePrediction(id) {
    const list = this.getLocalPredictions().filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PREDICTIONS, JSON.stringify(list));
    return { success: true };
  },

  // --- SCHEDULE ---
  getSchedule() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SCHEDULE);
      return data ? JSON.parse(data) : VACCINE_SCHEDULE;
    } catch {
      return VACCINE_SCHEDULE;
    }
  },

  updateScheduleStatus(id, newStatus) {
    const schedule = this.getSchedule().map((item) => {
      if (item.id === id) {
        return {
          ...item,
          status: newStatus,
          dateCompleted: newStatus === "completed" ? new Date().toISOString().split("T")[0] : item.dateCompleted
        };
      }
      return item;
    });
    localStorage.setItem(STORAGE_KEYS.SCHEDULE, JSON.stringify(schedule));
    return schedule;
  }
};
