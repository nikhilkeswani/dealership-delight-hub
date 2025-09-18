import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploader } from "@/components/ui/image-uploader";

export type VehicleFormValues = {
  id?: string;
  make: string;
  model: string;
  year: number;
  price?: number;
  mileage?: number;
  vin?: string;
  status: "available" | "sold" | "pending" | "service";
  description?: string;
  images?: string[];
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues?: Partial<VehicleFormValues>;
  onSubmit?: (values: VehicleFormValues) => void;
};

const emptyValues: VehicleFormValues = {
  make: "",
  model: "",
  year: new Date().getFullYear(),
  price: undefined,
  mileage: undefined,
  vin: "",
  status: "available",
  description: "",
  images: [],
};

const VehicleFormDialog: React.FC<Props> = ({ open, onOpenChange, initialValues, onSubmit }) => {
  const [values, setValues] = React.useState<VehicleFormValues>({ ...emptyValues, ...(initialValues ?? {}) });

  React.useEffect(() => {
    setValues({ ...emptyValues, ...(initialValues ?? {}) });
  }, [initialValues, open]);

  const update = (key: keyof VehicleFormValues) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.currentTarget.value;
    if (key === 'year' || key === 'price' || key === 'mileage') {
      const numValue = value === '' ? undefined : Number(value);
      setValues((v) => ({ ...v, [key]: numValue }));
    } else {
      setValues((v) => ({ ...v, [key]: value }));
    }
  };

  const updateSelect = (key: keyof VehicleFormValues) => (value: string) =>
    setValues((v) => ({ ...v, [key]: value }));

  const updateImages = (images: string[]) => {
    setValues((v) => ({ ...v, images }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialValues ? "Edit Vehicle" : "Add Vehicle"}</DialogTitle>
          <DialogDescription>Add vehicle details to your inventory for customers to browse.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="make">Make</Label>
              <Input id="make" value={values.make} onChange={update("make")} required />
            </div>
            <div>
              <Label htmlFor="model">Model</Label>
              <Input id="model" value={values.model} onChange={update("model")} required />
            </div>
            <div>
              <Label htmlFor="year">Year</Label>
              <Input 
                id="year" 
                type="number" 
                min="1900" 
                max={new Date().getFullYear() + 1}
                value={values.year || ''} 
                onChange={update("year")} 
                required 
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={values.status} onValueChange={updateSelect("status")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                  <SelectItem value="service">Service</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="price">Price ($)</Label>
              <Input 
                id="price" 
                type="number" 
                min="0" 
                step="0.01"
                value={values.price || ''} 
                onChange={update("price")} 
              />
            </div>
            <div>
              <Label htmlFor="mileage">Mileage</Label>
              <Input 
                id="mileage" 
                type="number" 
                min="0"
                value={values.mileage || ''} 
                onChange={update("mileage")} 
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="vin">VIN</Label>
              <Input id="vin" value={values.vin} onChange={update("vin")} />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={values.description} onChange={update("description")} rows={3} />
            </div>
            <div className="sm:col-span-2">
              <Label>Vehicle Images</Label>
              <ImageUploader 
                images={values.images || []} 
                onImagesChange={updateImages}
                maxImages={8}
                vehicleId={initialValues?.id && !initialValues.id.startsWith('temp-') ? initialValues.id : undefined}
                vehicleData={{
                  make: values.make,
                  model: values.model,
                  year: values.year,
                  condition: values.status === 'available' ? 'used' : values.status,
                }}
              />
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

export default VehicleFormDialog;