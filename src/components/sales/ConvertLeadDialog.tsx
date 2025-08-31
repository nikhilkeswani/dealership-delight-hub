import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useVehicles } from "@/hooks/useVehicles";
import { useConvertLeadToSale, type ConvertLeadToSaleData } from "@/hooks/useSales";
import { formatDate } from "@/lib/format";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: any;
};

const ConvertLeadDialog: React.FC<Props> = ({ open, onOpenChange, lead }) => {
  const [vehicleId, setVehicleId] = React.useState("");
  const [expectedCloseDate, setExpectedCloseDate] = React.useState("");
  const [dealNotes, setDealNotes] = React.useState("");

  const { data: vehicles } = useVehicles();
  const convertMutation = useConvertLeadToSale();

  const availableVehicles = vehicles?.filter(v => v.status === "available") || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!vehicleId) return;

    const convertData: ConvertLeadToSaleData = {
      lead_id: lead.id,
      vehicle_id: vehicleId,
      expected_close_date: expectedCloseDate || undefined,
      deal_notes: dealNotes || undefined,
    };

    convertMutation.mutate(convertData, {
      onSuccess: () => {
        onOpenChange(false);
        setVehicleId("");
        setExpectedCloseDate("");
        setDealNotes("");
      },
    });
  };

  const reset = () => {
    setVehicleId("");
    setExpectedCloseDate("");
    setDealNotes("");
  };

  React.useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open]);

  if (!lead) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Convert Lead to Deal</DialogTitle>
          <DialogDescription>
            Create a deal for {lead.first_name} {lead.last_name} and start tracking the sales process.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="vehicle">Vehicle*</Label>
            <Select value={vehicleId} onValueChange={setVehicleId} required>
              <SelectTrigger>
                <SelectValue placeholder="Select a vehicle" />
              </SelectTrigger>
              <SelectContent>
                {availableVehicles.map((vehicle) => (
                  <SelectItem key={vehicle.id} value={vehicle.id}>
                    {vehicle.year} {vehicle.make} {vehicle.model}
                    {vehicle.vin && ` (${vehicle.vin.slice(-6)})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {availableVehicles.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No available vehicles found. Add vehicles to your inventory first.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="expected_close_date">Expected Close Date</Label>
            <Input
              id="expected_close_date"
              type="date"
              value={expectedCloseDate}
              onChange={(e) => setExpectedCloseDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deal_notes">Deal Notes</Label>
            <Textarea
              id="deal_notes"
              placeholder="Add any notes about this deal..."
              value={dealNotes}
              onChange={(e) => setDealNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!vehicleId || convertMutation.isPending}
              variant="hero"
            >
              {convertMutation.isPending ? "Converting..." : "Create Deal"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ConvertLeadDialog;