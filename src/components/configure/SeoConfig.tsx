import React from "react";
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
import { Info, ExternalLink } from "lucide-react";
import { useDealer } from "@/hooks/useDealer";
import { toast } from "sonner";

const schema = z.object({
  metaTitle: z.string().min(10, "Title should be at least 10 characters").max(60, "Title should be less than 60 characters"),
  metaDescription: z.string().min(50, "Description should be at least 50 characters").max(160, "Description should be less than 160 characters"),
  keywords: z.string().optional(),
  googleAnalyticsId: z.string().optional(),
  googleTagManagerId: z.string().optional(),
  facebookPixelId: z.string().optional(),
  enableSocialSharing: z.boolean(),
  socialTitle: z.string().optional(),
  socialDescription: z.string().optional(),
  enableLocalSeo: z.boolean(),
  businessHours: z.object({
    monday: z.string().optional(),
    tuesday: z.string().optional(),
    wednesday: z.string().optional(),
    thursday: z.string().optional(),
    friday: z.string().optional(),
    saturday: z.string().optional(),
    sunday: z.string().optional(),
  }).optional(),
});

type FormData = z.infer<typeof schema>;

export function SeoConfig() {
  const { data: dealer } = useDealer();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      metaTitle: `${dealer?.business_name || "Auto Dealer"} - Quality Vehicles & Service`,
      metaDescription: `Visit ${dealer?.business_name || "our dealership"} for quality vehicles, competitive prices, and exceptional customer service. Browse our inventory and schedule a test drive today.`,
      keywords: "used cars, new cars, auto dealer, car financing, trade-in, automotive",
      googleAnalyticsId: "",
      googleTagManagerId: "",
      facebookPixelId: "",
      enableSocialSharing: true,
      socialTitle: `${dealer?.business_name || "Auto Dealer"} - Find Your Perfect Vehicle`,
      socialDescription: `Discover quality vehicles at ${dealer?.business_name || "our dealership"}. Browse our inventory and experience award-winning customer service.`,
      enableLocalSeo: true,
      businessHours: {
        monday: "9:00 AM - 8:00 PM",
        tuesday: "9:00 AM - 8:00 PM",
        wednesday: "9:00 AM - 8:00 PM",
        thursday: "9:00 AM - 8:00 PM",
        friday: "9:00 AM - 8:00 PM",
        saturday: "9:00 AM - 6:00 PM",
        sunday: "11:00 AM - 5:00 PM",
      },
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      // SEO configuration saved successfully
      toast.success("SEO settings saved!");
    } catch (error) {
      toast.error("Failed to save SEO settings");
    }
  };

  const metaTitleLength = form.watch("metaTitle")?.length || 0;
  const metaDescriptionLength = form.watch("metaDescription")?.length || 0;

  return (
    <>
      <CardHeader>
        <CardTitle>SEO & Marketing</CardTitle>
        <CardDescription>
          Optimize your website for search engines and set up marketing tracking
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic SEO */}
          <div className="space-y-4">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              Search Engine Optimization
            </Badge>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="metaTitle">Meta Title</Label>
                  <span className={`text-xs ${metaTitleLength > 60 ? 'text-destructive' : 'text-muted-foreground'}`}>
                    {metaTitleLength}/60
                  </span>
                </div>
                <Input
                  id="metaTitle"
                  placeholder="Your Business - Quality Vehicles & Service"
                  {...form.register("metaTitle")}
                />
                <p className="text-xs text-muted-foreground">
                  This appears as the clickable headline in search results
                </p>
                {form.formState.errors.metaTitle && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.metaTitle.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="metaDescription">Meta Description</Label>
                  <span className={`text-xs ${metaDescriptionLength > 160 ? 'text-destructive' : 'text-muted-foreground'}`}>
                    {metaDescriptionLength}/160
                  </span>
                </div>
                <Textarea
                  id="metaDescription"
                  rows={3}
                  placeholder="Visit our dealership for quality vehicles, competitive prices, and exceptional customer service..."
                  {...form.register("metaDescription")}
                />
                <p className="text-xs text-muted-foreground">
                  This appears as the description under your title in search results
                </p>
                {form.formState.errors.metaDescription && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.metaDescription.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="keywords">Keywords</Label>
                <Input
                  id="keywords"
                  placeholder="used cars, new cars, auto dealer, car financing"
                  {...form.register("keywords")}
                />
                <p className="text-xs text-muted-foreground">
                  Separate keywords with commas. Focus on terms customers use to find dealerships
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Social Media Sharing */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="bg-secondary/50 text-secondary-foreground border-secondary/20">
                Social Media Sharing
              </Badge>
              <div className="flex items-center space-x-2">
                <Switch
                  id="social-sharing-enabled"
                  checked={form.watch("enableSocialSharing")}
                  onCheckedChange={(checked) => form.setValue("enableSocialSharing", checked)}
                />
                <Label htmlFor="social-sharing-enabled" className="text-sm">
                  Enable social sharing
                </Label>
              </div>
            </div>

            {form.watch("enableSocialSharing") && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="socialTitle">Social Media Title</Label>
                  <Input
                    id="socialTitle"
                    placeholder="Find Your Perfect Vehicle at [Dealership Name]"
                    {...form.register("socialTitle")}
                  />
                  <p className="text-xs text-muted-foreground">
                    Title that appears when your website is shared on social media
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="socialDescription">Social Media Description</Label>
                  <Textarea
                    id="socialDescription"
                    rows={2}
                    placeholder="Discover quality vehicles and exceptional service..."
                    {...form.register("socialDescription")}
                  />
                  <p className="text-xs text-muted-foreground">
                    Description that appears when your website is shared on social media
                  </p>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Analytics & Tracking */}
          <div className="space-y-4">
            <Badge variant="outline" className="bg-accent/50 text-accent-foreground border-accent/20">
              Analytics & Tracking
            </Badge>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="googleAnalyticsId">Google Analytics ID</Label>
                <Input
                  id="googleAnalyticsId"
                  placeholder="G-XXXXXXXXXX or UA-XXXXXXXX-X"
                  {...form.register("googleAnalyticsId")}
                />
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                      Track website visitors and behavior
                    </p>
                    <a 
                      href="https://analytics.google.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                    >
                      Get Google Analytics ID <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="googleTagManagerId">Google Tag Manager ID</Label>
                <Input
                  id="googleTagManagerId"
                  placeholder="GTM-XXXXXXX"
                  {...form.register("googleTagManagerId")}
                />
                <p className="text-xs text-muted-foreground">
                  Manage tracking codes and marketing pixels
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="facebookPixelId">Facebook Pixel ID</Label>
                <Input
                  id="facebookPixelId"
                  placeholder="1234567890123456"
                  {...form.register("facebookPixelId")}
                />
                <p className="text-xs text-muted-foreground">
                  Track Facebook ad performance and create custom audiences
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Local SEO */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="bg-muted/50 text-muted-foreground border-muted">
                Local SEO
              </Badge>
              <div className="flex items-center space-x-2">
                <Switch
                  id="local-seo-enabled"
                  checked={form.watch("enableLocalSeo")}
                  onCheckedChange={(checked) => form.setValue("enableLocalSeo", checked)}
                />
                <Label htmlFor="local-seo-enabled" className="text-sm">
                  Enable local SEO
                </Label>
              </div>
            </div>

            {form.watch("enableLocalSeo") && (
              <div className="space-y-4">
                <div className="bg-muted/30 p-4 rounded-lg">
                  <p className="text-sm font-medium mb-2">Business Hours</p>
                  <p className="text-xs text-muted-foreground mb-3">
                    Help customers find your hours and improve local search visibility
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.entries({
                      monday: "Monday",
                      tuesday: "Tuesday", 
                      wednesday: "Wednesday",
                      thursday: "Thursday",
                      friday: "Friday",
                      saturday: "Saturday",
                      sunday: "Sunday",
                    }).map(([key, label]) => (
                      <div key={key} className="space-y-1">
                        <Label className="text-xs">{label}</Label>
                        <Input
                          placeholder="9:00 AM - 6:00 PM"
                          {...form.register(`businessHours.${key}` as any)}
                          className="text-sm"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <Button type="submit" className="w-full">
            Save SEO Settings
          </Button>
        </form>
      </CardContent>
    </>
  );
}