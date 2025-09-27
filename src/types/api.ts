// API and Error Types
export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

export interface SupabaseError extends Error {
  message: string;
  code?: string;
  details?: string;
  hint?: string;
}