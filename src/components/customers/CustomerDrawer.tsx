import React from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatDate } from "@/lib/format";

export type Customer = {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone?: string | null;
  city?: string | null;
  state?: string | null;
  created_at?: string | null;
  total_spent?: number | null;
  purchase_history?: Array<{ date?: string; amount?: number; vehicle?: string }>;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer?: Customer | null;
};

const CustomerDrawer: React.FC<Props> = ({ open, onOpenChange, customer }) => {
  const name = customer ? `${customer.first_name} ${customer.last_name}` : "";

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
            {customer?.purchase_history && customer.purchase_history.length > 0 ? (
              <ul className="space-y-2 text-sm">
                {customer.purchase_history.map((p, idx) => (
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
