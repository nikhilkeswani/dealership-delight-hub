import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingStateProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({ 
  message = "Loading...", 
  size = "md",
  className 
}) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6", 
    lg: "h-8 w-8"
  };

  const containerClasses = {
    sm: "py-2",
    md: "py-4",
    lg: "py-8"
  };

  return (
    <div className={cn(
      "flex items-center justify-center text-muted-foreground",
      containerClasses[size],
      className
    )}>
      <Loader2 className={cn("animate-spin mr-2", sizeClasses[size])} />
      <span className="text-sm">{message}</span>
    </div>
  );
};

export default LoadingState;