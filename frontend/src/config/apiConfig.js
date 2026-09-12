/**
 * Central API Configuration
 * 
 * To point to the PHP backend directly (e.g. running on port 8080):
 * Set VITE_API_URL="http://localhost:8080" in your .env or leave empty for same-origin proxy.
 */

export const API_BASE_URL = import.meta.env.VITE_API_URL || "";

export function buildApiUrl(endpoint) {
  if (endpoint.startsWith("http://") || endpoint.startsWith("https://")) {
    return endpoint;
  }
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
}
