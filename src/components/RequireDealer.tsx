import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useDealer } from "@/hooks/useDealer";

const RequireDealer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: dealer, isLoading } = useDealer();
  const location = useLocation();

  // Allow access to onboarding and overview routes without a dealer profile
  const pathname = location.pathname;
  const isOnboarding = pathname.includes("/app/onboarding");
  const isHub = pathname === "/app";

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-muted-foreground">
        Loading...
      </div>
    );
  }

  // If dealer profile exists but user is on onboarding, redirect into the app
  if (dealer && isOnboarding) {
    return <Navigate to="/app" replace />;
  }

  if (!dealer && !(isOnboarding || isHub)) {
    return <Navigate to="/app/onboarding" replace />;
  }

  return <>{children}</>;
};

export default RequireDealer;
