import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Upload, X, Plus, Trash2, Image as ImageIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useDealer } from "@/hooks/useDealer";
import { useImageUpload } from "@/hooks/useImageUpload";
import { useDealerSiteConfig } from "@/hooks/useDealerSiteConfig";
import { toast } from "sonner";

const schema = z.object({
  businessName: z.string().min(2, "Business name is required"),
  tagline: z.string().min(10, "Tagline should be at least 10 characters"),
  aboutContent: z.string().min(50, "About content should be at least 50 characters"),
  logoUrl: z.string().optional(),
  heroBackgroundUrl: z.string().optional(),
  servicesEnabled: z.boolean(),
  services: z.array(z.object({
    title: z.string().min(3, "Service title is required"),
    description: z.string().min(10, "Service description is required"),
  })).optional(),
  whyChooseUsEnabled: z.boolean(),
  whyChooseUsPoints: z.array(z.string().min(5, "Point should be at least 5 characters")).optional(),
});

type FormData = z.infer<typeof schema>;

const defaultServices = [
  { title: "Vehicle Sales", description: "Browse our extensive inventory of new and pre-owned vehicles" },
  { title: "Financing", description: "Competitive rates and flexible financing options available" },
  { title: "Trade-Ins", description: "Get the best value for your current vehicle" },
  { title: "Service & Maintenance", description: "Professional maintenance and repair services" },
];

const defaultWhyChooseUs = [
  "Over 20 years of experience in the automotive industry",
  "Transparent pricing with no hidden fees",
  "Award-winning customer service team",
  "Comprehensive warranty on all vehicles",
  "Fast and easy financing process",
];

