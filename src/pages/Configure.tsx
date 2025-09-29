import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Palette, Type, Image, Globe, Settings, Phone } from "lucide-react";
import BackToHubButton from "@/components/common/BackToHubButton";
import { CustomizeConfig } from "@/components/configure/CustomizeConfig";
import { ThemeConfig } from "@/components/configure/ThemeConfig";
import { SeoConfig } from "@/components/configure/SeoConfig";
import { DomainConfig } from "@/components/configure/DomainConfig";
import { ContactConfig } from "@/components/configure/ContactConfig";
import { WebsitePreview } from "@/components/configure/WebsitePreview";
import { DealerSiteThemeProvider } from "@/components/DealerSiteThemeProvider";
import { useDealer } from "@/hooks/useDealer";
import { useWebsitePublishing } from "@/hooks/useWebsitePublishing";
import { useDealerSiteConfig } from "@/hooks/useDealerSiteConfig";
import { DEFAULT_DEALER_SITE_CONFIG } from "@/constants/theme";
import { toast } from "sonner";

export default function Configure() {
  const [activeTab, setActiveTab] = useState("customize");
  const { data: dealer } = useDealer();
  const { publish, isPublishing, isPublished } = useWebsitePublishing();
  const navigate = useNavigate();
  
  // Get dealer site config for theme colors
  const slug = dealer?.business_name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'demo';
  const defaultConfig = {
    ...DEFAULT_DEALER_SITE_CONFIG,
    brand: { ...DEFAULT_DEALER_SITE_CONFIG.brand, name: dealer?.business_name || DEFAULT_DEALER_SITE_CONFIG.brand.name },
    contact: {
      ...DEFAULT_DEALER_SITE_CONFIG.contact,
      phone: dealer?.phone || DEFAULT_DEALER_SITE_CONFIG.contact.phone,
      email: dealer?.contact_email || DEFAULT_DEALER_SITE_CONFIG.contact.email,
      address: dealer?.address || DEFAULT_DEALER_SITE_CONFIG.contact.address,
    },
  };
  const { config } = useDealerSiteConfig(slug, defaultConfig);

  const handlePublish = async () => {
    if (!dealer?.id) return;
    
    // Pass the current theme configuration to the database
    publish({
      theme_config: {
        colors: config.colors,
        brand: config.brand,
        hero: config.hero,
        content: config.content,
      },
      contact_config: config.contact,
    });
  };

  const handlePreview = () => {
    if (dealer?.business_name) {
      const slug = dealer.business_name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      window.open(`/dealer/${slug}?preview=true`, '_blank');
    } else {
      window.open('/dealer/demo-motors?preview=true', '_blank');
    }
  };

  return (
    <>
      <SEO 
        title="Configure Website - Dealer Portal"
        description="Configure your dealer website"
        noIndex
      />
      
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="relative border-b overflow-hidden">
          <div className="absolute inset-0 pointer-events-none opacity-70" aria-hidden>
            <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full blur-3xl opacity-30" style={{ background: "var(--gradient-primary)" }} />
          </div>
          <div className="container py-8 relative">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <BackToHubButton />
                <div className="space-y-1">
                  <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Website Builder</h1>
                  <p className="text-sm text-muted-foreground">Configure your dealer website and publish it live</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handlePreview} variant="outline" size="lg">
                  Preview Site
                </Button>
                <Button onClick={handlePublish} variant="default" size="lg" disabled={isPublishing}>
                  {isPublishing ? "Publishing..." : isPublished ? "Update Website" : "Publish Website"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container py-8">
          <div className="max-w-4xl mx-auto">
            {/* Configuration Panel - Full Width */}
            <div className="rounded-xl border bg-card/60 backdrop-blur">
              <div className="p-6 border-b">
                <h2 className="text-xl font-medium">Website Configuration</h2>
                <p className="text-sm text-muted-foreground mt-1">Customize your dealer website settings. Use "Preview Site" to see your changes.</p>
              </div>
              <div className="p-6 space-y-4">
                {/* Simple Tab Navigation */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-5 h-auto p-1">
                    <TabsTrigger value="customize" className="flex flex-col gap-1 py-2 px-1">
                      <Type className="h-4 w-4" />
                      <span className="text-xs">Customize</span>
                    </TabsTrigger>
                    <TabsTrigger value="contact" className="flex flex-col gap-1 py-2 px-1">
                      <Phone className="h-4 w-4" />
                      <span className="text-xs">Contact</span>
                    </TabsTrigger>
                    <TabsTrigger value="theme" className="flex flex-col gap-1 py-2 px-1">
                      <Palette className="h-4 w-4" />
                      <span className="text-xs">Theme</span>
                    </TabsTrigger>
                    <TabsTrigger value="seo" className="flex flex-col gap-1 py-2 px-1">
                      <Globe className="h-4 w-4" />
                      <span className="text-xs">SEO</span>
                    </TabsTrigger>
                    <TabsTrigger value="domain" className="flex flex-col gap-1 py-2 px-1">
                      <Settings className="h-4 w-4" />
                      <span className="text-xs">Domain</span>
                    </TabsTrigger>
                  </TabsList>

                  <div className="mt-4">
                    <TabsContent value="customize" className="m-0">
                      <CustomizeConfig />
                    </TabsContent>
                    
                    <TabsContent value="contact" className="m-0">
                      <ContactConfig />
                    </TabsContent>
                    
                    <TabsContent value="theme" className="m-0">
                      <ThemeConfig />
                    </TabsContent>
                    
                    <TabsContent value="seo" className="m-0">
                      <SeoConfig />
                    </TabsContent>
                    
                    <TabsContent value="domain" className="m-0">
                      <DomainConfig />
                    </TabsContent>
                  </div>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}