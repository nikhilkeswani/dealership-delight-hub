// Utility Types for better type safety

// Generic utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// API Response wrapper
export interface ApiResponse<TData = unknown> {
  data: TData | null;
  error: string | null;
  success: boolean;
  timestamp: string;
}

// Pagination types
export interface PaginationParams {
  page: number;
  limit: number;
  offset?: number;
}

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResponse<TData> {
  data: TData[];
  meta: PaginationMeta;
}

// Sort and Filter types
export interface SortParams {
  field: string;
  direction: 'asc' | 'desc';
}

export interface FilterParams {
  [key: string]: string | number | boolean | string[] | number[] | null | undefined;
}

// Form state management
export interface FormFieldState<T = string> {
  value: T;
  error?: string;
  touched: boolean;
  dirty: boolean;
}

export interface FormState<T extends Record<string, unknown>> {
  fields: {
    [K in keyof T]: FormFieldState<T[K]>;
  };
  isValid: boolean;
  isSubmitting: boolean;
  submitCount: number;
}

// Status types that can be reused
export type Status = 'idle' | 'loading' | 'success' | 'error';
export type AsyncState<TData, TError = Error> = {
  status: Status;
  data: TData | null;
  error: TError | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
};

// Configuration types
export interface ConfigOption<T = string> {
  label: string;
  value: T;
  description?: string;
  disabled?: boolean;
}

// Event handler types
export type EventHandler<T = unknown> = (event: T) => void;
export type AsyncEventHandler<T = unknown> = (event: T) => Promise<void>;

// Generic CRUD operations
export interface CrudOperations<TEntity, TCreateData, TUpdateData = Partial<TCreateData>> {
  create: (data: TCreateData) => Promise<TEntity>;
  read: (id: string) => Promise<TEntity | null>;
  update: (id: string, data: TUpdateData) => Promise<TEntity>;
  delete: (id: string) => Promise<void>;
  list: (params?: FilterParams & PaginationParams & { sort?: SortParams }) => Promise<PaginatedResponse<TEntity>>;
}

// File upload types
export interface FileUploadState {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  url?: string;
}

export interface ImageMetadata {
  width: number;
  height: number;
  size: number;
  format: string;
  altText?: string;
}

// Color and theme types
export interface ColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  muted: string;
  destructive: string;
}

export interface ThemeVariant {
  name: string;
  label: string;
  colors: ColorScheme;
}

// Validation types
export interface ValidationRule<T = unknown> {
  message: string;
  validator: (value: T) => boolean;
}

export interface FieldValidation<T = unknown> {
  required?: boolean;
  rules?: ValidationRule<T>[];
}

// Search and filtering
export interface SearchParams {
  query?: string;
  filters?: FilterParams;
  sort?: SortParams;
  pagination?: PaginationParams;
}

export interface SearchResult<TData> {
  items: TData[];
  total: number;
  query: string;
  filters: FilterParams;
  took: number; // search duration in ms
}

// Component prop helpers
export type ComponentWithChildren<T = {}> = T & {
  children: React.ReactNode;
};

export type ComponentWithClassName<T = {}> = T & {
  className?: string;
};

export type ComponentWithOptionalChildren<T = {}> = T & {
  children?: React.ReactNode;
};