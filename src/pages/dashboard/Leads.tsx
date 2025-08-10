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
        noIndex
      />
      <section className="animate-fade-in">
        <PageHeader
          title="Leads"
          description="Track and manage sales leads for your dealership."
          actions={<Button size="sm" variant="hero">Add Lead</Button>}
        />
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Recent Leads</CardTitle>
              <CardDescription>New inquiries and their status</CardDescription>
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
                {data && data.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {data.map((l: any) => (
                      <Card key={l.id} className="relative overflow-hidden bg-card/60 backdrop-blur border hover-scale">
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between gap-2">
                            <CardTitle className="text-base">{l.first_name} {l.last_name}</CardTitle>
                            <StatusBadge status={l.status ?? "-"} className="capitalize" />
                          </div>
                          <CardDescription className="mt-1">{l.email || "-"}</CardDescription>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground flex items-center justify-between">
                          <div>
                            <div>Phone: {l.phone ?? "-"}</div>
                            <div className="capitalize">Source: {l.source ?? "-"}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs">Created</div>
                            <div className="font-medium">{formatDate(l.created_at)}</div>
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
