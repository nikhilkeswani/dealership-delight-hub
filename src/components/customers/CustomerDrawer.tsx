import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Customer } from "@/hooks/useCustomers";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer?: Customer | null;
}

export function CustomerDrawer({ open, onOpenChange, customer }: Props) {
  if (!customer) {
    return null;
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>
            {customer ? `${customer.first_name} ${customer.last_name}` : "Customer Details"}
          </SheetTitle>
        </SheetHeader>
        
        {customer && (
          <div className="mt-6 space-y-6">
            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Contact Information</h3>
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Email:</span>
                  <p className="text-sm">{customer.email}</p>
                </div>
                {customer.phone && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Phone:</span>
                    <p className="text-sm">{customer.phone}</p>
                  </div>
                )}
                {(customer.city || customer.state) && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Location:</span>
                    <p className="text-sm">
                      {customer.city && customer.state ? `${customer.city}, ${customer.state}` : 
                       customer.city || customer.state || "-"}
                    </p>
                  </div>
                )}
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Date Added:</span>
                  <p className="text-sm">{formatDate(customer.created_at)}</p>
                </div>
              </div>
            </div>

            {/* Customer Details */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Customer Details</h3>
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Lifetime Value:</span>
                  <p className="text-lg font-semibold text-green-600">
                    {formatCurrency(customer.total_spent)}
                  </p>
                </div>
                {customer.lead_id && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Converted from Lead:</span>
                    <p className="text-sm">Yes</p>
                  </div>
                )}
              </div>
            </div>

            {/* Purchase History */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Purchase History</h3>
              <p className="text-sm text-muted-foreground">
                No purchase history available yet.
              </p>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}