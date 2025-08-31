import React from "react";
import { useLeads, useCreateLead, useUpdateLead, useDeleteLead } from "@/hooks/useLeads";
import LeadFormDialog from "@/components/leads/LeadFormDialog";
import type { LeadFormValues } from "@/components/leads/LeadFormDialog";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import PageHeader from "@/components/common/PageHeader";
import StatusBadge from "@/components/common/StatusBadge";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Mail, Phone, Activity, Flame, TrendingUp, CalendarCheck, Pencil, Trash2, ChevronDown, MoreHorizontal, Filter } from "lucide-react";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import StatCard from "@/components/dashboard/StatCard";
import { isSameDay, differenceInDays } from "date-fns";

const Leads: React.FC = () => {
  const [leadDialogOpen, setLeadDialogOpen] = React.useState(false);
  const [editingLead, setEditingLead] = React.useState<any>(null);
  const [deletingLeadId, setDeletingLeadId] = React.useState<string | null>(null);
  
  const { data, isLoading, error } = useLeads();
  const createLeadMutation = useCreateLead();
  const updateLeadMutation = useUpdateLead();
  const deleteLeadMutation = useDeleteLead();

  // Helper function to check if lead is recent (created within last 3 days)
  const isRecentLead = (createdAt: string) => {
    const daysDiff = differenceInDays(new Date(), new Date(createdAt));
    return daysDiff <= 3;
  };

  // Helper function to get lead age in days
  const getLeadAge = (createdAt: string) => {
    return differenceInDays(new Date(), new Date(createdAt));
  };

  // Helper function to handle quick status update
  const handleQuickStatusUpdate = (leadId: string, newStatus: string) => {
    const lead = data?.find(l => l.id === leadId);
    if (lead) {
      updateLeadMutation.mutate({ 
        id: leadId, 
        values: { ...lead, status: newStatus as "new" | "contacted" | "qualified" | "converted" | "lost" } 
      });
    }
  };

  const handleCreateLead = (values: LeadFormValues) => {
    createLeadMutation.mutate(values);
  };

  const handleUpdateLead = (values: LeadFormValues) => {
    if (editingLead) {
      updateLeadMutation.mutate({ id: editingLead.id, values });
      setEditingLead(null);
    }
  };

  const handleDeleteLead = () => {
    if (deletingLeadId) {
      deleteLeadMutation.mutate(deletingLeadId);
      setDeletingLeadId(null);
    }
  };

  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState<string>("all");
  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return (data ?? []).filter((l: any) => {
      const matchesQuery = q
        ? [l.first_name, l.last_name, l.email, l.phone, l.source]
            .filter(Boolean)
            .some((v) => String(v).toLowerCase().includes(q))
        : true;
      const matchesStatus = status === "all" ? true : String(l.status ?? "").toLowerCase() === status;
      return matchesQuery && matchesStatus;
    });
  }, [data, query, status]);
const kpis = React.useMemo(() => {
  const all = (data ?? []) as any[];
  const total = all.length;
  const normalized = (s: any) => String(s ?? "").toLowerCase();
  const active = all.filter((l) => ["new", "contacted", "qualified"].includes(normalized(l.status))).length;
  const hot = all.filter((l) => ["qualified", "contacted"].includes(normalized(l.status))).length;
  const converted = all.filter((l) => normalized(l.status) === "converted").length;
  const convRate = total ? Math.round((converted / total) * 100) : 0;
  const todayFollowUps = all.filter((l) => l.follow_up_date && isSameDay(new Date(l.follow_up_date), new Date())).length;
  return { active, hot, convRate, todayFollowUps };
}, [data]);

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
          actions={<Button size="sm" variant="hero" onClick={() => setLeadDialogOpen(true)}>Add Lead</Button>}
