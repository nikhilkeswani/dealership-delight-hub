import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface RetryButtonProps {
  onRetry: () => void;
  loading?: boolean;
  children?: React.ReactNode;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

const RetryButton: React.FC<RetryButtonProps> = ({
  onRetry,
  loading = false,
  children = "Try Again",
  variant = "outline",
  size = "default",
  className
}) => {
  return (
    <Button
      onClick={onRetry}
      disabled={loading}
      variant={variant}
      size={size}
      className={cn("gap-2", className)}
    >
      <RefreshCw className={cn(
        "h-4 w-4",
        loading && "animate-spin"
      )} />
      {children}
    </Button>
  );
};

export default RetryButton;