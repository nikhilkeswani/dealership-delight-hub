import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatNumber } from "@/lib/format";

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
      />
      <section className="animate-fade-in">
        <h1 className="text-2xl font-semibold mb-4">Inventory</h1>
        <Card>
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
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Year</TableHead>
                      <TableHead>Make</TableHead>
                      <TableHead>Model</TableHead>
                      <TableHead>Mileage</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered && filtered.length > 0 ? (
                      filtered.map((v: any) => (
                        <TableRow key={v.id}>
                          <TableCell>{v.year}</TableCell>
                          <TableCell>{v.make}</TableCell>
                          <TableCell>{v.model}</TableCell>
                          <TableCell>{v.mileage != null ? formatNumber(Number(v.mileage)) : "-"}</TableCell>
                          <TableCell>{v.price != null ? formatCurrency(Number(v.price)) : "-"}</TableCell>
                          <TableCell>
                            <Badge
                              variant={String(v.status).toLowerCase() === "sold" ? "destructive" : String(v.status).toLowerCase() === "pending" ? "outline" : "secondary"}
                              className="capitalize"
                            >
                              {v.status ?? "-"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                          No vehicles found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </>
  );
};

export default Inventory;
