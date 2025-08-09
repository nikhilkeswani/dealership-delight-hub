import { useParams } from "react-router-dom";
import SEO from "@/components/SEO";
import { Helmet } from "react-helmet-async";
import VehicleCard, { VehicleData } from "@/components/VehicleCard";
import { Button } from "@/components/ui/button";
import sedan from "@/assets/cars/sedan.jpg";
import suv from "@/assets/cars/suv.jpg";
import hatch from "@/assets/cars/hatch.jpg";

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
  const dealerName = (slug || "demo-motors").replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  const address = "1600 Amphitheatre Parkway, Mountain View, CA";
  const currentUrl = typeof window !== "undefined" ? window.location.href : undefined;
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
          <div className="space-y-1">
            <p className="text-xs tracking-wide text-muted-foreground">Powered by DealerDelight</p>
            <h1 className="text-2xl font-semibold">{dealerName}</h1>
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
              <div id="contact" className="space-y-3">
                <h4 className="text-lg font-medium">Book a test drive</h4>
                <p className="text-muted-foreground">Use the form below to get in touch. In the full version, bookings sync to your DealerDelight calendar.</p>
                <Button variant="hero" size="lg">Coming soon – Connect Supabase</Button>
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
