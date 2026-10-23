/**
 * The only place that calls fetch. Everything else goes through api/*.js.
 * Base URL comes from VITE_API_URL (see .env.example); defaults to the local json-server.
 */
const BASE_URL = import.meta.env?.VITE_API_URL ?? 'http://localhost:3001';

export class ApiError extends Error {
  constructor(message, status = 0) {
    super(message);
    this.name = 'ApiError';
    this.status = status; // 0 = network error (API not reachable)
  }
}

async function request(path, { method = 'GET', body } = {}) {
  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError('Cannot reach the API. Is `npm run api` running?', 0);
  }
  if (!response.ok) throw new ApiError(`${method} ${path} failed (${response.status})`, response.status);
  return response.status === 204 ? null : response.json();
}

export const http = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body }),
  put: (path, body) => request(path, { method: 'PUT', body }),
  patch: (path, body) => request(path, { method: 'PATCH', body }),
  delete: (path) => request(path, { method: 'DELETE' }),
};
