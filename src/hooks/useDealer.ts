import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export const useDealer = () => {
  return useQuery<Tables<"dealers"> | null, Error>({
    queryKey: ["dealer"],
    queryFn: async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const uid = sessionData.session?.user?.id;
      if (!uid) return null;

      const { data, error } = await supabase
        .from("dealers")
        .select("*")
        .eq("user_id", uid)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    staleTime: 60 * 1000,
  });
};
