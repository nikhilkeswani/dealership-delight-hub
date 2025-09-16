export interface ThemeColors {
  primary: string;
  accent: string;
}

export interface PresetTheme {
  name: string;
  primary: string;
  accent: string;
  description: string;
}

export interface DealerBrand {
  name: string;
  tagline: string;
  logoUrl?: string;
}

export interface DealerHero {
  headline: string;
  subtitle: string;
  backgroundUrl?: string;
}

export interface DealerContact {
  phone: string;
  email: string;
  address: string;
}

export interface DealerService {
  title: string;
  description: string;
}

export interface DealerSiteConfig {
  brand: DealerBrand;
  hero: DealerHero;
  contact: DealerContact;
  colors: ThemeColors;
  content: {
    aboutContent?: string;
    servicesEnabled?: boolean;
    services?: DealerService[];
    whyChooseUsEnabled?: boolean;
    whyChooseUsPoints?: string[];
  };
}

export interface CustomerData {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  city?: string;
  state?: string;
  total_spent?: number;
  created_at: string;
}

export interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  helperText?: string;
  isLoading?: boolean;
  delta?: number;
  trend?: 'up' | 'down' | 'neutral';
}