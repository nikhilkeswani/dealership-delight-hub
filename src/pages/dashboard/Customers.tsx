import React, { useState, useMemo, useEffect } from "react";
import { Plus, Search, Download, Eye, Edit2, Trash2, Phone, Mail, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCustomers, useDeleteCustomer, type Customer } from "@/hooks/useCustomers";
import { useDealer } from "@/hooks/useDealer";
import CustomerFormDialog from "@/components/customers/CustomerFormDialog";
import { CustomerDrawer } from "@/components/customers/CustomerDrawer";
import CustomerKPIs from "@/components/dashboard/CustomerKPIs";
import { formatCurrency, formatDate } from "@/lib/format";
import { toast } from "sonner";
import LoadingState from "@/components/common/LoadingState";
import ConfirmDialog from "@/components/common/ConfirmDialog";

export default function Customers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedDateRange, setSelectedDateRange] = useState<string>("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);

  const { data: dealer, isLoading: isDealerLoading } = useDealer();
  const { data: customers, isLoading: isCustomersLoading, error: customersError } = useCustomers();
  const deleteCustomerMutation = useDeleteCustomer();

  const itemsPerPage = 10;

  // Debug logging for customer data
  useEffect(() => {
    if (customers && import.meta.env.DEV) {
      console.log("Customers page - received data:", {
        count: customers.length,
        firstCustomer: customers[0] ? {
          id: customers[0].id,
          firstName: customers[0].first_name,
          lastName: customers[0].last_name,
          email: customers[0].email
        } : null
      });
    }
  }, [customers]);

  // Get unique states for filter
  const uniqueStates = useMemo(() => {
    if (!customers) return [];
    const states = customers
      .map(c => c.state)
      .filter((state): state is string => !!state && state.trim() !== "");
    return Array.from(new Set(states)).sort();
  }, [customers]);

  // Filter and search customers
  const filtered = useMemo(() => {
    if (!customers) return [];
    
    return customers.filter(customer => {
      const matchesSearch = !searchTerm || 
        customer.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesState = !selectedState || customer.state === selectedState;
      
      const matchesDateRange = !selectedDateRange || (() => {
        const createdDate = new Date(customer.created_at);
        const now = new Date();
        
        switch (selectedDateRange) {
          case "7d":
            return createdDate >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          case "30d":
            return createdDate >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          case "90d":
            return createdDate >= new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          case "1y":
            return createdDate >= new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          default:
            return true;
        }
      })();
      
      return matchesSearch && matchesState && matchesDateRange;
    });
  }, [customers, searchTerm, selectedState, selectedDateRange]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filtered.slice(startIndex, startIndex + itemsPerPage);
  }, [filtered, currentPage]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedState, selectedDateRange]);

  // Early return if dealer is still loading
  if (isDealerLoading) {
    return <LoadingState message="Loading dealer profile..." />;
  }

  // Early return if no dealer profile found
  if (!dealer) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold">No Dealer Profile Found</h2>
        <p className="text-muted-foreground mt-2">Please complete your profile setup first.</p>
      </div>
    );
  }

  const handleExport = () => {
    if (!filtered.length) {
      toast.error("No customers to export");
      return;
    }

    const headers = ["First Name", "Last Name", "Email", "Phone", "City", "State", "Total Spent", "Date Added"];
    const csvContent = [
      headers.join(","),
      ...filtered.map(customer => [
        `"${customer.first_name}"`,
        `"${customer.last_name}"`,
        `"${customer.email}"`,
        `"${customer.phone || ""}"`,
        `"${customer.city || ""}"`,
        `"${customer.state || ""}"`,
        `"${customer.total_spent || 0}"`,
        `"${formatDate(customer.created_at)}"`
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `customers_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    
    toast.success("Customer data exported successfully");
  };

  const onAdd = () => {
    setEditingCustomer(null);
    setIsFormOpen(true);
  };

  const onEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsFormOpen(true);
  };

  const onView = (customer: Customer) => {
    setViewingCustomer(customer);
    setIsDrawerOpen(true);
  };

  const handleDelete = async (customer: Customer) => {
    try {
      await deleteCustomerMutation.mutateAsync(customer.id);
      toast.success("Customer deleted successfully");
    } catch (error) {
      console.error("Error deleting customer:", error);
      toast.error("Failed to delete customer");
    }
    setDeletingCustomer(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">Manage and track your customer relationships</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExport} disabled={!filtered.length}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={onAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Add Customer
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <CustomerKPIs 
        data={customers} 
        isLoading={isCustomersLoading} 
        error={customersError} 
      />

      {/* Main Content */}
      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <CardTitle>Customer List</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {filtered.length} {filtered.length === 1 ? 'customer' : 'customers'} found
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={selectedState} onValueChange={setSelectedState}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder="All states" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All states</SelectItem>
                  {uniqueStates.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedDateRange} onValueChange={setSelectedDateRange}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder="All time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All time</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isCustomersLoading ? (
            <LoadingState message="Loading customers..." />
          ) : customersError ? (
            <div className="text-center py-8">
              <p className="text-destructive">Error loading customers: {customersError.message}</p>
            </div>
          ) : paginatedData.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {customers?.length === 0 ? "No customers found." : "No customers match your search criteria."}
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Total Spent</TableHead>
                      <TableHead>Date Added</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedData.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell className="font-medium">
                          {customer.first_name} {customer.last_name}
                        </TableCell>
                        <TableCell>{customer.email}</TableCell>
                        <TableCell>{customer.phone || "-"}</TableCell>
                        <TableCell>
                          {customer.city && customer.state ? `${customer.city}, ${customer.state}` : "-"}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-green-600">
                            {formatCurrency(customer.total_spent)}
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(customer.created_at)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => onView(customer)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => onEdit(customer)}>
                                <Edit2 className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => window.open(`tel:${customer.phone}`)}>
                                <Phone className="mr-2 h-4 w-4" />
                                Call
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => window.open(`mailto:${customer.email}`)}>
                                <Mail className="mr-2 h-4 w-4" />
                                Email
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => window.open(`sms:${customer.phone}`)}>
                                <MessageSquare className="mr-2 h-4 w-4" />
                                SMS
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => setDeletingCustomer(customer)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex justify-center">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage <= 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage >= totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <CustomerFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        initialValues={editingCustomer ? {
          id: editingCustomer.id,
          first_name: editingCustomer.first_name,
          last_name: editingCustomer.last_name,
          email: editingCustomer.email,
          phone: editingCustomer.phone || "",
          city: editingCustomer.city || "",
          state: editingCustomer.state || ""
        } : undefined}
      />

      <CustomerDrawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        customer={viewingCustomer}
      />

      <ConfirmDialog
        open={!!deletingCustomer}
        onOpenChange={(open) => !open && setDeletingCustomer(null)}
        title="Delete Customer"
        description={`Are you sure you want to delete ${deletingCustomer?.first_name} ${deletingCustomer?.last_name}? This action cannot be undone.`}
        onConfirm={() => deletingCustomer && handleDelete(deletingCustomer)}
      />
    </div>
  );
}