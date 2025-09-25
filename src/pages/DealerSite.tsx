import { useParams, Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { Helmet } from "react-helmet-async";
import VehicleCard, { VehicleData } from "@/components/VehicleCard";
import { Button } from "@/components/ui/button";
import sedan from "@/assets/cars/sedan.jpg";
import suv from "@/assets/cars/suv.jpg";
import hatch from "@/assets/cars/hatch.jpg";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { DealerSiteThemeProvider } from "@/components/DealerSiteThemeProvider";
import { DEFAULT_DEALER_SITE_CONFIG, DEFAULT_COLORS, THEME_VERSION } from "@/constants/theme";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Phone, Mail, Clock, Star, Award, ShieldCheck, Tag, Search, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import CustomizeSheet from "@/components/dealer/CustomizeSheet";

type ContactIntent = "inquiry" | "testdrive";
import { useDealerSiteConfig, type DealerSiteConfig } from "@/hooks/useDealerSiteConfig";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useDealer } from "@/hooks/useDealer";
import { supabase } from "@/integrations/supabase/client";
import { usePublicDealer } from "@/hooks/usePublicDealer";
import { usePublicVehicles } from "@/hooks/usePublicVehicles";
import { usePublicDealerWebsite } from "@/hooks/usePublicDealerWebsite";
import { useCreatePublicLead } from "@/hooks/useCreatePublicLead";
import { formatCurrency } from "@/lib/format";
const sampleVehicles: VehicleData[] = [
  {
    id: "1",
    title: "2024 Electra Sedan Pro",
    price: "$42,990",
    condition: "New",
    description: "Premium electric sedan with 310-mile range, advanced driver assist, and panoramic roof.",
    features: ["Electric", "310 mi range", "Panoramic roof", "ADAS"],
    images: [sedan, sedan, sedan],
  },
  {
    id: "2",
    title: "2023 Urban SUV X AWD",
    price: "$36,450",
    condition: "Certified",
    description: "Spacious AWD SUV with smart infotainment, safety suite, and great fuel economy.",
    features: ["AWD", "Smart infotainment", "Safety suite", "Eco"],
    images: [suv, suv, suv],
  },
  {
    id: "3",
    title: "2022 City Hatch S",
    price: "$19,990",
    condition: "Used",
    description: "Compact hatchback, perfect for the city with great mileage and easy parking.",
    features: ["Compact", "Great mileage", "Bluetooth", "Backup cam"],
    images: [hatch, hatch, hatch],
  },
];

