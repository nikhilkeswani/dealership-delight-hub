import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export const usePublicDealerWebsite = (dealerId: string | undefined) => {
  return useQuery<Tables<"dealer_websites"> | null, Error>({
    queryKey: ["public-dealer-website", dealerId],
    queryFn: async () => {
      if (!dealerId) return null;

      const { data, error } = await supabase
        .from("dealer_websites")
        .select("*")
        .eq("dealer_id", dealerId)
        .eq("is_published", true)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!dealerId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};