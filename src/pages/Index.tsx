import { Button } from "@/components/ui/button";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Car, Users, CalendarCheck, BarChart3, Palette, Globe, Check } from "lucide-react";
import SEO from "@/components/SEO";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Dealer Website Builder – DealerDelight"
        description="Launch a beautiful, SEO-optimised dealer website in under 30 minutes. Manage inventory, leads, bookings, and analytics in one place."
      />

      <header className="relative border-b overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-70" aria-hidden>
          <div className="absolute -top-40 -left-40 w-[40rem] h-[40rem] rounded-full blur-3xl" style={{ background: "var(--gradient-primary)" }} />
          <div className="absolute -bottom-40 -right-40 w-[40rem] h-[40rem] rounded-full blur-3xl" style={{ background: "var(--gradient-primary)" }} />
        </div>
        <div className="container py-16 md:py-24 relative">
          <nav className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-8 w-8 rounded-md" style={{ background: "var(--gradient-primary)" }} />
              <span className="font-semibold">DealerDelight</span>
            </div>
            <div className="hidden md:flex items-center gap-6 text-sm">
              <a href="#features" className="hover:opacity-80">Features</a>
              <a href="#pricing" className="hover:opacity-80">Pricing</a>
              <a href="/dealer/demo-motors" className="hover:opacity-80">Live Demo</a>
              <a href="/app" className="hover:opacity-80">Sign in</a>
            </div>
          </nav>

          <div className="mt-12 grid md:grid-cols-2 gap-10 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-6xl font-[600] leading-tight">
                Launch your dealer website in minutes
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl">
                A clean, modern, high‑conversion SaaS for automobile dealers. Go live in under 30 minutes—no code, no hassle.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild variant="hero" size="xl">
                  <a href="/app" aria-label="Get started with DealerDelight">Get started free</a>
                </Button>
                <Button asChild variant="outline" size="xl">
                  <a href="/dealer/demo-motors" aria-label="View live demo">View live demo</a>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">• No credit card required • Mobile-first • SEO-ready</p>
            </div>
            <div className="relative">
              <div className="rounded-xl border bg-card p-4 shadow-sm">
                <div className="aspect-video rounded-lg overflow-hidden bg-muted" aria-label="Product preview">
                  <img src="/placeholder.svg" alt="DealerDelight dashboard preview" className="w-full h-full object-cover" loading="lazy" />
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3 text-xs text-muted-foreground">
                  <div className="rounded-md bg-secondary p-3">Inventory</div>
                  <div className="rounded-md bg-secondary p-3">Leads</div>
                  <div className="rounded-md bg-secondary p-3">Bookings</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main>
        <section id="features" className="container py-16 md:py-24">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-3xl font-semibold">Everything dealers need</h2>
            <p className="text-muted-foreground">Inventory, leads, bookings, analytics—built for conversion.</p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            <div className="rounded-lg border bg-card p-5">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-md bg-secondary flex items-center justify-center">
                  <Car className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">Inventory CRUD</h3>
                  <p className="text-sm text-muted-foreground">Create, edit, and publish vehicle listings with image uploads.</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border bg-card p-5">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-md bg-secondary flex items-center justify-center">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">Lead Management</h3>
                  <p className="text-sm text-muted-foreground">Track inquiries, status, and sources with notes.</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border bg-card p-5">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-md bg-secondary flex items-center justify-center">
                  <CalendarCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">Bookings</h3>
                  <p className="text-sm text-muted-foreground">Customers can book test drives and appointments.</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border bg-card p-5">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-md bg-secondary flex items-center justify-center">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">Analytics</h3>
                  <p className="text-sm text-muted-foreground">Page views, conversion rate, and most viewed vehicles.</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border bg-card p-5">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-md bg-secondary flex items-center justify-center">
                  <Palette className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">Branding</h3>
                  <p className="text-sm text-muted-foreground">Logo, colors, hero text, and font presets.</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border bg-card p-5">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-md bg-secondary flex items-center justify-center">
                  <Globe className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">Domains</h3>
                  <p className="text-sm text-muted-foreground">Free subdomain or connect your custom domain.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="border-t bg-muted/30">
          <div className="container py-16 md:py-24">
            <h2 className="text-3xl font-semibold text-center mb-10">How it works</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="rounded-xl border bg-card p-6">
                <div className="text-sm text-muted-foreground">Step 1</div>
                <h3 className="text-xl font-semibold mt-1">Sign up</h3>
                <p className="text-sm text-muted-foreground mt-2">Create your account and complete a short onboarding.</p>
              </div>
              <div className="rounded-xl border bg-card p-6">
                <div className="text-sm text-muted-foreground">Step 2</div>
                <h3 className="text-xl font-semibold mt-1">Add inventory</h3>
                <p className="text-sm text-muted-foreground mt-2">Import or create vehicle listings with photos and details.</p>
              </div>
              <div className="rounded-xl border bg-card p-6">
                <div className="text-sm text-muted-foreground">Step 3</div>
                <h3 className="text-xl font-semibold mt-1">Publish & track</h3>
                <p className="text-sm text-muted-foreground mt-2">Go live on your domain and track leads and performance.</p>
              </div>
            </div>
          </div>
        </section>

        <section aria-label="Trusted by dealers" className="border-t">
          <div className="container py-10">
            <p className="text-center text-sm text-muted-foreground mb-6">Trusted by growing dealerships</p>
            <div className="flex flex-wrap items-center justify-center gap-8 text-muted-foreground">
              <span className="opacity-80">AutoNova</span>
              <span className="opacity-80">City Motors</span>
              <span className="opacity-80">Prime Auto</span>
              <span className="opacity-80">Velocity Cars</span>
            </div>
          </div>
        </section>

        <section id="pricing" className="border-t bg-muted/30">
          <div className="container py-16 md:py-24">
            <h2 className="text-3xl font-semibold text-center mb-10">Simple, scalable pricing</h2>
            <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              <div className="rounded-xl border bg-card p-6">
                <h3 className="text-xl font-semibold">Basic</h3>
                <p className="text-muted-foreground mt-1">Up to 50 listings, SEO, analytics, bookings, branded subdomain.</p>
                <div className="mt-4 text-3xl font-semibold">$29<span className="text-base text-muted-foreground">/mo</span></div>
                <ul className="mt-4 space-y-2 text-sm">
                  <li className="flex items-start gap-2"><Check className="h-4 w-4 mt-0.5" /> 50 listings</li>
                  <li className="flex items-start gap-2"><Check className="h-4 w-4 mt-0.5" /> Basic SEO & analytics</li>
                  <li className="flex items-start gap-2"><Check className="h-4 w-4 mt-0.5" /> Booking calendar</li>
                  <li className="flex items-start gap-2"><Check className="h-4 w-4 mt-0.5" /> dealername.dealerdelight.com</li>
                </ul>
                <Button asChild variant="outline" size="xl" className="mt-6 w-full">
                  <a href="/app">Start Basic</a>
                </Button>
              </div>
              <div className="rounded-xl border bg-card p-6 relative">
                <span className="absolute -top-3 right-4 rounded-full bg-primary/10 text-primary text-xs px-3 py-1 border">Most popular</span>
                <h3 className="text-xl font-semibold">Premium</h3>
                <p className="text-muted-foreground mt-1">Unlimited listings, advanced SEO & analytics, custom domain, priority support.</p>
                <div className="mt-4 text-3xl font-semibold">$79<span className="text-base text-muted-foreground">/mo</span></div>
                <ul className="mt-4 space-y-2 text-sm">
                  <li className="flex items-start gap-2"><Check className="h-4 w-4 mt-0.5" /> Unlimited listings</li>
                  <li className="flex items-start gap-2"><Check className="h-4 w-4 mt-0.5" /> Advanced SEO & analytics</li>
                  <li className="flex items-start gap-2"><Check className="h-4 w-4 mt-0.5" /> Custom domain support</li>
                  <li className="flex items-start gap-2"><Check className="h-4 w-4 mt-0.5" /> Advanced branding</li>
                </ul>
                <Button asChild variant="hero" size="xl" className="mt-6 w-full">
                  <a href="/app">Go Premium</a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section id="faq" className="border-t">
          <div className="container py-16 md:py-24">
            <h2 className="text-3xl font-semibold text-center mb-8">Frequently asked questions</h2>
            <Accordion type="single" collapsible className="max-w-3xl mx-auto">
              <AccordionItem value="item-1">
                <AccordionTrigger>Can I use my own domain?</AccordionTrigger>
                <AccordionContent>Yes. Connect your custom domain on the Premium plan or use a free subdomain.</AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Do I need a developer to set this up?</AccordionTrigger>
                <AccordionContent>No. Everything is no‑code. Most dealers go live in under 30 minutes.</AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>Can I import my existing inventory?</AccordionTrigger>
                <AccordionContent>Yes. You can bulk add vehicles and upload photos easily.</AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger>Is SEO included?</AccordionTrigger>
                <AccordionContent>Yes. We handle meta tags, sitemap, clean URLs, and structured data best practices.</AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="container py-8 text-sm text-muted-foreground flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} DealerDelight</p>
          <nav className="flex gap-5">
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <a href="/dealer/demo-motors">Live Demo</a>
          </nav>
        </div>
      </footer>
    </div>
  );
};

export default Index;