/>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Active Leads" value={kpis.active} icon={Activity} />
          <StatCard title="Hot Leads" value={kpis.hot} icon={Flame} />
          <StatCard title="Conversion Rate" value={`${kpis.convRate}%`} icon={TrendingUp} />
          <StatCard title="Follow-ups Today" value={kpis.todayFollowUps} icon={CalendarCheck} />
        </div>
        <Card className="glass-card">
          <CardHeader className="gap-3">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
              <div>
                <CardTitle>Recent Leads</CardTitle>
                <CardDescription>New inquiries and their status</CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <div className="relative flex-1 min-w-[260px]">
                  <Input
                    placeholder="Search name, email, phone..."
                    value={query}
                    onChange={(e) => setQuery(e.currentTarget.value)}
                    aria-label="Search leads"
                  />
                </div>
                <div className="w-full sm:w-56">
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger aria-label="Filter by status" className="bg-background border border-border/50 hover:bg-muted/50 transition-colors shadow-sm">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent className="z-[100] bg-popover border border-border/80 shadow-lg rounded-md">
                      {["all", "new", "contacted", "qualified", "converted", "lost"].map((s) => (
                        <SelectItem key={s} value={s} className="capitalize hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground cursor-pointer">
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading && (
              <div className="space-y-2">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
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
                          <TableHead>Lead</TableHead>
                          <TableHead>Contact</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="hidden sm:table-cell">Source</TableHead>
                          <TableHead className="hidden md:table-cell">Age</TableHead>
                          <TableHead className="hidden lg:table-cell">Created</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filtered.map((l: any) => {
                          const leadAge = getLeadAge(l.created_at);
                          const isRecent = isRecentLead(l.created_at);
                          
                          return (
                            <TableRow key={l.id} className="hover:bg-muted/40">
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <div>
                                    <div className="font-medium flex items-center gap-2">
                                      {l.first_name} {l.last_name}
                                      {/* RECENT Banner for leads created within last 3 days */}
                                      {isRecent && (
                                        <span className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                                          RECENT
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="text-sm">{l.email || "-"}</div>
                                  <div className="text-sm text-muted-foreground">{l.phone || "-"}</div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Select 
                                  value={l.status || "new"} 
                                  onValueChange={(newStatus) => handleQuickStatusUpdate(l.id, newStatus)}
                                >
                                  <SelectTrigger className="w-auto h-9 px-3 bg-background border border-border/50 hover:bg-muted/50 transition-colors rounded-md shadow-sm">
                                    <StatusBadge status={l.status ?? "new"} className="capitalize mr-1" />
                                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                  </SelectTrigger>
                                  <SelectContent className="z-[100] bg-popover border border-border/80 shadow-lg rounded-md min-w-[140px]">
                                    {["new", "contacted", "qualified", "converted", "lost"].map((status) => (
                                      <SelectItem 
                                        key={status} 
                                        value={status} 
                                        className="capitalize text-sm hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground cursor-pointer"
                                      >
                                        {status}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell className="hidden sm:table-cell capitalize">
                                {l.source || "-"}
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                <div className="text-sm">
                                  {leadAge === 0 ? "Today" : leadAge === 1 ? "1 day ago" : `${leadAge} days ago`}
                                </div>
                              </TableCell>
                              <TableCell className="hidden lg:table-cell">
                                {formatDate(l.created_at)}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    asChild
                                    className="h-8"
                                  >
                                    <a href={`tel:${l.phone ?? ""}`} aria-label="Call lead">
                                      <Phone className="h-3 w-3" />
                                    </a>
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    asChild
                                    className="h-8"
                                  >
                                    <a href={`mailto:${l.email ?? ""}`} aria-label="Email lead">
                                      <Mail className="h-3 w-3" />
                                    </a>
                                  </Button>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                                        <MoreHorizontal className="h-3 w-3" />
                                        <span className="sr-only">Open menu</span>
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48">
                                      {l.status === "new" && (
                                        <>
                                          <DropdownMenuItem 
                                            onClick={() => handleQuickStatusUpdate(l.id, "contacted")}
                                            className="text-sm"
                                          >
                                            Mark as Contacted
                                          </DropdownMenuItem>
                                          <DropdownMenuItem 
                                            onClick={() => handleQuickStatusUpdate(l.id, "qualified")}
                                            className="text-sm"
                                          >
                                            Mark as Qualified
                                          </DropdownMenuItem>
                                        </>
                                      )}
                                      <DropdownMenuItem 
                                        onClick={() => setEditingLead(l)}
                                        className="text-sm"
                                      >
                                        <Pencil className="h-3 w-3 mr-2" />
                                        Edit Lead
                                      </DropdownMenuItem>
                                      <DropdownMenuItem 
                                        onClick={() => setDeletingLeadId(l.id)}
                                        className="text-sm text-destructive focus:text-destructive"
                                      >
                                        <Trash2 className="h-3 w-3 mr-2" />
                                        Delete Lead
                                      </DropdownMenuItem>
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
                  <div className="py-12 text-center text-muted-foreground">No leads found.</div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
      
      <LeadFormDialog
        open={leadDialogOpen}
        onOpenChange={setLeadDialogOpen}
        onSubmit={handleCreateLead}
      />
      
      <LeadFormDialog
        open={!!editingLead}
        onOpenChange={(open) => !open && setEditingLead(null)}
        initialValues={editingLead}
        onSubmit={handleUpdateLead}
      />
      
      <ConfirmDialog
        open={!!deletingLeadId}
        onOpenChange={(open) => !open && setDeletingLeadId(null)}
        title="Delete Lead"
        description="Are you sure you want to delete this lead? This action cannot be undone."
        confirmText="Delete"
        variant="destructive"
        onConfirm={handleDeleteLead}
      />
    </>
  );
};

export default Leads;
