import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BackToHubButtonProps {
  className?: string;
}

const BackToHubButton: React.FC<BackToHubButtonProps> = ({ className }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/app/overview");
  };

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={handleClick}
      className={`flex items-center gap-2 hover:bg-muted hover:text-foreground ${className}`}
    >
      <ArrowLeft className="h-4 w-4" />
      Back to Hub
    </Button>
  );
};

export default BackToHubButton;