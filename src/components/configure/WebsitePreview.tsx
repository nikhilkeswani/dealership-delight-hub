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
    <div className={`${containerClasses} h-full overflow-auto`} style={{ backgroundColor: '#ffffff', color: '#000000', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
      {/* Header */}
      <header style={{ borderBottom: '1px solid #e5e7eb', padding: '16px', backgroundColor: '#ffffff' }}>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={config.brand.logoUrl || undefined} alt={`${businessName} logo`} />
              <AvatarFallback style={{ backgroundColor: '#f3f4f6', color: '#111827', fontSize: '12px' }}>{businessInitials}</AvatarFallback>
            </Avatar>
            <div>
              <p style={{ fontSize: '12px', color: '#6b7280' }}>Powered by DealerDelight</p>
              <h1 style={{ fontWeight: '600', color: '#111827' }}>{businessName}</h1>
              <p style={{ fontSize: '12px', color: '#4b5563' }}>{config.brand.tagline}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button style={{ backgroundColor: '#ffffff', border: '1px solid #d1d5db', color: '#111827', padding: '6px 12px', borderRadius: '6px', fontSize: '14px' }}>Contact</button>
            <button style={{ backgroundColor: '#7c3aed', color: '#ffffff', padding: '6px 12px', borderRadius: '6px', fontSize: '14px', border: 'none' }}>Test Drive</button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ padding: '16px 24px', background: 'linear-gradient(135deg, #ede9fe 0%, #f3e8ff 50%, #dcfce7 100%)' }}>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-1">
            <span style={{ backgroundColor: '#ffffff', color: '#374151', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', border: '1px solid #d1d5db', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Star className="h-3 w-3" /> 4.9 Rating
            </span>
            <span style={{ backgroundColor: '#ffffff', color: '#374151', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', border: '1px solid #d1d5db', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Award className="h-3 w-3" /> Award Winning
            </span>
            <span style={{ backgroundColor: '#ffffff', color: '#374151', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', border: '1px solid #d1d5db', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <ShieldCheck className="h-3 w-3" /> Certified
            </span>
            <span style={{ backgroundColor: '#ffffff', color: '#374151', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', border: '1px solid #d1d5db', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Tag className="h-3 w-3" /> Best Prices
            </span>
          </div>

          <div className="space-y-3">
            <h2 style={{ fontSize: device === "mobile" ? '24px' : '36px', fontWeight: '600', color: '#111827', lineHeight: '1.2' }}>
              {config.hero.headline}
            </h2>
            <p style={{ fontSize: device === "mobile" ? '14px' : '18px', color: '#4b5563' }}>
              {config.hero.subtitle}
            </p>
          </div>

          <div style={{ borderRadius: '8px', border: '1px solid #d1d5db', backgroundColor: 'rgba(255, 255, 255, 0.9)', padding: '16px' }}>
            <div className="space-y-3">
              <div className="relative">
                <input 
                  style={{ width: '100%', padding: '8px 12px 8px 32px', fontSize: '14px', border: '1px solid #d1d5db', borderRadius: '6px', backgroundColor: '#ffffff', color: '#111827' }}
                  placeholder="Search by make, model, year..."
                />
              </div>
              <div className="flex flex-wrap gap-1" style={{ fontSize: '12px' }}>
                <span style={{ color: '#4b5563' }}>Popular:</span>
                {["SUVs", "Sedans", "Electric"].map((term) => (
                  <button key={term} style={{ height: '28px', fontSize: '12px', padding: '0 8px', backgroundColor: '#ffffff', border: '1px solid #d1d5db', color: '#374151', borderRadius: '4px' }}>
                    {term}
                  </button>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <button style={{ width: '100%', backgroundColor: '#7c3aed', color: '#ffffff', padding: '10px 16px', borderRadius: '6px', fontSize: '14px', border: 'none', fontWeight: '500' }}>
                  Search Now
                </button>
                <button style={{ backgroundColor: '#000000', border: '1px solid #000000', color: '#ffffff', padding: '10px 16px', borderRadius: '6px', fontSize: '14px', fontWeight: '500' }}>
                  View All Inventory
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vehicles Preview */}
      <section style={{ padding: '16px 24px', backgroundColor: '#ffffff' }}>
        <h3 style={{ fontWeight: '600', marginBottom: '16px', color: '#111827' }}>Available Vehicles</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ border: '1px solid #d1d5db', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#ffffff' }}>
              <div style={{ height: '128px', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ fontSize: '12px', color: '#6b7280' }}>Vehicle Image</p>
              </div>
              <div style={{ padding: '12px' }} className="space-y-2">
                <div className="flex items-center justify-between">
                  <p style={{ fontWeight: '500', fontSize: '14px', color: '#111827' }}>2024 Sample Car</p>
                  <span style={{ fontSize: '12px', backgroundColor: '#dcfce7', color: '#166534', padding: '2px 6px', borderRadius: '4px', border: '1px solid #bbf7d0' }}>New</span>
                </div>
                <p style={{ fontSize: '18px', fontWeight: '600', color: '#111827' }}>$35,990</p>
                <p style={{ fontSize: '12px', color: '#4b5563' }}>
                  Premium features, great mileage
                </p>
                <button style={{ width: '100%', backgroundColor: '#ffffff', border: '1px solid #d1d5db', color: '#111827', padding: '8px 12px', borderRadius: '6px', fontSize: '14px' }}>
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* About Preview */}
      <section style={{ padding: '16px 24px', backgroundColor: '#f9fafb' }}>
        <h3 style={{ fontWeight: '600', marginBottom: '16px', color: '#111827' }}>About Our Dealership</h3>
        <p style={{ fontSize: '14px', color: '#4b5563', marginBottom: '16px' }}>
          We're committed to providing exceptional service and helping you find the perfect vehicle. 
          With years of experience in the automotive industry, we pride ourselves on transparent 
          pricing, quality vehicles, and customer satisfaction.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #d1d5db' }}>
            <p style={{ fontWeight: '600', fontSize: '18px', color: '#111827' }}>500+</p>
            <p style={{ fontSize: '12px', color: '#4b5563' }}>Happy Customers</p>
          </div>
          <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #d1d5db' }}>
            <p style={{ fontWeight: '600', fontSize: '18px', color: '#111827' }}>15+</p>
            <p style={{ fontSize: '12px', color: '#4b5563' }}>Years Experience</p>
          </div>
          <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #d1d5db' }}>
            <p style={{ fontWeight: '600', fontSize: '18px', color: '#111827' }}>4.9/5</p>
            <p style={{ fontSize: '12px', color: '#4b5563' }}>Customer Rating</p>
          </div>
        </div>
      </section>

      {/* Contact Preview */}
      <section style={{ padding: '16px 24px', borderTop: '1px solid #d1d5db', backgroundColor: '#ffffff' }}>
        <h3 style={{ fontWeight: '600', marginBottom: '16px', color: '#111827' }}>Contact Us</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div style={{ padding: '8px', backgroundColor: '#f3f4f6', borderRadius: '50%' }}>
              <Phone className="h-4 w-4" style={{ color: '#4b5563' }} />
            </div>
            <div>
              <p style={{ fontWeight: '500', fontSize: '14px', color: '#111827' }}>{config.contact.phone}</p>
              <p style={{ fontSize: '12px', color: '#4b5563' }}>Call us anytime</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div style={{ padding: '8px', backgroundColor: '#f3f4f6', borderRadius: '50%' }}>
              <Mail className="h-4 w-4" style={{ color: '#4b5563' }} />
            </div>
            <div>
              <p style={{ fontWeight: '500', fontSize: '14px', color: '#111827' }}>{config.contact.email}</p>
              <p style={{ fontSize: '12px', color: '#4b5563' }}>Email us</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div style={{ padding: '8px', backgroundColor: '#f3f4f6', borderRadius: '50%' }}>
              <MapPin className="h-4 w-4" style={{ color: '#4b5563' }} />
            </div>
            <div>
              <p style={{ fontWeight: '500', fontSize: '14px', color: '#111827' }}>Visit Our Showroom</p>
              <p style={{ fontSize: '12px', color: '#4b5563' }}>
                {config.contact.address}
              </p>
            </div>
          </div>
          
          <button style={{ width: '100%', marginTop: '16px', backgroundColor: '#7c3aed', color: '#ffffff', padding: '10px 16px', borderRadius: '6px', fontSize: '14px', border: 'none', fontWeight: '500' }}>Get Directions</button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '16px', borderTop: '1px solid #d1d5db', backgroundColor: '#f9fafb', textAlign: 'center' }}>
        <p style={{ fontSize: '12px', color: '#4b5563' }}>
          © 2024 {businessName}. Powered by DealerDelight.
        </p>
      </footer>
    </div>
  );
}