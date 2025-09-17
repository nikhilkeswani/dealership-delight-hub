import React, { useEffect } from "react";
import SEO from "@/components/SEO";
import PageHeader from "@/components/common/PageHeader";
import MainActionCards from "@/components/dashboard/MainActionCards";
import { useDealer } from "@/hooks/useDealer";
import LoadingState from "@/components/common/LoadingState";
import CacheBuster from "@/components/common/CacheBuster";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { robustSignOut } from "@/lib/auth";

const AppLanding: React.FC = () => {
  const { data: dealer, isLoading } = useDealer();

  // Debug logging to track when this component renders
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('AppLanding rendered:', {
        path: window.location.pathname, 
        dealer: dealer?.business_name || 'No dealer',
        isLoading 
      });
    }
  }, [dealer, isLoading]);

  return (
    <>
      <CacheBuster />
      <SEO
        title="Dashboard – DealerDelight"
        description="Your dealer management hub. Configure your website, access CRM tools, and manage your account."
      />
      
      {/* Header with logout button */}
      <header className="flex justify-end p-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={robustSignOut}
          className="flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </header>
      
      <main className="space-y-8 animate-fade-in" key="app-landing">
        {/* Welcome Section */}
        <div className="text-center space-y-4 py-8">
          {isLoading ? (
            <div className="space-y-4">
              <div className="h-8 bg-muted animate-pulse rounded-lg max-w-md mx-auto" />
              <div className="h-6 bg-muted animate-pulse rounded-lg max-w-2xl mx-auto" />
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-bold">
                Welcome back{dealer?.business_name ? `, ${dealer.business_name}` : ''}! 👋
              </h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Manage your dealership with our comprehensive platform. Configure your website, track leads, 
                manage inventory, and grow your business all in one place.
              </p>
            </>
          )}
        </div>

        {/* Main Actions */}
        <section aria-label="Main Actions">
          <MainActionCards key="main-action-cards" />
        </section>
      </main>
    </>
  );
};

export default AppLanding;