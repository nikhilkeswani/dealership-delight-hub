import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Check, Zap, Star, Crown } from "lucide-react";
import { useSubscriptionPlans } from "@/hooks/useSubscriptionPlans";
import { useSubscription } from "@/hooks/useSubscription";
import { useToast } from "@/hooks/use-toast";
import LoadingState from "@/components/common/LoadingState";

const getTierIcon = (tier: string) => {
  switch (tier) {
    case 'basic':
      return <Zap className="h-4 w-4" />;
    case 'premium':
      return <Star className="h-4 w-4" />;
    case 'enterprise':
      return <Crown className="h-4 w-4" />;
    default:
      return <Zap className="h-4 w-4" />;
  }
};

const getTierColor = (tier: string) => {
  switch (tier) {
    case 'basic':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'premium':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    case 'enterprise':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
};

export const PlanUpgradeCard: React.FC = () => {
  const { data: plans, isLoading: plansLoading } = useSubscriptionPlans();
  const { data: currentSubscription } = useSubscription();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  if (plansLoading) {
    return <LoadingState />;
  }

  const handleUpgrade = (planId: string) => {
    setSelectedPlan(planId);
    toast({
      title: "Stripe Integration Required",
      description: "Payment processing will be available once Stripe is connected.",
    });
  };

  const isCurrentPlan = (tier: string) => {
    return currentSubscription?.tier === tier;
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Choose Your Plan</h3>
        <p className="text-sm text-muted-foreground">
          Select the perfect plan for your dealership's needs
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {plans?.map((plan) => (
          <Card 
            key={plan.id} 
            className={`relative ${isCurrentPlan(plan.tier) ? 'ring-2 ring-primary' : ''}`}
          >
            {isCurrentPlan(plan.tier) && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground">
                  Current Plan
                </Badge>
              </div>
            )}
            
            <CardHeader className="text-center pb-2">
              <div className="flex items-center justify-center mb-2">
                <Badge className={getTierColor(plan.tier)}>
                  {getTierIcon(plan.tier)}
                  <span className="ml-1 capitalize">{plan.tier}</span>
                </Badge>
              </div>
              <CardTitle className="text-xl">{plan.display_name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              
              <div className="mt-4">
                <div className="text-3xl font-bold">
                  ${plan.price_monthly}
                  <span className="text-sm font-normal text-muted-foreground">/month</span>
                </div>
                {plan.price_yearly && (
                  <div className="text-sm text-muted-foreground">
                    or ${plan.price_yearly}/year (save ${((plan.price_monthly * 12) - plan.price_yearly).toFixed(0)})
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <Separator />
              
              <div className="space-y-2">
                <h4 className="font-medium">Features:</h4>
                <ul className="space-y-1">
                  {(plan.features as string[]).map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="font-medium">Limits:</h4>
                <div className="space-y-1 text-sm">
                  {Object.entries(plan.limits as Record<string, number>).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="capitalize">{key.replace('_', ' ')}</span>
                      <span className="font-medium">
                        {value === -1 ? 'Unlimited' : value.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <Button
                className="w-full"
                variant={isCurrentPlan(plan.tier) ? "outline" : "default"}
                disabled={isCurrentPlan(plan.tier)}
                onClick={() => handleUpgrade(plan.id)}
              >
                {isCurrentPlan(plan.tier) ? 'Current Plan' : `Upgrade to ${plan.display_name}`}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center text-sm text-muted-foreground">
        <p>Need a custom plan? Contact our sales team for enterprise solutions.</p>
      </div>
    </div>
  );
};