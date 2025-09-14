import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useDealer } from "./useDealer";
import type { Tables } from "@/integrations/supabase/types";

export const useUsageTracking = () => {
  const { data: dealer } = useDealer();

  return useQuery<Tables<"usage_tracking">[], Error>({
    queryKey: ["usage-tracking", dealer?.id],
    queryFn: async () => {
      if (!dealer?.id) throw new Error("Dealer not found");

      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from("usage_tracking")
        .select("*")
        .eq("dealer_id", dealer.id)
        .gte("period_start", startOfMonth.toISOString())
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!dealer?.id,
    staleTime: 60 * 1000, // 1 minute
  });
};

export const useSubscriptionLimits = () => {
  const { data: dealer } = useDealer();
  const { data: subscription } = useQuery({
    queryKey: ["subscription-with-plan", dealer?.id],
    queryFn: async () => {
      if (!dealer?.id) throw new Error("Dealer not found");

      // First get the subscription
      const { data: subscriptionData, error: subError } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("dealer_id", dealer.id)
        .eq("status", "active")
        .maybeSingle();

      if (subError) throw subError;
      if (!subscriptionData) return null;

      // Then get the corresponding plan
      const { data: planData, error: planError } = await supabase
        .from("subscription_plans")
        .select("*")
        .eq("tier", subscriptionData.tier)
        .eq("is_active", true)
        .maybeSingle();

      if (planError) throw planError;

      return {
        ...subscriptionData,
        subscription_plan: planData
      };
    },
    enabled: !!dealer?.id,
  });

  const limits = subscription?.subscription_plan?.limits as Record<string, number> || {};
  
  return {
    limits,
    currentUsage: {
      leads_per_month: dealer?.monthly_leads_count || 0,
      vehicles: dealer?.monthly_vehicles_count || 0,
      customers: dealer?.monthly_customers_count || 0,
    },
    isWithinLimits: (feature: string) => {
      const limit = limits[feature];
      const current = dealer?.[`monthly_${feature}_count` as keyof typeof dealer] as number || 0;
      return limit === -1 || current < limit;
    },
    getUsagePercentage: (feature: string) => {
      const limit = limits[feature];
      if (limit === -1) return 0; // Unlimited
      const current = dealer?.[`monthly_${feature}_count` as keyof typeof dealer] as number || 0;
      return Math.min((current / limit) * 100, 100);
    }
  };
};