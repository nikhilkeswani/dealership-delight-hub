import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import StatusBadge from "@/components/common/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatNumber } from "@/lib/format";
import PageHeader from "@/components/common/PageHeader";

const Inventory: React.FC = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["vehicles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vehicles")
        .select("id, make, model, year, price, mileage, status, updated_at")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<string>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (data ?? []).filter((v: any) => {
      const matchesQuery = q
        ? [v.make, v.model, String(v.year)].some((field) =>
            String(field ?? "").toLowerCase().includes(q)
          )
        : true;
      const matchesStatus = status === "all" ? true : String(v.status ?? "").toLowerCase() === status;
      return matchesQuery && matchesStatus;
    });
  }, [data, query, status]);

  return (
    <>
      <SEO
        title="Inventory | Dealer Dashboard"
        description="Manage vehicle inventory for your dealership. View, filter, and update vehicles."
        canonical="/app/inventory"
        noIndex
      />
      <section className="animate-fade-in">
        <PageHeader
          title="Inventory"
          description="Manage your vehicles with a refined interface."
          actions={<Button size="sm" variant="hero">Add Vehicle</Button>}
        />
        <Card className="glass-card">
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle>Vehicles</CardTitle>
              <CardDescription>Your current listed vehicles</CardDescription>
            </div>
            <Button size="sm">Add Vehicle</Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="w-full sm:max-w-md">
                <Input
                  placeholder="Search by make, model, or year..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  aria-label="Search vehicles"
                />
              </div>
              <div className="w-full sm:w-56">
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger aria-label="Filter by status">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="sold">Sold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

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
                    {filtered.map((v: any) => (
                      <Card key={v.id} className="relative overflow-hidden glass-card hover-scale">
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between gap-2">
                            <CardTitle className="text-base">{v.year} {v.make} {v.model}</CardTitle>
                            <StatusBadge status={v.status ?? "-"} className="capitalize" />
                          </div>
                          <CardDescription className="text-3xl font-semibold mt-1">
                            {v.price != null ? formatCurrency(Number(v.price)) : "-"}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground flex items-center justify-between">
                          <div>
                            Mileage: {v.mileage != null ? formatNumber(Number(v.mileage)) : "-"}
                          </div>
                          <Button size="sm" variant="outline">View</Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center text-muted-foreground">No vehicles found.</div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </>
  );
};

export default Inventory;
