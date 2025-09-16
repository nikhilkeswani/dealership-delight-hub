// Form Types
export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  vehicleId: string;
  date?: string;
  message: string;
}

export interface LeadFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  message?: string;
  dealer_id: string;
  source?: string;
}

// Generic form field type
export interface FormField<T = string> {
  value: T;
  error?: string;
  touched?: boolean;
}

// Form state manager type
export interface FormState<T extends Record<string, unknown>> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isValid: boolean;
  isSubmitting: boolean;
}