
function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Environment variable ${name} is required but not set`);
  }
  return value;
}

export const API_BASE = requireEnv('MONGO_API');
export const API_KEY = requireEnv('API_KEY');

export const defaultHeaders = {
  "Content-Type": "application/json",
  "x-api-key": API_KEY,
} as const;