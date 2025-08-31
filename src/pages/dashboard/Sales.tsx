import React from "react";
import { useSales, useUpdateSale, useDeleteSale } from "@/hooks/useSales";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/format";
import PageHeader from "@/components/common/PageHeader";
import StatusBadge from "@/components/common/StatusBadge";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { DollarSign, TrendingUp, Clock, Target, ChevronDown, MoreHorizontal, Pencil, Trash2, Mail, Phone } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import { differenceInDays } from "date-fns";

const DEAL_STAGES = [
  { value: "lead", label: "Lead", color: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  { value: "qualified", label: "Qualified", color: "bg-green-500/10 text-green-600 border-green-500/20" },
  { value: "negotiation", label: "Negotiation", color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" },
  { value: "paperwork", label: "Paperwork", color: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
  { value: "closed_won", label: "Closed Won", color: "bg-green-600/10 text-green-700 border-green-600/20" },
  { value: "closed_lost", label: "Closed Lost", color: "bg-red-500/10 text-red-600 border-red-500/20" },
];

const Sales: React.FC = () => {
  const [deletingSaleId, setDeletingSaleId] = React.useState<string | null>(null);
  const [query, setQuery] = React.useState("");
  const [stageFilter, setStageFilter] = React.useState<string>("all");
  
  const { data, isLoading, error } = useSales();
  const updateSaleMutation = useUpdateSale();
  const deleteSaleMutation = useDeleteSale();

  const handleStageUpdate = (saleId: string, newStage: string) => {
    updateSaleMutation.mutate({ 
      id: saleId, 
      values: { stage: newStage } 
    });
  };

  const handleDeleteSale = () => {
    if (deletingSaleId) {
      deleteSaleMutation.mutate(deletingSaleId);
      setDeletingSaleId(null);
    }
  };

  const getStageColor = (stage: string) => {
    const stageObj = DEAL_STAGES.find(s => s.value === stage);
    return stageObj?.color || "bg-muted text-muted-foreground border-muted-foreground/20";
  };

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return (data ?? []).filter((sale: any) => {
      const matchesQuery = q
        ? [
            sale.leads?.first_name,
            sale.leads?.last_name,
            sale.leads?.email,
            sale.vehicles?.make,
            sale.vehicles?.model,
            sale.vehicles?.vin,
          ]
            .filter(Boolean)
            .some((v) => String(v).toLowerCase().includes(q))
        : true;
      const matchesStage = stageFilter === "all" ? true : sale.stage === stageFilter;
      return matchesQuery && matchesStage;
    });
  }, [data, query, stageFilter]);

  const kpis = React.useMemo(() => {
    const all = (data ?? []);
    const openDeals = all.filter((s: any) => !["closed_won", "closed_lost"].includes(s.stage));
    const closedWon = all.filter((s: any) => s.stage === "closed_won");
    const hotDeals = all.filter((s: any) => 
      s.stage === "negotiation" || s.stage === "paperwork"
    );
    const overdue = all.filter((s: any) => 
      s.expected_close_date && 
      new Date(s.expected_close_date) < new Date() && 
      !["closed_won", "closed_lost"].includes(s.stage)
    );

    const totalValue = openDeals.reduce((sum: number, sale: any) => 
      sum + (sale.sale_price || 0), 0
    );

    return {
      openDeals: openDeals.length,
      totalValue,
      hotDeals: hotDeals.length,
      overdue: overdue.length,
    };
  }, [data]);

  return (
    <>
      <SEO
        title="Sales Pipeline | Dealer Dashboard"
        description="Manage your sales pipeline and track deal progress."
        canonical="/app/sales"
        noIndex
      />
      <section className="animate-fade-in">
        <PageHeader
          title="Sales Pipeline"
          description="Track deals from lead to close and manage your sales process."
        />
        
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Open Deals" value={kpis.openDeals} icon={Target} />
          <StatCard title="Pipeline Value" value={formatCurrency(kpis.totalValue)} icon={DollarSign} />
          <StatCard title="Hot Deals" value={kpis.hotDeals} icon={TrendingUp} />
          <StatCard title="Overdue" value={kpis.overdue} icon={Clock} />
        </div>

        <Card className="glass-card">
          <CardHeader className="gap-3">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
              <div>
                <CardTitle>Active Deals</CardTitle>
                <CardDescription>Track your sales pipeline and deal progress</CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <div className="relative flex-1 min-w-[260px]">
                  <Input
                    placeholder="Search deals, customers, vehicles..."
                    value={query}
                    onChange={(e) => setQuery(e.currentTarget.value)}
                    aria-label="Search deals"
                  />
                </div>
                <div className="w-full sm:w-56">
                  <Select value={stageFilter} onValueChange={setStageFilter}>
                    <SelectTrigger aria-label="Filter by stage">
                      <SelectValue placeholder="Filter by stage" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Stages</SelectItem>
                      {DEAL_STAGES.map((stage) => (
                        <SelectItem key={stage.value} value={stage.value}>
                          {stage.label}
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
                          <TableHead>Customer</TableHead>
                          <TableHead>Vehicle</TableHead>
                          <TableHead>Stage</TableHead>
                          <TableHead className="hidden sm:table-cell">Value</TableHead>
                          <TableHead className="hidden md:table-cell">Expected Close</TableHead>
                          <TableHead className="hidden lg:table-cell">Created</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filtered.map((sale: any) => {
                          const isOverdue = sale.expected_close_date && 
                            new Date(sale.expected_close_date) < new Date() && 
                            !["closed_won", "closed_lost"].includes(sale.stage);
                          
                          return (
                            <TableRow key={sale.id} className="hover:bg-muted/40">
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="font-medium">
                                    {sale.leads?.first_name} {sale.leads?.last_name}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {sale.leads?.email}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="font-medium">
                                    {sale.vehicles?.year} {sale.vehicles?.make} {sale.vehicles?.model}
                                  </div>
                                  {sale.vehicles?.vin && (
                                    <div className="text-sm text-muted-foreground">
                                      VIN: ...{sale.vehicles.vin.slice(-6)}
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Select 
                                  value={sale.stage || "lead"} 
                                  onValueChange={(newStage) => handleStageUpdate(sale.id, newStage)}
                                >
                                  <SelectTrigger className="w-auto h-9 px-3">
                                    <div className={`px-2 py-1 rounded-md text-xs font-medium border ${getStageColor(sale.stage)}`}>
                                      {DEAL_STAGES.find(s => s.value === sale.stage)?.label || sale.stage}
                                    </div>
                                    <ChevronDown className="h-4 w-4 text-muted-foreground ml-1" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {DEAL_STAGES.map((stage) => (
                                      <SelectItem key={stage.value} value={stage.value}>
                                        {stage.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell className="hidden sm:table-cell">
                                {sale.sale_price ? formatCurrency(sale.sale_price) : "-"}
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                {sale.expected_close_date ? (
                                  <div className={isOverdue ? "text-destructive font-medium" : ""}>
                                    {formatDate(sale.expected_close_date)}
                                    {isOverdue && " (Overdue)"}
                                  </div>
                                ) : (
                                  "-"
                                )}
                              </TableCell>
                              <TableCell className="hidden lg:table-cell">
                                {formatDate(sale.created_at)}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  {sale.leads?.phone && (
                                    <Button 
                                      size="sm" 
                                      variant="outline" 
                                      asChild
                                      className="h-8"
                                    >
                                      <a href={`tel:${sale.leads.phone}`} aria-label="Call customer">
                                        <Phone className="h-3 w-3" />
                                      </a>
                                    </Button>
                                  )}
                                  {sale.leads?.email && (
                                    <Button 
                                      size="sm" 
                                      variant="outline" 
                                      asChild
                                      className="h-8"
                                    >
                                      <a href={`mailto:${sale.leads.email}`} aria-label="Email customer">
                                        <Mail className="h-3 w-3" />
                                      </a>
                                    </Button>
                                  )}
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                                        <MoreHorizontal className="h-3 w-3" />
                                        <span className="sr-only">Open menu</span>
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48">
                                      <DropdownMenuItem 
                                        onClick={() => setDeletingSaleId(sale.id)}
                                        className="text-sm text-destructive focus:text-destructive"
                                      >
                                        <Trash2 className="h-3 w-3 mr-2" />
                                        Delete Deal
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
                  <div className="py-12 text-center text-muted-foreground">
                    No deals found. Convert leads to deals to start tracking your sales pipeline.
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
      
      <ConfirmDialog
        open={!!deletingSaleId}
        onOpenChange={(open) => !open && setDeletingSaleId(null)}
        title="Delete Deal"
        description="Are you sure you want to delete this deal? This action cannot be undone."
        confirmText="Delete"
        variant="destructive"
        onConfirm={handleDeleteSale}
      />
    </>
  );
};

export default Sales;