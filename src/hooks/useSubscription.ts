import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export const useSubscription = () => {
  return useQuery<Tables<"subscriptions"> | null, Error>({
    queryKey: ["subscription"],
    queryFn: async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const uid = sessionData.session?.user?.id;
      if (!uid) return null;

      // First get the dealer
      const { data: dealer } = await supabase
        .from("dealers")
        .select("id")
        .eq("user_id", uid)
        .maybeSingle();

      if (!dealer) return null;

      // Then get the subscription
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("dealer_id", dealer.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    staleTime: 60 * 1000,
  });
};