// Website Configuration Types
export interface DealerWebsiteThemeConfig {
  colors: {
    primary: string;
    accent: string;
  };
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
  content?: {
    aboutContent?: string;
    servicesEnabled?: boolean;
    services?: Array<{
      title: string;
      description: string;
    }>;
    whyChooseUsEnabled?: boolean;
    whyChooseUsPoints?: string[];
  };
}

export interface DealerWebsiteContactConfig {
  phone: string;
  email: string;
  address: string;
}

export interface DealerWebsiteSeoConfig {
  title?: string;
  description?: string;
  keywords?: string[];
  businessHours?: Record<string, string>;
}

export interface WebsiteConfigParams {
  theme_config?: DealerWebsiteThemeConfig;
  seo_config?: DealerWebsiteSeoConfig;
  contact_config?: DealerWebsiteContactConfig;
  domain_name?: string;
}

// Complete website configuration
export interface DealerWebsiteConfig {
  id: string;
  dealer_id: string;
  is_published: boolean;
  business_name?: string;
  logo_url?: string;
  city?: string;
  state?: string;
  domain_name?: string;
  theme_config: DealerWebsiteThemeConfig;
  seo_config: DealerWebsiteSeoConfig;
  contact_config: DealerWebsiteContactConfig;
  created_at: string;
  updated_at: string;
}