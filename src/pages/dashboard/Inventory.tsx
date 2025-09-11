import React, { useMemo, useState } from "react";
import { useVehicles, useCreateVehicle, useUpdateVehicle, useDeleteVehicle } from "@/hooks/useVehicles";
import VehicleFormDialog from "@/components/vehicles/VehicleFormDialog";
import type { VehicleFormValues } from "@/components/vehicles/VehicleFormDialog";
import ConfirmDialog from "@/components/common/ConfirmDialog";
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
  const [editingVehicle, setEditingVehicle] = useState<any>(null);
  const [deletingVehicleId, setDeletingVehicleId] = useState<string | null>(null);
  
  const { data, isLoading, error } = useVehicles();
  const createVehicleMutation = useCreateVehicle();
  const updateVehicleMutation = useUpdateVehicle();
  const deleteVehicleMutation = useDeleteVehicle();

  const handleCreateVehicle = (values: VehicleFormValues) => {
    createVehicleMutation.mutate(values);
  };

  const handleUpdateVehicle = (values: VehicleFormValues) => {
    if (editingVehicle) {
      updateVehicleMutation.mutate({ id: editingVehicle.id, values });
      setEditingVehicle(null);
    }
  };

  const handleDeleteVehicle = () => {
    if (deletingVehicleId) {
      deleteVehicleMutation.mutate(deletingVehicleId);
      setDeletingVehicleId(null);
    }
  };

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
      <section className="animate-fade-in space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">Inventory</h1>
            <p className="text-muted-foreground">Manage your vehicles with ease and precision.</p>
          </div>
          <Button size="sm" onClick={() => setVehicleDialogOpen(true)} className="w-fit">
            Add Vehicle
          </Button>
        </div>
        
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Total Vehicles" value={kpis.total} icon={Car} />
          <StatCard title="Available" value={kpis.available} icon={CircleDot} />
          <StatCard title="Reserved" value={kpis.reserved} icon={Clock} />
          <StatCard title="Sold This Month" value={kpis.soldThisMonth} icon={CalendarCheck} />
        </div>
        <Card className="glass-card">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Vehicles</CardTitle>
            <CardDescription>Your current listed vehicles</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="w-full sm:max-w-md">
                <Input
                  placeholder="Search by make, model, or year..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  aria-label="Search vehicles"
                  className="h-10"
                />
              </div>
              <div className="flex w-full sm:w-auto items-center gap-3">
                <div className="w-full sm:w-56">
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger aria-label="Filter by status" className="h-10 glass-card">
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent className="z-50 glass-card">
                      <SelectItem value="all">All statuses</SelectItem>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="sold">Sold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="outline" className="whitespace-nowrap h-10">
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
                           <TableHead className="w-16"></TableHead>
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
                               <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                                 {v.images && v.images.length > 0 ? (
                                   <img
                                     src={v.images[0]}
                                     alt={`${v.year} ${v.make} ${v.model}`}
                                     className="w-full h-full object-cover"
                                   />
                                 ) : (
                                   <Car className="h-6 w-6 text-muted-foreground" />
                                 )}
                               </div>
                             </TableCell>
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
                                <Button 
                                  size="icon" 
                                  variant="outline" 
                                  aria-label="Edit"
                                  onClick={() => setEditingVehicle(v)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="icon" 
                                  variant="outline" 
                                  aria-label="Delete"
                                  onClick={() => setDeletingVehicleId(v.id)}
                                >
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
        onSubmit={handleCreateVehicle}
      />
      
      <VehicleFormDialog
        open={!!editingVehicle}
        onOpenChange={(open) => !open && setEditingVehicle(null)}
        initialValues={editingVehicle}
        onSubmit={handleUpdateVehicle}
      />
      
      <ConfirmDialog
        open={!!deletingVehicleId}
        onOpenChange={(open) => !open && setDeletingVehicleId(null)}
        title="Delete Vehicle"
        description="Are you sure you want to delete this vehicle? This action cannot be undone."
        confirmText="Delete"
        variant="destructive"
        onConfirm={handleDeleteVehicle}
      />
    </>
  );
};

export default Inventory;
