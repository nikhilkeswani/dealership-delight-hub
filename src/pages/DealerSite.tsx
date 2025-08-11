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
import { useToast } from "@/components/ui/use-toast";
import { Phone, Mail, Clock } from "lucide-react";
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
        <section className="container py-10 md:py-14">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="max-w-2xl space-y-3">
              <h2 className="text-3xl md:text-4xl font-semibold">Find your next vehicle</h2>
              <p className="text-muted-foreground text-lg">Curated inventory with transparent pricing. Reserve online in minutes.</p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sampleVehicles.map((v) => (
              <VehicleCard key={v.id} vehicle={v} />
            ))}
          </div>
        </section>

        <section className="border-t bg-muted/30">
          <div className="container py-10 md:py-14">
            <h3 className="text-2xl font-semibold mb-4">Visit our showroom</h3>
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
                <p className="text-xs text-muted-foreground">Demo only: this form shows the real experience but doesn’t store data.</p>
              </div>
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
