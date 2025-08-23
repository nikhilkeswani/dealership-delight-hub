import { useEffect, useMemo, useState } from "react";

export type DealerSiteConfig = {
  brand: {
    name: string;
    tagline: string;
    logoUrl?: string;
  };
  hero: {
    headline: string;
    subtitle: string;
    backgroundUrl?: string;
  };
  contact: {
    phone: string;
    email: string;
    address: string;
  };
  colors: {
    primary: string; // hex e.g. #2563eb
    accent: string; // hex e.g. #22c55e
  };
  content: {
    aboutContent?: string;
    servicesEnabled?: boolean;
    services?: Array<{ title: string; description: string; }>;
    whyChooseUsEnabled?: boolean;
    whyChooseUsPoints?: string[];
  };
};

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

function hexToRgb(hex: string) {
  let h = hex.replace("#", "");
  if (h.length === 3) {
    h = h.split("").map((c) => c + c).join("");
  }
  const intVal = parseInt(h, 16);
  const r = (intVal >> 16) & 255;
  const g = (intVal >> 8) & 255;
  const b = intVal & 255;
  return { r, g, b };
}

function rgbToHsl(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
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
  return { h: h * 360, s: s * 100, l: l * 100 };
}

function hexToHslString(hex: string) {
  try {
    const { r, g, b } = hexToRgb(hex);
    const { h, s, l } = rgbToHsl(r, g, b);
    const hh = Math.round(h);
    const ss = Math.round(clamp01(s / 100) * 100);
    const ll = Math.round(clamp01(l / 100) * 100);
    return `${hh} ${ss}% ${ll}%`;
  } catch {
    // fallback to a sane default
    return "221 83% 53%"; // approx tailwind blue-600
  }
}

export function useDealerSiteConfig(slug: string | undefined, defaults: DealerSiteConfig) {
  const storageKey = useMemo(() => `dealerSite:config:${slug || "demo"}`,[slug]);
  const [config, setConfig] = useState<DealerSiteConfig>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        return { 
          ...defaults, 
          ...parsed, 
          brand: { ...defaults.brand, ...parsed.brand }, 
          hero: { ...defaults.hero, ...parsed.hero }, 
          contact: { ...defaults.contact, ...parsed.contact }, 
          colors: { ...defaults.colors, ...parsed.colors },
          content: { ...defaults.content, ...parsed.content }
        } as DealerSiteConfig;
      }
    } catch {}
    return defaults;
  });

  // Apply theme colors to CSS variables
  useEffect(() => {
    const root = document.documentElement;
    const primaryHsl = hexToHslString(config.colors.primary);
    const accentHsl = hexToHslString(config.colors.accent);
    root.style.setProperty("--primary", primaryHsl);
    root.style.setProperty("--accent", accentHsl);
  }, [config.colors.primary, config.colors.accent]);

  const update = (partial: Partial<DealerSiteConfig>) => {
    setConfig((prev) => ({
      ...prev,
      ...partial,
      brand: { ...prev.brand, ...(partial.brand || {}) },
      hero: { ...prev.hero, ...(partial.hero || {}) },
      contact: { ...prev.contact, ...(partial.contact || {}) },
      colors: { ...prev.colors, ...(partial.colors || {}) },
      content: { ...prev.content, ...(partial.content || {}) },
    }));
  };

  const saveLocal = () => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(config));
    } catch {}
  };

  const reset = () => {
    try { localStorage.removeItem(storageKey); } catch {}
    setConfig(defaults);
  };

  return { config, setConfig: update, saveLocal, reset } as const;
}
