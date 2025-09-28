import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/format";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Filter vehicles based on search
  const filteredVehicles = vehicles.filter(vehicle => {
    const searchLower = searchQuery.toLowerCase();
    return (
      vehicle.make.toLowerCase().includes(searchLower) ||
      vehicle.model.toLowerCase().includes(searchLower) ||
      vehicle.year.toString().includes(searchLower)
    );
  });

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
    <div className="min-h-screen bg-background">
      <SEO
        title={`${dealer.business_name} - Vehicle Inventory`}
        description={`Browse ${filteredVehicles.length} vehicles at ${dealer.business_name}`}
      />

      {/* Header */}
      <header className="border-b">
        <div className="container py-4">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to={`/dealer/${slug}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Showroom
              </Link>
            </Button>
          </div>
          
          <div className="flex items-center gap-3">
            {dealer.logo_url && (
              <img 
                src={dealer.logo_url} 
                alt={`${dealer.business_name} logo`}
                className="h-10 w-10 rounded-full object-cover"
              />
            )}
            <div>
              <h1 className="text-2xl font-semibold">{dealer.business_name}</h1>
              <p className="text-sm text-muted-foreground">
                {filteredVehicles.length} vehicles available
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search vehicles..."
              className="pl-9"
            />
          </div>
          <div className="mt-4 flex items-center gap-2">
            <Badge variant="secondary">
              {filteredVehicles.length} Results
            </Badge>
          </div>
        </div>

        {/* Vehicle Grid */}
        {filteredVehicles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              {searchQuery ? "No vehicles match your search." : "No vehicles available."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredVehicles.map((vehicle) => (
              <Card key={vehicle.id} className="overflow-hidden">
                <div className="aspect-video bg-muted flex items-center justify-center">
                  {vehicle.images && vehicle.images.length > 0 ? (
                    <img 
                      src={vehicle.images[0]} 
                      alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-muted-foreground">No Image</div>
                  )}
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {vehicle.price && (
                      <p className="text-xl font-semibold text-primary">
                        {formatCurrency(vehicle.price)}
                      </p>
                    )}
                    {vehicle.mileage && (
                      <p className="text-sm text-muted-foreground">
                        {vehicle.mileage.toLocaleString()} miles
                      </p>
                    )}
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
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default DealerInventoryNew;