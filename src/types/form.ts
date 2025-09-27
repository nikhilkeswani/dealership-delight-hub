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
  source?: 'website' | 'phone' | 'email' | 'referral' | 'walk_in' | 'social_media' | 'website_testdrive' | 'website_inquiry';
}

// Form validation error type
export interface FormError {
  field: string;
  message: string;
}

// Generic form field type
export interface FormField<T = string> {
  value: T;
  error?: string;
  touched?: boolean;
}