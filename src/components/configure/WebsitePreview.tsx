import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Award, ShieldCheck, Tag, Phone, Mail, MapPin } from "lucide-react";
import { useDealer } from "@/hooks/useDealer";
import { useDealerSiteConfig } from "@/hooks/useDealerSiteConfig";

interface WebsitePreviewProps {
  device: "desktop" | "mobile";
}

export function WebsitePreview({ device }: WebsitePreviewProps) {
  const { data: dealer } = useDealer();
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
  
  const { config } = useDealerSiteConfig(slug, defaultConfig);
  
  const businessName = config.brand.name;
  const businessInitials = businessName
    .split(" ")
    .slice(0, 2)
    .map(word => word[0])
    .join("")
    .toUpperCase();

  const containerClasses = device === "mobile" 
    ? "w-full max-w-sm mx-auto" 
    : "w-full";

  const textSizes = device === "mobile" 
    ? {
      headline: "text-2xl",
      subtitle: "text-sm",
      button: "text-sm px-4 py-2",
    }
    : {
      headline: "text-4xl",
      subtitle: "text-lg",  
      button: "text-base px-6 py-3",
    };

  return (
    <div className={`${containerClasses} h-full overflow-auto bg-background border rounded-lg`}>
      {/* Header */}
      <header className="border-b p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={config.brand.logoUrl || undefined} alt={`${businessName} logo`} />
              <AvatarFallback className="text-xs">{businessInitials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-xs text-muted-foreground">Powered by DealerDelight</p>
              <h1 className="font-semibold">{businessName}</h1>
              <p className="text-xs text-muted-foreground">{config.brand.tagline}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">Contact</Button>
            <Button size="sm">Test Drive</Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="p-4 md:p-6 bg-gradient-to-br from-primary/20 via-primary/10 to-accent/20">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-1">
            <Badge variant="secondary" className="flex items-center gap-1 text-xs">
              <Star className="h-3 w-3" /> 4.9 Rating
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1 text-xs">
              <Award className="h-3 w-3" /> Award Winning
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1 text-xs">
              <ShieldCheck className="h-3 w-3" /> Certified
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1 text-xs">
              <Tag className="h-3 w-3" /> Best Prices
            </Badge>
          </div>

          <div className="space-y-3">
            <h2 className={`${textSizes.headline} font-semibold tracking-tight`}>
              {config.hero.headline}
            </h2>
            <p className={`${textSizes.subtitle} text-muted-foreground`}>
              {config.hero.subtitle}
            </p>
          </div>

          <div className="rounded-lg border bg-card/70 backdrop-blur p-3 md:p-4">
            <div className="space-y-3">
              <div className="relative">
                <input 
                  className="w-full px-3 py-2 text-sm border border-input rounded-md pl-8"
                  placeholder="Search by make, model, year..."
                />
                <div className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex flex-wrap gap-1 text-xs">
                <span className="text-muted-foreground">Popular:</span>
                {["SUVs", "Sedans", "Electric"].map((term) => (
                  <Button key={term} variant="outline" size="sm" className="h-7 text-xs px-2">
                    {term}
                  </Button>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button className="w-full" size={device === "mobile" ? "sm" : "default"}>
                  Search Now
                </Button>
                <Button 
                  variant="secondary" 
                  className="w-full sm:w-auto" 
                  size={device === "mobile" ? "sm" : "default"}
                >
                  View All Inventory
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vehicles Preview */}
      <section className="p-4 md:p-6">
        <h3 className="font-semibold mb-4">Available Vehicles</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border rounded-lg overflow-hidden">
              <div className="h-32 bg-muted flex items-center justify-center">
                <p className="text-xs text-muted-foreground">Vehicle Image</p>
              </div>
              <div className="p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm">2024 Sample Car</p>
                  <Badge variant="outline" className="text-xs">New</Badge>
                </div>
                <p className="text-lg font-semibold">$35,990</p>
                <p className="text-xs text-muted-foreground">
                  Premium features, great mileage
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  View Details
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* About Preview */}
      <section className="p-4 md:p-6 bg-muted/30">
        <h3 className="font-semibold mb-4">About Our Dealership</h3>
        <p className="text-sm text-muted-foreground mb-4">
          We're committed to providing exceptional service and helping you find the perfect vehicle. 
          With years of experience in the automotive industry, we pride ourselves on transparent 
          pricing, quality vehicles, and customer satisfaction.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-3 bg-background rounded-lg">
            <p className="font-semibold text-lg">500+</p>
            <p className="text-xs text-muted-foreground">Happy Customers</p>
          </div>
          <div className="text-center p-3 bg-background rounded-lg">
            <p className="font-semibold text-lg">15+</p>
            <p className="text-xs text-muted-foreground">Years Experience</p>
          </div>
          <div className="text-center p-3 bg-background rounded-lg">
            <p className="font-semibold text-lg">4.9/5</p>
            <p className="text-xs text-muted-foreground">Customer Rating</p>
          </div>
        </div>
      </section>

      {/* Contact Preview */}
      <section className="p-4 md:p-6 border-t">
        <h3 className="font-semibold mb-4">Contact Us</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-muted rounded-full">
              <Phone className="h-4 w-4" />
            </div>
            <div>
              <p className="font-medium text-sm">{config.contact.phone}</p>
              <p className="text-xs text-muted-foreground">Call us anytime</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="p-2 bg-muted rounded-full">
              <Mail className="h-4 w-4" />
            </div>
            <div>
              <p className="font-medium text-sm">{config.contact.email}</p>
              <p className="text-xs text-muted-foreground">Email us</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="p-2 bg-muted rounded-full">
              <MapPin className="h-4 w-4" />
            </div>
            <div>
              <p className="font-medium text-sm">Visit Our Showroom</p>
              <p className="text-xs text-muted-foreground">
                {config.contact.address}
              </p>
            </div>
          </div>
          
          <Button className="w-full mt-4">Get Directions</Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="p-4 border-t bg-muted/30 text-center">
        <p className="text-xs text-muted-foreground">
          © 2024 {businessName}. Powered by DealerDelight.
        </p>
      </footer>
    </div>
  );
}