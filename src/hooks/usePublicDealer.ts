import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export const usePublicDealer = (slug: string | undefined) => {
  return useQuery<Tables<"dealers"> | null, Error>({
    queryKey: ["public-dealer", slug],
    queryFn: async () => {
      if (!slug) return null;

      // First try exact match with basic conversion
      const basicName = slug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      let { data, error } = await supabase
        .from("dealers")
        .select("*")
        .ilike("business_name", basicName)
        .eq("is_active", true)
        .maybeSingle();

      // If no match found, try partial match with LIKE to handle compound words
      if (!data && !error) {
        const { data: partialData, error: partialError } = await supabase
          .from("dealers")
          .select("*")
          .ilike("business_name", `%${slug.replace(/-/g, '%')}%`)
          .eq("is_active", true)
          .maybeSingle();
        
        data = partialData;
        error = partialError;
      }

      if (error) throw error;
      return data;
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};