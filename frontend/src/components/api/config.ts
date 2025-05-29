// src/api/config.ts
export const API_BASE = process.env.REACT_APP_API_URL ?? "http://localhost:8000";
export const defaultHeaders = {
  "Content-Type": "application/json",
  "x-api-key": "somya",
};
