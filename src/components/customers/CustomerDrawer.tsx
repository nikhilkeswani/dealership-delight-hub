import React from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Customer } from "@/hooks/useCustomers";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer?: Customer | null;
};

const CustomerDrawer: React.FC<Props> = ({ open, onOpenChange, customer }) => {
  const name = customer ? `${customer.first_name} ${customer.last_name}` : "";

  // Parse purchase history if it's a JSON string
  const purchaseHistory = React.useMemo(() => {
    if (!customer?.purchase_history) return [];
    if (Array.isArray(customer.purchase_history)) return customer.purchase_history;
    if (typeof customer.purchase_history === 'string') {
      try {
        return JSON.parse(customer.purchase_history);
      } catch {
        return [];
      }
    }
    return [];
  }, [customer?.purchase_history]);

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{name}</DrawerTitle>
          <DrawerDescription>Customer details and purchase history</DrawerDescription>
        </DrawerHeader>
        <div className="px-6 pb-6 space-y-6">
          <section>
            <h3 className="text-sm font-medium text-muted-foreground">Contact</h3>
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              <div><span className="text-muted-foreground">Email:</span> {customer?.email || "-"}</div>
              <div><span className="text-muted-foreground">Phone:</span> {customer?.phone || "-"}</div>
              <div><span className="text-muted-foreground">Location:</span> {[customer?.city, customer?.state].filter(Boolean).join(", ") || "-"}</div>
              <div><span className="text-muted-foreground">Since:</span> {customer?.created_at ? formatDate(customer?.created_at) : "-"}</div>
            </div>
          </section>
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
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default CustomerDrawer;
