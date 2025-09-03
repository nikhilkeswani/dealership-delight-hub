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
    <div className={`${containerClasses} h-full overflow-auto bg-white border rounded-lg text-gray-900`}>
      {/* Header */}
      <header className="border-b p-4 bg-white">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={config.brand.logoUrl || undefined} alt={`${businessName} logo`} />
              <AvatarFallback className="text-xs bg-gray-100 text-gray-900">{businessInitials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-xs text-gray-500">Powered by DealerDelight</p>
              <h1 className="font-semibold text-gray-900">{businessName}</h1>
              <p className="text-xs text-gray-600">{config.brand.tagline}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="bg-white border-gray-300 text-gray-900 hover:bg-gray-50">Contact</Button>
            <Button size="sm" className="bg-purple-600 text-white hover:bg-purple-700">Test Drive</Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="p-4 md:p-6 bg-gradient-to-br from-purple-100 via-purple-50 to-green-50">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-1">
            <Badge variant="secondary" className="flex items-center gap-1 text-xs bg-white text-gray-700 border border-gray-200">
              <Star className="h-3 w-3" /> 4.9 Rating
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1 text-xs bg-white text-gray-700 border border-gray-200">
              <Award className="h-3 w-3" /> Award Winning
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1 text-xs bg-white text-gray-700 border border-gray-200">
              <ShieldCheck className="h-3 w-3" /> Certified
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1 text-xs bg-white text-gray-700 border border-gray-200">
              <Tag className="h-3 w-3" /> Best Prices
            </Badge>
          </div>

          <div className="space-y-3">
            <h2 className={`${textSizes.headline} font-semibold tracking-tight text-gray-900`}>
              {config.hero.headline}
            </h2>
            <p className={`${textSizes.subtitle} text-gray-600`}>
              {config.hero.subtitle}
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white/80 backdrop-blur p-3 md:p-4">
            <div className="space-y-3">
              <div className="relative">
                <input 
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md pl-8 bg-white text-gray-900 placeholder-gray-500"
                  placeholder="Search by make, model, year..."
                />
                <div className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              <div className="flex flex-wrap gap-1 text-xs">
                <span className="text-gray-600">Popular:</span>
                {["SUVs", "Sedans", "Electric"].map((term) => (
                  <Button key={term} variant="outline" size="sm" className="h-7 text-xs px-2 bg-white border-gray-300 text-gray-700 hover:bg-gray-50">
                    {term}
                  </Button>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button className="w-full bg-purple-600 text-white hover:bg-purple-700" size={device === "mobile" ? "sm" : "default"}>
                  Search Now
                </Button>
                <Button 
                  variant="preview-button" 
                  className="w-full sm:w-auto bg-white border-gray-300 text-gray-900 hover:bg-gray-50" 
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
      <section className="p-4 md:p-6 bg-white">
        <h3 className="font-semibold mb-4 text-gray-900">Available Vehicles</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
              <div className="h-32 bg-gray-100 flex items-center justify-center">
                <p className="text-xs text-gray-500">Vehicle Image</p>
              </div>
              <div className="p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm text-gray-900">2024 Sample Car</p>
                  <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">New</Badge>
                </div>
                <p className="text-lg font-semibold text-gray-900">$35,990</p>
                <p className="text-xs text-gray-600">
                  Premium features, great mileage
                </p>
                <Button variant="outline" size="sm" className="w-full bg-white border-gray-300 text-gray-900 hover:bg-gray-50">
                  View Details
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* About Preview */}
      <section className="p-4 md:p-6 bg-gray-50">
        <h3 className="font-semibold mb-4 text-gray-900">About Our Dealership</h3>
        <p className="text-sm text-gray-600 mb-4">
          We're committed to providing exceptional service and helping you find the perfect vehicle. 
          With years of experience in the automotive industry, we pride ourselves on transparent 
          pricing, quality vehicles, and customer satisfaction.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
            <p className="font-semibold text-lg text-gray-900">500+</p>
            <p className="text-xs text-gray-600">Happy Customers</p>
          </div>
          <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
            <p className="font-semibold text-lg text-gray-900">15+</p>
            <p className="text-xs text-gray-600">Years Experience</p>
          </div>
          <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
            <p className="font-semibold text-lg text-gray-900">4.9/5</p>
            <p className="text-xs text-gray-600">Customer Rating</p>
          </div>
        </div>
      </section>

      {/* Contact Preview */}
      <section className="p-4 md:p-6 border-t border-gray-200 bg-white">
        <h3 className="font-semibold mb-4 text-gray-900">Contact Us</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-full">
              <Phone className="h-4 w-4 text-gray-600" />
            </div>
            <div>
              <p className="font-medium text-sm text-gray-900">{config.contact.phone}</p>
              <p className="text-xs text-gray-600">Call us anytime</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-full">
              <Mail className="h-4 w-4 text-gray-600" />
            </div>
            <div>
              <p className="font-medium text-sm text-gray-900">{config.contact.email}</p>
              <p className="text-xs text-gray-600">Email us</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-full">
              <MapPin className="h-4 w-4 text-gray-600" />
            </div>
            <div>
              <p className="font-medium text-sm text-gray-900">Visit Our Showroom</p>
              <p className="text-xs text-gray-600">
                {config.contact.address}
              </p>
            </div>
          </div>
          
          <Button className="w-full mt-4 bg-purple-600 text-white hover:bg-purple-700">Get Directions</Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="p-4 border-t border-gray-200 bg-gray-50 text-center">
        <p className="text-xs text-gray-600">
          © 2024 {businessName}. Powered by DealerDelight.
        </p>
      </footer>
    </div>
  );
}