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

// Form validation error type
export interface FormError {
  field: string;
  message: string;
}

// Generic API response wrapper
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: ApiError;
  success: boolean;
}