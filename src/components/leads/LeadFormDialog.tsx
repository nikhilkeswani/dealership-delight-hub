import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export type LeadFormValues = {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  source: "website" | "phone" | "email" | "referral" | "walk_in" | "social_media" | "website_testdrive" | "website_inquiry";
  status: "new" | "contacted" | "qualified" | "converted" | "lost";
  notes?: string;
  follow_up_date?: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues?: Partial<LeadFormValues>;
  onSubmit?: (values: LeadFormValues) => void;
};

const emptyValues: LeadFormValues = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  source: "website",
  status: "new",
  notes: "",
  follow_up_date: "",
};

const LeadFormDialog: React.FC<Props> = ({ open, onOpenChange, initialValues, onSubmit }) => {
  const [values, setValues] = React.useState<LeadFormValues>({ ...emptyValues, ...(initialValues ?? {}) });

  React.useEffect(() => {
    setValues({ ...emptyValues, ...(initialValues ?? {}) });
  }, [initialValues, open]);

  const update = (key: keyof LeadFormValues) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setValues((v) => ({ ...v, [key]: e.currentTarget.value }));

  const updateSelect = (key: keyof LeadFormValues) => (value: string) =>
    setValues((v) => ({ ...v, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{initialValues ? "Edit Lead" : "Add Lead"}</DialogTitle>
          <DialogDescription>Capture lead information for follow-up and conversion tracking.</DialogDescription>
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
              <Label htmlFor="source">Source</Label>
              <Select value={values.source} onValueChange={updateSelect("source")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="website_testdrive">Website Test Drive</SelectItem>
                  <SelectItem value="website_inquiry">Website Inquiry</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="referral">Referral</SelectItem>
                  <SelectItem value="social_media">Social Media</SelectItem>
                  <SelectItem value="walk_in">Walk-in</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={values.status} onValueChange={updateSelect("status")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                  <SelectItem value="converted">Converted</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="follow_up_date">Follow-up Date</Label>
              <Input 
                id="follow_up_date" 
                type="datetime-local" 
                value={values.follow_up_date} 
                onChange={update("follow_up_date")} 
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" value={values.notes} onChange={update("notes")} rows={3} />
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

export default LeadFormDialog;