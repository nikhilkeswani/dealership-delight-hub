/**
 * Utility to reset theme configurations and clear localStorage inconsistencies
 */

export const resetThemeToDefaults = () => {
  // Clear all dealer site config from localStorage
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.startsWith('dealerSite:config:')) {
      localStorage.removeItem(key);
    }
  });
  
  // Force page reload to apply default theme
  window.location.reload();
};

export const clearDealerSiteConfig = (slug: string) => {
  const storageKey = `dealerSite:config:${slug}`;
  localStorage.removeItem(storageKey);
};