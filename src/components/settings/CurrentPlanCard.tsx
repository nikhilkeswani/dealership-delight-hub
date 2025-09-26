import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Crown, Zap, Star } from "lucide-react";
import { useDealer } from "@/hooks/useDealer";
import { useSubscription } from "@/hooks/useSubscription";
import { formatDate } from "@/lib/format";

const getTierIcon = (tier: string) => {
  switch (tier) {
    case "enterprise":
      return <Crown className="h-4 w-4" />;
    case "premium":
      return <Zap className="h-4 w-4" />;
    default:
      return <Star className="h-4 w-4" />;
  }
};

const getTierColor = (tier: string) => {
  switch (tier) {
    case "enterprise":
      return "bg-gradient-to-r from-yellow-500 to-orange-500 text-white";
    case "premium":
      return "bg-gradient-to-r from-blue-500 to-purple-500 text-white";
    default:
      return "bg-gradient-to-r from-gray-500 to-gray-600 text-white";
  }
};

export const CurrentPlanCard: React.FC = () => {
  const { data: dealer, isLoading: isDealerLoading } = useDealer();
  const { data: subscription, isLoading: isSubLoading } = useSubscription();

  if (isDealerLoading || isSubLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-1/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const tier = dealer?.tier || "basic";
  const tierName = tier.charAt(0).toUpperCase() + tier.slice(1);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Current Plan
          <Badge className={getTierColor(tier)}>
            {getTierIcon(tier)}
            {tierName}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">Status</p>
          <p className="font-medium">
            {subscription?.status === "active" ? "Active" : "Inactive"}
          </p>
        </div>

        {subscription && (
          <>
            <div>
              <p className="text-sm text-muted-foreground">Billing Cycle</p>
              <p className="font-medium capitalize">{subscription.billing_cycle}</p>
            </div>

            {subscription.next_billing_date && (
              <div>
                <p className="text-sm text-muted-foreground">Next Billing Date</p>
                <p className="font-medium">
                  {formatDate(subscription.next_billing_date)}
                </p>
              </div>
            )}

            <div>
              <p className="text-sm text-muted-foreground">Amount</p>
              <p className="font-medium">${Number(subscription.amount).toFixed(2)}</p>
            </div>
          </>
        )}

        <div className="pt-2">
          <p className="text-xs text-muted-foreground">
            Use the Plans tab to upgrade your subscription
          </p>
        </div>
      </CardContent>
    </Card>
  );
};