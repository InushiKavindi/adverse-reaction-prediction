const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

const STORAGE_KEYS = {
  TOKEN: "vaxcare_token",
  USER: "vaxcare_user",
  ACTIVE_CHILD: "vaxcare_active_child_id"
};

function getAuthHeaders() {
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

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

      const err = await response.json();
      return { success: false, error: err.detail || "Invalid username or password" };
    } catch (err) {
      return { success: false, error: "Unable to connect to authentication server. Please ensure backend is running." };
    }
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
      return { success: false, error: "Network error during registration" };
    }
  },

  async fetchCurrentUser() {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (!token) return null;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const user = await response.json();
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
        return user;
      }
    } catch {
      // Return cached user if offline
    }
    return this.getCurrentUser();
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
    return null;
  },

  logout() {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_CHILD);
  },

  // --- CHILDREN PROFILES ---
  async getChildren() {
    try {
      const response = await fetch(`${API_BASE_URL}/children`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const children = await response.json();
        return children.map((c) => ({
          ...c,
          ageMonths: c.age_months !== undefined ? c.age_months : c.ageMonths,
          birthDate: c.birth_date || c.birthDate,
          bloodGroup: c.blood_group || c.bloodGroup || "O+",
          currentIllness: c.current_illness !== undefined ? c.current_illness : (c.currentIllness || ""),
          currentMedication: c.current_medication !== undefined ? c.current_medication : (c.currentMedication || "")
        }));
      }
      return [];
    } catch {
      return [];
    }
  },

  async createChild(childData) {
    try {
      const payload = {
        name: childData.name,
        birth_date: childData.birthDate || childData.birth_date,
        sex: childData.sex || "M",
        age_months: childData.ageMonths !== undefined ? parseFloat(childData.ageMonths) : undefined,
        allergies: childData.allergies || "None reported",
        current_illness: childData.currentIllness !== undefined ? childData.currentIllness : (childData.current_illness || ""),
        current_medication: childData.currentMedication !== undefined ? childData.currentMedication : (childData.current_medication || ""),
        blood_group: childData.bloodGroup || "O+",
        pediatrician: childData.pediatrician || "Dr. K. Perera",
        emergency_contact: childData.emergencyContact || childData.emergency_contact
      };

      const response = await fetch(`${API_BASE_URL}/children`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const c = await response.json();
        return {
          success: true,
          data: {
            ...c,
            ageMonths: c.age_months,
            birthDate: c.birth_date,
            bloodGroup: c.blood_group,
            currentIllness: c.current_illness || "",
            currentMedication: c.current_medication || ""
          }
        };
      }

      const err = await response.json();
      return { success: false, error: err.detail || "Failed to create child profile" };
    } catch (err) {
      return { success: false, error: err.message || "Network error while saving child profile" };
    }
  },

  async updateChild(childId, childData) {
    try {
      const payload = {
        name: childData.name,
        birth_date: childData.birthDate || childData.birth_date,
        sex: childData.sex,
        age_months: childData.ageMonths !== undefined ? parseFloat(childData.ageMonths) : undefined,
        allergies: childData.allergies,
        current_illness: childData.currentIllness !== undefined ? childData.currentIllness : childData.current_illness,
        current_medication: childData.currentMedication !== undefined ? childData.currentMedication : childData.current_medication,
        blood_group: childData.bloodGroup,
        pediatrician: childData.pediatrician,
        emergency_contact: childData.emergencyContact
      };

      const response = await fetch(`${API_BASE_URL}/children/${childId}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const c = await response.json();
        return {
          success: true,
          data: {
            ...c,
            ageMonths: c.age_months,
            birthDate: c.birth_date,
            bloodGroup: c.blood_group,
            currentIllness: c.current_illness !== undefined ? c.current_illness : (c.currentIllness || ""),
            currentMedication: c.current_medication !== undefined ? c.current_medication : (c.currentMedication || "")
          }
        };
      }
      return { success: false, error: "Failed to update profile" };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  async deleteChild(childId) {
    try {
      const response = await fetch(`${API_BASE_URL}/children/${childId}`, {
        method: "DELETE",
        headers: getAuthHeaders()
      });
      return { success: response.ok };
    } catch {
      return { success: false };
    }
  },

  // --- VACCINE SCHEDULE (AUTO-CALCULATED BY BACKEND) ---
  async getChildSchedule(childId) {
    if (!childId) return [];
    try {
      const response = await fetch(`${API_BASE_URL}/children/${childId}/schedule`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        return await response.json();
      }
      return [];
    } catch {
      return [];
    }
  },

  async updateChildVaccineStatus(childId, vaxId, status, dateCompleted = null, reaction = null) {
    try {
      const response = await fetch(`${API_BASE_URL}/children/${childId}/schedule/${vaxId}`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          status,
          date_completed: dateCompleted,
          reaction
        })
      });
      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch {
      return null;
    }
  },

  // --- PREDICTIONS & ONSET FORECASTS ---
  async predict(patientInput, saveRecord = false, includeExplanation = false) {
    try {
      const params = new URLSearchParams();
      params.set("save_record", saveRecord ? "true" : "false");
      if (includeExplanation) {
        params.set("include_explanation", "true");
      }
      const url = `${API_BASE_URL}/predict?${params.toString()}`;
      const response = await fetch(url, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(patientInput)
      });
      if (response.ok) {
        const result = await response.json();
        return { success: true, data: result };
      }
      const err = await response.json();
      return { success: false, error: err.detail || "Prediction request failed" };
    } catch (err) {
      return { success: false, error: err.message || "Failed to connect to ML prediction service" };
    }
  },

  async getPredictionHistory() {
    try {
      const response = await fetch(`${API_BASE_URL}/predict/history`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        return await response.json();
      }
      return [];
    } catch {
      return [];
    }
  },

  async deletePrediction(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/predict/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders()
      });
      return { success: response.ok };
    } catch {
      return { success: false };
    }
  }
};
