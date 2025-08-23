import React, { useState } from "react";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Eye, Palette, Type, Image, Globe, Settings, CheckCircle, ArrowRight, Smartphone, Monitor } from "lucide-react";
import { BrandingConfig } from "@/components/configure/BrandingConfig";
import { ThemeConfig } from "@/components/configure/ThemeConfig";
import { ContentConfig } from "@/components/configure/ContentConfig";
import { SeoConfig } from "@/components/configure/SeoConfig";
import { DomainConfig } from "@/components/configure/DomainConfig";
import { WebsitePreview } from "@/components/configure/WebsitePreview";
import { useDealer } from "@/hooks/useDealer";
import { usePublicDealerWebsite } from "@/hooks/usePublicDealerWebsite";
import { toast } from "sonner";

export default function Configure() {
  const [activeTab, setActiveTab] = useState("branding");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [isPublishing, setIsPublishing] = useState(false);
  
  const { data: dealer } = useDealer();
  const { data: websiteConfig, refetch } = usePublicDealerWebsite(dealer?.id);

  const handlePublish = async () => {
    if (!dealer?.id) return;
    
    setIsPublishing(true);
    try {
      // This would typically save and publish the website
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      toast.success("Website published successfully!");
    } catch (error) {
      toast.error("Failed to publish website");
    } finally {
      setIsPublishing(false);
    }
  };

  const configSections = [
    {
      id: "branding",
      label: "Branding",
      icon: Type,
      description: "Logo, business name, and tagline",
      completed: true,
    },
    {
      id: "theme",
      label: "Theme & Colors",
      icon: Palette,
      description: "Colors, fonts, and layout",
      completed: false,
    },
    {
      id: "content",
      label: "Content",
      icon: Image,
      description: "Hero section, about, and services",
      completed: false,
    },
    {
      id: "seo",
      label: "SEO & Marketing",
      icon: Globe,
      description: "Meta tags and analytics",
      completed: false,
    },
    {
      id: "domain",
      label: "Domain & Publishing",
      icon: Settings,
      description: "Custom domain and publish settings",
      completed: false,
    },
  ];

  const completedSections = configSections.filter(section => section.completed).length;
  const progressPercentage = (completedSections / configSections.length) * 100;

  return (
    <>
      <SEO 
        title="Configure Website - Dealer Portal"
        description="Configure your dealer website with our visual builder"
        noIndex
      />
      
      <div className="min-h-screen bg-muted/20">
        {/* Header */}
        <div className="border-b bg-background">
          <div className="container py-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="space-y-2">
                <h1 className="text-3xl font-semibold tracking-tight">Configure Website</h1>
                <p className="text-muted-foreground">
                  Customize your dealer website with our visual builder
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Button
                    variant={previewDevice === "desktop" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPreviewDevice("desktop")}
                    className="flex items-center gap-2"
                  >
                    <Monitor className="h-4 w-4" />
                    Desktop
                  </Button>
                  <Button
                    variant={previewDevice === "mobile" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPreviewDevice("mobile")}
                    className="flex items-center gap-2"
                  >
                    <Smartphone className="h-4 w-4" />
                    Mobile
                  </Button>
                </div>
                
                <Separator orientation="vertical" className="h-8" />
                
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  Preview
                </Button>
                
                <Button 
                  onClick={handlePublish}
                  disabled={isPublishing}
                  className="flex items-center gap-2"
                >
                  {isPublishing ? "Publishing..." : "Publish Website"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container py-6">
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
            {/* Configuration Panel */}
            <div className="xl:col-span-2 space-y-6">
              {/* Progress Card */}
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Setup Progress</CardTitle>
                      <CardDescription>
                        {completedSections} of {configSections.length} sections completed
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="font-medium">
                      {Math.round(progressPercentage)}%
                    </Badge>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {configSections.map((section) => (
                      <div
                        key={section.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                          activeTab === section.id 
                            ? "bg-primary/5 border-primary" 
                            : "hover:bg-muted/50"
                        }`}
                        onClick={() => setActiveTab(section.id)}
                      >
                        <div className={`p-2 rounded-md ${
                          section.completed 
                            ? "bg-primary/10 text-primary" 
                            : "bg-muted text-muted-foreground"
                        }`}>
                          {section.completed ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <section.icon className="h-4 w-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{section.label}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {section.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Configuration Content */}
              <Card className="overflow-hidden">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
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
                </Tabs>
              </Card>
            </div>

            {/* Preview Panel */}
            <div className="xl:col-span-3">
              <Card className="h-full min-h-[800px]">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Live Preview</CardTitle>
                    <Badge variant="outline" className="font-medium">
                      {previewDevice === "desktop" ? "Desktop" : "Mobile"} View
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="h-full">
                  <WebsitePreview device={previewDevice} />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}