import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import StatCard from "@/components/dashboard/StatCard";
import { useDealer } from "@/hooks/useDealer";
import { formatCurrency } from "@/lib/format";
import { NavLink } from "react-router-dom";
import QuickActions from "@/components/dashboard/QuickActions";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import PageHeader from "@/components/common/PageHeader";
import { LayoutDashboard, ShoppingCart, Users, TrendingUp } from "lucide-react";

const startOfMonth = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
};
const startOfNextMonth = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth() + 1, 1).toISOString();
};
const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
};
const startOfTomorrow = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 1);
  return d.toISOString();
};

const last30Days = () => {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString();
};

const sixMonthsAgo = () => {
  const d = new Date();
  d.setMonth(d.getMonth() - 5, 1);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
};

const DashboardHome: React.FC = () => {
  const { data: dealer, isLoading: dealerLoading } = useDealer();
  const dealerId = dealer?.id;

  const { data: vehiclesCount, isLoading: vehiclesLoading } = useQuery({
    queryKey: ["vehicles-count", dealerId],
    enabled: !!dealerId,
    queryFn: async () => {
      const { count, error } = await supabase
        .from("vehicles")
        .select("id", { count: "exact", head: true })
        .eq("dealer_id", dealerId!);
      if (error) throw error;
      return count ?? 0;
    },
  });

  const { data: activeLeadsCount, isLoading: leadsLoading } = useQuery({
    queryKey: ["active-leads-count", dealerId],
    enabled: !!dealerId,
    queryFn: async () => {
      const { count, error } = await supabase
        .from("leads")
        .select("id", { count: "exact", head: true })
        .eq("dealer_id", dealerId!)
        .in("status", ["new", "contacted", "qualified"]);
      if (error) throw error;
      return count ?? 0;
    },
  });

  const { data: monthlySales, isLoading: salesLoading } = useQuery({
    queryKey: ["monthly-sales", dealerId],
    enabled: !!dealerId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales")
        .select("sale_price,sale_date")
        .eq("dealer_id", dealerId!)
        .gte("sale_date", startOfMonth())
        .lt("sale_date", startOfNextMonth());
      if (error) throw error;
      const total = (data ?? []).reduce((sum: number, row: any) => sum + Number(row.sale_price ?? 0), 0);
      return total;
    },
  });

  const { data: totalLeads30 } = useQuery({
    queryKey: ["total-leads-30", dealerId],
    enabled: !!dealerId,
    queryFn: async () => {
      const { count, error } = await supabase
        .from("leads")
        .select("id", { count: "exact", head: true })
        .eq("dealer_id", dealerId!)
        .gte("created_at", last30Days());
      if (error) throw error;
      return count ?? 0;
    },
  });

  const { data: convertedLeads30 } = useQuery({
    queryKey: ["converted-leads-30", dealerId],
    enabled: !!dealerId,
    queryFn: async () => {
      const { count, error } = await supabase
        .from("leads")
        .select("id", { count: "exact", head: true })
        .eq("dealer_id", dealerId!)
        .gte("created_at", last30Days())
        .eq("status", "converted");
      if (error) throw error;
      return count ?? 0;
    },
  });

  const { data: sales6m, isLoading: sales6mLoading } = useQuery({
    queryKey: ["sales-6m", dealerId],
    enabled: !!dealerId,
    queryFn: async () => {
      const from = sixMonthsAgo();
      const { data, error } = await supabase
        .from("sales")
        .select("sale_price,sale_date")
        .eq("dealer_id", dealerId!)
        .gte("sale_date", from)
        .lt("sale_date", startOfNextMonth());
      if (error) throw error;
      const map = new Map<string, number>();
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        map.set(key, 0);
      }
      (data ?? []).forEach((row: any) => {
        const d = new Date(row.sale_date);
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        map.set(key, (map.get(key) || 0) + Number(row.sale_price || 0));
      });
      const result = Array.from(map.entries()).map(([key, total]) => {
        const [y, m] = key.split("-").map(Number);
        const label = new Date(y, m, 1).toLocaleString(undefined, { month: "short" });
        return { month: label, total };
      });
      return result;
    },
  });

  const conversionRate = React.useMemo(() => {
    if (!totalLeads30 || totalLeads30 === 0) return 0;
    return Math.round(((convertedLeads30 ?? 0) / totalLeads30) * 100);
  }, [totalLeads30, convertedLeads30]);

  const { data: recentLeads, isLoading: recentLoading } = useQuery({
    queryKey: ["recent-leads", dealerId],
    enabled: !!dealerId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("id,first_name,last_name,email,phone,status,created_at")
        .eq("dealer_id", dealerId!)
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: todaysAppointments, isLoading: apptLoading } = useQuery({
    queryKey: ["todays-appointments", dealerId],
    enabled: !!dealerId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("id,first_name,last_name,email,phone,status,follow_up_date")
        .eq("dealer_id", dealerId!)
        .gte("follow_up_date", startOfToday())
        .lt("follow_up_date", startOfTomorrow())
        .order("follow_up_date", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const anyLoading = dealerLoading || vehiclesLoading || leadsLoading || salesLoading;

  return (
    <>
      <SEO
        title="CRM Dashboard | Dealer CRM"
        description="Data-driven overview of your dealership: inventory, leads, sales, and appointments."
      />
      <div className="min-h-screen bg-gradient-to-br from-background to-background/80">
        <main className="container mx-auto px-4 py-8 space-y-12 animate-fade-in">
          {/* Header Section */}
          <div className="glass-card p-8 text-center">
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-lg text-muted-foreground mt-2">
              Welcome back! Here's what's happening at your dealership.
            </p>
          </div>

          {/* Key Metrics Section */}
          <section aria-label="Key metrics" className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Inventory"
              value={vehiclesCount ?? 0}
              icon={LayoutDashboard}
              isLoading={anyLoading}
              helperText="Vehicles in stock"
            />
            <StatCard
              title="Active Leads"
              value={activeLeadsCount ?? 0}
              icon={Users}
              isLoading={anyLoading}
              helperText="Requiring follow-up"
            />
            <StatCard
              title="Monthly Sales"
              value={formatCurrency(monthlySales ?? 0)}
              icon={ShoppingCart}
              isLoading={anyLoading}
              helperText="This month's revenue"
            />
            <StatCard
              title="Conversion Rate"
              value={`${conversionRate}%`}
              icon={TrendingUp}
              isLoading={anyLoading}
              helperText="Last 30 days"
            />
          </section>

          {/* Activity Feed Section */}
          <section className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-foreground mb-2">Recent Activity</h2>
              <p className="text-muted-foreground">Stay up to date with your latest leads and appointments</p>
            </div>
            {recentLoading || apptLoading ? (
              <div className="grid gap-8 lg:grid-cols-2">
                <div className="h-[400px] w-full glass-card animate-pulse rounded-2xl" />
                <div className="h-[400px] w-full glass-card animate-pulse rounded-2xl" />
              </div>
            ) : (
              <ActivityFeed recentLeads={recentLeads ?? []} todaysAppointments={todaysAppointments ?? []} />
            )}
          </section>

          {/* Quick Actions Section */}
          <section className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-foreground mb-2">Quick Actions</h2>
              <p className="text-muted-foreground">Get started with common tasks</p>
            </div>
            <QuickActions />
          </section>
        </main>
      </div>
    </>
  );
};

export default DashboardHome;