import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import PageHeader from "@/components/common/PageHeader";
import StatusBadge from "@/components/common/StatusBadge";
import { Input } from "@/components/ui/input";
import { Eye, Mail, Phone, Activity, Flame, TrendingUp, CalendarCheck } from "lucide-react";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import StatCard from "@/components/dashboard/StatCard";
import { isSameDay } from "date-fns";

const Leads: React.FC = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["leads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("id, first_name, last_name, email, phone, status, source, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState<string>("all");
  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return (data ?? []).filter((l: any) => {
      const matchesQuery = q
        ? [l.first_name, l.last_name, l.email, l.phone, l.source]
            .filter(Boolean)
            .some((v) => String(v).toLowerCase().includes(q))
        : true;
      const matchesStatus = status === "all" ? true : String(l.status ?? "").toLowerCase() === status;
      return matchesQuery && matchesStatus;
    });
  }, [data, query, status]);
const kpis = React.useMemo(() => {
  const all = (data ?? []) as any[];
  const total = all.length;
  const normalized = (s: any) => String(s ?? "").toLowerCase();
  const active = all.filter((l) => ["new", "contacted", "qualified"].includes(normalized(l.status))).length;
  const hot = all.filter((l) => ["qualified", "contacted"].includes(normalized(l.status))).length;
  const converted = all.filter((l) => normalized(l.status) === "converted").length;
  const convRate = total ? Math.round((converted / total) * 100) : 0;
  const todayFollowUps = all.filter((l) => l.follow_up_date && isSameDay(new Date(l.follow_up_date), new Date())).length;
  return { active, hot, convRate, todayFollowUps };
}, [data]);

  return (
    <>
      <SEO
        title="Leads | Dealer Dashboard"
        description="Track and manage sales leads for your dealership."
        canonical="/app/leads"
        noIndex
      />
      <section className="animate-fade-in">
        <PageHeader
          title="Leads"
          description="Track and manage sales leads for your dealership."
          actions={<Button size="sm" variant="hero">Add Lead</Button>}
/>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Active Leads" value={kpis.active} icon={Activity} />
          <StatCard title="Hot Leads" value={kpis.hot} icon={Flame} />
          <StatCard title="Conversion Rate" value={`${kpis.convRate}%`} icon={TrendingUp} />
          <StatCard title="Follow-ups Today" value={kpis.todayFollowUps} icon={CalendarCheck} />
        </div>
        <Card className="glass-card">
          <CardHeader className="gap-3">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
              <div>
                <CardTitle>Recent Leads</CardTitle>
                <CardDescription>New inquiries and their status</CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <div className="relative flex-1 min-w-[260px]">
                  <Input
                    placeholder="Search name, email, phone..."
                    value={query}
                    onChange={(e) => setQuery(e.currentTarget.value)}
                    aria-label="Search leads"
                  />
                </div>
                <div className="w-full sm:w-56">
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger aria-label="Filter by status" className="bg-background">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent className="z-50 bg-popover">
                      {["all", "new", "contacted", "qualified", "converted", "lost"].map((s) => (
                        <SelectItem key={s} value={s} className="capitalize">
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="space-y-2">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            )}
            {error && <div className="text-destructive">{(error as any).message}</div>}
            {!isLoading && !error && (
              <div>
                {filtered && filtered.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filtered.map((l: any) => (
                      <Card key={l.id} className="relative overflow-hidden glass-card hover-scale">
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between gap-2">
                            <CardTitle className="text-base">{l.first_name} {l.last_name}</CardTitle>
                            <StatusBadge status={l.status ?? "-"} className="capitalize" />
                          </div>
                          <CardDescription className="mt-1">{l.email || "-"}</CardDescription>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground">
                          <div className="flex items-center justify-between">
                            <div>
                              <div>Phone: {l.phone ?? "-"}</div>
                              <div className="capitalize">Source: {l.source ?? "-"}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs">Created</div>
                              <div className="font-medium">{formatDate(l.created_at)}</div>
                            </div>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <Button size="sm" variant="outline" asChild>
                              <a href={`tel:${l.phone ?? ""}`} aria-label="Call lead">
                                <span className="icon-chip mr-2"><Phone className="h-4 w-4" /></span>
                                <span>Call</span>
                              </a>
                            </Button>
                            <Button size="sm" variant="outline" asChild>
                              <a href={`mailto:${l.email ?? ""}`} aria-label="Email lead">
                                <span className="icon-chip mr-2"><Mail className="h-4 w-4" /></span>
                                <span>Email</span>
                              </a>
                            </Button>
                            <Button size="sm" variant="ghost" aria-label="View lead">
                              <span className="icon-chip mr-2"><Eye className="h-4 w-4" /></span>
                              <span>View</span>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center text-muted-foreground">No leads found.</div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </>
  );
};

export default Leads;
