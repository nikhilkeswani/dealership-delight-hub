import { useParams, Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import VehicleCard, { VehicleData } from "@/components/VehicleCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Search, Filter, X } from "lucide-react";
import { useState, useMemo } from "react";
import { usePublicDealer } from "@/hooks/usePublicDealer";
import { usePublicVehicles } from "@/hooks/usePublicVehicles";
import { formatCurrency } from "@/lib/format";
import sedan from "@/assets/cars/sedan.jpg";
import type { DisplayVehicle, VehicleSearchParams } from "@/types/vehicle";

const DealerInventory = () => {
  const { slug } = useParams();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<VehicleSearchParams["sort"]>("relevance");
  const [currentPage, setCurrentPage] = useState(1);
  const [makeFilter, setMakeFilter] = useState<string>("");
  const [bodyTypeFilter, setBodyTypeFilter] = useState<string>("");
  const [fuelTypeFilter, setFuelTypeFilter] = useState<string>("");
  const [transmissionFilter, setTransmissionFilter] = useState<string>("");
  const [conditionFilter, setConditionFilter] = useState<string>("");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200000]);
  const [mileageRange, setMileageRange] = useState<[number, number]>([0, 150000]);
  const [yearRange, setYearRange] = useState<[number, number]>([2000, 2025]);
  const [showFilters, setShowFilters] = useState(false);
  const vehiclesPerPage = 12;

  const { data: publicDealer, isLoading: dealerLoading, error: dealerError } = usePublicDealer(slug);
  const { data: publicVehicles, isLoading: vehiclesLoading } = usePublicVehicles(publicDealer?.id);
  
  const isLoading = dealerLoading || vehiclesLoading;

  // Show error if dealer not found
  if (dealerError || (!dealerLoading && !publicDealer && slug)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-2">Dealer Not Found</h1>
          <p className="text-muted-foreground mb-4">The dealer "{slug}" could not be found or is not active.</p>
          <Button asChild>
            <Link to="/">Return Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  const dealerName = publicDealer?.business_name || (slug || "demo-motors")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());

  const brandInitials = (dealerName || "").split(" ").slice(0,2).map(w=>w[0]).join("").toUpperCase() || "DL";

  // Get unique makes for filter
  const availableMakes = useMemo(() => {
    const makes = [...new Set((publicVehicles || []).map((v: DisplayVehicle) => v.make))].sort();
    return makes;
  }, [publicVehicles]);

  // Get unique filter options
  const availableBodyTypes = useMemo(() => {
    const types = [...new Set((publicVehicles || []).map((v: DisplayVehicle) => v.body_type).filter(Boolean))].sort();
    return types;
  }, [publicVehicles]);

  const availableFuelTypes = useMemo(() => {
    const types = [...new Set((publicVehicles || []).map((v: DisplayVehicle) => v.fuel_type).filter(Boolean))].sort();
    return types;
  }, [publicVehicles]);

  const availableTransmissions = useMemo(() => {
    const types = [...new Set((publicVehicles || []).map((v: DisplayVehicle) => v.transmission).filter(Boolean))].sort();
    return types;
  }, [publicVehicles]);

  const availableConditions = useMemo(() => {
    const types = [...new Set((publicVehicles || []).map((v: DisplayVehicle) => v.condition).filter(Boolean))].sort();
    return types;
  }, [publicVehicles]);

  // Filter and sort vehicles
  const filteredVehicles = useMemo(() => {
    return (publicVehicles || []).filter((v: DisplayVehicle) => {
      const q = query.trim().toLowerCase();
      const vehicleTitle = `${v.year} ${v.make} ${v.model}`;
      const vin = v.vin || '';
      const description = v.description || '';
      
      // Enhanced search including VIN, features, and description
      const matchesSearch = !q || 
        vehicleTitle.toLowerCase().includes(q) ||
        description.toLowerCase().includes(q) ||
        vin.toLowerCase().includes(q) ||
        (v.features && JSON.stringify(v.features).toLowerCase().includes(q));
      
      const price = parsePrice(v.price);
      const mileage = v.mileage || 0;
      const year = v.year || 2000;
      
      const matchesMake = !makeFilter || v.make === makeFilter;
      const matchesBodyType = !bodyTypeFilter || v.body_type === bodyTypeFilter;
      const matchesFuelType = !fuelTypeFilter || v.fuel_type === fuelTypeFilter;
      const matchesTransmission = !transmissionFilter || v.transmission === transmissionFilter;
      const matchesCondition = !conditionFilter || v.condition === conditionFilter;
      const matchesPrice = price >= priceRange[0] && price <= priceRange[1];
      const matchesMileage = mileage >= mileageRange[0] && mileage <= mileageRange[1];
      const matchesYear = year >= yearRange[0] && year <= yearRange[1];
      
      return matchesSearch && matchesMake && matchesBodyType && matchesFuelType && 
             matchesTransmission && matchesCondition && matchesPrice && matchesMileage && matchesYear;
    });
  }, [publicVehicles, query, makeFilter, bodyTypeFilter, fuelTypeFilter, transmissionFilter, conditionFilter, priceRange, mileageRange, yearRange]);

  const parsePrice = (price: number | null | undefined): number => {
    if (typeof price === 'number') return price;
    const n = Number(String(price ?? "").replace(/[^0-9.]/g, ""));
    return isNaN(n) ? 0 : n;
  };

  const sortedVehicles = useMemo(() => {
    return [...filteredVehicles].sort((a, b) => {
      if (sort === "price-asc") return parsePrice(a.price) - parsePrice(b.price);
      if (sort === "price-desc") return parsePrice(b.price) - parsePrice(a.price);
      if (sort === "year-desc") return (b.year || 0) - (a.year || 0);
      if (sort === "mileage-asc") return (a.mileage || 0) - (b.mileage || 0);
      if (sort === "recently-added") return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      return 0;
    });
  }, [filteredVehicles, sort]);

  // Clear all filters
  const clearAllFilters = () => {
    setQuery("");
    setMakeFilter("");
    setBodyTypeFilter("");
    setFuelTypeFilter("");
    setTransmissionFilter("");
    setConditionFilter("");
    setPriceRange([0, 200000]);
    setMileageRange([0, 150000]);
    setYearRange([2000, 2025]);
    setCurrentPage(1);
  };

  // Pagination
  const totalPages = Math.ceil(sortedVehicles.length / vehiclesPerPage);
  const startIndex = (currentPage - 1) * vehiclesPerPage;
  const paginatedVehicles = sortedVehicles.slice(startIndex, startIndex + vehiclesPerPage);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={`${dealerName} - Complete Vehicle Inventory | DealerDelight`}
        description={`Browse our complete inventory of ${sortedVehicles.length} vehicles at ${dealerName}. Find your perfect car today.`}
      />

      {/* Header */}
      <header className="border-b">
        <div className="container py-4 md:py-6">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to={`/dealer/${slug}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Showroom
              </Link>
            </Button>
          </div>
          
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={publicDealer?.logo_url || undefined} alt={`${dealerName} logo`} />
              <AvatarFallback>{brandInitials}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-semibold">{dealerName} - Complete Inventory</h1>
              <p className="text-sm text-muted-foreground">Browse all available vehicles</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-8">
        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by make, model, year, VIN, or features..."
                className="pl-9"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={sort} onValueChange={(v) => setSort(v as VehicleSearchParams["sort"])}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  <SelectItem value="year-desc">Year: Newest First</SelectItem>
                  <SelectItem value="mileage-asc">Mileage: Low to High</SelectItem>
                  <SelectItem value="recently-added">Recently Added</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="w-full sm:w-auto"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Advanced Filters</span>
                  <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                    <X className="h-4 w-4 mr-1" />
                    Clear All
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Make Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Make</label>
                    <Select value={makeFilter} onValueChange={setMakeFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Makes" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Makes</SelectItem>
                        {availableMakes.map((make) => (
                          <SelectItem key={make} value={make}>{make}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Body Type Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Body Type</label>
                    <Select value={bodyTypeFilter} onValueChange={setBodyTypeFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Types</SelectItem>
                        {availableBodyTypes.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Fuel Type Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Fuel Type</label>
                    <Select value={fuelTypeFilter} onValueChange={setFuelTypeFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Fuel Types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Fuel Types</SelectItem>
                        {availableFuelTypes.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Transmission Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Transmission</label>
                    <Select value={transmissionFilter} onValueChange={setTransmissionFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Transmissions" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Transmissions</SelectItem>
                        {availableTransmissions.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Condition Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Condition</label>
                    <Select value={conditionFilter} onValueChange={setConditionFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Conditions" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Conditions</SelectItem>
                        {availableConditions.map((condition) => (
                          <SelectItem key={condition} value={condition}>{condition}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Price Range */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Price: {formatCurrency(priceRange[0])} - {formatCurrency(priceRange[1])}
                    </label>
                    <Slider
                      value={priceRange}
                      onValueChange={(value) => {
                        setPriceRange(value as [number, number]);
                        setCurrentPage(1);
                      }}
                      max={200000}
                      min={0}
                      step={5000}
                      className="w-full"
                    />
                  </div>

                  {/* Mileage Range */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Mileage: {mileageRange[0].toLocaleString()} - {mileageRange[1].toLocaleString()} mi
                    </label>
                    <Slider
                      value={mileageRange}
                      onValueChange={(value) => {
                        setMileageRange(value as [number, number]);
                        setCurrentPage(1);
                      }}
                      max={150000}
                      min={0}
                      step={5000}
                      className="w-full"
                    />
                  </div>

                  {/* Year Range */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Year: {yearRange[0]} - {yearRange[1]}
                    </label>
                    <Slider
                      value={yearRange}
                      onValueChange={(value) => {
                        setYearRange(value as [number, number]);
                        setCurrentPage(1);
                      }}
                      max={2025}
                      min={2000}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {paginatedVehicles.length} of {sortedVehicles.length} vehicles
              {query && ` matching "${query}"`}
            </p>
            <Badge variant="secondary">{sortedVehicles.length} Total Vehicles</Badge>
          </div>
        </div>

        {/* Vehicle Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="rounded-lg border bg-card p-4 animate-pulse">
                <div className="h-48 bg-muted rounded mb-4"></div>
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : paginatedVehicles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No vehicles match your search.</p>
            <Button 
              variant="outline" 
              className="mt-4" 
              onClick={clearAllFilters}
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginatedVehicles.map((vehicle: DisplayVehicle) => {
                const vehicleData: VehicleData = {
                  id: vehicle.id,
                  title: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
                  price: typeof vehicle.price === 'number' ? formatCurrency(vehicle.price) : vehicle.price || 'Contact for price',
                  condition: vehicle.status === 'available' ? 'Available' : vehicle.status,
                  description: vehicle.description || `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
                  features: vehicle.features ? Object.keys(vehicle.features) : [],
                  images: vehicle.images?.length ? vehicle.images : [sedan],
                };

                return (
                  <div key={vehicle.id} className="space-y-3 hover-scale animate-fade-in">
                    <VehicleCard vehicle={vehicleData} />
                    <div className="flex flex-col gap-2">
                      <Button variant="hero" size="sm" className="w-full" asChild>
                        <Link to={`/dealer/${slug}#contact`}>
                          Test Drive
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" className="w-full" asChild>
                        <Link to={`/dealer/${slug}#contact`}>
                          Inquire
                        </Link>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => 
                    page === 1 || 
                    page === totalPages || 
                    Math.abs(page - currentPage) <= 2
                  )
                  .map((page, index, array) => (
                    <div key={page} className="flex items-center">
                      {index > 0 && array[index - 1] !== page - 1 && (
                        <span className="px-2 text-muted-foreground">...</span>
                      )}
                      <Button
                        variant={currentPage === page ? "default" : "outline"}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    </div>
                  ))}
                
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default DealerInventory;