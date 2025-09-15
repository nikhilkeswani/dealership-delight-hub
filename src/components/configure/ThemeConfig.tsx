import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Palette, Check, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { useDealer } from "@/hooks/useDealer";
import { useDealerSiteConfig } from "@/hooks/useDealerSiteConfig";
import { DEFAULT_DEALER_SITE_CONFIG } from "@/constants/theme";
import { ThemeDebugPanel } from "./ThemeDebugPanel";

const presetThemes = [
  {
    name: "Corporate Slate",
    primary: "#475569",
    accent: "#f8fafc",
    description: "Professional and trustworthy",
  },
  {
    name: "Executive Navy",
    primary: "#1e293b",
    accent: "#f1f5f9",
    description: "Authoritative and sophisticated",
  },
  {
    name: "Professional Gray",
    primary: "#64748b",
    accent: "#f8fafc",
    description: "Clean and timeless",
  },
  {
    name: "Refined Indigo",
    primary: "#4338ca",
    accent: "#eef2ff",
    description: "Modern enterprise standard",
  },
  {
    name: "Subtle Teal",
    primary: "#0f766e",
    accent: "#f0fdfa",
    description: "Contemporary business",
  },
  {
    name: "Warm Charcoal",
    primary: "#374151",
    accent: "#f9fafb",
    description: "Sophisticated and readable",
  },
  {
    name: "Classic Forest",
    primary: "#065f46",
    accent: "#ecfdf5",
    description: "Professional stability",
  },
  {
    name: "Executive Burgundy",
    primary: "#7c2d12",
    accent: "#fef7f7",
    description: "Premium and distinguished",
  },
];

const fontOptions = [
  { name: "Inter (Modern)", value: "inter", sample: "The quick brown fox jumps over the lazy dog" },
  { name: "Roboto (Clean)", value: "roboto", sample: "The quick brown fox jumps over the lazy dog" },
  { name: "Open Sans (Friendly)", value: "opensans", sample: "The quick brown fox jumps over the lazy dog" },
  { name: "Poppins (Rounded)", value: "poppins", sample: "The quick brown fox jumps over the lazy dog" },
];

