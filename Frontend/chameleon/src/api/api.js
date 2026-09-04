/**
 * Centralized API Configuration and HTTP Client
 * 
 * You can configure your backend URL in two ways:
 * 1. Set VITE_BACKEND_URL in your .env / .env.local file (Recommended)
 * 2. Or change the fallback URL in BACKEND_URL below
 */

// Central Backend URL Definition
export const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:8080';

// Alias exports for convenience across the codebase
export const API_BASE_URL = BACKEND_URL;
export const BASE_URL = BACKEND_URL;

/**
 * Predefined API Endpoints Dictionary
 * Centralize all backend route definitions here for easy maintenance.
 */
export const ENDPOINTS = {
  HEALTH: `${BACKEND_URL}/api/gemini/health`,
  GEMINI: {
    GENERATE: `${BACKEND_URL}/api/gemini/generate-app-json`,
    GENERATE_MULTIPART: `${BACKEND_URL}/api/gemini/generate-app`,
    MODELS: `${BACKEND_URL}/api/gemini/models`,
    HEALTH: `${BACKEND_URL}/api/gemini/health`,
  },
  APPS: {
    BASE: `${BACKEND_URL}/api/apps`,
  },
  SETTINGS: {
    BASE: `${BACKEND_URL}/api/settings`,
    TEST_KEY: `${BACKEND_URL}/api/settings/test-key`,
  },
  AUTH: {
    LOGIN: `${BACKEND_URL}/api/auth/login`,
    GOOGLE: `${BACKEND_URL}/api/auth/google`,
    SEND_OTP: `${BACKEND_URL}/api/auth/send-otp`,
    VERIFY_OTP: `${BACKEND_URL}/api/auth/verify-otp`,
    LOGOUT: `${BACKEND_URL}/api/auth/logout`,
    ME: `${BACKEND_URL}/api/auth/me`,
  },
};

/**
 * Construct a full URL from an endpoint or relative path
 * @param {string} path - e.g. '/api/users' or 'users'
 * @returns {string} Full backend URL
 */
export const getApiUrl = (path = '') => {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${BACKEND_URL}${cleanPath}`;
};

/**
 * Generic API request function handling headers, JSON serialization, and error parsing
 * @param {string} endpoint - Relative path (e.g., '/api/data') or absolute URL
 * @param {RequestInit} [options={}] - Fetch options
 * @returns {Promise<any>}
 */
export async function apiRequest(endpoint, options = {}) {
  const url = getApiUrl(endpoint);
  
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  let body = options.body;
  // Automatically stringify plain JavaScript objects
  if (
    body &&
    typeof body === 'object' &&
    !(body instanceof FormData) &&
    !(body instanceof Blob)
  ) {
    body = JSON.stringify(body);
  }

  // Remove Content-Type if uploading FormData so the browser can set multipart boundaries
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  const config = {
    ...options,
    headers,
    body,
  };

  try {
    const response = await fetch(url, config);

    // 204 No Content response
    if (response.status === 204) {
      return null;
    }

    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    const data = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      const error = new Error(
        (data && data.message) || response.statusText || 'API Request Failed'
      );
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    console.error(`[API Error] ${options.method || 'GET'} ${url}:`, err);
    throw err;
  }
}

/**
 * HTTP Method Helpers for standard API calls
 * 
 * Example usage:
 *   import { api } from './api';
 *   const data = await api.get('/api/users');
 *   const newUser = await api.post('/api/users', { name: 'John' });
 */
export const api = {
  get: (endpoint, options = {}) =>
    apiRequest(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options = {}) =>
    apiRequest(endpoint, { ...options, method: 'POST', body }),
  put: (endpoint, body, options = {}) =>
    apiRequest(endpoint, { ...options, method: 'PUT', body }),
  patch: (endpoint, body, options = {}) =>
    apiRequest(endpoint, { ...options, method: 'PATCH', body }),
  delete: (endpoint, options = {}) =>
    apiRequest(endpoint, { ...options, method: 'DELETE' }),
};

export default api;
