import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Palette, Type, Image, Globe, Settings, Phone, ArrowLeft } from "lucide-react";
import { CustomizeConfig } from "@/components/configure/CustomizeConfig";
import { ThemeConfig } from "@/components/configure/ThemeConfig";
import { SeoConfig } from "@/components/configure/SeoConfig";
import { DomainConfig } from "@/components/configure/DomainConfig";
import { ContactConfig } from "@/components/configure/ContactConfig";
import { WebsitePreview } from "@/components/configure/WebsitePreview";
import { useDealer } from "@/hooks/useDealer";
import { toast } from "sonner";

export default function Configure() {
  const [activeTab, setActiveTab] = useState("customize");
  const { data: dealer } = useDealer();
  const navigate = useNavigate();

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
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigate(-1)}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                <div>
                  <h1 className="text-2xl font-semibold">Website Builder</h1>
                  <p className="text-muted-foreground text-sm mt-1">
                    Customize your dealer website
                  </p>
                </div>
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
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Customize</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}