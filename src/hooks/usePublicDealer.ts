import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export const usePublicDealer = (slug: string | undefined) => {
  return useQuery<Tables<"dealers"> | null, Error>({
    queryKey: ["public-dealer", slug],
    queryFn: async () => {
      if (!slug) return null;

      // Convert slug back to business name (replace hyphens with spaces and capitalize)
      const businessName = slug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      const { data, error } = await supabase
        .from("dealers")
        .select("*")
        .ilike("business_name", businessName)
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};