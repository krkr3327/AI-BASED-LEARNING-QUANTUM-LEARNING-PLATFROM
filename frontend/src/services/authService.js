/**
 * Auth Service — handles login, signup, logout, token storage.
 * Token is persisted in localStorage under key "q_token".
 * Every authenticated request sends: Authorization: Bearer <token>
 */

const BASE = '/api/auth';
const TOKEN_KEY = 'q_token';

// ── Token helpers ─────────────────────────────────────────────────────────────

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || null;
}

function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

function authHeaders() {
  const token = getToken();
  return token
    ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    : { 'Content-Type': 'application/json' };
}

// ── Core request helper ───────────────────────────────────────────────────────

async function request(path, options = {}) {
  const res = await fetch(path, {
    ...options,
    headers: { ...authHeaders(), ...(options.headers || {}) },
  });

  let data;
  try {
    data = await res.json();
  } catch {
    data = {};
  }

  if (!res.ok) {
    // Normalise FastAPI error shapes
    let msg = `Request failed (${res.status})`;
    if (typeof data.detail === 'string') msg = data.detail;
    else if (Array.isArray(data.detail)) msg = data.detail.map(d => d.msg || JSON.stringify(d)).join('; ');
    else if (data.detail?.message) msg = data.detail.message;
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }

  return data;
}

// ── Auth API calls ────────────────────────────────────────────────────────────

/**
 * Register a new student.
 * Returns { token, profile, progress }
 */
export async function signup({ username, email, password, full_name = '', level = 'Beginner' }) {
  const data = await request(`${BASE}/signup`, {
    method: 'POST',
    body: JSON.stringify({ username, email, password, full_name, level }),
  });
  saveToken(data.token);
  if (data?.profile?.level) {
    window.dispatchEvent(new CustomEvent('learning:level_changed', { detail: { level: data.profile.level } }));
  }
  return data;
}

/**
 * Login an existing student.
 * Returns { token, profile, progress }
 */
export async function login({ username, password }) {
  const data = await request(`${BASE}/login`, {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  saveToken(data.token);
  if (data?.profile?.level) {
    window.dispatchEvent(new CustomEvent('learning:level_changed', { detail: { level: data.profile.level } }));
  }
  return data;
}

/**
 * Logout current student.
 */
export async function logout() {
  try {
    await request(`${BASE}/logout`, { method: 'POST' });
  } catch {
    // ignore server errors on logout
  }
  clearToken();
}

/**
 * Fetch the currently logged-in student.
 * Returns { profile, progress } or null if not authenticated.
 */
export async function getMe() {
  const token = getToken();
  if (!token) return null;
  try {
    const data = await request(`${BASE}/me`);
    // If backend returns demo account with no token, treat as not logged in
    if (data?.profile?.student_id === 'student_demo_1' && !token) return null;
    if (data?.profile?.level) {
      window.dispatchEvent(new CustomEvent('learning:level_changed', { detail: { level: data.profile.level } }));
    }
    return data;
  } catch {
    clearToken();
    return null;
  }
}

/**
 * True if a token exists in localStorage.
 */
export function isLoggedIn() {
  return !!getToken();
}
