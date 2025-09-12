import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export const useDealer = () => {
  return useQuery<Tables<"dealers"> | null, Error>({
    queryKey: ["dealer"],
    queryFn: async () => {
      console.log("useDealer queryFn - starting");
      const { data: sessionData } = await supabase.auth.getSession();
      const uid = sessionData.session?.user?.id;
      console.log("useDealer queryFn - uid:", uid);
      
      if (!uid) {
        console.log("useDealer queryFn - no uid, returning null");
        return null;
      }

      const { data, error } = await supabase
        .from("dealers")
        .select("*")
        .eq("user_id", uid)
        .maybeSingle();

      console.log("useDealer queryFn - dealer data:", data, "error:", error);
      
      if (error) throw error;
      return data;
    },
    staleTime: 60 * 1000,
  });
};
