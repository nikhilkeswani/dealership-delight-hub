import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export type CustomerFormValues = {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  city?: string;
  state?: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues?: Partial<CustomerFormValues>;
  onSubmit?: (values: CustomerFormValues) => void;
};

const emptyValues: CustomerFormValues = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  city: "",
  state: "",
};

const CustomerFormDialog: React.FC<Props> = ({ open, onOpenChange, initialValues, onSubmit }) => {
  const [values, setValues] = React.useState<CustomerFormValues>({ ...emptyValues, ...(initialValues ?? {}) });

  React.useEffect(() => {
    setValues({ ...emptyValues, ...(initialValues ?? {}) });
  }, [initialValues, open]);

  const update = (key: keyof CustomerFormValues) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setValues((v) => ({ ...v, [key]: e.currentTarget.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(values);
    onOpenChange(false);
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
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerFormDialog;
