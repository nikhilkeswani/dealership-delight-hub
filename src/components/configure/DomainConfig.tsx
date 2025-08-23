import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, Globe, ExternalLink, Copy, AlertTriangle, Clock, Shield } from "lucide-react";
import { useDealer } from "@/hooks/useDealer";
import { toast } from "sonner";

const schema = z.object({
  customDomain: z.string().optional(),
  enableSsl: z.boolean(),
  enableWww: z.boolean(),
  isPublished: z.boolean(),
});

type FormData = z.infer<typeof schema>;

export function DomainConfig() {
  const { data: dealer } = useDealer();
  const [domainStatus, setDomainStatus] = useState<"checking" | "verified" | "error" | "none">("none");
  const [sslStatus, setSslStatus] = useState<"active" | "pending" | "error" | "none">("none");
  
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      customDomain: "",
      enableSsl: true,
      enableWww: true,
      isPublished: false,
    },
  });

  const businessSlug = dealer?.business_name
    ?.toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || "your-dealership";

  const defaultSubdomain = `${businessSlug}.dealerdelight.com`;

  const handleDomainCheck = async () => {
    const domain = form.watch("customDomain");
    if (!domain) return;

    setDomainStatus("checking");
    try {
      // Simulate domain verification
      await new Promise(resolve => setTimeout(resolve, 2000));
      setDomainStatus("verified");
      toast.success("Domain verified successfully!");
    } catch (error) {
      setDomainStatus("error");
      toast.error("Domain verification failed");
    }
  };

  const handlePublish = async () => {
    try {
      const data = form.getValues();
      console.log("Publishing website:", data);
      
      // Simulate publishing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      form.setValue("isPublished", true);
      toast.success("Website published successfully!");
    } catch (error) {
      toast.error("Failed to publish website");
    }
  };

  const handleUnpublish = async () => {
    try {
      form.setValue("isPublished", false);
      toast.success("Website unpublished");
    } catch (error) {
      toast.error("Failed to unpublish website");
    }
  };

  const copyDnsRecord = (record: string) => {
    navigator.clipboard.writeText(record);
    toast.success("DNS record copied to clipboard");
  };

  const onSubmit = async (data: FormData) => {
    try {
      console.log("Saving domain config:", data);
      toast.success("Domain settings saved!");
    } catch (error) {
      toast.error("Failed to save domain settings");
    }
  };

  const isPublished = form.watch("isPublished");
  const hasCustomDomain = !!form.watch("customDomain");

  return (
    <>
      <CardHeader>
        <CardTitle>Domain & Publishing</CardTitle>
        <CardDescription>
          Configure your website domain and publishing settings
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Current Status */}
          <div className="space-y-4">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              Website Status
            </Badge>

            <Alert className={isPublished ? "border-green-200 bg-green-50" : "border-yellow-200 bg-yellow-50"}>
              <div className="flex items-center gap-2">
                {isPublished ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <Clock className="h-4 w-4 text-yellow-600" />
                )}
                <AlertDescription className={isPublished ? "text-green-800" : "text-yellow-800"}>
                  {isPublished ? "Your website is live and accessible to customers" : "Your website is not yet published"}
                </AlertDescription>
              </div>
            </Alert>

            {isPublished && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Your website is available at:</Label>
                <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <code className="flex-1 text-sm">
                    {hasCustomDomain ? `https://${form.watch("customDomain")}` : `https://${defaultSubdomain}`}
                  </code>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(hasCustomDomain ? `https://${form.watch("customDomain")}` : `https://${defaultSubdomain}`, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Default Subdomain */}
          <div className="space-y-4">
            <Badge variant="outline" className="bg-secondary/50 text-secondary-foreground border-secondary/20">
              Free Subdomain
            </Badge>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Your free subdomain</Label>
              <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <code className="flex-1 text-sm">{defaultSubdomain}</code>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => copyDnsRecord(defaultSubdomain)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                This subdomain is automatically configured and ready to use
              </p>
            </div>
          </div>

          <Separator />

          {/* Custom Domain */}
          <div className="space-y-4">
            <Badge variant="outline" className="bg-accent/50 text-accent-foreground border-accent/20">
              Custom Domain
            </Badge>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customDomain">Custom Domain</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="customDomain"
                    placeholder="yourdealership.com"
                    {...form.register("customDomain")}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleDomainCheck}
                    disabled={!form.watch("customDomain") || domainStatus === "checking"}
                  >
                    {domainStatus === "checking" ? "Checking..." : "Verify"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Enter your custom domain (requires DNS configuration)
                </p>
              </div>

              {domainStatus === "verified" && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Domain verified! Your custom domain is properly configured.
                  </AlertDescription>
                </Alert>
              )}

              {domainStatus === "error" && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    Domain verification failed. Please check your DNS settings.
                  </AlertDescription>
                </Alert>
              )}

              {form.watch("customDomain") && (
                <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
                  <p className="text-sm font-medium">DNS Configuration Required</p>
                  <p className="text-xs text-muted-foreground">
                    Add these DNS records at your domain registrar:
                  </p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-background rounded border">
                      <div className="space-y-1">
                        <p className="text-xs font-mono">A Record</p>
                        <p className="text-xs text-muted-foreground">@ → 185.158.133.1</p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => copyDnsRecord("185.158.133.1")}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-2 bg-background rounded border">
                      <div className="space-y-1">
                        <p className="text-xs font-mono">CNAME Record</p>
                        <p className="text-xs text-muted-foreground">www → {defaultSubdomain}</p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => copyDnsRecord(defaultSubdomain)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="enable-ssl" className="text-sm font-medium">SSL Certificate</Label>
                    <p className="text-xs text-muted-foreground">Automatically provision SSL for secure HTTPS</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="enable-ssl"
                      checked={form.watch("enableSsl")}
                      onCheckedChange={(checked) => form.setValue("enableSsl", checked)}
                    />
                    <Shield className="h-4 w-4 text-green-600" />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="enable-www" className="text-sm font-medium">WWW Redirect</Label>
                    <p className="text-xs text-muted-foreground">Redirect www.yourdomain.com to yourdomain.com</p>
                  </div>
                  <Switch
                    id="enable-www"
                    checked={form.watch("enableWww")}
                    onCheckedChange={(checked) => form.setValue("enableWww", checked)}
                  />
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Publishing Controls */}
          <div className="space-y-4">
            <Badge variant="outline" className="bg-muted/50 text-muted-foreground border-muted">
              Publishing Controls
            </Badge>

            <div className="flex flex-col gap-3">
              {!isPublished ? (
                <Button
                  type="button"
                  onClick={handlePublish}
                  className="w-full"
                >
                  Publish Website
                </Button>
              ) : (
                <div className="space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleUnpublish}
                    className="w-full"
                  >
                    Unpublish Website
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Unpublishing will make your website inaccessible to visitors
                  </p>
                </div>
              )}
            </div>
          </div>

          <Button type="submit" variant="outline" className="w-full">
            Save Domain Settings
          </Button>
        </form>
      </CardContent>
    </>
  );
}