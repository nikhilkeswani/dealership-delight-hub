import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import React, { lazy, Suspense } from "react";
import ProtectedRoute from "./components/ProtectedRoute";
import RequireDealer from "./components/RequireDealer";

const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const DealerSite = lazy(() => import("./pages/DealerSite"));
const Auth = lazy(() => import("./pages/Auth"));
const DashboardLayout = lazy(() => import("./layouts/DashboardLayout"));
const Overview = lazy(() => import("./pages/dashboard/Overview"));
const Inventory = lazy(() => import("./pages/dashboard/Inventory"));
const Leads = lazy(() => import("./pages/dashboard/Leads"));
const Customers = lazy(() => import("./pages/dashboard/Customers"));
const Onboarding = lazy(() => import("./pages/Onboarding"));

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<div className="p-8">Loading...</div>}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/signup" element={<Navigate to="/auth" replace />} />
              <Route path="/dealer/:slug" element={<DealerSite />} />

              {/* Protected Dealer App */}
              <Route
                path="/app/*"
                element={
                  <ProtectedRoute>
                    <RequireDealer>
                      <DashboardLayout />
                    </RequireDealer>
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="overview" replace />} />
                <Route path="overview" element={<Overview />} />
                <Route path="inventory" element={<Inventory />} />
                <Route path="leads" element={<Leads />} />
                <Route path="customers" element={<Customers />} />
                <Route path="onboarding" element={<Onboarding />} />
              </Route>

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
