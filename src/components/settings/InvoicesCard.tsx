import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Download, FileText, CreditCard } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { useBillingHistory } from "@/hooks/useBillingHistory";
import { format } from "date-fns";
import LoadingState from "@/components/common/LoadingState";

export const InvoicesCard: React.FC = () => {
  const { data: subscription } = useSubscription();
  const { data: billingHistory, isLoading } = useBillingHistory();

  console.log("InvoicesCard - Subscription:", subscription);
  console.log("InvoicesCard - Billing history:", billingHistory);
  console.log("InvoicesCard - Loading:", isLoading);

  if (isLoading) {
    return <LoadingState />;
  }

  // Process billing history or create mock data
  const invoices = billingHistory?.length ? 
    billingHistory.map(bill => ({
      id: bill.id,
      description: bill.description || `${subscription?.tier} Plan`,
      date: bill.payment_date || bill.created_at,
      amount: Number(bill.amount),
      status: bill.status,
      invoice_url: bill.invoice_url
    })) :
    // Mock data when no billing history exists
    subscription ? [{
      id: 'mock-1',
      description: `${subscription.tier} Plan`,
      date: subscription.current_period_start || subscription.created_at,
      amount: Number(subscription.amount),
      status: 'paid',
      invoice_url: null
    }] : [];

  if (!subscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Recent Invoices
          </CardTitle>
          <CardDescription>Your billing history and invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No active subscription found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Recent Invoices
        </CardTitle>
        <CardDescription>Your billing history and invoices</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {invoices.length > 0 ? (
          <div className="space-y-3">
            {invoices.slice(0, 5).map((invoice, index) => (
              <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-md">
                    <CreditCard className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{invoice.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(invoice.date), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-medium">${invoice.amount.toFixed(2)}</p>
                    <Badge 
                      variant={invoice.status === 'paid' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {invoice.status}
                    </Badge>
                  </div>
                  {invoice.invoice_url && (
                    <Button size="sm" variant="outline">
                      <Download className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No invoices available yet.</p>
        )}
        
        <Separator />
        
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            Invoice downloads will be available once payment processing is set up.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};