export function ThemeConfig() {
  const { data: dealer } = useDealer();
  const slug = dealer?.business_name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'demo';
  
  const defaultConfig = {
    ...DEFAULT_DEALER_SITE_CONFIG,
    brand: {
      ...DEFAULT_DEALER_SITE_CONFIG.brand,
      name: dealer?.business_name || DEFAULT_DEALER_SITE_CONFIG.brand.name,
    },
    contact: {
      phone: dealer?.phone || DEFAULT_DEALER_SITE_CONFIG.contact.phone,
      email: dealer?.contact_email || DEFAULT_DEALER_SITE_CONFIG.contact.email,
      address: dealer?.address || DEFAULT_DEALER_SITE_CONFIG.contact.address,
    },
  };
  
  const { config, setConfig: updateConfig, saveLocal, clearThemeData } = useDealerSiteConfig(slug, defaultConfig);
  
  const [selectedTheme, setSelectedTheme] = useState(() => {
    // Find matching preset theme based on current config colors
    const matchingTheme = presetThemes.find(theme => 
      theme.primary === config.colors.primary && theme.accent === config.colors.accent
    );
    return matchingTheme || presetThemes[1]; // Default to Luxury Purple
  });
  
  const [customPrimary, setCustomPrimary] = useState(config.colors.primary);
  const [customAccent, setCustomAccent] = useState(config.colors.accent);
  const [selectedFont, setSelectedFont] = useState("inter");
  const [isCustomMode, setIsCustomMode] = useState(() => {
    // Check if current colors match any preset
    return !presetThemes.some(theme => 
      theme.primary === config.colors.primary && theme.accent === config.colors.accent
    );
  });

  // Sync state when config changes with improved detection
  useEffect(() => {
    console.log('[ThemeConfig] Config colors changed:', config.colors);
    
    // Find matching preset theme with exact match
    const matchingPreset = presetThemes.find(theme => 
      theme.primary.toLowerCase() === config.colors.primary.toLowerCase() && 
      theme.accent.toLowerCase() === config.colors.accent.toLowerCase()
    );

    if (matchingPreset) {
      console.log('[ThemeConfig] Found matching preset:', matchingPreset.name);
      if (selectedTheme.name !== matchingPreset.name) {
        setSelectedTheme(matchingPreset);
        setIsCustomMode(false);
      }
    } else {
      console.log('[ThemeConfig] No matching preset, using custom mode');
      if (!isCustomMode) {
        setIsCustomMode(true);
      }
      // Only update custom colors if they're different (prevent loops)
      if (customPrimary !== config.colors.primary) {
        setCustomPrimary(config.colors.primary);
      }
      if (customAccent !== config.colors.accent) {
        setCustomAccent(config.colors.accent);
      }
    }
  }, [config.colors]);

  const handlePresetSelect = (theme: typeof presetThemes[0]) => {
    console.log('[ThemeConfig] Theme selected:', theme.name, theme.primary, theme.accent);
    
    // Prevent selection if already selected (avoid infinite loops)
    if (selectedTheme.name === theme.name && 
        config.colors.primary === theme.primary && 
        config.colors.accent === theme.accent && 
        !isCustomMode) {
      console.log('[ThemeConfig] Theme already selected, skipping');
      return;
    }
    
    setSelectedTheme(theme);
    setCustomPrimary(theme.primary);
    setCustomAccent(theme.accent);
    setIsCustomMode(false);
    
    // Only update if colors are actually different
    if (config.colors.primary !== theme.primary || config.colors.accent !== theme.accent) {
      updateConfig({
        colors: {
          primary: theme.primary,
          accent: theme.accent,
        }
      });
      
      // Auto-save to localStorage after a short delay
      setTimeout(() => {
        saveLocal();
        toast.success(`${theme.name} theme applied!`);
      }, 200);
    }
  };

  const handleCustomColorChange = (type: 'primary' | 'accent', color: string) => {
    console.log('Custom color changed:', type, color);
    
    // Validate color format
    if (!color || !color.startsWith('#') || color.length !== 7) {
      return;
    }
    
    if (type === 'primary' && config.colors.primary !== color) {
      setCustomPrimary(color);
      updateConfig({
        colors: {
          ...config.colors,
          primary: color,
        }
      });
    } else if (type === 'accent' && config.colors.accent !== color) {
      setCustomAccent(color);
      updateConfig({
        colors: {
          ...config.colors,
          accent: color,
        }
      });
    }
    
    setIsCustomMode(true);
    
    // Debounced auto-save
    setTimeout(() => {
      saveLocal();
    }, 300);
  };

  const resetToDefault = () => {
    const defaultTheme = presetThemes[1]; // Luxury Purple
    handlePresetSelect(defaultTheme);
  };

  const saveTheme = () => {
    // Save the current configuration to localStorage
    saveLocal();
    toast.success("Theme settings saved!");
  };

  // Helper function to convert hex to HSL
  function hexToHsl(hex: string): string {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  }

  return (
    <>
      <CardHeader>
        <CardTitle>Theme & Colors</CardTitle>
        <CardDescription>
          Choose colors and fonts that reflect your brand identity
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Debug Panel */}
        <ThemeDebugPanel 
          config={config} 
          storageKey={`dealerSite:config:${slug}`}
          onClearData={clearThemeData}
        />
        
        {/* Preset Themes */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-medium">Preset Themes</Label>
            <Button
              variant="outline"
              size="sm"
              onClick={resetToDefault}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {presetThemes.map((theme, index) => (
              <div
                key={theme.name}
                className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedTheme.name === theme.name && !isCustomMode
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-border hover:border-primary/50"
                }`}
                onClick={() => handlePresetSelect(theme)}
              >
                {selectedTheme.name === theme.name && !isCustomMode && (
                  <div className="absolute top-2 right-2">
                    <div className="h-5 w-5 bg-primary rounded-full flex items-center justify-center">
                      <Check className="h-3 w-3 text-primary-foreground" />
                    </div>
                  </div>
                )}
                
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex gap-1">
                    <div
                      className="w-4 h-4 rounded-full border border-border"
                      style={{ backgroundColor: theme.primary }}
                    />
                    <div
                      className="w-4 h-4 rounded-full border border-border"
                      style={{ backgroundColor: theme.accent }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{theme.name}</p>
                    <p className="text-xs text-muted-foreground">{theme.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {isCustomMode && (
            <Badge variant="outline" className="w-fit">
              <Palette className="h-3 w-3 mr-1" />
              Custom Theme Active
            </Badge>
          )}
        </div>

        <Separator />

        {/* Custom Colors */}
        <div className="space-y-4">
          <Label className="text-base font-medium">Custom Colors</Label>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="primary-color" className="text-sm">Primary Color</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="primary-color"
                  type="color"
                  value={customPrimary}
                  onChange={(e) => handleCustomColorChange('primary', e.target.value)}
                  className="w-16 h-10 p-1 border-border"
                />
                <Input
                  value={customPrimary}
                  onChange={(e) => handleCustomColorChange('primary', e.target.value)}
                  placeholder="#7c3aed"
                  className="flex-1 font-mono text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accent-color" className="text-sm">Accent Color</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="accent-color"
                  type="color"
                  value={customAccent}
                  onChange={(e) => handleCustomColorChange('accent', e.target.value)}
                  className="w-16 h-10 p-1 border-border"
                />
                <Input
                  value={customAccent}
                  onChange={(e) => handleCustomColorChange('accent', e.target.value)}
                  placeholder="#f8fafc"
                  className="flex-1 font-mono text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Font Selection */}
        <div className="space-y-4">
          <Label className="text-base font-medium">Typography</Label>
          
          <div className="space-y-3">
            {fontOptions.map((font) => (
              <div
                key={font.value}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedFont === font.value
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
                onClick={() => setSelectedFont(font.value)}
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium text-sm">{font.name}</p>
                  {selectedFont === font.value && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground" style={{ fontFamily: font.value }}>
                  {font.sample}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Button onClick={saveTheme} className="w-full">
            Save Theme Settings
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            Changes are automatically applied to the preview
          </p>
        </div>
      </CardContent>
    </>
  );
}