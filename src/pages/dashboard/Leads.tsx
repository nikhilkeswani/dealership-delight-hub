import React from "react";
import { useLeads, useCreateLead, useUpdateLead, useDeleteLead } from "@/hooks/useLeads";
import LeadFormDialog from "@/components/leads/LeadFormDialog";
import type { LeadFormValues } from "@/components/leads/LeadFormDialog";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import PageHeader from "@/components/common/PageHeader";
import StatusBadge from "@/components/common/StatusBadge";
import { Input } from "@/components/ui/input";
import { Eye, Mail, Phone, Activity, Flame, TrendingUp, CalendarCheck, Pencil, Trash2, ChevronDown } from "lucide-react";
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

  // Helper function to check if lead is new (created within last 3 days)
  const isNewLead = (createdAt: string) => {
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
                    <SelectTrigger aria-label="Filter by status" className="bg-background">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent className="z-50 bg-popover">
                      {["all", "new", "contacted", "qualified", "converted", "lost"].map((s) => (
                        <SelectItem key={s} value={s} className="capitalize">
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
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
                {filtered && filtered.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filtered.map((l: any) => {
                      const leadAge = getLeadAge(l.created_at);
                      const isNew = isNewLead(l.created_at);
                      
                      return (
                        <Card key={l.id} className="relative overflow-hidden glass-card hover-scale">
                          {/* NEW Banner for leads created within last 3 days */}
                          {isNew && (
                            <div className="absolute top-2 left-2 z-10">
                              <div className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground text-xs font-bold px-2 py-1 rounded-full shadow-lg animate-pulse">
                                NEW
                              </div>
                            </div>
                          )}
                          
                          <CardHeader className="pb-2">
                            <div className="flex items-start justify-between gap-2">
                              <CardTitle className="text-base">{l.first_name} {l.last_name}</CardTitle>
                              
                              {/* Enhanced Status Display */}
                              <div className="flex flex-col items-end gap-1">
                                <Select 
                                  value={l.status || "new"} 
                                  onValueChange={(newStatus) => handleQuickStatusUpdate(l.id, newStatus)}
                                >
                                  <SelectTrigger className="w-auto h-8 text-xs font-medium border-0 bg-secondary/20 hover:bg-secondary/30 transition-colors">
                                    <StatusBadge status={l.status ?? "new"} className="capitalize border-0 bg-transparent" />
                                    <ChevronDown className="h-3 w-3 ml-1" />
                                  </SelectTrigger>
                                  <SelectContent className="z-50 bg-popover min-w-[120px]">
                                    {["new", "contacted", "qualified", "converted", "lost"].map((status) => (
                                      <SelectItem key={status} value={status} className="capitalize text-xs">
                                        {status}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                
                                {/* Lead Age Indicator */}
                                <div className="text-xs text-muted-foreground">
                                  {leadAge === 0 ? "Today" : leadAge === 1 ? "1 day ago" : `${leadAge} days ago`}
                                </div>
                              </div>
                            </div>
                            <CardDescription className="mt-1">{l.email || "-"}</CardDescription>
                          </CardHeader>
                          
                          <CardContent className="text-sm text-muted-foreground">
                            <div className="flex items-center justify-between">
                              <div>
                                <div>Phone: {l.phone ?? "-"}</div>
                                <div className="capitalize">Source: {l.source ?? "-"}</div>
                              </div>
                              <div className="text-right">
                                <div className="text-xs">Created</div>
                                <div className="font-medium">{formatDate(l.created_at)}</div>
                              </div>
                            </div>
                            
                            {/* Quick Action Buttons */}
                            <div className="mt-3 flex flex-wrap gap-2">
                              {l.status === "new" && (
                                <>
                                  <Button 
                                    size="sm" 
                                    variant="secondary" 
                                    className="text-xs h-7"
                                    onClick={() => handleQuickStatusUpdate(l.id, "contacted")}
                                  >
                                    Mark Contacted
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="text-xs h-7"
                                    onClick={() => handleQuickStatusUpdate(l.id, "qualified")}
                                  >
                                    Mark Qualified
                                  </Button>
                                </>
                              )}
                              
                              <Button size="sm" variant="outline" asChild className="h-7">
                                <a href={`tel:${l.phone ?? ""}`} aria-label="Call lead">
                                  <Phone className="h-3 w-3 mr-1" />
                                  <span className="text-xs">Call</span>
                                </a>
                              </Button>
                              <Button size="sm" variant="outline" asChild className="h-7">
                                <a href={`mailto:${l.email ?? ""}`} aria-label="Email lead">
                                  <Mail className="h-3 w-3 mr-1" />
                                  <span className="text-xs">Email</span>
                                </a>
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                aria-label="Edit lead"
                                className="h-7"
                                onClick={() => setEditingLead(l)}
                              >
                                <Pencil className="h-3 w-3 mr-1" />
                                <span className="text-xs">Edit</span>
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                aria-label="Delete lead"
                                className="h-7 text-destructive hover:text-destructive"
                                onClick={() => setDeletingLeadId(l.id)}
                              >
                                <Trash2 className="h-3 w-3 mr-1" />
                                <span className="text-xs">Delete</span>
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
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
