import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export const useBillingHistory = () => {
  return useQuery<Tables<"billing_history">[], Error>({
    queryKey: ["billing-history"],
    queryFn: async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const uid = sessionData.session?.user?.id;
      if (!uid) throw new Error("Not authenticated");

      // Get dealer's subscription ID
      const { data: dealer } = await supabase
        .from("dealers")
        .select("id")
        .eq("user_id", uid)
        .maybeSingle();

      if (!dealer) throw new Error("Dealer not found");

      const { data: subscription } = await supabase
        .from("subscriptions")
        .select("id")
        .eq("dealer_id", dealer.id)
        .maybeSingle();

      if (!subscription) return [];

      const { data, error } = await supabase
        .from("billing_history")
        .select("*")
        .eq("subscription_id", subscription.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      return data || [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};