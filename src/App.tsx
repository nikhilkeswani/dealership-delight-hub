import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import React, { lazy, Suspense, useEffect } from "react";
import ProtectedRoute from "./components/ProtectedRoute";
import RequireDealer from "./components/RequireDealer";
import ErrorBoundary from "./components/common/ErrorBoundary";
import { getSubdomainInfo } from "./utils/subdomain";

const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const DealerSite = lazy(() => import("./pages/DealerSite"));
const DealerInventory = lazy(() => import("./pages/DealerInventory"));
const Auth = lazy(() => import("./pages/Auth"));
const Configure = lazy(() => import("./pages/Configure"));
const DashboardLayout = lazy(() => import("./layouts/DashboardLayout"));
const SettingsLayout = lazy(() => import("./layouts/SettingsLayout"));
const AppLanding = lazy(() => import("./pages/AppLanding"));
const DashboardHome = lazy(() => import("./pages/dashboard/DashboardHome"));
const Inventory = lazy(() => import("./pages/dashboard/Inventory"));
const Leads = lazy(() => import("./pages/dashboard/Leads"));
const Customers = lazy(() => import("./pages/dashboard/Customers"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const SettingsProfile = lazy(() => import("./pages/settings/Profile"));
const SettingsDealers = lazy(() => import("./pages/settings/Dealers"));
const SettingsBilling = lazy(() => import("./pages/settings/Billing"));
const ProviderLayout = lazy(() => import("./layouts/ProviderLayout"));
const ProviderDashboard = lazy(() => import("./pages/provider/Dashboard"));
const ProviderDealers = lazy(() => import("./pages/provider/Dealers"));
const ProviderUsers = lazy(() => import("./pages/provider/Users"));
const ProviderAnalytics = lazy(() => import("./pages/provider/Analytics"));
const ProviderSubscriptions = lazy(() => import("./pages/provider/Subscriptions"));
const ProviderAuditLogs = lazy(() => import("./pages/provider/AuditLogs"));
const ProviderSecurity = lazy(() => import("./pages/provider/Security"));
const ProviderSettings = lazy(() => import("./pages/provider/Settings"));
const RequireProvider = lazy(() => import("./components/RequireProvider"));

const queryClient = new QueryClient();

const SubdomainRouter = () => {
  useEffect(() => {
    const subdomainInfo = getSubdomainInfo();
    
    // If we're on a subdomain, redirect to the dealer page
    if (subdomainInfo.isSubdomain && subdomainInfo.dealerSlug) {
      const currentPath = window.location.pathname;
      
      // Don't redirect if we're already on a dealer page
      if (!currentPath.startsWith('/dealer/')) {
        // Redirect to the dealer page with the current path
        const newPath = `/dealer/${subdomainInfo.dealerSlug}${currentPath === '/' ? '' : currentPath}`;
        window.history.replaceState(null, '', newPath);
      }
    }
  }, []);

  return null;
};

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ErrorBoundary>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <SubdomainRouter />
            <Suspense fallback={<div className="p-8">Loading...</div>}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/signup" element={<Navigate to="/auth" replace />} />
                <Route path="/dealer/:slug" element={<DealerSite />} />
                <Route path="/dealer/:slug/inventory" element={<DealerInventory />} />

                {/* Hub routes without dashboard layout */}
                <Route
                  element={
                    <ProtectedRoute>
                      <RequireDealer>
                        <Outlet />
                      </RequireDealer>
                    </ProtectedRoute>
                  }
                >
                  <Route path="/app" element={<AppLanding />} />
                  <Route path="/app/onboarding" element={<Onboarding />} />
                  <Route path="/app/configure" element={<Configure />} />
                </Route>

                {/* Dashboard routes with layout */}
                <Route
                  element={
                    <ProtectedRoute>
                      <RequireDealer>
                        <DashboardLayout />
                      </RequireDealer>
                    </ProtectedRoute>
                  }
                >
                  <Route path="/app/dashboard" element={<DashboardHome />} />
                  <Route path="/app/inventory" element={<Inventory />} />
                  <Route path="/app/leads" element={<Leads />} />
                  <Route path="/app/customers" element={<Customers />} />
                </Route>

                {/* Settings routes with separate layout */}
                <Route
                  element={
                    <ProtectedRoute>
                      <RequireDealer>
                        <SettingsLayout />
                      </RequireDealer>
                    </ProtectedRoute>
                  }
                >
                  <Route path="/app/settings/profile" element={<SettingsProfile />} />
                  <Route path="/app/settings/dealers" element={<SettingsDealers />} />
                  <Route path="/app/settings/billing" element={<SettingsBilling />} />
                </Route>

                {/* Provider routes with separate layout */}
                <Route
                  element={
                    <ProtectedRoute>
                      <RequireProvider>
                        <ProviderLayout />
                      </RequireProvider>
                    </ProtectedRoute>
                  }
                >
                  <Route path="/provider" element={<ProviderDashboard />} />
                  <Route path="/provider/dealers" element={<ProviderDealers />} />
                  <Route path="/provider/users" element={<ProviderUsers />} />
                  <Route path="/provider/analytics" element={<ProviderAnalytics />} />
                  <Route path="/provider/subscriptions" element={<ProviderSubscriptions />} />
                  <Route path="/provider/audit" element={<ProviderAuditLogs />} />
                  <Route path="/provider/security" element={<ProviderSecurity />} />
                  <Route path="/provider/settings" element={<ProviderSettings />} />
                </Route>

                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </ErrorBoundary>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
