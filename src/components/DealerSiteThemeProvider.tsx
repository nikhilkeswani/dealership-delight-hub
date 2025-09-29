import React, { useEffect, useRef, useMemo, useCallback } from 'react';

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

  // Memoize the theme styles to prevent recalculation on every render
  const themeStyles = useMemo(() => {
    if (!primary || !accent) return null;

    const primaryHsl = hexToHsl(primary);
    const accentHsl = hexToHsl(accent);
    
    // Parse HSL to calculate dependent colors
    const [h, s, l] = primaryHsl.split(' ').map((v, i) => 
      i === 0 ? parseInt(v) : parseInt(v.replace('%', ''))
    );
    
    // Calculate dependent colors
    const glowLightness = Math.min(l + 20, 90);
    const primaryGlow = `${h} ${s}% ${glowLightness}%`;
    const gradientPrimary = `linear-gradient(135deg, hsl(${primaryHsl}), hsl(${primaryGlow}))`;
    const shadowElegant = `0 10px 30px -10px hsl(${primaryHsl} / 0.3)`;
    const shadowGlow = `0 0 40px hsl(${primaryGlow} / 0.4)`;
    
    return {
      primaryHsl,
      accentHsl,
      primaryGlow,
      gradientPrimary,
      shadowElegant,
      shadowGlow
    };
  }, [primary, accent]);

  // Create a stable cleanup function
  const cleanup = useCallback(() => {
    const styleId = 'dealer-theme-override';
    const existingStyle = document.getElementById(styleId);
    if (existingStyle) existingStyle.remove();
  }, []);

  useEffect(() => {
    if (!containerRef.current || !themeStyles) return;

    console.log('[DealerSiteThemeProvider] Applying theme:', { primary, accent });
    console.log('[DealerSiteThemeProvider] Theme styles:', themeStyles);

    const { primaryHsl, accentHsl, primaryGlow, gradientPrimary, shadowElegant, shadowGlow } = themeStyles;
    
    // Create a unique style element ID to avoid conflicts
    const styleId = 'dealer-theme-override';
    
    // Remove any existing theme style first
    cleanup();
    
    // Inject CSS at document level to override everything
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      /* Override CSS variables at root level for theme container */
      [data-theme-container] {
        --primary: ${primaryHsl} !important;
        --accent: ${accentHsl} !important;
        --primary-glow: ${primaryGlow} !important;
        --gradient-primary: ${gradientPrimary} !important;
        --shadow-elegant: ${shadowElegant} !important;
        --shadow-glow: ${shadowGlow} !important;
        --primary-foreground: 210 40% 98% !important;
        --accent-foreground: 222.2 47.4% 11.2% !important;
        --brand-foreground: 210 40% 98% !important;
      }
      
      /* Force button styles with highest specificity */
      [data-theme-container] .bg-primary { 
        background-color: hsl(${primaryHsl}) !important; 
      }
      [data-theme-container] .bg-primary:hover { 
        background-color: hsl(${primaryHsl} / 0.9) !important; 
      }
      [data-theme-container] .text-primary { 
        color: hsl(${primaryHsl}) !important; 
      }
      [data-theme-container] .border-primary { 
        border-color: hsl(${primaryHsl}) !important; 
      }
      [data-theme-container] .bg-accent { 
        background-color: hsl(${accentHsl}) !important; 
      }
      
      /* Hero button variants - target all gradient classes */
      [data-theme-container] button[class*="hero"] {
        background: ${gradientPrimary} !important;
        background-image: ${gradientPrimary} !important;
      }
      [data-theme-container] .bg-gradient-to-br,
      [data-theme-container] .from-primary,
      [data-theme-container] .to-primary-glow,
      [data-theme-container] [style*="gradient"] {
        background: ${gradientPrimary} !important;
        background-image: ${gradientPrimary} !important;
      }
      
      /* Override any inline gradient styles */
      [data-theme-container] [style*="--gradient-primary"] {
        background: ${gradientPrimary} !important;
      }
    `;
    
    // Append to document head for maximum override power
    document.head.appendChild(style);
    
    // Cleanup on unmount or dependency change
    return cleanup;
  }, [themeStyles, cleanup]);

  return (
    <div ref={containerRef} data-theme-container className="w-full h-full">
      {children}
    </div>
  );
}