export function CustomizeConfig() {
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
      aboutContent: "We're committed to providing exceptional service and helping you find the perfect vehicle. With years of experience in the automotive industry, we pride ourselves on transparent pricing, quality vehicles, and customer satisfaction.",
      servicesEnabled: true,
      services: [],
      whyChooseUsEnabled: true,
      whyChooseUsPoints: [],
    },
  };
  
  const { config, setConfig: updateConfig, saveLocal } = useDealerSiteConfig(slug, defaultConfig);
  const [logoPreview, setLogoPreview] = useState<string | null>(config.brand.logoUrl || null);
  const [heroBackgroundPreview, setHeroBackgroundPreview] = useState<string | null>(null);
  const [aboutContent, setAboutContent] = useState("We're committed to providing exceptional service and helping you find the perfect vehicle. With years of experience in the automotive industry, we pride ourselves on transparent pricing, quality vehicles, and customer satisfaction. Our knowledgeable team is here to guide you through every step of your car buying journey.");
  const [services, setServices] = useState(defaultServices);
  const [whyChooseUsPoints, setWhyChooseUsPoints] = useState(defaultWhyChooseUs);
  const [servicesEnabled, setServicesEnabled] = useState(true);
  const [whyChooseUsEnabled, setWhyChooseUsEnabled] = useState(true);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      businessName: config.brand.name,
      tagline: config.brand.tagline,
      aboutContent: aboutContent,
      logoUrl: config.brand.logoUrl,
      heroBackgroundUrl: "",
      servicesEnabled: servicesEnabled,
      services: services,
      whyChooseUsEnabled: whyChooseUsEnabled,
      whyChooseUsPoints: whyChooseUsPoints,
    },
  });

  // Auto-save functionality with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const formData = form.getValues();
      updateConfig({
        brand: {
          name: formData.businessName,
          tagline: formData.tagline,
          logoUrl: formData.logoUrl || "",
        },
        hero: {
          headline: "Find Your Perfect Vehicle",
          subtitle: formData.tagline,
          backgroundUrl: formData.heroBackgroundUrl || heroBackgroundPreview || "",
        },
        content: {
          aboutContent,
          servicesEnabled,
          services: servicesEnabled ? services : [],
          whyChooseUsEnabled,
          whyChooseUsPoints: whyChooseUsEnabled ? whyChooseUsPoints : [],
        }
      });
      saveLocal();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [
    form.watch("businessName"), 
    form.watch("tagline"), 
    form.watch("logoUrl"),
    form.watch("heroBackgroundUrl"),
    heroBackgroundPreview,
    aboutContent,
    servicesEnabled,
    services,
    whyChooseUsEnabled,
    whyChooseUsPoints,
    updateConfig,
    saveLocal
  ]);

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

  const handleHeroBackgroundUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error("Image size should be less than 5MB");
      return;
    }

    const uploadedUrl = await uploadImage(file, 'hero-backgrounds');
    if (uploadedUrl) {
      setHeroBackgroundPreview(uploadedUrl);
      form.setValue("heroBackgroundUrl", uploadedUrl);
      toast.success("Hero background uploaded successfully");
    }
  };

  const addService = () => {
    setServices([...services, { title: "", description: "" }]);
  };

  const removeService = (index: number) => {
    setServices(services.filter((_, i) => i !== index));
  };

  const updateService = (index: number, field: 'title' | 'description', value: string) => {
    const updatedServices = [...services];
    updatedServices[index][field] = value;
    setServices(updatedServices);
  };

  const addWhyChooseUsPoint = () => {
    setWhyChooseUsPoints([...whyChooseUsPoints, ""]);
  };

  const removeWhyChooseUsPoint = (index: number) => {
    setWhyChooseUsPoints(whyChooseUsPoints.filter((_, i) => i !== index));
  };

  const updateWhyChooseUsPoint = (index: number, value: string) => {
    const updatedPoints = [...whyChooseUsPoints];
    updatedPoints[index] = value;
    setWhyChooseUsPoints(updatedPoints);
  };

  // Real-time update handlers
  const handleBusinessNameChange = (value: string) => {
    form.setValue("businessName", value);
    updateConfig({
      brand: { ...config.brand, name: value }
    });
    saveLocal();
  };

  const handleTaglineChange = (value: string) => {
    form.setValue("tagline", value);
    updateConfig({
      brand: { ...config.brand, tagline: value },
      hero: { ...config.hero, subtitle: value }
    });
    saveLocal();
  };

  const handleAboutContentChange = (value: string) => {
    setAboutContent(value);
    form.setValue("aboutContent", value);
  };

  const onSubmit = async (data: FormData) => {
    try {
      // Website settings saved successfully
      toast.success("Website settings saved!");
    } catch (error) {
      toast.error("Failed to save settings");
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
        <CardTitle>Customize Your Website</CardTitle>
        <CardDescription>
          Set up your business identity, content, and optional sections
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-8">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Business Identity Section */}
          <div className="space-y-4">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              Business Identity
            </Badge>

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
                value={form.watch("businessName")}
                onChange={(e) => handleBusinessNameChange(e.target.value)}
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
                value={form.watch("tagline")}
                onChange={(e) => handleTaglineChange(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                A short, memorable phrase that appears as your hero subtitle
              </p>
              {form.formState.errors.tagline && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.tagline.message}
                </p>
              )}
            </div>
          </div>

          <Separator />

          {/* Website Content Section */}
          <div className="space-y-4">
            <Badge variant="outline" className="bg-secondary/50 text-secondary-foreground border-secondary/20">
              Website Content
            </Badge>

            {/* Hero Background Image */}
            <div className="space-y-2">
              <Label>Hero Background Image (Optional)</Label>
              <div className="space-y-2">
                {heroBackgroundPreview ? (
                  <div className="relative">
                    <img
                      src={heroBackgroundPreview}
                      alt="Hero background preview"
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setHeroBackgroundPreview(null);
                        form.setValue("heroBackgroundUrl", "");
                      }}
                      className="absolute top-2 right-2"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleHeroBackgroundUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={isUploading}
                    />
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        {isUploading ? "Uploading..." : "Click to upload hero background image"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Recommended: 1920x800px, JPG or PNG
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* About Content */}
            <div className="space-y-2">
              <Label htmlFor="aboutContent">About Your Business</Label>
              <Textarea
                id="aboutContent"
                rows={4}
                placeholder="Tell customers about your dealership, values, history, and what makes you special..."
                value={aboutContent}
                onChange={(e) => handleAboutContentChange(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                This appears in your About section and helps customers understand your business
              </p>
              {form.formState.errors.aboutContent && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.aboutContent.message}
                </p>
              )}
            </div>
          </div>

          <Separator />

          {/* Services Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="bg-accent/50 text-accent-foreground border-accent/20">
                Services Section
              </Badge>
              <div className="flex items-center space-x-2">
                <Switch
                  id="services-enabled"
                  checked={servicesEnabled}
                  onCheckedChange={(checked) => {
                    setServicesEnabled(checked);
                    form.setValue("servicesEnabled", checked);
                  }}
                />
                <Label htmlFor="services-enabled" className="text-sm">
                  Show services section
                </Label>
              </div>
            </div>

            {servicesEnabled && (
              <div className="space-y-4">
                {services.map((service, index) => (
                  <div key={index} className="space-y-2 p-4 border rounded-lg">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 space-y-2">
                        <Input
                          placeholder="Service title"
                          value={service.title}
                          onChange={(e) => updateService(index, 'title', e.target.value)}
                        />
                        <Textarea
                          rows={2}
                          placeholder="Service description"
                          value={service.description}
                          onChange={(e) => updateService(index, 'description', e.target.value)}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeService(index)}
                        className="shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={addService}
                  className="w-full flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Service
                </Button>
              </div>
            )}
          </div>

          <Separator />

          {/* Why Choose Us Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="bg-muted/50 text-muted-foreground border-muted">
                Why Choose Us
              </Badge>
              <div className="flex items-center space-x-2">
                <Switch
                  id="why-choose-us-enabled"
                  checked={whyChooseUsEnabled}
                  onCheckedChange={(checked) => {
                    setWhyChooseUsEnabled(checked);
                    form.setValue("whyChooseUsEnabled", checked);
                  }}
                />
                <Label htmlFor="why-choose-us-enabled" className="text-sm">
                  Show why choose us section
                </Label>
              </div>
            </div>

            {whyChooseUsEnabled && (
              <div className="space-y-3">
                {whyChooseUsPoints.map((point, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      placeholder="Why customers should choose you..."
                      value={point}
                      onChange={(e) => updateWhyChooseUsPoint(index, e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeWhyChooseUsPoint(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={addWhyChooseUsPoint}
                  className="w-full flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Point
                </Button>
              </div>
            )}
          </div>

          <Button type="submit" className="w-full">
            Save Website Settings
          </Button>
        </form>
      </CardContent>
    </>
  );
}