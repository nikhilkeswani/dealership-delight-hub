import React from "react";
import SEO from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Activity, Users, CreditCard, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import LoadingState from "@/components/common/LoadingState";
import RetryButton from "@/components/common/RetryButton";
import { withErrorHandling } from "@/lib/errors";

const Dashboard: React.FC = () => {
  // Fetch dashboard stats with improved error handling
  const { data: stats, isLoading, error, refetch } = useQuery({
    queryKey: ["provider-stats"],
    queryFn: async () => {
      return withErrorHandling(async () => {
        const [dealersResult, usersResult, subscriptionsResult, leadsResult] = await Promise.all([
          supabase.from("dealers").select("id", { count: "exact" }),
          supabase.from("user_roles").select("id", { count: "exact" }),
          supabase.from("subscriptions").select("id", { count: "exact" }),
          supabase.from("leads").select("id", { count: "exact" })
        ]);

        // Check for errors in parallel requests
        if (dealersResult.error) throw dealersResult.error;
        if (usersResult.error) throw usersResult.error;
        if (subscriptionsResult.error) throw subscriptionsResult.error;
        if (leadsResult.error) throw leadsResult.error;

        return {
          dealers: dealersResult.count || 0,
          users: usersResult.count || 0,
          subscriptions: subscriptionsResult.count || 0,
          leads: leadsResult.count || 0
        };
      }, 'fetch dashboard statistics');
    },
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const statCards = [
    {
      title: "Total Dealers",
      value: stats?.dealers || 0,
      icon: Users,
      description: "Active dealer accounts"
    },
    {
      title: "Total Users", 
      value: stats?.users || 0,
      icon: Users,
      description: "Registered users"
    },
    {
      title: "Subscriptions",
      value: stats?.subscriptions || 0,
      icon: CreditCard,
      description: "Active subscriptions"
    },
    {
      title: "Total Leads",
      value: stats?.leads || 0,
      icon: TrendingUp,
      description: "Generated leads"
    }
  ];

  return (
    <div className="space-y-6">
      <SEO 
        title="Provider Dashboard | Control Center" 
        description="Manage your dealer network and system operations" 
        noIndex 
      />
      
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Overview of your dealer network and system performance
        </p>
      </div>

      {error ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-medium mb-2">Failed to load dashboard data</h3>
            <p className="text-muted-foreground mb-6 text-center max-w-md">
              We couldn't load the latest statistics. This might be due to a connection issue.
            </p>
            <RetryButton onRetry={() => refetch()} />
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {statCards.map((card) => (
              <Card key={card.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {card.title}
                  </CardTitle>
                  <card.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isLoading ? (
                      <div className="h-8 bg-muted animate-pulse rounded w-16" />
                    ) : (
                      card.value.toLocaleString()
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {card.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>System Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">
                    System is running smoothly with all services operational.
                  </div>
                  <div className="text-xs text-green-600">
                    ✓ All systems operational
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-sm">
                    • Review new dealer applications
                  </div>
                  <div className="text-sm">
                    • Monitor system performance
                  </div>
                  <div className="text-sm">
                    • Check audit logs
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;