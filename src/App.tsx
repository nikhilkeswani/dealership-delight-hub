import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import DealerSite from "./pages/DealerSite";
 
 import Auth from "./pages/Auth";
 import ProtectedRoute from "./components/ProtectedRoute";
 import DashboardLayout from "./layouts/DashboardLayout";
 import Inventory from "./pages/dashboard/Inventory";
 import Leads from "./pages/dashboard/Leads";
 import Customers from "./pages/dashboard/Customers";
 
 const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
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
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="inventory" replace />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="leads" element={<Leads />} />
              <Route path="customers" element={<Customers />} />
            </Route>

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
