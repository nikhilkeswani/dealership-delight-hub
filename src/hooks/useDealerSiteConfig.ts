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
      if (import.meta.env.DEV) {
        console.log('[Theme Debug] Loading config from localStorage:', { storageKey, raw: raw ? 'exists' : 'null' });
      }
      
      if (raw) {
        const parsed = JSON.parse(raw);
        if (import.meta.env.DEV) {
          console.log('[Theme Debug] Parsed config:', { colors: parsed.colors, themeVersion: parsed.themeVersion });
        }
        
        // Only migrate if the config is truly corrupted (missing required fields)
        const isCorrupted = !parsed.colors || !parsed.colors.primary || !parsed.colors.accent;
        
        if (isCorrupted) {
          if (import.meta.env.DEV) {
            console.log('[Theme Debug] Config corrupted, using defaults');
          }
          const cleanedConfig = { 
            ...defaults, 
            ...parsed, 
            brand: { ...defaults.brand, ...(parsed.brand || {}) }, 
            hero: { ...defaults.hero, ...(parsed.hero || {}) }, 
            contact: { ...defaults.contact, ...(parsed.contact || {}) }, 
            colors: defaults.colors, // Use default colors only if corrupted
            content: { ...defaults.content, ...(parsed.content || {}) },
            themeVersion: "1.0.0"
          } as DealerSiteConfig & { themeVersion: string };
          return cleanedConfig;
        }
        
        // Use existing config without aggressive migration
        const validConfig = { 
          ...defaults, 
          ...parsed, 
          brand: { ...defaults.brand, ...(parsed.brand || {}) }, 
          hero: { ...defaults.hero, ...(parsed.hero || {}) }, 
          contact: { ...defaults.contact, ...(parsed.contact || {}) }, 
          colors: { ...defaults.colors, ...(parsed.colors || {}) }, // Preserve user colors
          content: { ...defaults.content, ...(parsed.content || {}) }
        } as DealerSiteConfig;
        
        if (import.meta.env.DEV) {
          console.log('[Theme Debug] Using existing config:', { colors: validConfig.colors });
        }
        return validConfig;
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('[Theme Debug] Error loading config:', error);
      }
    }
    if (import.meta.env.DEV) {
      console.log('[Theme Debug] Using defaults:', { colors: defaults.colors });
    }
    return defaults;
  });

  // Debounced update tracking to prevent infinite loops
  const [isUpdating, setIsUpdating] = useState(false);

  // Listen for localStorage changes from other hook instances with debouncing
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === storageKey && e.newValue && !isUpdating) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (import.meta.env.DEV) {
            console.log('[Theme Debug] Storage change detected:', { colors: parsed.colors });
          }
          
          const updatedConfig = { 
            ...defaults, 
            ...parsed, 
            brand: { ...defaults.brand, ...(parsed.brand || {}) }, 
            hero: { ...defaults.hero, ...(parsed.hero || {}) }, 
            contact: { ...defaults.contact, ...(parsed.contact || {}) }, 
            colors: { ...defaults.colors, ...(parsed.colors || {}) },
            content: { ...defaults.content, ...(parsed.content || {}) }
          } as DealerSiteConfig;
          setConfig(updatedConfig);
        } catch (error) {
          if (import.meta.env.DEV) {
            console.error('[Theme Debug] Error in storage change:', error);
          }
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [storageKey, defaults, isUpdating]);

  // Note: CSS variables are NOT applied globally to avoid affecting the main SaaS platform
  // Custom colors are only applied in specific dealer site contexts

  const update = (partial: Partial<DealerSiteConfig>) => {
    if (import.meta.env.DEV) {
      console.log('[Theme Debug] Updating config:', { colors: partial.colors });
    }
    
    setConfig((prev) => {
      const newConfig = {
        ...prev,
        ...partial,
        brand: { ...prev.brand, ...(partial.brand || {}) },
        hero: { ...prev.hero, ...(partial.hero || {}) },
        contact: { ...prev.contact, ...(partial.contact || {}) },
        colors: { ...prev.colors, ...(partial.colors || {}) },
        content: { ...prev.content, ...(partial.content || {}) },
        themeVersion: "1.0.0"
      };
      
      if (import.meta.env.DEV) {
        console.log('[Theme Debug] New config created:', { colors: newConfig.colors });
      }
      return newConfig;
    });
  };

  const saveLocal = () => {
    try {
      setIsUpdating(true);
      const configWithVersion = { ...config, themeVersion: "1.0.0" };
      
      // Validate colors before saving
      if (!configWithVersion.colors?.primary || !configWithVersion.colors?.accent) {
        if (import.meta.env.DEV) {
          console.error('[Theme Debug] Invalid colors, not saving:', configWithVersion.colors);
        }
        return;
      }
      
      localStorage.setItem(storageKey, JSON.stringify(configWithVersion));
      if (import.meta.env.DEV) {
        console.log('[Theme Debug] Config saved successfully:', configWithVersion.colors);
      }
      
      setTimeout(() => setIsUpdating(false), 100); // Debounce to prevent loops
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('[Theme Debug] Error saving config:', error);
      }
      setIsUpdating(false);
    }
  };

  // Emergency reset function for debugging
  const clearThemeData = () => {
    try {
      localStorage.removeItem(storageKey);
      setConfig(defaults);
      if (import.meta.env.DEV) {
        console.log('[Theme Debug] Theme data cleared, reset to defaults');
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('[Theme Debug] Error clearing theme data:', error);
      }
    }
  };

  const reset = () => {
    try { localStorage.removeItem(storageKey); } catch {}
    setConfig(defaults);
    if (import.meta.env.DEV) {
      console.log('[Theme Debug] Config reset to defaults');
    }
  };

  return { config, setConfig: update, saveLocal, reset, clearThemeData } as const;
}
