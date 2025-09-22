import React from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/format";
import type { CustomerOrLead } from "@/hooks/useCustomers";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer?: CustomerOrLead | null;
};

const CustomerDrawer: React.FC<Props> = ({ open, onOpenChange, customer }) => {
  const name = customer ? `${customer.first_name} ${customer.last_name}` : "";
  const isLead = customer?.isLead;

  // Parse purchase history if it's a customer and has purchase history
  const purchaseHistory = React.useMemo(() => {
    if (isLead || !customer || !('total_spent' in customer)) return [];
    
    // For now, we don't have purchase_history in our CustomerOrLead type
    // This would need to be fetched separately or added to the type
    return [];
  }, [customer, isLead]);

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="flex items-center gap-2">
            {name}
            {isLead && (
              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                Lead
              </Badge>
            )}
          </DrawerTitle>
          <DrawerDescription>
            {isLead ? "Lead information and status" : "Customer details and purchase history"}
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-6 pb-6 space-y-6">
          <section>
            <h3 className="text-sm font-medium text-muted-foreground">Contact</h3>
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              <div><span className="text-muted-foreground">Email:</span> {customer?.email || "-"}</div>
              <div><span className="text-muted-foreground">Phone:</span> {customer?.phone || "-"}</div>
              <div><span className="text-muted-foreground">Location:</span> {[customer?.city, customer?.state].filter(Boolean).join(", ") || "-"}</div>
              <div><span className="text-muted-foreground">{isLead ? "Created:" : "Since:"}</span> {customer?.created_at ? formatDate(customer?.created_at) : "-"}</div>
            </div>
          </section>
          
          {isLead ? (
            <>
              <Separator />
              <section>
                <h3 className="text-sm font-medium text-muted-foreground">Lead Details</h3>
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <div><span className="text-muted-foreground">Status:</span> {customer?.status || "-"}</div>
                  <div><span className="text-muted-foreground">Source:</span> {customer?.source || "-"}</div>
                </div>
              </section>
            </>
          ) : (
            <>
              <Separator />
              <section>
                <h3 className="text-sm font-medium text-muted-foreground">Lifetime value</h3>
                <div className="mt-2 text-2xl font-semibold">{formatCurrency(Number(customer?.total_spent ?? 0))}</div>
              </section>
              <Separator />
              <section>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Purchase history</h3>
                {purchaseHistory.length > 0 ? (
                  <ul className="space-y-2 text-sm">
                    {purchaseHistory.map((p: any, idx: number) => (
                      <li key={idx} className="flex items-center justify-between">
                        <span>{p.vehicle || "Vehicle"}</span>
                        <span className="text-muted-foreground">{p.date ? formatDate(p.date) : "-"}</span>
                        <span className="font-medium">{formatCurrency(Number(p.amount ?? 0))}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No purchases yet.</p>
                )}
              </section>
            </>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default CustomerDrawer;