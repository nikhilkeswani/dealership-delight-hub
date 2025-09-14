import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Crown } from "lucide-react";
import { Link } from "react-router-dom";

interface UpgradePromptProps {
  title?: string;
  description: string;
  className?: string;
}

export function UpgradePrompt({ 
  title = "Premium Feature", 
  description, 
  className 
}: UpgradePromptProps) {
  return (
    <Alert className={`border-amber-200 bg-amber-50 ${className}`}>
      <Crown className="h-4 w-4 text-amber-600" />
      <AlertDescription className="text-amber-800">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">{title}</p>
            <p className="text-sm">{description}</p>
          </div>
          <Button asChild variant="outline" size="sm" className="ml-4">
            <Link to="/settings/billing">Upgrade</Link>
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}