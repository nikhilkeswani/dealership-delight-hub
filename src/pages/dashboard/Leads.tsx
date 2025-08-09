import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";

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

  return (
    <>
      <SEO
        title="Leads | Dealer Dashboard"
        description="Track and manage sales leads for your dealership."
        canonical="/app/leads"
      />
      <section className="animate-fade-in">
        <h1 className="text-2xl font-semibold mb-4">Leads</h1>
        <Card>
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Leads</CardTitle>
              <CardDescription>New inquiries and their status</CardDescription>
            </div>
            <Button size="sm">Add Lead</Button>
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
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data && data.length > 0 ? (
                      data.map((l: any) => (
                        <TableRow key={l.id}>
                          <TableCell>{l.first_name} {l.last_name}</TableCell>
                          <TableCell>{l.email}</TableCell>
                          <TableCell>{l.phone ?? "-"}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="capitalize">{l.status ?? "-"}</Badge>
                          </TableCell>
                          <TableCell className="capitalize">{l.source}</TableCell>
                          <TableCell>{formatDate(l.created_at)}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                          No leads found.
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

export default Leads;
