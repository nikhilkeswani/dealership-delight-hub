import React from "react";
import SEO from "@/components/SEO";
import PageHeader from "@/components/common/PageHeader";
import MainActionCards from "@/components/dashboard/MainActionCards";
import QuickActions from "@/components/dashboard/QuickActions";
import { useDealer } from "@/hooks/useDealer";
import LoadingState from "@/components/common/LoadingState";

const AppLanding: React.FC = () => {
  const { data: dealer, isLoading } = useDealer();

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <>
      <SEO
        title="Dashboard – DealerDelight"
        description="Your dealer management hub. Configure your website, access CRM tools, and manage your account."
      />
      
      <main className="space-y-8 animate-fade-in">
        {/* Welcome Section */}
        <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/5 via-primary/3 to-background p-8 lg:p-12">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-50" />
          <div className="relative z-10 max-w-3xl">
            <h1 className="text-3xl lg:text-4xl font-bold mb-4">
              Welcome back{dealer?.business_name ? `, ${dealer.business_name}` : ''}! 👋
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Manage your dealership with our comprehensive platform. Configure your website, track leads, 
              manage inventory, and grow your business all in one place.
            </p>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-primary/10 blur-2xl" />
          <div className="absolute -bottom-4 -left-4 w-24 h-24 rounded-full bg-primary/5 blur-xl" />
        </div>

        {/* Main Action Cards */}
        <section aria-label="Main Actions" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Get Started</h2>
            <p className="text-sm text-muted-foreground">Choose an action to begin</p>
          </div>
          <MainActionCards />
        </section>

        {/* Quick Actions */}
        <section aria-label="Quick Actions" className="space-y-6">
          <h2 className="text-2xl font-semibold">Quick Actions</h2>
          <QuickActions />
        </section>
      </main>
    </>
  );
};

export default AppLanding;