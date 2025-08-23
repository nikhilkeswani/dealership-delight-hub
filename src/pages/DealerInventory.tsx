import { useParams, Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import VehicleCard, { VehicleData } from "@/components/VehicleCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Search } from "lucide-react";
import { useState } from "react";
import { usePublicDealer } from "@/hooks/usePublicDealer";
import { usePublicVehicles } from "@/hooks/usePublicVehicles";
import { formatCurrency } from "@/lib/format";
import sedan from "@/assets/cars/sedan.jpg";

const DealerInventory = () => {
  const { slug } = useParams();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"relevance" | "price-asc" | "price-desc">("relevance");
  const [currentPage, setCurrentPage] = useState(1);
  const vehiclesPerPage = 12;

  const { data: publicDealer } = usePublicDealer(slug);
  const { data: publicVehicles, isLoading } = usePublicVehicles(publicDealer?.id);

  const dealerName = publicDealer?.business_name || (slug || "demo-motors")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());

  const brandInitials = (dealerName || "").split(" ").slice(0,2).map(w=>w[0]).join("").toUpperCase() || "DL";

  // Filter and sort vehicles
  const filteredVehicles = (publicVehicles || []).filter((v: any) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    const vehicleTitle = `${v.year} ${v.make} ${v.model}`;
    return vehicleTitle.toLowerCase().includes(q) || 
           (v.description && v.description.toLowerCase().includes(q));
  });

  const parsePrice = (price: any) => {
    if (typeof price === 'number') return price;
    const n = Number(String(price ?? "").replace(/[^0-9.]/g, ""));
    return isNaN(n) ? 0 : n;
  };

  const sortedVehicles = [...filteredVehicles].sort((a, b) => {
    if (sort === "price-asc") return parsePrice(a.price) - parsePrice(b.price);
    if (sort === "price-desc") return parsePrice(b.price) - parsePrice(a.price);
    return 0;
  });

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
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by make, model, year..."
                className="pl-9"
              />
            </div>
            <Select value={sort} onValueChange={(v) => setSort(v as any)}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

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
              onClick={() => {setQuery(""); setCurrentPage(1);}}
            >
              Clear Search
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginatedVehicles.map((vehicle: any) => {
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