// Database Entity Types
import type { Tables } from "@/integrations/supabase/types";

// Re-export database types with better names
export type Vehicle = Tables<"vehicles">;
export type Lead = Tables<"leads">;
export type Customer = Tables<"customers">;
export type Dealer = Tables<"dealers">;
export type Subscription = Tables<"subscriptions">;
export type BillingHistory = Tables<"billing_history">;
export type Provider = Tables<"providers">;

// Enhanced Vehicle Types
export interface VehicleFeatures {
  // Safety Features
  airbags?: boolean;
  abs?: boolean;
  stability_control?: boolean;
  backup_camera?: boolean;
  blind_spot_monitoring?: boolean;
  lane_departure_warning?: boolean;
  
  // Comfort Features
  air_conditioning?: boolean;
  heated_seats?: boolean;
  leather_interior?: boolean;
  sunroof?: boolean;
  premium_sound?: boolean;
  navigation?: boolean;
  bluetooth?: boolean;
  
  // Performance Features
  all_wheel_drive?: boolean;
  turbo?: boolean;
  sport_mode?: boolean;
  
  // Additional features (for extensibility)
  [key: string]: boolean | string | number | undefined;
}

// Enhanced Error Types
export interface DatabaseError extends Error {
  message: string;
  code?: string;
  details?: string;
  hint?: string;
  table?: string;
  operation?: 'select' | 'insert' | 'update' | 'delete';
}

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface MutationError extends Error {
  message: string;
  validationErrors?: ValidationError[];
  databaseError?: DatabaseError;
}

// Query Result Types
export interface QueryResult<T> {
  data: T | null;
  error: DatabaseError | null;
  isLoading: boolean;
  isError: boolean;
}

export interface MutationResult<T> {
  data: T | null;
  error: MutationError | null;
  isLoading: boolean;
  mutateAsync: (variables: any) => Promise<T>;
  mutate: (variables: any) => void;
}

// Status Types
export type VehicleStatus = "available" | "sold" | "pending" | "service";
export type LeadStatus = "new" | "contacted" | "qualified" | "converted" | "lost";
export type LeadSource = "website" | "phone" | "email" | "referral" | "walk_in" | "social_media" | "website_testdrive" | "website_inquiry";

// Form Value Types
export interface VehicleFormValues {
  id?: string;
  make: string;
  model: string;
  year: number;
  price?: number;
  mileage?: number;
  vin?: string;
  status: VehicleStatus;
  description?: string;
  features?: VehicleFeatures;
  images?: string[];
  body_type?: string;
  fuel_type?: string;
  transmission?: string;
  condition?: string;
}

export interface LeadFormValues {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  source: LeadSource;
  status: LeadStatus;
  notes?: string;
  follow_up_date?: string;
}

export interface CustomerFormValues {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  total_spent?: number;
}