const DealerSite = () => {
  const { slug } = useParams();
  
  // Fetch real dealer data
  const { data: publicDealer, isLoading: dealerLoading } = usePublicDealer(slug);
  const { data: publicVehicles, isLoading: vehiclesLoading } = usePublicVehicles(publicDealer?.id);
  const { data: websiteConfig, isLoading: websiteLoading } = usePublicDealerWebsite(publicDealer?.id);
  const createPublicLead = useCreatePublicLead();

  // Demo fallback data
  const dealerName = publicDealer?.business_name || (slug || "demo-motors")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
  const address = publicDealer?.address || "1600 Amphitheatre Parkway, Mountain View, CA";
  const currentUrl = typeof window !== "undefined" ? window.location.href : undefined;

  // Real or demo contact info
  const phone = publicDealer?.phone || "(650) 555-0199";
  const email = publicDealer?.contact_email || `sales@${(slug || "demo-motors")
    .replace(/[^a-z0-9-]/gi, "")
    .toLowerCase()}.com`;

  // Check if we're in preview mode (coming from configure page)
  const isPreviewMode = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("preview") === "true";

  // Use website config if available, otherwise defaults
  const themeConfig = websiteConfig?.theme_config as any;
  const contactConfig = websiteConfig?.contact_config as any;
  
  const defaults: DealerSiteConfig = {
    brand: { 
      name: dealerName, 
      tagline: themeConfig?.brand?.tagline || "Your trusted local dealer — transparent pricing and fast test drives.", 
      logoUrl: publicDealer?.logo_url || themeConfig?.brand?.logoUrl 
    },
    hero: { 
      headline: themeConfig?.hero?.headline || "Find Your Perfect Vehicle", 
      subtitle: themeConfig?.hero?.subtitle || "Premium quality cars with unbeatable service and expertise. Experience the difference with our award‑winning customer care.",
      backgroundUrl: themeConfig?.hero?.backgroundUrl || ""
    },
    contact: { 
      phone: contactConfig?.phone || phone, 
      email: contactConfig?.email || email, 
      address: contactConfig?.address || address 
    },
    colors: themeConfig?.colors || DEFAULT_COLORS,
    content: {
      aboutContent: "We're committed to providing exceptional service and helping you find the perfect vehicle. With years of experience in the automotive industry, we pride ourselves on transparent pricing, quality vehicles, and customer satisfaction.",
      servicesEnabled: true,
      services: [
        { title: "Vehicle Sales", description: "Browse our extensive inventory of new and pre-owned vehicles" },
        { title: "Financing", description: "Competitive rates and flexible financing options available" },
        { title: "Trade-Ins", description: "Get the best value for your current vehicle" },
        { title: "Service & Maintenance", description: "Professional maintenance and repair services" },
      ],
      whyChooseUsEnabled: true,
      whyChooseUsPoints: [
        "Over 20 years of experience in the automotive industry",
        "Transparent pricing with no hidden fees", 
        "Award-winning customer service team",
        "Comprehensive warranty on all vehicles",
        "Fast and easy financing process"
      ]
    },
  };

  // In preview mode, prioritize localStorage config; otherwise use database config as defaults
  const { config, setConfig, saveLocal, reset } = useDealerSiteConfig(
    slug, 
    isPreviewMode ? defaults : defaults
  );

  const { data: dealer } = useDealer();
  const isDemo = !publicDealer || (slug || "").toLowerCase() === "demo-motors" || (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("demo") === "1");
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [contactIntent, setContactIntent] = useState<ContactIntent>("inquiry");
  const brandInitials = (config.brand.name || "").split(" ").slice(0,2).map(w=>w[0]).join("").toUpperCase() || "DL";

  const saveToWebsite = async () => {
    if (!dealer?.id) return;
    const { error } = await supabase.from("dealer_websites").upsert({
      dealer_id: dealer.id,
      theme_config: { colors: config.colors, brand: config.brand, hero: config.hero, content: config.content },
      contact_config: { ...config.contact },
    });
    if (error) {
      toast({ title: "Save failed", description: error.message });
    } else {
      toast({ title: "Saved to website", description: "Your customization has been saved." });
    }
  };

  // Form schema and setup
  const formSchema = z.object({
    name: z.string().min(2, "Please enter your full name"),
    email: z.string().email("Enter a valid email"),
    phone: z
      .string()
      .min(7, "Enter a valid phone number")
      .optional()
      .or(z.literal("")),
    vehicleId: z.string().min(1, "Select a vehicle"),
    date: z.string().optional(),
    message: z.string().min(5, "Please add a short message"),
    honeypot: z.string().optional(), // Hidden field for spam detection
  });
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      vehicleId: "",
      date: "",
      message: "",
      honeypot: "", // Hidden field for spam detection
    },
  });
  const { toast } = useToast();
  
  // Use real vehicles or fallback to sample data
  const displayVehicles = publicVehicles?.length ? publicVehicles : sampleVehicles;
  const vehicleOptions = displayVehicles.map((v) => ({ 
    id: v.id, 
    title: 'title' in v ? v.title : `${v.year} ${v.make} ${v.model}` 
  }));

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (isDemo) {
      // Demo mode
      setTimeout(() => {
        toast({
          title: "Request received",
          description: "Thanks for your interest! This is a live demo—no data is stored. A real site would contact you shortly.",
        });
        form.reset();
      }, 600);
      return;
    }

    if (!publicDealer?.id) {
      toast({
        title: "Error",
        description: "Unable to submit request. Please try again later.",
        variant: "destructive",
      });
      return;
    }

    try {
      const [firstName, ...lastNameParts] = values.name.split(' ');
      await createPublicLead.mutateAsync({
        first_name: firstName,
        last_name: lastNameParts.join(' ') || firstName,
        email: values.email,
        phone: values.phone || undefined,
        notes: values.message,
        source: contactIntent === 'testdrive' ? 'website_testdrive' : 'website_inquiry',
        dealer_id: publicDealer.id,
        honeypot: values.honeypot || '', // Add honeypot field for spam detection
      });

      // Success is handled by the hook
      form.reset();
    } catch (error) {
      // Error handling is done by the hook
      if (import.meta.env.DEV) {
        console.error('Error submitting lead:', error);
      }
    }
  };

  // Client-side search/filter
  const [query, setQuery] = useState("");
  const [type, setType] = useState<string | null>(null);
  const filteredVehicles = displayVehicles.filter((v) => {
    const q = query.trim().toLowerCase();
    const vehicleTitle = 'title' in v ? v.title : `${(v as any).year} ${(v as any).make} ${(v as any).model}`;
    const vehicleDescription = 'description' in v ? v.description : (v as any).description;
    const vehicleFeatures = 'features' in v ? v.features : ((v as any).features ? Object.keys((v as any).features) : []);
    
    const matchesQuery = !q
      ? true
      : [vehicleTitle, vehicleDescription, ...(Array.isArray(vehicleFeatures) ? vehicleFeatures : [])]
          .filter(Boolean)
          .some((t) => String(t).toLowerCase().includes(q));
    const matchesType = !type
      ? true
      : type === "SUVs"
      ? vehicleTitle.toLowerCase().includes("suv")
      : type === "Sedans"
      ? vehicleTitle.toLowerCase().includes("sedan")
      : type === "Electric"
      ? (Array.isArray(vehicleFeatures) ? vehicleFeatures : []).some((f) => String(f).toLowerCase().includes("electric"))
      : true;
    return matchesQuery && matchesType;
  });

  // Sorting
  const [sort, setSort] = useState<"relevance" | "price-asc" | "price-desc">("relevance");
  const parsePrice = (vehicle: any) => {
    const price = 'price' in vehicle ? vehicle.price : vehicle.price;
    if (typeof price === 'number') return price;
    const n = Number(String(price ?? "").replace(/[^0-9.]/g, ""));
    return isNaN(n) ? 0 : n;
  };
  const sortedVehicles = [...filteredVehicles].sort((a, b) => {
    if (sort === "price-asc") return parsePrice(a) - parsePrice(b);
    if (sort === "price-desc") return parsePrice(b) - parsePrice(a);
    return 0;
  });

  const vehiclesStructured = displayVehicles.map((v) => {
    const vehicleTitle = 'title' in v ? v.title : `${(v as any).year} ${(v as any).make} ${(v as any).model}`;
    const vehicleDescription = 'description' in v ? v.description : (v as any).description;
    const vehicleImages = 'images' in v ? v.images : (v as any).images;
    const vehiclePrice = 'price' in v ? v.price : (v as any).price;
    
    return {
      "@type": "Vehicle",
      name: vehicleTitle,
      description: vehicleDescription,
      image: vehicleImages?.[0],
      offers: {
        "@type": "Offer",
        priceCurrency: "USD",
        price: typeof vehiclePrice === 'number' ? vehiclePrice : String((vehiclePrice || "").replace(/[^0-9.]/g, "")) || undefined,
        availability: "https://schema.org/InStock",
        url: currentUrl,
      },
    };
  });
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "AutoDealer",
    name: config.brand.name,
    url: currentUrl,
    telephone: config.contact.phone,
    email: config.contact.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: config.contact.address,
    },
    makesOffer: vehiclesStructured,
  };
  const mapEmbed = `https://www.google.com/maps?q=${encodeURIComponent(config.contact.address)}&output=embed`;
  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(config.contact.address)}`;

  return (
    <DealerSiteThemeProvider primary={config.colors.primary} accent={config.colors.accent}>
      <div className="min-h-screen bg-background">
      <SEO
        title={`${dealerName} – Inventory & Test Drives | DealerDelight`}
        description={`${dealerName}: Browse vehicles, book test drives, and contact our showroom. Powered by DealerDelight.`}
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>

      <header className="border-b">
        <div className="container py-4 md:py-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={config.brand.logoUrl || undefined} alt={`${config.brand.name} logo`} />
              <AvatarFallback>{brandInitials}</AvatarFallback>
            </Avatar>
            <div className="space-y-1.5">
              <p className="text-xs tracking-wide text-muted-foreground">Powered by DealerDelight</p>
              <h1 className="text-2xl font-semibold">{config.brand.name}</h1>
              <p className="text-sm text-muted-foreground">{config.brand.tagline}</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full md:w-auto">
            <Button 
              variant="outline" 
              size="xl" 
              className="w-full sm:w-auto" 
              onClick={() => {
                setContactIntent("inquiry");
                document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Contact Dealer
            </Button>
            <Button 
              variant="hero" 
              size="xl" 
              className="w-full sm:w-auto" 
              onClick={() => {
                setContactIntent("testdrive");
                document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Book Test Drive
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden" >
          {config.hero.backgroundUrl && (
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${config.hero.backgroundUrl})` }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-accent/20" />
          <div className="absolute inset-0 opacity-40 bg-[radial-gradient(hsl(var(--primary)/0.15)_1px,transparent_1px)] bg-[length:20px_20px]" />
          <div className="container relative py-8 md:py-20 space-y-8 animate-fade-in">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="flex items-center gap-1"><Star className="h-3.5 w-3.5" /> 4.9 Rating</Badge>
              <Badge variant="secondary" className="flex items-center gap-1"><Award className="h-3.5 w-3.5" /> Award Winning</Badge>
              <Badge variant="secondary" className="flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5" /> Certified Dealer</Badge>
              <Badge variant="secondary" className="flex items-center gap-1"><Tag className="h-3.5 w-3.5" /> Best Prices</Badge>
            </div>

            <div className="max-w-3xl">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight">{config.hero.headline}</h2>
              <p className="mt-3 text-muted-foreground text-lg">{config.hero.subtitle}</p>
            </div>

            <div className="rounded-xl border bg-card/70 backdrop-blur p-4 md:p-6 w-full max-w-3xl">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  document.getElementById("inventory")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="space-y-4"
              >
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by make, model, year, or keyword..."
                    className="pl-9"
                    aria-label="Search inventory"
                  />
                </div>
                <div className="flex flex-wrap gap-2 text-sm items-center">
                  <span className="text-muted-foreground">Popular searches:</span>
                  {(["SUVs", "Sedans", "Electric"] as const).map((label) => (
                    <Button
                      key={label}
                      type="button"
                      size="sm"
                      variant={type === label ? "default" : "outline"}
                      onClick={() => setType(type === label ? null : label)}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button type="submit" variant="hero" size="lg" className="w-full sm:w-auto">Search Now</Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto"
                    asChild
                  >
                    <Link to={`/dealer/${slug}/inventory`}>
                      View All Inventory
                    </Link>
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </section>


        {/* Inventory */}
        <section id="inventory" className="">
          <div className="container pt-6 pb-14 md:pt-8 md:pb-20">
            <h3 className="sr-only">Available Vehicles</h3>

            <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">Showing {sortedVehicles.length} result{sortedVehicles.length !== 1 ? "s" : ""}</p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Sort by</span>
                <Select value={sort} onValueChange={(v) => setSort(v as any)}>
                  <SelectTrigger className="w-full sm:w-44">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="price-asc">Price: Low to High</SelectItem>
                    <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {vehiclesLoading ? (
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="rounded-lg border bg-card p-4 animate-pulse">
                    <div className="h-48 bg-muted rounded mb-4"></div>
                    <div className="h-4 bg-muted rounded mb-2"></div>
                    <div className="h-4 bg-muted rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sortedVehicles.length === 0 ? (
                    <div className="col-span-full text-center text-muted-foreground">
                      No vehicles match your search.
                    </div>
                  ) : (
                    sortedVehicles.slice(0, displayVehicles.length > 4 ? 6 : sortedVehicles.length).map((v) => {
                      // Convert database vehicle to VehicleCard format
                      const vehicleData: VehicleData = 'title' in v ? v : {
                        id: (v as any).id,
                        title: `${(v as any).year} ${(v as any).make} ${(v as any).model}`,
                        price: typeof (v as any).price === 'number' ? formatCurrency((v as any).price) : (v as any).price || 'Contact for price',
                        condition: (v as any).status === 'available' ? 'Available' : (v as any).status,
                        description: (v as any).description || `${(v as any).year} ${(v as any).make} ${(v as any).model}`,
                        features: (v as any).features ? Object.keys((v as any).features) : [],
                        images: (v as any).images?.length ? (v as any).images : [sedan],
                      };
                      
                      return (
                        <div key={(v as any).id} className="space-y-3 hover-scale animate-fade-in">
                          <VehicleCard vehicle={vehicleData} />
                          <div className="flex flex-col sm:flex-row gap-2">
                            <Button variant="hero" size="sm" className="w-full sm:w-auto" onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}>
                              Test Drive
                            </Button>
                            <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}>
                              Inquire
                            </Button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
                
                {/* Show "View All Inventory" button if more than 4 vehicles */}
                {displayVehicles.length > 4 && (
                  <div className="mt-8 text-center">
                    <Button variant="outline" size="lg" asChild>
                      <Link to={`/dealer/${slug}/inventory`}>
                        View All {displayVehicles.length} Vehicles
                      </Link>
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* Services Section */}
        {config.content.servicesEnabled && config.content.services && config.content.services.length > 0 && (
          <section className="container py-12 md:py-16">
            <div className="text-center max-w-2xl mx-auto mb-8">
              <h3 className="text-2xl md:text-3xl font-semibold">Our Services</h3>
              <p className="text-muted-foreground">Everything you need for your automotive journey</p>
            </div>
            <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
              {config.content.services.map((service, index) => (
                <div key={index} className="rounded-xl border bg-card p-6 hover-scale animate-fade-in">
                  <h4 className="font-medium mb-2">{service.title}</h4>
                  <p className="text-sm text-muted-foreground">{service.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* About Section */}
        {config.content.aboutContent && (
          <section className="container py-12 md:py-16 border-t bg-background/50">
            <div className="text-center max-w-3xl mx-auto">
              <h3 className="text-2xl md:text-3xl font-semibold mb-4">About {config.brand.name}</h3>
              <p className="text-muted-foreground text-lg leading-relaxed">{config.content.aboutContent}</p>
            </div>
          </section>
        )}

        {/* Why Choose - moved above CTA */}
        {config.content.whyChooseUsEnabled && config.content.whyChooseUsPoints && config.content.whyChooseUsPoints.length > 0 && (
          <section className="container py-12 md:py-16">
            <div className="text-center max-w-2xl mx-auto mb-8">
              <h3 className="text-2xl md:text-3xl font-semibold">Why Choose {config.brand.name}?</h3>
              <p className="text-muted-foreground">Your trusted automotive partner</p>
            </div>
            <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-3">
              {config.content.whyChooseUsPoints.map((point, index) => (
                <div key={index} className="rounded-xl border bg-card p-6 hover-scale animate-fade-in">
                  <ShieldCheck className="h-6 w-6 text-primary mb-3" />
                  <p className="text-sm text-muted-foreground">{point}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="border-t bg-background">
          <div className="container py-12 md:py-16">
            <div className="text-center max-w-2xl mx-auto mb-8">
              <h3 className="text-2xl md:text-3xl font-semibold">Ready to Find Your Next Car?</h3>
              <p className="text-muted-foreground">Our team is here to help you every step of the way. Visit us today!</p>
            </div>


            <h4 className="text-xl font-semibold mb-4">Visit our showroom</h4>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="rounded-lg overflow-hidden aspect-video bg-muted">
                  <iframe
                    title={`Map location for ${dealerName}`}
                    src={mapEmbed}
                    className="w-full h-full"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    aria-label="Google Map"
                  />
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{config.contact.address}</p>
              </div>
              <div id="contact" className="space-y-4">
                <h4 className="text-lg font-medium">
                  {contactIntent === "testdrive" ? "Book a test drive" : "Get more information"}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-primary" />
                    <a href={`tel:${config.contact.phone.replace(/[^0-9+]/g, "")}`} className="hover:underline">{config.contact.phone}</a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-primary" />
                    <a href={`mailto:${config.contact.email}`} className="hover:underline">{config.contact.email}</a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>Mon–Sat: 9am–6pm</span>
                  </div>
                </div>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full name</FormLabel>
                          <FormControl>
                            <Input placeholder="Alex Johnson" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="you@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input type="tel" placeholder="(555) 123-4567" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="vehicleId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vehicle</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a vehicle" />
                              </SelectTrigger>
                              <SelectContent>
                                {vehicleOptions.map((v) => (
                                  <SelectItem key={v.id} value={v.id}>
                                    {v.title}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {contactIntent === "testdrive" ? "Preferred date" : "Best time to contact"}
                          </FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem className="sm:col-span-2">
                          <FormLabel>Message</FormLabel>
                          <FormControl>
                            <Textarea 
                              rows={4} 
                              placeholder={
                                contactIntent === "testdrive" 
                                  ? "Tell us when you'd like to come by for a test drive..." 
                                  : "Tell us what information you're looking for..."
                              } 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Hidden honeypot field for spam detection */}
                    <FormField
                      control={form.control}
                      name="honeypot"
                      render={({ field }) => (
                        <FormItem style={{ display: 'none' }}>
                          <FormLabel>Leave this field empty</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              tabIndex={-1}
                              autoComplete="off"
                              style={{ display: 'none' }}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <div className="sm:col-span-2">
                      <Button type="submit" variant="hero" size="lg" className="w-full sm:w-auto">
                        {contactIntent === "testdrive" ? "Request test drive" : "Send inquiry"}
                      </Button>
                    </div>
                  </form>
                </Form>
                
              </div>
            </div>
          </div>
        </section>

      </main>

      {isDemo && (
        <>
          <button
            aria-label="Customize"
            onClick={() => setCustomizeOpen(true)}
            className="fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full shadow-lg bg-primary text-primary-foreground hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <Settings className="h-6 w-6 m-auto" />
          </button>
          <CustomizeSheet
            open={customizeOpen}
            onOpenChange={setCustomizeOpen}
            config={config}
            onChange={setConfig}
            onReset={reset}
            onSaveLocal={saveLocal}
            onSaveCloud={saveToWebsite}
            canSaveCloud={!!dealer?.id}
          />
        </>
      )}

      <footer className="border-t">
        <div className="container py-6 text-sm text-muted-foreground">
          © {new Date().getFullYear()} {dealerName}. Powered by DealerDelight.
        </div>
      </footer>
      </div>
    </DealerSiteThemeProvider>
  );
};

export default DealerSite;
