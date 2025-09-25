import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useCreateCustomer, useUpdateCustomer, type CustomerFormValues } from "@/hooks/useCustomers";
import { useToast } from "@/hooks/use-toast";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues?: Partial<CustomerFormValues & { id?: string }>;
};

const emptyValues: CustomerFormValues = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  city: "",
  state: "",
  total_spent: 0,
};

const CustomerFormDialog: React.FC<Props> = ({ open, onOpenChange, initialValues }) => {
  const { toast } = useToast();
  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();
  const [values, setValues] = React.useState<CustomerFormValues>({ ...emptyValues, ...(initialValues ?? {}) });

  React.useEffect(() => {
    setValues({ ...emptyValues, ...(initialValues ?? {}) });
  }, [initialValues, open]);

  const update = (key: keyof CustomerFormValues) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = key === 'total_spent' ? parseFloat(e.currentTarget.value) || 0 : e.currentTarget.value;
    setValues((v) => ({ ...v, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (initialValues?.id) {
        await updateCustomer.mutateAsync({ id: initialValues.id, values });
        toast({ title: "Customer updated", description: `${values.first_name} ${values.last_name} has been updated.` });
      } else {
        await createCustomer.mutateAsync(values);
        toast({ title: "Customer created", description: `${values.first_name} ${values.last_name} has been added.` });
      }
      onOpenChange(false);
    } catch (error) {
      toast({ 
        title: "Error", 
        description: error instanceof Error ? error.message : "Failed to save customer",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialValues ? "Edit Customer" : "Add Customer"}</DialogTitle>
          <DialogDescription>Capture essential customer details for follow-up and sales.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first_name">First name</Label>
              <Input id="first_name" value={values.first_name} onChange={update("first_name")} required />
            </div>
            <div>
              <Label htmlFor="last_name">Last name</Label>
              <Input id="last_name" value={values.last_name} onChange={update("last_name")} required />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={values.email} onChange={update("email")} required />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={values.phone} onChange={update("phone")} />
            </div>
            <div>
              <Label htmlFor="city">City</Label>
              <Input id="city" value={values.city} onChange={update("city")} />
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <Input id="state" value={values.state} onChange={update("state")} />
            </div>
            <div>
              <Label htmlFor="total_spent">Total Spent</Label>
              <Input 
                id="total_spent" 
                type="number" 
                step="0.01" 
                min="0" 
                value={values.total_spent || 0} 
                onChange={update("total_spent")} 
                placeholder="0.00"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={createCustomer.isPending || updateCustomer.isPending}>
              {createCustomer.isPending || updateCustomer.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerFormDialog;
