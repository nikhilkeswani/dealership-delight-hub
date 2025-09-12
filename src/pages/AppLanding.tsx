import React from "react";
import SEO from "@/components/SEO";
import PageHeader from "@/components/common/PageHeader";
import MainActionCards from "@/components/dashboard/MainActionCards";
import { useDealer } from "@/hooks/useDealer";
import LoadingState from "@/components/common/LoadingState";

const AppLanding: React.FC = () => {
  const { data: dealer, isLoading } = useDealer();

  return (
    <>
      <SEO
        title="Dashboard – DealerDelight"
        description="Your dealer management hub. Configure your website, access CRM tools, and manage your account."
      />
      
      <main className="space-y-8 animate-fade-in">
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
          <MainActionCards />
        </section>
      </main>
    </>
  );
};

export default AppLanding;