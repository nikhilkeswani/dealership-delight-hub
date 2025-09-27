// Hook Types
import type { UseQueryResult, UseMutationResult } from "@tanstack/react-query";
import type { 
  Vehicle, 
  Lead, 
  Customer, 
  VehicleFormValues, 
  LeadFormValues, 
  CustomerFormValues,
  DatabaseError,
  MutationError,
  ValidationError
} from "./database";

// Query Hook Return Types
export type UseVehiclesResult = UseQueryResult<Vehicle[], DatabaseError>;
export type UseLeadsResult = UseQueryResult<Lead[], DatabaseError>;
export type UseCustomersResult = UseQueryResult<Customer[], DatabaseError>;

// Mutation Hook Return Types
export type UseCreateVehicleResult = UseMutationResult<Vehicle, MutationError, VehicleFormValues>;
export type UseUpdateVehicleResult = UseMutationResult<Vehicle, MutationError, { id: string; values: Partial<VehicleFormValues> }>;
export type UseDeleteVehicleResult = UseMutationResult<void, MutationError, string>;

export type UseCreateLeadResult = UseMutationResult<Lead, MutationError, LeadFormValues>;
export type UseUpdateLeadResult = UseMutationResult<Lead, MutationError, { id: string; values: Partial<LeadFormValues> }>;
export type UseDeleteLeadResult = UseMutationResult<void, MutationError, string>;

export type UseCreateCustomerResult = UseMutationResult<Customer, MutationError, CustomerFormValues>;
export type UseUpdateCustomerResult = UseMutationResult<Customer, MutationError, { id: string; values: Partial<CustomerFormValues> }>;
export type UseDeleteCustomerResult = UseMutationResult<void, MutationError, string>;

// Generic Hook Options
export interface QueryOptions {
  enabled?: boolean;
  staleTime?: number;
  refetchOnWindowFocus?: boolean;
}

export interface MutationOptions<TData, TError, TVariables> {
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: TError, variables: TVariables) => void;
  onSettled?: (data: TData | undefined, error: TError | null, variables: TVariables) => void;
}

// Error Handler Types
export type ErrorHandler = (error: DatabaseError | MutationError) => void;

export interface ErrorHandlers {
  database: (error: DatabaseError) => void;
  validation: (errors: ValidationError[]) => void;
  network: (error: Error) => void;
  generic: (error: Error) => void;
}