import React, { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useDealer } from "@/hooks/useDealer";
import VehicleFormDialog from "@/components/vehicles/VehicleFormDialog";
import type { VehicleFormValues } from "@/components/vehicles/VehicleFormDialog";
import { toast } from "sonner";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import StatusBadge from "@/components/common/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatNumber, formatDate } from "@/lib/format";
import PageHeader from "@/components/common/PageHeader";
import StatCard from "@/components/dashboard/StatCard";
import { Car, CircleDot, Clock, CalendarCheck, Eye, Pencil, Trash2, Filter } from "lucide-react";

const Inventory: React.FC = () => {
  const [vehicleDialogOpen, setVehicleDialogOpen] = useState(false);
  const { data: dealer } = useDealer();
  const queryClient = useQueryClient();

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

  const createVehicleMutation = useMutation({
    mutationFn: async (values: VehicleFormValues) => {
      if (!dealer?.id) throw new Error("No dealer found");
      
      const { data, error } = await supabase
        .from("vehicles")
        .insert({
          ...values,
          dealer_id: dealer.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      toast.success("Vehicle added successfully");
    },
    onError: (error) => {
      toast.error("Failed to add vehicle: " + error.message);
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

  const kpis = useMemo(() => {
    const all = (data ?? []) as any[];
    const norm = (s: any) => String(s ?? '').toLowerCase();
    const total = all.length;
    const available = all.filter((v) => norm(v.status) === 'available').length;
    const reserved = all.filter((v) => ['pending', 'reserved'].includes(norm(v.status))).length;
    const now = new Date();
    const soldThisMonth = all.filter(
      (v) =>
        norm(v.status) === 'sold' && v.updated_at &&
        new Date(v.updated_at).getMonth() === now.getMonth() &&
        new Date(v.updated_at).getFullYear() === now.getFullYear()
    ).length;
    return { total, available, reserved, soldThisMonth };
  }, [data]);

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
          actions={<Button size="sm" variant="hero" onClick={() => setVehicleDialogOpen(true)}>Add Vehicle</Button>}
        />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Total Vehicles" value={kpis.total} icon={Car} />
          <StatCard title="Available" value={kpis.available} icon={CircleDot} />
          <StatCard title="Reserved" value={kpis.reserved} icon={Clock} />
          <StatCard title="Sold This Month" value={kpis.soldThisMonth} icon={CalendarCheck} />
        </div>
        <Card className="glass-card">
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle>Vehicles</CardTitle>
              <CardDescription>Your current listed vehicles</CardDescription>
            </div>
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
              <div className="flex w-full sm:w-auto items-center gap-2">
                <div className="w-full sm:w-56">
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger aria-label="Filter by status" className="bg-background">
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent className="z-50 bg-popover">
                      <SelectItem value="all">All statuses</SelectItem>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="sold">Sold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="outline" className="whitespace-nowrap">
                  <Filter className="mr-2 h-4 w-4" /> Filters
                </Button>
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
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Vehicle</TableHead>
                          <TableHead className="text-right">Price</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="hidden sm:table-cell">Mileage</TableHead>
                          <TableHead className="hidden md:table-cell">Updated</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filtered.map((v: any) => (
                          <TableRow key={v.id} className="hover:bg-muted/40">
                            <TableCell>
                              <div className="font-medium">{v.year} {v.make} {v.model}</div>
                            </TableCell>
                            <TableCell className="text-right">
                              {v.price != null ? formatCurrency(Number(v.price)) : "-"}
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={v.status ?? "-"} className="capitalize" />
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                              {v.mileage != null ? `${formatNumber(Number(v.mileage))} miles` : "-"}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {v.updated_at ? formatDate(v.updated_at) : "-"}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button size="icon" variant="outline" aria-label="View">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button size="icon" variant="outline" aria-label="Edit">
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button size="icon" variant="outline" aria-label="Delete">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="py-12 text-center text-muted-foreground">No vehicles found.</div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
      
      <VehicleFormDialog
        open={vehicleDialogOpen}
        onOpenChange={setVehicleDialogOpen}
        onSubmit={createVehicleMutation.mutate}
      />
    </>
  );
};

export default Inventory;
