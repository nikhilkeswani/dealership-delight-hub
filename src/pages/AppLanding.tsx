import React, { useEffect } from "react";
import SEO from "@/components/SEO";
import PageHeader from "@/components/common/PageHeader";
import MainActionCards from "@/components/dashboard/MainActionCards";
import { useDealer } from "@/hooks/useDealer";
import LoadingState from "@/components/common/LoadingState";
import CacheBuster from "@/components/common/CacheBuster";
import { robustSignOut } from "@/lib/auth";
import { LogOut, Settings, LayoutDashboard, ChevronDown } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { NavLink } from "react-router-dom";

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
      
      {/* Top-right logout dropdown */}
      <div className="fixed top-4 right-6 z-50">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button 
              aria-label="Open user menu" 
              className="rounded-full focus:outline-none focus:ring-2 focus:ring-ring/50 hover-scale flex items-center gap-2 bg-card/50 backdrop-blur px-3 py-2 border shadow-sm hover:bg-card/80 transition-colors"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                  {dealer?.business_name?.charAt(0)?.toUpperCase() || "DC"}
                </AvatarFallback>
              </Avatar>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 glass-card">
            <DropdownMenuLabel>
              {dealer?.business_name || "My Account"}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <NavLink to="/app/dashboard" className="flex items-center">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard
              </NavLink>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <NavLink to="/app/settings/profile" className="flex items-center">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </NavLink>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={robustSignOut} className="flex items-center text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
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