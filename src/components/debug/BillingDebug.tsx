import React from "react";
import { useSubscriptionPlans } from "@/hooks/useSubscriptionPlans";
import { useSubscription } from "@/hooks/useSubscription";
import { useDealer } from "@/hooks/useDealer";
import { supabase } from "@/integrations/supabase/client";

export const BillingDebug: React.FC = () => {
  const { data: plans, isLoading: plansLoading, error: plansError } = useSubscriptionPlans();
  const { data: subscription, isLoading: subLoading, error: subError } = useSubscription();
  const { data: dealer, isLoading: dealerLoading, error: dealerError } = useDealer();

  React.useEffect(() => {
    const checkAuth = async () => {
      const { data: session } = await supabase.auth.getSession();
      console.log("Auth session:", session);
    };
    checkAuth();
  }, []);

  console.log("=== BILLING DEBUG ===");
  console.log("Plans:", { data: plans, loading: plansLoading, error: plansError });
  console.log("Subscription:", { data: subscription, loading: subLoading, error: subError });
  console.log("Dealer:", { data: dealer, loading: dealerLoading, error: dealerError });

  return (
    <div className="p-4 bg-red-100 border border-red-300 rounded">
      <h3 className="font-bold">Debug Info</h3>
      <div className="text-sm mt-2 space-y-1">
        <div>Plans Loading: {plansLoading ? "Yes" : "No"}</div>
        <div>Plans Count: {plans?.length || 0}</div>
        <div>Subscription: {subscription ? "Found" : "None"}</div>
        <div>Dealer: {dealer ? "Found" : "None"}</div>
        <div>Plans Error: {plansError?.message || "None"}</div>
        <div>Sub Error: {subError?.message || "None"}</div>
        <div>Dealer Error: {dealerError?.message || "None"}</div>
      </div>
    </div>
  );
};