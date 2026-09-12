import { buildApiUrl } from '../config/apiConfig';

export async function request(url, options = {}) {
  const fullUrl = buildApiUrl(url);
  const defaultHeaders = { 'Content-Type': 'application/json' };
  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers
    }
  };

  try {
    const res = await fetch(fullUrl, config);
    const text = await res.text();
    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { rawText: text };
    }

    if (!res.ok) {
      let errorMsg = `Request failed with status ${res.status}`;
      if (typeof data.detail === 'string') {
        errorMsg = data.detail;
      } else if (Array.isArray(data.detail)) {
        errorMsg = data.detail.map(d => (typeof d === 'object' ? (d.msg || JSON.stringify(d)) : String(d))).join('; ');
      } else if (data.detail && typeof data.detail === 'object') {
        errorMsg = data.detail.message || JSON.stringify(data.detail);
      } else if (data.message) {
        errorMsg = typeof data.message === 'string' ? data.message : JSON.stringify(data.message);
      }
      const err = new Error(errorMsg);
      err.status = res.status;
      err.data = data;
      throw err;
    }

    return data;
  } catch (err) {
    if (!err.status) {
      console.error(`Network or fetch error for ${url}:`, err);
    }
    throw err;
  }
}

export async function get(url) {
  return request(url, { method: 'GET' });
}

export async function post(url, body) {
  return request(url, { method: 'POST', body: JSON.stringify(body) });
}
