import { buildApiUrl } from "../config/apiConfig";

const TOKEN_KEY = "platform_token";
const USER_KEY = "platform_user";
const ROLE_KEY = "platform_role";

const API_BASE = "/api/platform";

export const platformAuth = {
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  getUser() {
    try {
      const u = localStorage.getItem(USER_KEY);
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  },

  getRole() {
    return localStorage.getItem(ROLE_KEY) || (this.getUser()?.role) || null;
  },

  isAuthenticated() {
    return !!this.getToken() && !!this.getUser();
  },

  isTrainer() {
    return this.getRole() === "trainer";
  },

  isLearner() {
    return this.getRole() === "learner";
  },

  async login(email, password, role) {
    const res = await fetch(buildApiUrl(`${API_BASE}/auth/login`), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Login failed" }));
      throw new Error(err.detail || "Invalid credentials");
    }
    const data = await res.json();
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    localStorage.setItem(ROLE_KEY, data.user.role);
    return data;
  },

  async register(payload) {
    const res = await fetch(buildApiUrl(`${API_BASE}/auth/register`), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Registration failed" }));
      throw new Error(err.detail || "Registration failed");
    }
    const data = await res.json();
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    localStorage.setItem(ROLE_KEY, data.user.role);
    return data;
  },

  async getMe() {
    const token = this.getToken();
    if (!token) return null;
    const res = await fetch(buildApiUrl(`${API_BASE}/auth/me`), {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const user = await res.json();
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      localStorage.setItem(ROLE_KEY, user.role);
      return user;
    }
    return null;
  },

  async updateProfile(updates) {
    const token = this.getToken();
    const res = await fetch(buildApiUrl(`${API_BASE}/profile`), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(updates)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Update failed" }));
      throw new Error(err.detail || "Profile update failed");
    }
    const updated = await res.json();
    localStorage.setItem(USER_KEY, JSON.stringify(updated));
    return updated;
  },

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(ROLE_KEY);
  }
};
