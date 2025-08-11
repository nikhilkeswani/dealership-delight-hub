import { useParams } from "react-router-dom";
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
import { Phone, Mail, Clock, Star, Award, ShieldCheck, Tag, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
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
  const dealerName = (slug || "demo-motors")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
  const address = "1600 Amphitheatre Parkway, Mountain View, CA";
  const currentUrl =
    typeof window !== "undefined" ? window.location.href : undefined;

  // Demo contact info
  const phone = "(650) 555-0199";
  const email = `sales@${(slug || "demo-motors")
    .replace(/[^a-z0-9-]/gi, "")
    .toLowerCase()}.com`;

  // Form schema and setup (demo only)
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
    },
  });
  const { toast } = useToast();
  const vehicleOptions = sampleVehicles.map((v) => ({ id: v.id, title: v.title }));

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    setTimeout(() => {
      toast({
        title: "Request received",
        description:
          "Thanks for your interest! This is a live demo—no data is stored. A real site would contact you shortly.",
      });
      form.reset();
    }, 600);
  };

  // Client-side search/filter (demo only)
  const [query, setQuery] = useState("");
  const [type, setType] = useState<string | null>(null);
  const filteredVehicles = sampleVehicles.filter((v) => {
    const q = query.trim().toLowerCase();
    const matchesQuery = !q
      ? true
      : [v.title, v.description, ...(v.features || [])]
          .filter(Boolean)
          .some((t) => String(t).toLowerCase().includes(q));
    const matchesType = !type
      ? true
      : type === "SUVs"
      ? v.title.toLowerCase().includes("suv")
      : type === "Sedans"
      ? v.title.toLowerCase().includes("sedan")
      : type === "Electric"
      ? (v.features || []).some((f) => String(f).toLowerCase().includes("electric"))
      : true;
    return matchesQuery && matchesType;
  });

  // Sorting (demo only)
  const [sort, setSort] = useState<"relevance" | "price-asc" | "price-desc">(
    "relevance"
  );
  const parsePrice = (p?: string) => {
    const n = Number(String(p ?? "").replace(/[^0-9.]/g, ""));
    return isNaN(n) ? 0 : n;
  };
  const sortedVehicles = [...filteredVehicles].sort((a, b) => {
    if (sort === "price-asc") return parsePrice(a.price) - parsePrice(b.price);
    if (sort === "price-desc") return parsePrice(b.price) - parsePrice(a.price);
    return 0;
  });

  const vehiclesStructured = sampleVehicles.map((v) => ({
    "@type": "Vehicle",
    name: v.title,
    description: v.description,
    image: v.images?.[0],
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      price: String((v.price || "").replace(/[^0-9.]/g, "")) || undefined,
      availability: "https://schema.org/InStock",
      url: currentUrl,
    },
  }));
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "AutoDealer",
    name: dealerName,
    url: currentUrl,
    telephone: phone,
    email: email,
    address: {
      "@type": "PostalAddress",
      streetAddress: address,
    },
    makesOffer: vehiclesStructured,
  };
  const mapEmbed = `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;
  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={`${dealerName} – Inventory & Test Drives | DealerDelight`}
        description={`${dealerName}: Browse vehicles, book test drives, and contact our showroom. Powered by DealerDelight.`}
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>

      <header className="border-b">
        <div className="container py-6 flex items-center justify-between">
          <div className="space-y-1.5">
            <p className="text-xs tracking-wide text-muted-foreground">Powered by DealerDelight</p>
            <h1 className="text-2xl font-semibold">{dealerName}</h1>
            <p className="text-sm text-muted-foreground">Your trusted local dealer — transparent pricing and fast test drives.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="sm" onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}>
              Contact Dealer
            </Button>
            <Button variant="hero" size="xl" onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}>
              Book Test Drive
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden" >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-accent/20" />
          <div className="absolute inset-0 opacity-40 bg-[radial-gradient(hsl(var(--primary)/0.15)_1px,transparent_1px)] bg-[length:20px_20px]" />
          <div className="container relative py-12 md:py-20 space-y-8 animate-fade-in">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="flex items-center gap-1"><Star className="h-3.5 w-3.5" /> 4.9 Rating</Badge>
              <Badge variant="secondary" className="flex items-center gap-1"><Award className="h-3.5 w-3.5" /> Award Winning</Badge>
              <Badge variant="secondary" className="flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5" /> Certified Dealer</Badge>
              <Badge variant="secondary" className="flex items-center gap-1"><Tag className="h-3.5 w-3.5" /> Best Prices</Badge>
            </div>

            <div className="max-w-3xl">
              <h2 className="text-4xl md:text-5xl font-semibold tracking-tight">Find Your Perfect Vehicle</h2>
              <p className="mt-3 text-muted-foreground text-lg">Premium quality cars with unbeatable service and expertise. Experience the difference with our award‑winning customer care.</p>
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
                <div>
                  <Button type="submit" variant="hero" size="lg">Search Now</Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="ml-2"
                    onClick={() => {
                      setQuery("");
                      setType(null);
                      document.getElementById("inventory")?.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    Browse Inventory
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
                  <SelectTrigger className="w-44">
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

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedVehicles.length === 0 ? (
                <div className="col-span-full text-center text-muted-foreground">
                  No vehicles match your search.
                </div>
              ) : (
                sortedVehicles.map((v) => (
                  <div key={v.id} className="space-y-3 hover-scale animate-fade-in">
                    <VehicleCard vehicle={v} />
                    <div className="flex gap-2">
                      <Button variant="hero" size="sm" onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}>
                        Test Drive
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}>
                        Inquire
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

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
                <p className="mt-3 text-sm text-muted-foreground">{address}</p>
              </div>
              <div id="contact" className="space-y-4">
                <h4 className="text-lg font-medium">Book a test drive</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-primary" />
                    <a href={`tel:${phone.replace(/[^0-9+]/g, "")}`} className="hover:underline">{phone}</a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-primary" />
                    <a href={`mailto:${email}`} className="hover:underline">{email}</a>
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
                          <FormLabel>Preferred date</FormLabel>
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
                            <Textarea rows={4} placeholder="Tell us when you'd like to come by..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="sm:col-span-2">
                      <Button type="submit" variant="hero" size="lg" className="w-full sm:w-auto">
                        Request test drive
                      </Button>
                    </div>
                  </form>
                </Form>
                
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose - moved to bottom */}
        <section className="container py-12 md:py-16">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h3 className="text-2xl md:text-3xl font-semibold">Why Choose {dealerName}?</h3>
            <p className="text-muted-foreground">Your trusted automotive partner</p>
          </div>
          <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-3">
            <div className="rounded-xl border bg-card p-6 hover-scale animate-fade-in">
              <ShieldCheck className="h-6 w-6 text-primary" />
              <h4 className="mt-3 font-medium">Certified Quality</h4>
              <p className="text-sm text-muted-foreground">Every vehicle undergoes rigorous inspection.</p>
            </div>
            <div className="rounded-xl border bg-card p-6 hover-scale animate-fade-in">
              <Award className="h-6 w-6 text-primary" />
              <h4 className="mt-3 font-medium">Award Winning</h4>
              <p className="text-sm text-muted-foreground">Recognized for excellence in customer service.</p>
            </div>
            <div className="rounded-xl border bg-card p-6 hover-scale animate-fade-in">
              <Star className="h-6 w-6 text-primary" />
              <h4 className="mt-3 font-medium">5‑Star Reviews</h4>
              <p className="text-sm text-muted-foreground">Thousands of satisfied customers.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="container py-6 text-sm text-muted-foreground">
          © {new Date().getFullYear()} {dealerName}. Powered by DealerDelight.
        </div>
      </footer>
    </div>
  );
};

export default DealerSite;
