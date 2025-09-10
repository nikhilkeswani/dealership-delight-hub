import React from "react";
import SEO from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Activity, Users, CreditCard } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Analytics: React.FC = () => {
  const { data: monthlyStats = [], isLoading } = useQuery({
    queryKey: ["monthly-analytics"],
    queryFn: async () => {
      // Get monthly growth data for the last 6 months
      const { data, error } = await supabase
        .from("dealers")
        .select("created_at")
        .gte("created_at", new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      // Group by month
      const monthlyData: Record<string, number> = {};
      data.forEach(dealer => {
        const month = new Date(dealer.created_at).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short' 
        });
        monthlyData[month] = (monthlyData[month] || 0) + 1;
      });

      return Object.entries(monthlyData).map(([month, count]) => ({ month, count }));
    },
  });

  const { data: activityData = [], isLoading: activityLoading } = useQuery({
    queryKey: ["recent-activity"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <SEO 
        title="Analytics | Provider Control" 
        description="System analytics and performance metrics" 
        noIndex 
      />
      
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-2">
          System performance metrics and growth analytics
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              Monthly Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-4 text-muted-foreground">Loading analytics...</div>
            ) : (
              <div className="space-y-2">
                {monthlyStats.map((stat) => (
                  <div key={stat.month} className="flex justify-between items-center">
                    <span className="text-sm">{stat.month}</span>
                    <span className="font-medium">{stat.count} new dealers</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="mr-2 h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activityLoading ? (
              <div className="text-center py-4 text-muted-foreground">Loading activity...</div>
            ) : (
              <div className="space-y-3">
                {activityData.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No recent activity</p>
                ) : (
                  activityData.slice(0, 5).map((activity) => (
                    <div key={activity.id} className="flex justify-between items-center text-sm">
                      <span>{activity.action} on {activity.resource_type}</span>
                      <span className="text-muted-foreground">
                        {new Date(activity.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.2%</div>
            <p className="text-xs text-muted-foreground">
              Visitors to dealers conversion
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Avg. Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$1,240</div>
            <p className="text-xs text-muted-foreground">
              Per dealer per month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Retention Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94%</div>
            <p className="text-xs text-muted-foreground">
              Monthly retention rate
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;