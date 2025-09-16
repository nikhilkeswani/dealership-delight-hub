import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Phone, Mail, MapPin, Clock, Save, Eye } from "lucide-react";
import { toast } from "sonner";
import { useDealer } from "@/hooks/useDealer";
import { useDealerProfile } from "@/hooks/useDealerProfile";
import { useDealerSiteConfig } from "@/hooks/useDealerSiteConfig";
import { DEFAULT_DEALER_SITE_CONFIG } from "@/constants/theme";

const contactSchema = z.object({
  phone: z.string().min(1, "Phone number is required"),
  email: z.string().email("Valid email is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(1, "ZIP code is required"),
  businessHours: z.string().optional(),
  showMap: z.boolean().default(true),
  contactFormEnabled: z.boolean().default(true),
  autoResponseMessage: z.string().optional(),
});

type ContactFormData = z.infer<typeof contactSchema>;

export function ContactConfig() {
  const { data: dealer } = useDealer();
  const { updateProfile, isUpdating } = useDealerProfile();
  
  const defaultConfig = {
    ...DEFAULT_DEALER_SITE_CONFIG,
    brand: {
      ...DEFAULT_DEALER_SITE_CONFIG.brand,
      name: dealer?.business_name || DEFAULT_DEALER_SITE_CONFIG.brand.name,
    },
    contact: { 
      ...DEFAULT_DEALER_SITE_CONFIG.contact,
      phone: dealer?.phone || DEFAULT_DEALER_SITE_CONFIG.contact.phone,
      email: dealer?.contact_email || DEFAULT_DEALER_SITE_CONFIG.contact.email,
      address: `${dealer?.address || "123 Main St"}, ${dealer?.city || "Anytown"}, ${dealer?.state || "ST"} ${dealer?.zip_code || "12345"}`
    },
  };

  const { config, setConfig: updateSiteConfig, saveLocal } = useDealerSiteConfig(
    dealer?.business_name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'demo',
    defaultConfig
  );

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      phone: dealer?.phone || "",
      email: dealer?.contact_email || "",
      address: dealer?.address || "",
      city: dealer?.city || "",
      state: dealer?.state || "",
      zipCode: dealer?.zip_code || "",
      businessHours: "",
      showMap: true,
      contactFormEnabled: true,
      autoResponseMessage: "Thank you for your inquiry! We'll get back to you within 24 hours.",
    },
  });

  // Update form when dealer data loads
  useEffect(() => {
    if (dealer) {
      form.reset({
        phone: dealer.phone || "",
        email: dealer.contact_email || "",
        address: dealer.address || "",
        city: dealer.city || "",
        state: dealer.state || "",
        zipCode: dealer.zip_code || "",
        businessHours: "",
        showMap: true,
        contactFormEnabled: true,
        autoResponseMessage: "Thank you for your inquiry! We'll get back to you within 24 hours.",
      });
    }
  }, [dealer, form]);

  const onSubmit = async (data: ContactFormData) => {
    try {
      // Update dealer profile in Supabase
      await updateProfile({
        phone: data.phone,
        contact_email: data.email,
        address: data.address,
        city: data.city,
        state: data.state,
        zip_code: data.zipCode,
      });

      // Update site config
      const fullAddress = `${data.address}, ${data.city}, ${data.state} ${data.zipCode}`;
      updateSiteConfig({
        contact: {
          phone: data.phone,
          email: data.email,
          address: fullAddress,
        }
      });
      saveLocal();

      toast.success("Contact information updated successfully!");
    } catch (error) {
      toast.error("Failed to update contact information");
      if (import.meta.env.DEV) {
        if (import.meta.env.DEV) {
          console.error("Error updating contact info:", error);
        }
      }
    }
  };

  const handlePreview = () => {
    if (dealer?.business_name) {
      const slug = dealer.business_name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      window.open(`/dealer/${slug}#contact`, '_blank');
    } else {
      window.open('/dealer/demo-motors#contact', '_blank');
    }
  };

  return (
    <>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>
              Manage your business contact details and contact form settings
            </CardDescription>
          </div>
          <Button onClick={handlePreview} variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Business Contact Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <Label className="text-base font-medium">Business Contact Details</Label>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  {...form.register("phone")}
                  placeholder="(555) 123-4567"
                  className="bg-background"
                />
                {form.formState.errors.phone && (
                  <p className="text-sm text-destructive">{form.formState.errors.phone.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  {...form.register("email")}
                  placeholder="contact@dealership.com"
                  className="bg-background"
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Business Address */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <Label className="text-base font-medium">Business Address</Label>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Street Address *</Label>
                <Input
                  id="address"
                  {...form.register("address")}
                  placeholder="123 Main Street"
                  className="bg-background"
                />
                {form.formState.errors.address && (
                  <p className="text-sm text-destructive">{form.formState.errors.address.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    {...form.register("city")}
                    placeholder="Anytown"
                    className="bg-background"
                  />
                  {form.formState.errors.city && (
                    <p className="text-sm text-destructive">{form.formState.errors.city.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    {...form.register("state")}
                    placeholder="ST"
                    className="bg-background"
                  />
                  {form.formState.errors.state && (
                    <p className="text-sm text-destructive">{form.formState.errors.state.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zipCode">ZIP Code *</Label>
                  <Input
                    id="zipCode"
                    {...form.register("zipCode")}
                    placeholder="12345"
                    className="bg-background"
                  />
                  {form.formState.errors.zipCode && (
                    <p className="text-sm text-destructive">{form.formState.errors.zipCode.message}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="space-y-1">
                <Label htmlFor="showMap" className="text-sm font-medium">Show Map</Label>
                <p className="text-xs text-muted-foreground">Display an interactive map on your website</p>
              </div>
              <Switch
                id="showMap"
                {...form.register("showMap")}
              />
            </div>
          </div>

          <Separator />

          {/* Business Hours */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <Label className="text-base font-medium">Business Hours</Label>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="businessHours">Hours (optional)</Label>
              <Textarea
                id="businessHours"
                {...form.register("businessHours")}
                placeholder="Monday - Friday: 9:00 AM - 6:00 PM&#10;Saturday: 9:00 AM - 5:00 PM&#10;Sunday: Closed"
                rows={4}
                className="bg-background resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Enter your business hours. This will be displayed on your contact section.
              </p>
            </div>
          </div>

          <Separator />

          {/* Contact Form Settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <Label className="text-base font-medium">Contact Form Settings</Label>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="space-y-1">
                  <Label htmlFor="contactFormEnabled" className="text-sm font-medium">Enable Contact Form</Label>
                  <p className="text-xs text-muted-foreground">Allow visitors to send inquiries through your website</p>
                </div>
                <Switch
                  id="contactFormEnabled"
                  {...form.register("contactFormEnabled")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="autoResponseMessage">Auto-Response Message</Label>
                <Textarea
                  id="autoResponseMessage"
                  {...form.register("autoResponseMessage")}
                  placeholder="Thank you for your inquiry! We'll get back to you within 24 hours."
                  rows={3}
                  className="bg-background resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  This message will be shown to visitors after they submit the contact form.
                </p>
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isUpdating}>
            <Save className="h-4 w-4 mr-2" />
            {isUpdating ? "Saving..." : "Save Contact Information"}
          </Button>
        </form>
      </CardContent>
    </>
  );
}