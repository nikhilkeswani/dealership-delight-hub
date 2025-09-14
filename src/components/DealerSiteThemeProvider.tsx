import React, { useEffect, useRef } from 'react';

interface DealerSiteThemeProviderProps {
  primary: string;
  accent: string;
  children: React.ReactNode;
}

function hexToHsl(hex: string): string {
  try {
    let h = hex.replace("#", "");
    if (h.length === 3) {
      h = h.split("").map((c) => c + c).join("");
    }
    const intVal = parseInt(h, 16);
    const r = (intVal >> 16) & 255;
    const g = (intVal >> 8) & 255;
    const b = intVal & 255;

    const rNorm = r / 255;
    const gNorm = g / 255;
    const bNorm = b / 255;

    const max = Math.max(rNorm, gNorm, bNorm);
    const min = Math.min(rNorm, gNorm, bNorm);
    let hue = 0, sat = 0, light = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      sat = light > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case rNorm: hue = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0); break;
        case gNorm: hue = (bNorm - rNorm) / d + 2; break;
        case bNorm: hue = (rNorm - gNorm) / d + 4; break;
      }
      hue /= 6;
    }

    const h360 = Math.round(hue * 360);
    const s100 = Math.round(Math.max(0, Math.min(1, sat)) * 100);
    const l100 = Math.round(Math.max(0, Math.min(1, light)) * 100);
    
    return `${h360} ${s100}% ${l100}%`;
  } catch {
    return "221 83% 53%"; // fallback purple
  }
}

export function DealerSiteThemeProvider({ primary, accent, children }: DealerSiteThemeProviderProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      const primaryHsl = hexToHsl(primary);
      const accentHsl = hexToHsl(accent);
      
      // Set CSS variables only on this container, not globally
      containerRef.current.style.setProperty("--primary", primaryHsl);
      containerRef.current.style.setProperty("--accent", accentHsl);
    }
  }, [primary, accent]);

  return (
    <div ref={containerRef} className="w-full h-full">
      {children}
    </div>
  );
}