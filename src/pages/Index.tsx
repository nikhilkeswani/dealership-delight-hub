import { Button } from "@/components/ui/button";
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
              <a href="/signup" className="hover:opacity-80">Sign in</a>
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
                  <a href="/signup" aria-label="Get started with DealerDelight">Get started free</a>
                </Button>
                <Button asChild variant="outline" size="xl">
                  <a href="/dealer/demo-motors" aria-label="View live demo">View live demo</a>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">No credit card required • Mobile-first • SEO-ready</p>
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
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">Built for conversion</h2>
              <p className="text-muted-foreground">Lightning-fast pages, clear CTAs, and modern layouts to turn visitors into buyers.</p>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">Dealer website + CRM</h2>
              <p className="text-muted-foreground">Manage inventory, leads, appointments, and analytics in one place.</p>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">SEO done right</h2>
              <p className="text-muted-foreground">Meta tags, clean URLs, sitemap, and structured data out of the box.</p>
            </div>
          </div>

          <div className="mt-10 grid md:grid-cols-3 gap-6">
            {[
              { title: "Inventory CRUD", text: "Create, edit, and publish vehicle listings with image uploads.", },
              { title: "Lead Management", text: "Track inquiries, status, and sources with notes.", },
              { title: "Bookings", text: "Customers can book test drives and appointments.", },
              { title: "Analytics", text: "Page views, conversion rate, and most viewed vehicles.", },
              { title: "Branding", text: "Logo, colors, hero text, and font presets.", },
              { title: "Domains", text: "Free subdomain or connect your custom domain.", },
            ].map((f) => (
              <div key={f.title} className="rounded-lg border bg-card p-5">
                <h3 className="font-medium mb-1">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.text}</p>
              </div>
            ))}
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
                  <li>• 50 listings</li>
                  <li>• Basic SEO & analytics</li>
                  <li>• Booking calendar</li>
                  <li>• dealername.dealerdelight.com</li>
                </ul>
                <Button asChild variant="hero" size="xl" className="mt-6 w-full">
                  <a href="/signup">Start Basic</a>
                </Button>
              </div>
              <div className="rounded-xl border bg-card p-6">
                <h3 className="text-xl font-semibold">Premium</h3>
                <p className="text-muted-foreground mt-1">Unlimited listings, advanced SEO & analytics, custom domain, priority support.</p>
                <div className="mt-4 text-3xl font-semibold">$79<span className="text-base text-muted-foreground">/mo</span></div>
                <ul className="mt-4 space-y-2 text-sm">
                  <li>• Unlimited listings</li>
                  <li>• Advanced SEO & analytics</li>
                  <li>• Custom domain support</li>
                  <li>• Advanced branding</li>
                </ul>
                <Button asChild variant="hero" size="xl" className="mt-6 w-full">
                  <a href="/signup">Go Premium</a>
                </Button>
              </div>
            </div>
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
