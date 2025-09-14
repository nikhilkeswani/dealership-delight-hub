import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Users, Car, MessageSquare, AlertTriangle } from "lucide-react";
import { useSubscriptionLimits } from "@/hooks/useUsageTracking";
import { useSubscription } from "@/hooks/useSubscription";
import LoadingState from "@/components/common/LoadingState";

const getUsageIcon = (feature: string) => {
  switch (feature) {
    case 'leads_per_month':
      return <MessageSquare className="h-4 w-4" />;
    case 'vehicles':
      return <Car className="h-4 w-4" />;
    case 'customers':
      return <Users className="h-4 w-4" />;
    default:
      return <AlertTriangle className="h-4 w-4" />;
  }
};

const getFeatureLabel = (feature: string) => {
  switch (feature) {
    case 'leads_per_month':
      return 'Monthly Leads';
    case 'vehicles':
      return 'Vehicle Listings';
    case 'customers':
      return 'Customer Records';
    default:
      return feature.replace('_', ' ');
  }
};

const getProgressColor = (percentage: number) => {
  if (percentage >= 90) return 'bg-red-500';
  if (percentage >= 75) return 'bg-amber-500';
  return 'bg-green-500';
};

export const UsageDashboard: React.FC = () => {
  const { limits, currentUsage, getUsagePercentage, isWithinLimits } = useSubscriptionLimits();
  const { data: subscription, isLoading } = useSubscription();

  if (isLoading) {
    return <LoadingState />;
  }

  if (!subscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Usage Dashboard</CardTitle>
          <CardDescription>No active subscription found</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const usageItems = [
    { key: 'leads_per_month', current: currentUsage.leads_per_month },
    { key: 'vehicles', current: currentUsage.vehicles },
    { key: 'customers', current: currentUsage.customers },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Usage Dashboard</h3>
        <p className="text-sm text-muted-foreground">
          Monitor your feature usage against subscription limits
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {usageItems.map(({ key, current }) => {
          const limit = limits[key];
          const percentage = getUsagePercentage(key);
          const withinLimits = isWithinLimits(key);

          return (
            <Card key={key}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getUsageIcon(key)}
                    <CardTitle className="text-sm">{getFeatureLabel(key)}</CardTitle>
                  </div>
                  {!withinLimits && (
                    <Badge variant="destructive" className="text-xs">
                      Limit Reached
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>
                    {current.toLocaleString()} / {limit === -1 ? '∞' : limit.toLocaleString()}
                  </span>
                  {limit !== -1 && (
                    <span className="text-muted-foreground">
                      {percentage.toFixed(0)}%
                    </span>
                  )}
                </div>

                {limit !== -1 && (
                  <Progress 
                    value={percentage} 
                    className="h-2"
                  />
                )}

                {limit === -1 && (
                  <div className="text-xs text-muted-foreground">
                    ∞ Unlimited usage
                  </div>
                )}

                {percentage >= 90 && limit !== -1 && (
                  <div className="text-xs text-amber-600 dark:text-amber-400">
                    ⚠️ Approaching limit
                  </div>
                )}

                {!withinLimits && limit !== -1 && (
                  <div className="text-xs text-red-600 dark:text-red-400">
                    🚫 Limit exceeded - consider upgrading
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Usage Period</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            Current billing period: {new Date().toLocaleDateString('en-US', { 
              month: 'long', 
              year: 'numeric' 
            })}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Usage counters reset monthly on your billing date
          </div>
        </CardContent>
      </Card>
    </div>
  );
};