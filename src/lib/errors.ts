// Centralized error handling system
import { toast } from "sonner";

export interface AppError {
  code: string;
  message: string;
  userMessage: string;
  action?: string;
  retry?: boolean;
}

export const ERROR_CODES = {
  // Authentication errors
  AUTH_INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
  AUTH_EMAIL_NOT_CONFIRMED: 'AUTH_EMAIL_NOT_CONFIRMED', 
  AUTH_SESSION_EXPIRED: 'AUTH_SESSION_EXPIRED',
  
  // Network errors
  NETWORK_CONNECTION_ERROR: 'NETWORK_CONNECTION_ERROR',
  NETWORK_TIMEOUT: 'NETWORK_TIMEOUT',
  
  // Database errors
  DB_PERMISSION_DENIED: 'DB_PERMISSION_DENIED',
  DB_RESOURCE_NOT_FOUND: 'DB_RESOURCE_NOT_FOUND',
  DB_VALIDATION_ERROR: 'DB_VALIDATION_ERROR',
  
  // File upload errors
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  FILE_INVALID_TYPE: 'FILE_INVALID_TYPE',
  FILE_UPLOAD_FAILED: 'FILE_UPLOAD_FAILED',
  
  // Generic errors
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
} as const;

export const ERROR_MESSAGES: Record<string, AppError> = {
  [ERROR_CODES.AUTH_INVALID_CREDENTIALS]: {
    code: ERROR_CODES.AUTH_INVALID_CREDENTIALS,
    message: 'Invalid email or password',
    userMessage: 'The email or password you entered is incorrect. Please check your credentials and try again.',
    action: 'Try the "Forgot Password" link if you need to reset your password.',
    retry: true,
  },
  
  [ERROR_CODES.AUTH_EMAIL_NOT_CONFIRMED]: {
    code: ERROR_CODES.AUTH_EMAIL_NOT_CONFIRMED,
    message: 'Email not confirmed',
    userMessage: 'Please check your email and click the confirmation link before signing in.',
    action: 'Resend confirmation email if needed.',
    retry: false,
  },
  
  [ERROR_CODES.AUTH_SESSION_EXPIRED]: {
    code: ERROR_CODES.AUTH_SESSION_EXPIRED,
    message: 'Session expired',
    userMessage: 'Your session has expired. Please sign in again to continue.',
    action: 'You will be redirected to the login page.',
    retry: false,
  },
  
  [ERROR_CODES.NETWORK_CONNECTION_ERROR]: {
    code: ERROR_CODES.NETWORK_CONNECTION_ERROR,
    message: 'Network connection error',
    userMessage: 'Unable to connect to our servers. Please check your internet connection.',
    action: 'Try refreshing the page or checking your network settings.',
    retry: true,
  },
  
  [ERROR_CODES.NETWORK_TIMEOUT]: {
    code: ERROR_CODES.NETWORK_TIMEOUT,
    message: 'Request timeout',
    userMessage: 'The request is taking longer than expected. This might be due to a slow connection.',
    action: 'Please try again in a moment.',
    retry: true,
  },
  
  [ERROR_CODES.DB_PERMISSION_DENIED]: {
    code: ERROR_CODES.DB_PERMISSION_DENIED,
    message: 'Permission denied',
    userMessage: 'You don\'t have permission to perform this action.',
    action: 'Contact support if you believe this is an error.',
    retry: false,
  },
  
  [ERROR_CODES.DB_RESOURCE_NOT_FOUND]: {
    code: ERROR_CODES.DB_RESOURCE_NOT_FOUND,
    message: 'Resource not found',
    userMessage: 'The item you\'re looking for could not be found. It may have been deleted or moved.',
    action: 'Try refreshing the page or navigating back.',
    retry: false,
  },
  
  [ERROR_CODES.DB_VALIDATION_ERROR]: {
    code: ERROR_CODES.DB_VALIDATION_ERROR,
    message: 'Validation error',
    userMessage: 'Some of the information you entered is invalid. Please check your input and try again.',
    retry: true,
  },
  
  [ERROR_CODES.FILE_TOO_LARGE]: {
    code: ERROR_CODES.FILE_TOO_LARGE,
    message: 'File too large',
    userMessage: 'The file you selected is too large. Please choose a file smaller than 5MB.',
    retry: true,
  },
  
  [ERROR_CODES.FILE_INVALID_TYPE]: {
    code: ERROR_CODES.FILE_INVALID_TYPE,
    message: 'Invalid file type',
    userMessage: 'This file type is not supported. Please select a JPEG, PNG, or WebP image.',
    retry: true,
  },
  
  [ERROR_CODES.FILE_UPLOAD_FAILED]: {
    code: ERROR_CODES.FILE_UPLOAD_FAILED,
    message: 'Upload failed',
    userMessage: 'Failed to upload your file. This could be due to a network issue.',
    action: 'Please try again with a stable internet connection.',
    retry: true,
  },
  
  [ERROR_CODES.UNKNOWN_ERROR]: {
    code: ERROR_CODES.UNKNOWN_ERROR,
    message: 'Unknown error',
    userMessage: 'Something unexpected happened. Our team has been notified.',
    action: 'Please try again or contact support if the problem persists.',
    retry: true,
  },
};

