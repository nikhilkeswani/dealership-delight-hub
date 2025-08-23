import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useDealer } from "@/hooks/useDealer";
import { useImageUpload } from "@/hooks/useImageUpload";
import { useDealerSiteConfig } from "@/hooks/useDealerSiteConfig";
import { toast } from "sonner";

const schema = z.object({
  businessName: z.string().min(2, "Business name is required"),
  tagline: z.string().min(10, "Tagline should be at least 10 characters"),
  description: z.string().min(20, "Description should be at least 20 characters"),
  logoUrl: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export function BrandingConfig() {
  const { data: dealer } = useDealer();
  const { uploadImage, deleteImage, isUploading } = useImageUpload();
  const slug = dealer?.business_name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'demo';
  
  const defaultConfig = {
    brand: {
      name: dealer?.business_name || "Premier Auto Sales",
      tagline: "Your trusted local dealer — transparent pricing and fast test drives.",
      logoUrl: dealer?.logo_url || "",
    },
    hero: {
      headline: "Find Your Perfect Vehicle",
      subtitle: "Premium quality cars with unbeatable service and expertise.",
    },
    contact: {
      phone: dealer?.phone || "(555) 123-4567",
      email: dealer?.contact_email || "sales@example.com", 
      address: dealer?.address || "123 Main St, City, State 12345",
    },
    colors: {
      primary: "#8b5cf6",
      accent: "#22c55e",
    },
    content: {
      aboutContent: "",
      servicesEnabled: false,
      services: [],
      whyChooseUsEnabled: false,
      whyChooseUsPoints: [],
    },
  };
  
  const { config, setConfig: updateConfig, saveLocal } = useDealerSiteConfig(slug, defaultConfig);
  const [logoPreview, setLogoPreview] = useState<string | null>(config.brand.logoUrl || null);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      businessName: config.brand.name,
      tagline: config.brand.tagline,
      description: "We're committed to providing exceptional service and helping you find the perfect vehicle. With years of experience and a dedication to customer satisfaction, we make car buying simple and enjoyable.",
      logoUrl: config.brand.logoUrl,
    },
  });

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const uploadedUrl = await uploadImage(file, 'logos');
    if (uploadedUrl) {
      setLogoPreview(uploadedUrl);
      form.setValue("logoUrl", uploadedUrl);
      toast.success("Logo uploaded successfully");
    }
  };

  const handleRemoveLogo = async () => {
    const currentUrl = form.watch("logoUrl");
    if (currentUrl) {
      await deleteImage(currentUrl);
    }
    setLogoPreview(null);
    form.setValue("logoUrl", "");
  };

  const onSubmit = async (data: FormData) => {
    try {
      updateConfig({
        brand: {
          name: data.businessName,
          tagline: data.tagline,
          logoUrl: data.logoUrl || "",
        }
      });
      saveLocal();
      console.log("Saving branding config:", data);
      toast.success("Branding settings saved!");
    } catch (error) {
      toast.error("Failed to save branding settings");
    }
  };

  const businessInitials = form.watch("businessName")
    .split(" ")
    .slice(0, 2)
    .map(word => word[0])
    .join("")
    .toUpperCase() || "DL";

  return (
    <>
      <CardHeader>
        <CardTitle>Branding & Identity</CardTitle>
        <CardDescription>
          Set up your business logo, name, and brand messaging
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Logo Upload */}
          <div className="space-y-4">
            <Label>Business Logo</Label>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={logoPreview || undefined} alt="Business logo" />
                <AvatarFallback className="text-lg font-semibold">
                  {businessInitials}
                </AvatarFallback>
              </Avatar>
              
              <div className="space-y-2">
                {!logoPreview ? (
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={isUploading}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isUploading}
                      className="flex items-center gap-2"
                    >
                      {isUploading ? (
                        "Uploading..."
                      ) : (
                        <>
                          <Upload className="h-4 w-4" />
                          Upload Logo
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleRemoveLogo}
                      className="flex items-center gap-2"
                    >
                      <X className="h-4 w-4" />
                      Remove
                    </Button>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={isUploading}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isUploading}
                        className="flex items-center gap-2"
                      >
                        <ImageIcon className="h-4 w-4" />
                        Replace
                      </Button>
                    </div>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Recommended: Square image, 256x256px or larger
                </p>
              </div>
            </div>
          </div>

          {/* Business Name */}
          <div className="space-y-2">
            <Label htmlFor="businessName">Business Name</Label>
            <Input
              id="businessName"
              placeholder="e.g., Premier Auto Sales"
              {...form.register("businessName")}
            />
            {form.formState.errors.businessName && (
              <p className="text-sm text-destructive">
                {form.formState.errors.businessName.message}
              </p>
            )}
          </div>

          {/* Tagline */}
          <div className="space-y-2">
            <Label htmlFor="tagline">Tagline</Label>
            <Input
              id="tagline"
              placeholder="e.g., Your trusted local dealer"
              {...form.register("tagline")}
            />
            <p className="text-xs text-muted-foreground">
              A short, memorable phrase that appears under your business name
            </p>
            {form.formState.errors.tagline && (
              <p className="text-sm text-destructive">
                {form.formState.errors.tagline.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">About Your Business</Label>
            <Textarea
              id="description"
              rows={4}
              placeholder="Tell customers about your dealership, values, and what makes you special..."
              {...form.register("description")}
            />
            <p className="text-xs text-muted-foreground">
              This appears in your About section and helps customers understand your business
            </p>
            {form.formState.errors.description && (
              <p className="text-sm text-destructive">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full">
            Save Branding Settings
          </Button>
        </form>
      </CardContent>
    </>
  );
}