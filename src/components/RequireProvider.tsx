import React from "react";
import { Navigate } from "react-router-dom";
import { useIsProvider } from "@/hooks/useUserRoles";

const RequireProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isProvider, isLoading } = useIsProvider();

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (!isProvider) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

export default RequireProvider;