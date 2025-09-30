import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Search, Phone, Mail, MapPin, Star, Award, ShieldCheck, Tag, Filter, SortAsc } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/format";
import { DealerSiteThemeProvider } from "@/components/DealerSiteThemeProvider";
import { usePublicDealerWebsite } from "@/hooks/usePublicDealerWebsite";
import { DEFAULT_COLORS } from "@/constants/theme";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

interface SimpleVehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number | null;
  mileage: number | null;
  images: string[] | null;
  status: string;
  body_type: string | null;
  fuel_type: string | null;
  transmission: string | null;
  condition: string | null;
}

interface SimpleDealer {
  id: string;
  business_name: string;
  logo_url: string | null;
}

const DealerInventoryNew = () => {
  const { slug } = useParams<{ slug: string }>();
  const [dealer, setDealer] = useState<SimpleDealer | null>(null);
  const [vehicles, setVehicles] = useState<SimpleVehicle[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [filterBy, setFilterBy] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch dealer website configuration for theming
  const { data: websiteConfig } = usePublicDealerWebsite(dealer?.id);

  // Load dealer and vehicles
  useEffect(() => {
    const loadData = async () => {
      if (!slug) {
        setError("No dealer specified");
        setLoading(false);
        return;
      }

      try {
        // Find dealer by business name (convert slug to potential business names)
        const searchTerms = [
          slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
          slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' '),
        ];

        let dealerData: SimpleDealer | null = null;

        // Try different name variations
        for (const term of searchTerms) {
          const { data } = await supabase
            .from('dealers')
            .select('id, business_name, logo_url')
            .ilike('business_name', `%${term}%`)
            .eq('is_active', true)
            .maybeSingle();
          
          if (data) {
            dealerData = data;
            break;
          }
        }

        if (!dealerData) {
          setError(`Dealer "${slug}" not found`);
          setLoading(false);
          return;
        }

        setDealer(dealerData);

        // Load vehicles
        const { data: vehicleData } = await supabase
          .from('public_vehicles')
          .select('*')
          .eq('dealer_id', dealerData.id);

        setVehicles(vehicleData || []);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load inventory');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [slug]);

  // Filter and sort vehicles
  const filteredVehicles = vehicles
    .filter(vehicle => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        vehicle.make.toLowerCase().includes(searchLower) ||
        vehicle.model.toLowerCase().includes(searchLower) ||
        vehicle.year.toString().includes(searchLower) ||
        (vehicle.body_type && vehicle.body_type.toLowerCase().includes(searchLower));
      
      const matchesFilter = filterBy === "all" || 
        (filterBy === "new" && vehicle.condition === "new") ||
        (filterBy === "used" && vehicle.condition === "used") ||
        (filterBy === "suv" && vehicle.body_type?.toLowerCase().includes("suv")) ||
        (filterBy === "sedan" && vehicle.body_type?.toLowerCase().includes("sedan"));
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return (a.price || 0) - (b.price || 0);
        case "price-high":
          return (b.price || 0) - (a.price || 0);
        case "year-new":
          return b.year - a.year;
        case "year-old":
          return a.year - b.year;
        case "mileage":
          return (a.mileage || 0) - (b.mileage || 0);
        default:
          return 0;
      }
    });

  // Get theme colors from dealer configuration
  const themeColors = (websiteConfig?.theme_config as any)?.colors || DEFAULT_COLORS;
  const dealerBrand = (websiteConfig?.theme_config as any)?.brand || { name: dealer?.business_name, tagline: "Quality vehicles, trusted service" };
  const contactInfo = (websiteConfig?.contact_config as any) || {};
  const brandInitials = (dealerBrand.name || dealer?.business_name || "")
    .split(" ")
    .slice(0, 2)
    .map(w => w[0])
    .join("")
    .toUpperCase() || "DL";

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse">Loading inventory...</div>
        </div>
      </div>
    );
  }

  if (error || !dealer) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-2">Dealer Not Found</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button asChild>
            <Link to="/">Return Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <DealerSiteThemeProvider primary={themeColors.primary} accent={themeColors.accent}>
      <div className="min-h-screen bg-background" data-dealer-site>
        <SEO
          title={`${dealer.business_name} - Vehicle Inventory`}
          description={`Browse ${filteredVehicles.length} quality vehicles at ${dealer.business_name}. Find your perfect car today!`}
        />

        {/* Enhanced Header */}
        <header className="border-b bg-background/95 backdrop-blur-sm sticky top-0 z-40">
          <div className="container py-4 md:py-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={dealer.logo_url || undefined} alt={`${dealer.business_name} logo`} />
                  <AvatarFallback className="bg-primary text-primary-foreground">{brandInitials}</AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" asChild className="p-0 h-auto text-muted-foreground hover:text-foreground">
                      <Link to={`/dealer/${slug}`}>
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Back to Showroom
                      </Link>
                    </Button>
                  </div>
                  <h1 className="text-2xl font-semibold">{dealer.business_name}</h1>
                  <p className="text-sm text-muted-foreground">{dealerBrand.tagline}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Star className="h-3 w-3" /> 4.9 Rating
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Award className="h-3 w-3" /> Certified
                </Badge>
                <Button variant="hero" asChild>
                  <Link to={`/dealer/${slug}#contact`}>Contact Dealer</Link>
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10">
          <div className="absolute inset-0 bg-[radial-gradient(hsl(var(--primary)/0.1)_1px,transparent_1px)] bg-[length:20px_20px]" />
          <div className="container relative py-12 md:py-16 space-y-6">
            <div className="max-w-3xl">
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">Vehicle Inventory</h2>
              <p className="mt-3 text-muted-foreground text-lg">
                Discover {vehicles.length} quality vehicles in our inventory. Find your perfect match today.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" /> All Vehicles Inspected
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Tag className="h-3 w-3" /> Competitive Pricing
              </Badge>
              <Badge variant="secondary">
                {filteredVehicles.length} Available Now
              </Badge>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <main className="container py-8">
          {/* Search and Filters */}
          <div className="mb-8 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by make, model, year..."
                  className="pl-9"
                />
              </div>
              
              <div className="flex gap-2">
                <Select value={filterBy} onValueChange={setFilterBy}>
                  <SelectTrigger className="w-32">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="used">Used</SelectItem>
                    <SelectItem value="suv">SUVs</SelectItem>
                    <SelectItem value="sedan">Sedans</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-32">
                    <SortAsc className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Sort" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="year-new">Year: Newest</SelectItem>
                    <SelectItem value="year-old">Year: Oldest</SelectItem>
                    <SelectItem value="mileage">Mileage: Low to High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-medium">
                {filteredVehicles.length} Results
              </Badge>
              {searchQuery && (
                <Badge variant="secondary">
                  Searching: "{searchQuery}"
                </Badge>
              )}
              {filterBy !== "all" && (
                <Badge variant="secondary">
                  Filter: {filterBy}
                </Badge>
              )}
            </div>
          </div>

          {/* Vehicle Grid */}
          {filteredVehicles.length === 0 ? (
            <div className="text-center py-16">
              <div className="space-y-4">
                <div className="text-6xl">🚗</div>
                <h3 className="text-xl font-semibold">
                  {searchQuery || filterBy !== "all" ? "No vehicles match your criteria" : "No vehicles available"}
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  {searchQuery || filterBy !== "all" 
                    ? "Try adjusting your search or filter to see more results."
                    : "Check back soon for new inventory updates."
                  }
                </p>
                {(searchQuery || filterBy !== "all") && (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchQuery("");
                      setFilterBy("all");
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVehicles.map((vehicle) => (
                <Card key={vehicle.id} className="group overflow-hidden hover:shadow-lg transition-all duration-300 border-muted/50 hover:border-primary/20">
                  <div className="relative aspect-video bg-muted overflow-hidden">
                    {vehicle.images && vehicle.images.length > 0 ? (
                      <img 
                        src={vehicle.images[0]} 
                        alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground bg-gradient-to-br from-muted to-muted/50">
                        <div className="text-center">
                          <div className="text-4xl mb-2">🚗</div>
                          <p className="text-sm">No Image</p>
                        </div>
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm">
                        {vehicle.condition || "Used"}
                      </Badge>
                    </div>
                  </div>
                  
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      {vehicle.price && (
                        <p className="text-2xl font-bold text-primary">
                          {formatCurrency(vehicle.price)}
                        </p>
                      )}
                      {vehicle.mileage && (
                        <p className="text-sm text-muted-foreground">
                          {vehicle.mileage.toLocaleString()} mi
                        </p>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {vehicle.body_type && (
                        <Badge variant="outline" className="text-xs">
                          {vehicle.body_type}
                        </Badge>
                      )}
                      {vehicle.fuel_type && (
                        <Badge variant="outline" className="text-xs">
                          {vehicle.fuel_type}
                        </Badge>
                      )}
                      {vehicle.transmission && (
                        <Badge variant="outline" className="text-xs">
                          {vehicle.transmission}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1" asChild>
                        <Link to={`/dealer/${slug}#contact`}>
                          View Details
                        </Link>
                      </Button>
                      <Button size="sm" className="flex-1" asChild>
                        <Link to={`/dealer/${slug}#contact`}>
                          Contact
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>

        {/* Enhanced Footer */}
        <footer className="bg-muted/30 border-t mt-16">
          <div className="container py-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={dealer.logo_url || undefined} alt={`${dealer.business_name} logo`} />
                    <AvatarFallback className="bg-primary text-primary-foreground">{brandInitials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{dealer.business_name}</h3>
                    <p className="text-sm text-muted-foreground">{dealerBrand.tagline}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Your trusted automotive partner. Quality vehicles, exceptional service, and transparent deals.
                </p>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold">Contact Information</h4>
                <div className="space-y-2">
                  {contactInfo?.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <a href={`tel:${contactInfo.phone}`} className="hover:text-primary transition-colors">
                        {contactInfo.phone}
                      </a>
                    </div>
                  )}
                  {contactInfo?.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a href={`mailto:${contactInfo.email}`} className="hover:text-primary transition-colors">
                        {contactInfo.email}
                      </a>
                    </div>
                  )}
                  {contactInfo?.address && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{contactInfo.address}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold">Quick Links</h4>
                <div className="space-y-2">
                  <Link to={`/dealer/${slug}`} className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                    Back to Showroom
                  </Link>
                  <Link to={`/dealer/${slug}#contact`} className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                    Contact Us
                  </Link>
                  <Link to={`/dealer/${slug}#about`} className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                    About Us
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="border-t mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-muted-foreground">
                © 2024 {dealer.business_name}. All rights reserved.
              </p>
              <p className="text-xs text-muted-foreground">
                Powered by <span className="font-medium">DealerDelight</span>
              </p>
            </div>
          </div>
        </footer>
      </div>
    </DealerSiteThemeProvider>
  );
};

export default DealerInventoryNew;