// Enhanced Vehicle Types
export interface VehicleFilters {
  make?: string;
  model?: string;
  year?: number;
  minPrice?: number;
  maxPrice?: number;
  minMileage?: number;
  maxMileage?: number;
  bodyType?: string;
  fuelType?: string;
  transmission?: string;
  condition?: string;
}

export interface DisplayVehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  mileage?: number | null;
  price?: number | null;
  fuel_type?: string | null;
  transmission?: string | null;
  condition?: string | null;
  description?: string | null;
  images?: string[] | null;
  body_type?: string | null;
  status: "available" | "sold" | "pending" | "service";
  created_at: string;
  features?: Record<string, unknown> | null;
  vin?: string | null;
}

// For search and filtering operations
export interface VehicleSearchParams {
  query?: string;
  filters?: VehicleFilters;
  sort?: "relevance" | "price-asc" | "price-desc" | "year-desc" | "mileage-asc" | "recently-added";
  page?: number;
  limit?: number;
}

// For displaying in cards/lists
export interface VehicleDisplayData {
  id: string;
  title: string;
  price: string;
  condition: string;
  description: string;
  features: string[];
  images: string[];
}