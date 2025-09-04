import React from "react";
import SEO from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, CreditCard, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Dashboard: React.FC = () => {
  // Fetch dashboard stats
  const { data: stats = { dealers: 0, users: 0, subscriptions: 0, leads: 0 }, isLoading } = useQuery({
    queryKey: ["provider-stats"],
    queryFn: async () => {
      const [dealersResult, usersResult, subscriptionsResult, leadsResult] = await Promise.all([
        supabase.from("dealers").select("id", { count: "exact" }),
        supabase.from("user_roles").select("id", { count: "exact" }),
        supabase.from("subscriptions").select("id", { count: "exact" }),
        supabase.from("leads").select("id", { count: "exact" })
      ]);

      return {
        dealers: dealersResult.count || 0,
        users: usersResult.count || 0,
        subscriptions: subscriptionsResult.count || 0,
        leads: leadsResult.count || 0
      };
    }
  });

  const statCards = [
    {
      title: "Total Dealers",
      value: stats.dealers,
      icon: Building2,
      description: "Active dealer accounts"
    },
    {
      title: "Total Users",
      value: stats.users,
      icon: Users,
      description: "Registered users"
    },
    {
      title: "Subscriptions",
      value: stats.subscriptions,
      icon: CreditCard,
      description: "Active subscriptions"
    },
    {
      title: "Total Leads",
      value: stats.leads,
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
                {isLoading ? "..." : card.value.toLocaleString()}
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
    </div>
  );
};

export default Dashboard;