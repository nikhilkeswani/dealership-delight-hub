export const DEFAULT_COLORS = {
  primary: "#8B5CF6", // Purple-500 - consistent brand color  
  accent: "#F3F4F6",  // Gray-100 - light neutral accent
};

export const THEME_VERSION = "1.0.0"; // For localStorage migration

export const DEFAULT_DEALER_SITE_CONFIG = {
  brand: {
    name: "Your Dealership",
    tagline: "Find Your Perfect Vehicle",
    logoUrl: undefined,
  },
  hero: {
    headline: "Find Your Perfect Vehicle",
    subtitle: "Browse our extensive collection of quality pre-owned vehicles",
    backgroundUrl: undefined,
  },
  contact: {
    phone: "(555) 123-4567",
    email: "contact@yourdealership.com",
    address: "123 Main St, Your City, ST 12345",
  },
  colors: DEFAULT_COLORS,
  content: {
    aboutContent: "We are a trusted dealership with years of experience in providing quality vehicles and exceptional customer service.",
    servicesEnabled: true,
    services: [
      { title: "Vehicle Sales", description: "Browse our extensive inventory of quality vehicles" },
      { title: "Financing", description: "Flexible financing options to fit your budget" },
      { title: "Service & Maintenance", description: "Professional maintenance and repair services" },
    ],
    whyChooseUsEnabled: true,
    whyChooseUsPoints: [
      "Quality inspected vehicles",
      "Competitive pricing",
      "Expert financing assistance",
      "Outstanding customer service"
    ],
  },
};