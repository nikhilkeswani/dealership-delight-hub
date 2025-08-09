import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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

  return (
    <>
      <SEO
        title="Inventory | Dealer Dashboard"
        description="Manage vehicle inventory for your dealership. View, filter, and update vehicles."
        canonical="/app/inventory"
      />
      <section>
        <h1 className="text-2xl font-semibold mb-4">Inventory</h1>
        <Card>
          <CardHeader>
            <CardTitle>Vehicles</CardTitle>
            <CardDescription>Your current listed vehicles</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && <div className="text-muted-foreground">Loading vehicles...</div>}
            {error && <div className="text-destructive">{(error as any).message}</div>}
            {!isLoading && !error && (
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
                  {data && data.length > 0 ? (
                    data.map((v) => (
                      <TableRow key={v.id}>
                        <TableCell>{v.year}</TableCell>
                        <TableCell>{v.make}</TableCell>
                        <TableCell>{v.model}</TableCell>
                        <TableCell>{v.mileage?.toLocaleString?.() ?? "-"}</TableCell>
                        <TableCell>{v.price ? `$${Number(v.price).toLocaleString()}` : "-"}</TableCell>
                        <TableCell className="capitalize">{v.status}</TableCell>
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
            )}
          </CardContent>
        </Card>
      </section>
    </>
  );
};

export default Inventory;