// Parse Supabase errors into our error system
export function parseSupabaseError(error: any): AppError {
  const message = error?.message?.toLowerCase() || '';
  
  // Authentication errors
  if (message.includes('invalid login credentials')) {
    return ERROR_MESSAGES[ERROR_CODES.AUTH_INVALID_CREDENTIALS];
  }
  
  if (message.includes('email not confirmed')) {
    return ERROR_MESSAGES[ERROR_CODES.AUTH_EMAIL_NOT_CONFIRMED];
  }
  
  if (message.includes('jwt expired') || message.includes('session expired')) {
    return ERROR_MESSAGES[ERROR_CODES.AUTH_SESSION_EXPIRED];
  }
  
  // Permission errors
  if (message.includes('permission denied') || message.includes('insufficient privileges')) {
    return ERROR_MESSAGES[ERROR_CODES.DB_PERMISSION_DENIED];
  }
  
  // Not found errors
  if (message.includes('not found') || error?.status === 404) {
    return ERROR_MESSAGES[ERROR_CODES.DB_RESOURCE_NOT_FOUND];
  }
  
  // Validation errors
  if (message.includes('violates') || message.includes('invalid') || error?.status === 400) {
    return ERROR_MESSAGES[ERROR_CODES.DB_VALIDATION_ERROR];
  }
  
  // Network errors
  if (message.includes('fetch') || message.includes('network') || !navigator.onLine) {
    return ERROR_MESSAGES[ERROR_CODES.NETWORK_CONNECTION_ERROR];
  }
  
  // Default to unknown error
  return ERROR_MESSAGES[ERROR_CODES.UNKNOWN_ERROR];
}

// Enhanced error handler with user-friendly messaging
export function handleError(error: unknown, context?: string): AppError {
  console.error(`Error in ${context || 'application'}:`, error);
  
  let appError: AppError;
  
  if (error && typeof error === 'object' && 'code' in error) {
    // Already an AppError
    appError = error as AppError;
  } else {
    // Parse the error
    appError = parseSupabaseError(error);
  }
  
  // Show user-friendly toast
  toast.error(appError.userMessage, {
    description: appError.action,
    action: appError.retry ? {
      label: "Try Again",
      onClick: () => window.location.reload()
    } : undefined,
  });
  
  return appError;
}

// Specific error handlers for common scenarios
export const errorHandlers = {
  auth: (error: unknown) => handleError(error, 'authentication'),
  database: (error: unknown) => handleError(error, 'database operation'),
  upload: (error: unknown) => handleError(error, 'file upload'),
  network: (error: unknown) => handleError(error, 'network request'),
};

// Async wrapper with error handling
export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  context: string
): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    handleError(error, context);
    return null;
  }
}