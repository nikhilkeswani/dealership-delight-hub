import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type PublicVehicle = Tables<"vehicles">;

export const usePublicVehicles = (dealerId: string | undefined) => {
  return useQuery<PublicVehicle[]>({
    queryKey: ["public-vehicles", dealerId],
    queryFn: async () => {
      if (!dealerId) return [];

      const { data, error } = await supabase
        .from("vehicles")
        .select("*")
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