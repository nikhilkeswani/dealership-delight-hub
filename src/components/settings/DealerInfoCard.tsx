import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Mail, Phone, MapPin, Edit } from "lucide-react";
import { useDealer } from "@/hooks/useDealer";
import { formatDate } from "@/lib/format";

export const DealerInfoCard: React.FC = () => {
  const { data: dealer, isLoading } = useDealer();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Dealer Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
            <div className="h-4 bg-muted rounded w-1/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!dealer) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Dealer Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No dealer profile found</p>
        </CardContent>
      </Card>
    );
  }

  const tierColor = dealer.tier === "enterprise" 
    ? "bg-yellow-100 text-yellow-800" 
    : dealer.tier === "premium" 
    ? "bg-blue-100 text-blue-800" 
    : "bg-gray-100 text-gray-800";

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Dealer Information
        </CardTitle>
        <Button variant="outline" size="sm" disabled>
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">{dealer.business_name}</h3>
          <Badge className={tierColor}>
            {dealer.tier.charAt(0).toUpperCase() + dealer.tier.slice(1)}
          </Badge>
        </div>

        <div className="grid gap-3">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{dealer.contact_email}</span>
          </div>

          {dealer.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{dealer.phone}</span>
            </div>
          )}

          {(dealer.address || dealer.city || dealer.state) && (
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="text-sm">
                {dealer.address && <div>{dealer.address}</div>}
                {(dealer.city || dealer.state) && (
                  <div>
                    {dealer.city}{dealer.city && dealer.state && ", "}{dealer.state} {dealer.zip_code}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="pt-2 border-t">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Status:</span>
            <span className={dealer.is_active ? "text-green-600" : "text-red-600"}>
              {dealer.is_active ? "Active" : "Inactive"}
            </span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-muted-foreground">Member since:</span>
            <span>{formatDate(dealer.created_at)}</span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Dealer profile editing coming soon
        </p>
      </CardContent>
    </Card>
  );
};