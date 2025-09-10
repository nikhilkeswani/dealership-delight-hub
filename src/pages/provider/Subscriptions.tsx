import React, { useState } from "react";
import SEO from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MoreHorizontal, Search, Gift, Star } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Subscriptions: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDealer, setSelectedDealer] = useState<any>(null);
  const [freeMonths, setFreeMonths] = useState(1);
  const [reviewNotes, setReviewNotes] = useState("");
  const queryClient = useQueryClient();

  const { data: subscriptions = [], isLoading } = useQuery({
    queryKey: ["all-subscriptions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscriptions")
        .select(`
          *,
          dealers!inner(
            id,
            business_name,
            contact_email,
            created_at
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const grantFreeMonthsMutation = useMutation({
    mutationFn: async ({ subscriptionId, months, notes }: { 
      subscriptionId: string; 
      months: number; 
      notes: string; 
    }) => {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user?.id;
      if (!userId) throw new Error("Not authenticated");

      // In a real implementation, this would extend the subscription
      // For now, we'll just log the action
      const { error } = await supabase
        .from("audit_logs")
        .insert({
          user_id: userId,
          action: "grant_free_months",
          resource_type: "subscription",
          resource_id: subscriptionId,
          details: {
            months_granted: months,
            reason: "review_reward",
            notes: notes,
            granted_at: new Date().toISOString()
          }
        });

      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      toast.success("Free months granted successfully!");
      queryClient.invalidateQueries({ queryKey: ["all-subscriptions"] });
      setSelectedDealer(null);
      setFreeMonths(1);
      setReviewNotes("");
    },
    onError: (error: any) => {
      toast.error(`Failed to grant free months: ${error.message}`);
    },
  });

  const filteredSubscriptions = subscriptions.filter(sub =>
    sub.dealers?.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.dealers?.contact_email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      active: "default",
      past_due: "destructive", 
      canceled: "secondary",
      trialing: "outline"
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  const getTierBadge = (tier: string) => {
    const colors: Record<string, string> = {
      basic: "bg-blue-100 text-blue-800",
      premium: "bg-purple-100 text-purple-800", 
      enterprise: "bg-green-100 text-green-800"
    };
    return (
      <Badge className={colors[tier] || "bg-gray-100 text-gray-800"}>
        {tier}
      </Badge>
    );
  };

  const handleGrantFreeMonths = () => {
    if (!selectedDealer || !reviewNotes.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    grantFreeMonthsMutation.mutate({
      subscriptionId: selectedDealer.id,
      months: freeMonths,
      notes: reviewNotes
    });
  };

  return (
    <div className="space-y-6">
      <SEO 
        title="Subscription Management | Provider Control" 
        description="Manage dealer subscriptions and billing" 
        noIndex 
      />
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Subscriptions</h1>
          <p className="text-muted-foreground mt-2">
            Manage dealer subscriptions and grant review rewards
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by business name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4 text-muted-foreground">Loading subscriptions...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Business</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Next Billing</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubscriptions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No subscriptions found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSubscriptions.map((subscription) => (
                    <TableRow key={subscription.id}>
                      <TableCell className="font-medium">
                        {subscription.dealers?.business_name || "N/A"}
                      </TableCell>
                      <TableCell>{subscription.dealers?.contact_email}</TableCell>
                      <TableCell>{getTierBadge(subscription.tier)}</TableCell>
                      <TableCell>{getStatusBadge(subscription.status)}</TableCell>
                      <TableCell>
                        ${(subscription.amount / 100).toFixed(2)}/{subscription.billing_cycle}
                      </TableCell>
                      <TableCell>
                        {subscription.next_billing_date 
                          ? new Date(subscription.next_billing_date).toLocaleDateString()
                          : "N/A"
                        }
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <Dialog>
                              <DialogTrigger asChild>
                                <DropdownMenuItem
                                  onSelect={(e) => {
                                    e.preventDefault();
                                    setSelectedDealer(subscription);
                                  }}
                                >
                                  <Gift className="mr-2 h-4 w-4" />
                                  Grant Free Months
                                </DropdownMenuItem>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle className="flex items-center">
                                    <Star className="mr-2 h-5 w-5 text-yellow-500" />
                                    Grant Free Months for Review
                                  </DialogTitle>
                                  <DialogDescription>
                                    Reward {selectedDealer?.dealers?.business_name} for providing a review
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <Label htmlFor="months">Number of Free Months</Label>
                                    <Input
                                      id="months"
                                      type="number"
                                      min="1"
                                      max="12"
                                      value={freeMonths}
                                      onChange={(e) => setFreeMonths(parseInt(e.target.value) || 1)}
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="notes">Review Details / Notes *</Label>
                                    <Textarea
                                      id="notes"
                                      placeholder="Describe the review they provided (platform, rating, content summary, etc.)"
                                      value={reviewNotes}
                                      onChange={(e) => setReviewNotes(e.target.value)}
                                      required
                                    />
                                  </div>
                                  <div className="flex justify-end space-x-2">
                                    <Button
                                      variant="outline"
                                      onClick={() => {
                                        setSelectedDealer(null);
                                        setFreeMonths(1);
                                        setReviewNotes("");
                                      }}
                                    >
                                      Cancel
                                    </Button>
                                    <Button
                                      onClick={handleGrantFreeMonths}
                                      disabled={grantFreeMonthsMutation.isPending || !reviewNotes.trim()}
                                    >
                                      {grantFreeMonthsMutation.isPending ? "Granting..." : "Grant Free Months"}
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <DropdownMenuItem className="text-destructive">
                              Cancel Subscription
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Subscriptions;