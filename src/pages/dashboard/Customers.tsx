import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency, formatDate } from "@/lib/format";
import { useToast } from "@/hooks/use-toast";
import CustomerFormDialog from "@/components/customers/CustomerFormDialog";
import CustomerDrawer, { type Customer } from "@/components/customers/CustomerDrawer";
import { Download, Plus } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";

const Customers: React.FC = () => {
  const { toast } = useToast();
  const { data, isLoading, error } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("id, first_name, last_name, email, phone, city, state, created_at, total_spent, purchase_history")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Customer[];
    },
  });

  // UI state
  const [search, setSearch] = React.useState("");
  const [stateFilter, setStateFilter] = React.useState<string>("all");
  const [dateFilter, setDateFilter] = React.useState<string>("all");
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<Customer | null>(null);
  const [formOpen, setFormOpen] = React.useState(false);
  const [editValues, setEditValues] = React.useState<Partial<Customer> | undefined>(undefined);

  const uniqueStates = React.useMemo(() => {
    const s = new Set<string>();
    (data ?? []).forEach((c) => c.state && s.add(c.state));
    return Array.from(s).sort();
  }, [data]);

  const filtered = React.useMemo(() => {
    let rows = [...(data ?? [])];
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter((c) =>
        [c.first_name, c.last_name, c.email, c.phone, c.city, c.state]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q))
      );
    }
    if (stateFilter !== "all") rows = rows.filter((c) => c.state === stateFilter);
    if (dateFilter !== "all") {
      const now = new Date();
      let from: Date | null = null;
      if (dateFilter === "30") {
        from = new Date();
        from.setDate(now.getDate() - 30);
      } else if (dateFilter === "90") {
        from = new Date();
        from.setDate(now.getDate() - 90);
      } else if (dateFilter === "year") {
        from = new Date(now.getFullYear(), 0, 1);
      }
      if (from) rows = rows.filter((c) => new Date(c.created_at || 0) >= from!);
    }
    return rows;
  }, [data, search, stateFilter, dateFilter]);

  // pagination (client-side)
  const [page, setPage] = React.useState(1);
  const pageSize = 10;
  const pageCount = Math.max(1, Math.ceil((filtered?.length ?? 0) / pageSize));
  React.useEffect(() => setPage(1), [search, stateFilter, dateFilter]);
  const pageRows = React.useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  // KPIs
  const totalCustomers = data?.length ?? 0;
  const totalSpent = (data ?? []).reduce((sum, c) => sum + Number(c.total_spent ?? 0), 0);
  const avgSpent = totalCustomers > 0 ? totalSpent / totalCustomers : 0;
  const newThisMonth = React.useMemo(() => {
    const d = new Date();
    const start = new Date(d.getFullYear(), d.getMonth(), 1);
    return (data ?? []).filter((c) => new Date(c.created_at || 0) >= start).length;
  }, [data]);

  const handleExport = () => {
    const rows = [
      ["First Name", "Last Name", "Email", "Phone", "City", "State", "Total Spent", "Created"],
      ...filtered.map((c) => [
        c.first_name,
        c.last_name,
        c.email ?? "",
        c.phone ?? "",
        c.city ?? "",
        c.state ?? "",
        String(Number(c.total_spent ?? 0)),
        c.created_at ? new Date(c.created_at).toISOString() : "",
      ]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `customers_export_${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const onAdd = () => {
    setEditValues(undefined);
    setFormOpen(true);
  };
  const onEdit = (c: Customer) => {
    setEditValues(c);
    setFormOpen(true);
  };
  const onView = (c: Customer) => {
    setSelected(c);
    setDrawerOpen(true);
  };
  const onDelete = (c: Customer) => {
    toast({ title: "Demo only", description: `Would delete ${c.first_name} ${c.last_name} in production.` });
  };

  return (
    <>
      <SEO
        title="Customers | Dealer Dashboard"
        description="View and manage your dealership's customers."
        canonical="/app/customers"
        noIndex
      />
      <section className="animate-fade-in space-y-4">
        <PageHeader
          title="Customers"
          description="Customer directory and insights"
          actions={
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" /> Export CSV
              </Button>
              <Button onClick={onAdd} variant="hero">
                <Plus className="h-4 w-4 mr-2" /> Add Customer
              </Button>
            </div>
          }
        />

        <section aria-label="KPIs" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="glass-card">
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Customers</CardTitle></CardHeader>
            <CardContent className="text-2xl font-bold">{totalCustomers}</CardContent>
          </Card>
          <Card className="glass-card">
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">New This Month</CardTitle></CardHeader>
            <CardContent className="text-2xl font-bold">{newThisMonth}</CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Spent</CardTitle></CardHeader>
            <CardContent className="text-2xl font-bold">{formatCurrency(totalSpent)}</CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Avg Spent</CardTitle></CardHeader>
            <CardContent className="text-2xl font-bold">{formatCurrency(avgSpent)}</CardContent>
          </Card>
        </section>

        <Card>
          <CardHeader className="gap-3">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
              <div>
                <CardTitle>Customer List</CardTitle>
                <CardDescription>All customers associated with your dealership</CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <div className="relative flex-1 min-w-[220px]">
                  <Input
                    placeholder="Search name, email, phone..."
                    value={search}
                    onChange={(e) => setSearch(e.currentTarget.value)}
                  />
                </div>
                <Select value={stateFilter} onValueChange={setStateFilter}>
                  <SelectTrigger className="w-[180px]"><SelectValue placeholder="State" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All states</SelectItem>
                    {uniqueStates.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-[180px]"><SelectValue placeholder="Date range" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All time</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="90">Last 90 days</SelectItem>
                    <SelectItem value="year">This year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="space-y-2">
                {[...Array(8)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            )}
            {error && <div className="text-destructive">{(error as any).message}</div>}
            {!isLoading && !error && (
              <>
                {pageRows && pageRows.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {pageRows.map((c) => (
                      <Card
                        key={c.id}
                        className="relative overflow-hidden bg-card/60 backdrop-blur border hover-scale cursor-pointer"
                        onClick={() => onView(c)}
                      >
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">{c.first_name} {c.last_name}</CardTitle>
                          <CardDescription>{c.email || "-"}</CardDescription>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground flex items-start justify-between gap-4">
                          <div className="space-y-1">
                            <div>Phone: {c.phone ?? "-"}</div>
                            <div>Location: {[c.city, c.state].filter(Boolean).join(", ") || "-"}</div>
                            <div>Joined: {formatDate(c.created_at)}</div>
                          </div>
                          <div className="flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
                            <Button size="sm" variant="outline" onClick={() => onEdit(c)}>Edit</Button>
                            <Button size="sm" variant="ghost" onClick={() => onDelete(c)}>Delete</Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center text-muted-foreground">No customers found.</div>
                )}

                <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
                  <div>
                    Page {page} of {pageCount}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                      Previous
                    </Button>
                    <Button variant="outline" size="sm" disabled={page >= pageCount} onClick={() => setPage((p) => Math.min(pageCount, p + 1))}>
                      Next
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </section>

      <CustomerFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        initialValues={editValues}
        onSubmit={(values) => {
          toast({ title: "Saved (demo)", description: `${values.first_name} ${values.last_name} saved.` });
        }}
      />

      <CustomerDrawer open={drawerOpen} onOpenChange={setDrawerOpen} customer={selected ?? undefined} />
    </>
  );
};

export default Customers;
