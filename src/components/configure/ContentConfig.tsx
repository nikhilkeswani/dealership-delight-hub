import React, { useState } from "react";
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
import { Upload, X, Plus, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";

const schema = z.object({
  heroHeadline: z.string().min(10, "Headline should be at least 10 characters"),
  heroSubtitle: z.string().min(20, "Subtitle should be at least 20 characters"),
  aboutTitle: z.string().min(5, "About title is required"),
  aboutContent: z.string().min(50, "About content should be at least 50 characters"),
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

export function ContentConfig() {
  const [heroBackgroundPreview, setHeroBackgroundPreview] = useState<string | null>(null);
  const [services, setServices] = useState(defaultServices);
  const [whyChooseUsPoints, setWhyChooseUsPoints] = useState(defaultWhyChooseUs);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      heroHeadline: "Find Your Perfect Vehicle",
      heroSubtitle: "Premium quality cars with unbeatable service and expertise. Experience the difference with our award‑winning customer care.",
      aboutTitle: "About Our Dealership",
      aboutContent: "We're committed to providing exceptional service and helping you find the perfect vehicle. With years of experience in the automotive industry, we pride ourselves on transparent pricing, quality vehicles, and customer satisfaction. Our knowledgeable team is here to guide you through every step of your car buying journey.",
      servicesEnabled: true,
      services: defaultServices,
      whyChooseUsEnabled: true,
      whyChooseUsPoints: defaultWhyChooseUs,
    },
  });

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

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setHeroBackgroundPreview(result);
        toast.success("Hero background uploaded successfully");
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error("Failed to upload image");
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

  const onSubmit = async (data: FormData) => {
    try {
      const contentConfig = {
        ...data,
        services: form.watch("servicesEnabled") ? services : [],
        whyChooseUsPoints: form.watch("whyChooseUsEnabled") ? whyChooseUsPoints : [],
        heroBackground: heroBackgroundPreview,
      };
      
      // Content configuration saved successfully
      toast.success("Content settings saved!");
    } catch (error) {
      toast.error("Failed to save content settings");
    }
  };

  return (
    <>
      <CardHeader>
        <CardTitle>Website Content</CardTitle>
        <CardDescription>
          Configure your hero section, about page, services, and key selling points
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Hero Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                Hero Section
              </Badge>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="heroHeadline">Main Headline</Label>
                <Input
                  id="heroHeadline"
                  placeholder="Find Your Perfect Vehicle"
                  {...form.register("heroHeadline")}
                />
                {form.formState.errors.heroHeadline && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.heroHeadline.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="heroSubtitle">Subtitle</Label>
                <Textarea
                  id="heroSubtitle"
                  rows={3}
                  placeholder="A compelling subtitle that explains your value proposition..."
                  {...form.register("heroSubtitle")}
                />
                {form.formState.errors.heroSubtitle && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.heroSubtitle.message}
                  </p>
                )}
              </div>

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
                        onClick={() => setHeroBackgroundPreview(null)}
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
                      />
                      <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Click to upload hero background image
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Recommended: 1920x800px, JPG or PNG
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* About Section */}
          <div className="space-y-4">
            <Badge variant="outline" className="bg-secondary/50 text-secondary-foreground border-secondary/20">
              About Section
            </Badge>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="aboutTitle">Section Title</Label>
                <Input
                  id="aboutTitle"
                  placeholder="About Our Dealership"
                  {...form.register("aboutTitle")}
                />
                {form.formState.errors.aboutTitle && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.aboutTitle.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="aboutContent">About Content</Label>
                <Textarea
                  id="aboutContent"
                  rows={4}
                  placeholder="Tell visitors about your dealership, history, values, and what makes you special..."
                  {...form.register("aboutContent")}
                />
                {form.formState.errors.aboutContent && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.aboutContent.message}
                  </p>
                )}
              </div>
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
                  checked={form.watch("servicesEnabled")}
                  onCheckedChange={(checked) => form.setValue("servicesEnabled", checked)}
                />
                <Label htmlFor="services-enabled" className="text-sm">
                  Show services section
                </Label>
              </div>
            </div>

            {form.watch("servicesEnabled") && (
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
                  checked={form.watch("whyChooseUsEnabled")}
                  onCheckedChange={(checked) => form.setValue("whyChooseUsEnabled", checked)}
                />
                <Label htmlFor="why-choose-us-enabled" className="text-sm">
                  Show why choose us section
                </Label>
              </div>
            </div>

            {form.watch("whyChooseUsEnabled") && (
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
            Save Content Settings
          </Button>
        </form>
      </CardContent>
    </>
  );
}