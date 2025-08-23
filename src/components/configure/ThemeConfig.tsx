import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Palette, Check, RotateCcw } from "lucide-react";
import { toast } from "sonner";

const presetThemes = [
  {
    name: "Professional Blue",
    primary: "#2563eb",
    accent: "#f1f5f9",
    description: "Trust and reliability",
  },
  {
    name: "Luxury Purple",
    primary: "#7c3aed",
    accent: "#f8fafc",
    description: "Premium and elegant",
  },
  {
    name: "Energy Orange",
    primary: "#ea580c",
    accent: "#fef3c7",
    description: "Bold and dynamic",
  },
  {
    name: "Nature Green",
    primary: "#16a34a",
    accent: "#f0fdf4",
    description: "Fresh and eco-friendly",
  },
  {
    name: "Classic Red",
    primary: "#dc2626",
    accent: "#fef2f2",
    description: "Bold and confident",
  },
  {
    name: "Modern Teal",
    primary: "#0d9488",
    accent: "#f0fdfa",
    description: "Contemporary and clean",
  },
];

const fontOptions = [
  { name: "Inter (Modern)", value: "inter", sample: "The quick brown fox jumps over the lazy dog" },
  { name: "Roboto (Clean)", value: "roboto", sample: "The quick brown fox jumps over the lazy dog" },
  { name: "Open Sans (Friendly)", value: "opensans", sample: "The quick brown fox jumps over the lazy dog" },
  { name: "Poppins (Rounded)", value: "poppins", sample: "The quick brown fox jumps over the lazy dog" },
];

export function ThemeConfig() {
  const [selectedTheme, setSelectedTheme] = useState(presetThemes[1]); // Default to Luxury Purple
  const [customPrimary, setCustomPrimary] = useState("#7c3aed");
  const [customAccent, setCustomAccent] = useState("#f8fafc");
  const [selectedFont, setSelectedFont] = useState("inter");
  const [isCustomMode, setIsCustomMode] = useState(false);

  const handlePresetSelect = (theme: typeof presetThemes[0]) => {
    setSelectedTheme(theme);
    setCustomPrimary(theme.primary);
    setCustomAccent(theme.accent);
    setIsCustomMode(false);
    
    // Apply theme to CSS variables
    document.documentElement.style.setProperty('--primary', hexToHsl(theme.primary));
    document.documentElement.style.setProperty('--accent', hexToHsl(theme.accent));
  };

  const handleCustomColorChange = (type: 'primary' | 'accent', color: string) => {
    if (type === 'primary') {
      setCustomPrimary(color);
      document.documentElement.style.setProperty('--primary', hexToHsl(color));
    } else {
      setCustomAccent(color);
      document.documentElement.style.setProperty('--accent', hexToHsl(color));
    }
    setIsCustomMode(true);
  };

  const resetToDefault = () => {
    const defaultTheme = presetThemes[1];
    handlePresetSelect(defaultTheme);
  };

  const saveTheme = () => {
    // In a real app, you would save this to the database
    const themeConfig = {
      preset: isCustomMode ? 'custom' : selectedTheme.name,
      colors: {
        primary: customPrimary,
        accent: customAccent,
      },
      font: selectedFont,
    };
    
    console.log("Saving theme config:", themeConfig);
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

        <Button onClick={saveTheme} className="w-full">
          Save Theme Settings
        </Button>
      </CardContent>
    </>
  );
}