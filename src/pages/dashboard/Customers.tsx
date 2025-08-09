import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDate } from "@/lib/format";

const Customers: React.FC = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("id, first_name, last_name, email, phone, city, state, created_at, total_spent")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <>
      <SEO
        title="Customers | Dealer Dashboard"
        description="View and manage your dealership's customers."
        canonical="/app/customers"
      />
      <section className="animate-fade-in">
        <h1 className="text-2xl font-semibold mb-4">Customers</h1>
        <Card>
          <CardHeader>
            <CardTitle>Customer List</CardTitle>
            <CardDescription>All customers associated with your dealership</CardDescription>
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Total Spent</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data && data.length > 0 ? (
                    data.map((c: any) => (
                      <TableRow key={c.id}>
                        <TableCell>{c.first_name} {c.last_name}</TableCell>
                        <TableCell>{c.email}</TableCell>
                        <TableCell>{c.phone ?? "-"}</TableCell>
                        <TableCell>{[c.city, c.state].filter(Boolean).join(", ")}</TableCell>
                        <TableCell>{formatCurrency(Number(c.total_spent ?? 0))}</TableCell>
                        <TableCell>{formatDate(c.created_at)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        No customers found.
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

export default Customers;
