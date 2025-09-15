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
      
      // Force override CSS variables on ALL child elements using !important
      const style = document.createElement('style');
      style.textContent = `
        [data-theme-container],
        [data-theme-container] * {
          --primary: ${primaryHsl} !important;
          --accent: ${accentHsl} !important;
          --primary-foreground: 210 40% 98% !important;
          --accent-foreground: 222.2 47.4% 11.2% !important;
        }
        
        /* Force specific button and component styles */
        [data-theme-container] .bg-primary,
        [data-theme-container] .bg-primary * { 
          background-color: hsl(${primaryHsl}) !important; 
        }
        [data-theme-container] .bg-primary:hover,
        [data-theme-container] .bg-primary:hover * { 
          background-color: hsl(${primaryHsl} / 0.9) !important; 
        }
        [data-theme-container] .text-primary,
        [data-theme-container] .text-primary * { 
          color: hsl(${primaryHsl}) !important; 
        }
        [data-theme-container] .border-primary,
        [data-theme-container] .border-primary * { 
          border-color: hsl(${primaryHsl}) !important; 
        }
        [data-theme-container] .bg-accent,
        [data-theme-container] .bg-accent * { 
          background-color: hsl(${accentHsl}) !important; 
        }
      `;
      
      // Remove old style if exists
      const oldStyle = containerRef.current.querySelector('[data-theme-style]');
      if (oldStyle) oldStyle.remove();
      
      style.setAttribute('data-theme-style', 'true');
      containerRef.current.appendChild(style);
    }
  }, [primary, accent]);

  return (
    <div ref={containerRef} data-theme-container className="w-full h-full">
      {children}
    </div>
  );
}