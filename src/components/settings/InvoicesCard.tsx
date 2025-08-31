import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { format } from "date-fns";

export const InvoicesCard: React.FC = () => {
  const { data: subscription, isLoading } = useSubscription();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-muted rounded w-full"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Mock invoice data based on subscription
  const mockInvoices = subscription ? [
    {
      id: "inv_001",
      date: subscription.created_at,
      amount: subscription.amount,
      status: "paid",
      description: `${subscription.tier} plan - ${subscription.billing_cycle}`
    }
  ] : [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Invoices</CardTitle>
        <Button variant="outline" size="sm" disabled>
          <Download className="h-4 w-4 mr-2" />
          Download All
        </Button>
      </CardHeader>
      <CardContent>
        {mockInvoices.length > 0 ? (
          <div className="space-y-3">
            {mockInvoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium">{invoice.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(invoice.date), "MMMM d, yyyy")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">${Number(invoice.amount).toFixed(2)}</span>
                  <Button variant="ghost" size="sm" disabled>
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            <p className="text-xs text-muted-foreground text-center pt-2">
              Invoice downloads coming soon
            </p>
          </div>
        ) : (
          <div className="text-center py-6">
            <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No invoices available</p>
            <p className="text-xs text-muted-foreground mt-1">
              Invoices will appear here once you have an active subscription
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};