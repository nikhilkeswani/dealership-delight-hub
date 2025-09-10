import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Public vehicle type with only safe, non-sensitive fields
export type PublicVehicle = {
  id: string;
  make: string;
  model: string;
  year: number;
  mileage: number | null;
  price: number | null;
  fuel_type: string | null;
  transmission: string | null;
  condition: string | null;
  description: string | null;
  images: string[] | null;
  body_type: string | null;
  status: "available" | "sold" | "pending" | "service";
  created_at: string;
};

export const usePublicVehicles = (dealerId: string | undefined) => {
  return useQuery<PublicVehicle[]>({
    queryKey: ["public-vehicles", dealerId],
    queryFn: async () => {
      if (!dealerId) return [];

      const { data, error } = await supabase
        .from("vehicles")
        .select(`
          id,
          make,
          model,
          year,
          mileage,
          price,
          fuel_type,
          transmission,
          condition,
          description,
          images,
          body_type,
          status,
          created_at
        `)
        .eq("dealer_id", dealerId)
        .eq("status", "available")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!dealerId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};