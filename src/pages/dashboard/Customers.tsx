import React from "react";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { formatCurrency, formatDate } from "@/lib/format";
import { useToast } from "@/hooks/use-toast";
import { useCustomers, useDeleteCustomer, type Customer } from "@/hooks/useCustomers";
import { useDealer } from "@/hooks/useDealer";
import CustomerFormDialog from "@/components/customers/CustomerFormDialog";
import CustomerDrawer from "@/components/customers/CustomerDrawer";
import CustomerKPIs from "@/components/dashboard/CustomerKPIs";
import LoadingState from "@/components/common/LoadingState";
import { 
  Download, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  MoreHorizontal,
  Phone,
  Mail
} from "lucide-react";

const Customers: React.FC = () => {
  const { toast } = useToast();
  const { data: dealer, isLoading: dealerLoading, error: dealerError } = useDealer();
  const { data, isLoading: customersLoading, error: customersError } = useCustomers();
  const deleteCustomer = useDeleteCustomer();

  // Ensure customers are only loaded when dealer exists
  // Handle loading states separately for better error isolation
  const shouldLoadCustomers = !!dealer && !dealerLoading;

  // Combined loading and error states
  const isCustomersReady = shouldLoadCustomers && !customersLoading;
  const hasError = dealerError || customersError;

  // Add debugging
  React.useEffect(() => {
    console.log("Customers component render:", { 
      dealer: !!dealer, 
      dealerLoading, 
      dealerError: !!dealerError,
      hasData: !!data, 
      dataLength: data?.length, 
      customersLoading, 
      customersError: !!customersError,
      shouldLoadCustomers,
      isCustomersReady,
      hasError: !!hasError
    });
  }, [dealer, dealerLoading, dealerError, data, customersLoading, customersError, shouldLoadCustomers, isCustomersReady, hasError]);

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

  // Early return for dealer loading
  if (dealerLoading) {
    return (
      <>
        <SEO
          title="Customers | Dealer Dashboard"
          description="View and manage your dealership's customers."
          canonical="/app/customers"
          noIndex
        />
        <div className="min-h-[50vh] flex items-center justify-center">
          <LoadingState message="Loading dealer profile..." />
        </div>
      </>
    );
  }

  // Early return for no dealer
  if (!dealer) {
    return (
      <>
        <SEO
          title="Customers | Dealer Dashboard"
          description="View and manage your dealership's customers."
          canonical="/app/customers"
          noIndex
        />
        <div className="min-h-[50vh] flex items-center justify-center">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">No dealer profile found.</p>
            <p className="text-sm text-muted-foreground">Please complete your onboarding first.</p>
          </div>
        </div>
      </>
    );
  }

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
  const handleDelete = async (c: Customer) => {
    try {
      await deleteCustomer.mutateAsync(c.id);
      toast({ title: "Customer deleted", description: `${c.first_name} ${c.last_name} has been removed.` });
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Failed to delete customer",
        variant: "destructive"
      });
    }
  };

  return (
    <>
      <SEO
        title="Customers | Dealer Dashboard"
        description="View and manage your dealership's customers."
        canonical="/app/customers"
        noIndex
      />
      <section className="animate-fade-in space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">Customers</h1>
            <p className="text-muted-foreground">Customer directory and insights</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" /> Export CSV
            </Button>
            <Button onClick={onAdd}>
              <Plus className="h-4 w-4 mr-2" /> Add Customer
            </Button>
          </div>
        </div>

        <CustomerKPIs 
          data={data} 
          isLoading={customersLoading} 
          error={customersError} 
        />

        <Card className="glass-card">
          <CardHeader className="space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="space-y-1">
                <CardTitle className="text-xl">Customer List</CardTitle>
                <CardDescription>All customers associated with your dealership</CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <div className="relative flex-1 min-w-[220px]">
                  <Input
                    placeholder="Search name, email, phone..."
                    value={search}
                    onChange={(e) => setSearch(e.currentTarget.value)}
                    className="h-10"
                  />
                </div>
                <Select value={stateFilter} onValueChange={setStateFilter}>
                  <SelectTrigger className="w-[180px] h-10 glass-card"><SelectValue placeholder="State" /></SelectTrigger>
                  <SelectContent className="glass-card">
                    <SelectItem value="all">All states</SelectItem>
                    {uniqueStates.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-[180px] h-10 glass-card"><SelectValue placeholder="Date range" /></SelectTrigger>
                  <SelectContent className="glass-card">
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
            {customersLoading && (
              <div className="space-y-2">
                {[...Array(8)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            )}
            {customersError && <div className="text-destructive">{(customersError as any).message}</div>}
            {!customersLoading && !customersError && (
              <>
                {pageRows && pageRows.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Customer</TableHead>
                          <TableHead>Contact</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Spent</TableHead>
                          <TableHead>Joined</TableHead>
                          <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pageRows.map((c) => {
                          const isRecent = new Date(c.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                          
                          return (
                            <TableRow key={c.id}>
                              <TableCell>
                                <div className="flex items-center space-x-3">
                                  <Avatar className="h-8 w-8">
                                     <AvatarFallback className="text-xs">
                                       {(c.first_name?.[0] || "?").toUpperCase()}{(c.last_name?.[0] || "?").toUpperCase()}
                                     </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="flex items-center space-x-2">
                                      <div className="font-medium">
                                        {c.first_name} {c.last_name}
                                      </div>
                                      {isRecent && (
                                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
                                          RECENT
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="text-sm">{c.email}</div>
                                  {c.phone && (
                                    <div className="text-sm text-muted-foreground">{c.phone}</div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                {c.city && c.state ? (
                                  <div className="text-sm">
                                    {c.city}, {c.state}
                                  </div>
                                ) : (
                                  <div className="text-sm text-muted-foreground">—</div>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="font-medium">{formatCurrency(c.total_spent || 0)}</div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm text-muted-foreground">
                                  {formatDate(c.created_at)}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-1">
                                  {c.phone && (
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <Phone className="h-4 w-4" />
                                    </Button>
                                  )}
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <Mail className="h-4 w-4" />
                                  </Button>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="glass-card">
                                      <DropdownMenuItem onClick={() => onView(c)}>
                                        <Eye className="h-4 w-4 mr-2" />
                                        View Details
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => onEdit(c)}>
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit Customer
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Delete
                                          </DropdownMenuItem>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent className="glass-card">
                                          <AlertDialogHeader>
                                            <AlertDialogTitle>Delete Customer</AlertDialogTitle>
                                            <AlertDialogDescription>
                                              Are you sure you want to delete {c.first_name} {c.last_name}? This action cannot be undone.
                                            </AlertDialogDescription>
                                          </AlertDialogHeader>
                                          <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction 
                                              onClick={() => handleDelete(c)}
                                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                            >
                                              Delete
                                            </AlertDialogAction>
                                          </AlertDialogFooter>
                                        </AlertDialogContent>
                                      </AlertDialog>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
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
      />

      <CustomerDrawer open={drawerOpen} onOpenChange={setDrawerOpen} customer={selected ?? undefined} />
    </>
  );
};

export default Customers;
