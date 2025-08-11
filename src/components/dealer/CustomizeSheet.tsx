import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { DealerSiteConfig } from "@/hooks/useDealerSiteConfig";

type CustomizeSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: DealerSiteConfig;
  onChange: (partial: Partial<DealerSiteConfig>) => void;
  onReset: () => void;
  onSaveLocal: () => void;
  onSaveCloud?: () => Promise<void> | void;
  canSaveCloud?: boolean;
};

export default function CustomizeSheet({ open, onOpenChange, config, onChange, onReset, onSaveLocal, onSaveCloud, canSaveCloud }: CustomizeSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Customize Demo</SheetTitle>
          <SheetDescription>Update branding, content, and colors. Changes preview instantly.</SheetDescription>
        </SheetHeader>

        <div className="mt-4 space-y-6 overflow-y-auto pr-2 max-h-[calc(100dvh-9rem)]">
          {/* Branding */}
          <section className="space-y-3">
            <h4 className="text-sm font-medium">Branding</h4>
            <div className="grid gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="brand-name">Dealer name</Label>
                <Input id="brand-name" value={config.brand.name} onChange={(e) => onChange({ brand: { name: e.target.value } as any })} />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="brand-tagline">Tagline</Label>
                <Input id="brand-tagline" value={config.brand.tagline} onChange={(e) => onChange({ brand: { tagline: e.target.value } as any })} />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="brand-logo">Logo URL</Label>
                <Input id="brand-logo" placeholder="https://.../logo.png" value={config.brand.logoUrl || ""} onChange={(e) => onChange({ brand: { logoUrl: e.target.value } as any })} />
              </div>
            </div>
          </section>

          {/* Hero */}
          <section className="space-y-3">
            <h4 className="text-sm font-medium">Hero</h4>
            <div className="grid gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="hero-headline">Main headline</Label>
                <Input id="hero-headline" value={config.hero.headline} onChange={(e) => onChange({ hero: { headline: e.target.value } as any })} />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="hero-subtitle">Subtitle</Label>
                <Textarea id="hero-subtitle" value={config.hero.subtitle} onChange={(e) => onChange({ hero: { subtitle: e.target.value } as any })} />
              </div>
            </div>
          </section>

          {/* Contact */}
          <section className="space-y-3">
            <h4 className="text-sm font-medium">Contact</h4>
            <div className="grid gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="contact-phone">Call number</Label>
                <Input id="contact-phone" value={config.contact.phone} onChange={(e) => onChange({ contact: { phone: e.target.value } as any })} />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="contact-email">Email</Label>
                <Input id="contact-email" type="email" value={config.contact.email} onChange={(e) => onChange({ contact: { email: e.target.value } as any })} />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="contact-address">Address</Label>
                <Textarea id="contact-address" value={config.contact.address} onChange={(e) => onChange({ contact: { address: e.target.value } as any })} />
              </div>
            </div>
          </section>

          {/* Colors */}
          <section className="space-y-3">
            <h4 className="text-sm font-medium">Colors</h4>
            <div className="grid grid-cols-2 gap-4 items-end">
              <div className="grid gap-1.5">
                <Label htmlFor="color-primary">Primary</Label>
                <div className="flex items-center gap-3">
                  <input id="color-primary" type="color" className="h-10 w-10 rounded-md border" value={config.colors.primary}
                    onChange={(e) => onChange({ colors: { primary: e.target.value } as any })}
                    aria-label="Pick primary color"
                  />
                  <Input value={config.colors.primary} onChange={(e) => onChange({ colors: { primary: e.target.value } as any })} />
                </div>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="color-accent">Accent</Label>
                <div className="flex items-center gap-3">
                  <input id="color-accent" type="color" className="h-10 w-10 rounded-md border" value={config.colors.accent}
                    onChange={(e) => onChange({ colors: { accent: e.target.value } as any })}
                    aria-label="Pick accent color"
                  />
                  <Input value={config.colors.accent} onChange={(e) => onChange({ colors: { accent: e.target.value } as any })} />
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Colors update the site's design tokens (primary/accent) in real time.</p>
          </section>
        </div>

        <div className="sticky bottom-0 left-0 right-0 bg-background border-t mt-4 pt-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="ghost" className="w-full sm:w-auto" onClick={onReset}>Reset</Button>
            <div className="flex-1" />
            <Button variant="outline" className="w-full sm:w-auto" onClick={onSaveLocal}>Save (local)</Button>
            {canSaveCloud && (
              <Button className="w-full sm:w-auto" onClick={() => onSaveCloud && onSaveCloud()}>Save to website</Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
