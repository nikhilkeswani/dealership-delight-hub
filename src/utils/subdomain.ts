/**
 * Subdomain utilities for dealer website routing
 */

export interface SubdomainInfo {
  isSubdomain: boolean;
  dealerSlug: string | null;
  rootDomain: string;
  fullDomain: string;
}

/**
 * Extracts subdomain information from the current URL
 * Handles both development and production scenarios
 */
export const getSubdomainInfo = (): SubdomainInfo => {
  if (typeof window === 'undefined') {
    return {
      isSubdomain: false,
      dealerSlug: null,
      rootDomain: '',
      fullDomain: '',
    };
  }

  const hostname = window.location.hostname;
  const fullDomain = hostname;
  
  // Development environments (localhost, lovable domains)
  const isDevelopment = hostname.includes('localhost') || 
                       hostname.includes('lovable.app') || 
                       hostname.includes('127.0.0.1');

  if (isDevelopment) {
    return {
      isSubdomain: false,
      dealerSlug: null,
      rootDomain: hostname,
      fullDomain,
    };
  }

  // Production subdomain detection
  // Example: mydealership.dealerdelight.com
  const parts = hostname.split('.');
  
  // Check if it's a subdomain of dealerdelight.com
  if (parts.length >= 3 && parts.slice(-2).join('.') === 'dealerdelight.com') {
    const subdomain = parts[0];
    
    // Ignore www subdomain
    if (subdomain === 'www') {
      return {
        isSubdomain: false,
        dealerSlug: null,
        rootDomain: parts.slice(-2).join('.'),
        fullDomain,
      };
    }

    return {
      isSubdomain: true,
      dealerSlug: subdomain,
      rootDomain: parts.slice(-2).join('.'),
      fullDomain,
    };
  }

  // Not a subdomain or not dealerdelight.com
  return {
    isSubdomain: false,
    dealerSlug: null,
    rootDomain: hostname,
    fullDomain,
  };
};

/**
 * Generates a subdomain URL for a dealer
 */
export const generateSubdomainUrl = (dealerSlug: string, path: string = ''): string => {
  const subdomainInfo = getSubdomainInfo();
  
  // In development, use path-based routing
  if (subdomainInfo.rootDomain.includes('localhost') || 
      subdomainInfo.rootDomain.includes('lovable.app')) {
    return `${window.location.protocol}//${subdomainInfo.rootDomain}/dealer/${dealerSlug}${path}`;
  }
  
  // In production, use subdomain
  return `${window.location.protocol}//${dealerSlug}.dealerdelight.com${path}`;
};

/**
 * Checks if current domain supports subdomain routing
 */
export const supportsSubdomains = (): boolean => {
  const subdomainInfo = getSubdomainInfo();
  return !subdomainInfo.rootDomain.includes('localhost') && 
         !subdomainInfo.rootDomain.includes('lovable.app') &&
         subdomainInfo.rootDomain === 'dealerdelight.com';
};