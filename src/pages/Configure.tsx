import React, { useState } from "react";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Palette, Type, Image, Globe, Settings } from "lucide-react";
import { BrandingConfig } from "@/components/configure/BrandingConfig";
import { ThemeConfig } from "@/components/configure/ThemeConfig";
import { ContentConfig } from "@/components/configure/ContentConfig";
import { SeoConfig } from "@/components/configure/SeoConfig";
import { DomainConfig } from "@/components/configure/DomainConfig";
import { WebsitePreview } from "@/components/configure/WebsitePreview";
import { useDealer } from "@/hooks/useDealer";
import { toast } from "sonner";

export default function Configure() {
  const [activeTab, setActiveTab] = useState("branding");
  const { data: dealer } = useDealer();

  const handlePublish = async () => {
    if (!dealer?.id) return;
    
    try {
      toast.success("Website published successfully!");
    } catch (error) {
      toast.error("Failed to publish website");
    }
  };

  const handlePreview = () => {
    if (dealer?.business_name) {
      const slug = dealer.business_name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      window.open(`/dealer/${slug}`, '_blank');
    } else {
      window.open('/dealer/demo-motors', '_blank');
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
        {/* Simple Header */}
        <div className="border-b">
          <div className="container py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold">Website Builder</h1>
                <p className="text-muted-foreground text-sm mt-1">
                  Customize your dealer website
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handlePreview} variant="outline">
                  Preview in New Tab
                </Button>
                <Button onClick={handlePublish} variant="default">
                  Publish Website
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container py-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Configuration Panel */}
            <div>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Customize</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Simple Tab Navigation */}
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-5 h-auto p-1">
                      <TabsTrigger value="branding" className="flex flex-col gap-1 py-2 px-1">
                        <Type className="h-4 w-4" />
                        <span className="text-xs">Brand</span>
                      </TabsTrigger>
                      <TabsTrigger value="theme" className="flex flex-col gap-1 py-2 px-1">
                        <Palette className="h-4 w-4" />
                        <span className="text-xs">Theme</span>
                      </TabsTrigger>
                      <TabsTrigger value="content" className="flex flex-col gap-1 py-2 px-1">
                        <Image className="h-4 w-4" />
                        <span className="text-xs">Content</span>
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
                      <TabsContent value="branding" className="m-0">
                        <BrandingConfig />
                      </TabsContent>
                      
                      <TabsContent value="theme" className="m-0">
                        <ThemeConfig />
                      </TabsContent>
                      
                      <TabsContent value="content" className="m-0">
                        <ContentConfig />
                      </TabsContent>
                      
                      <TabsContent value="seo" className="m-0">
                        <SeoConfig />
                      </TabsContent>
                      
                      <TabsContent value="domain" className="m-0">
                        <DomainConfig />
                      </TabsContent>
                    </div>
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            {/* Preview Panel */}
            <div>
              <Card className="h-[600px]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Preview</CardTitle>
                </CardHeader>
                <CardContent className="h-full p-4">
                  <div className="w-full h-full border rounded-md overflow-hidden">
                    <WebsitePreview device="desktop" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}