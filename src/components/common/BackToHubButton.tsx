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
      variant="secondary" 
      size="sm" 
      onClick={handleClick}
      className={`flex items-center gap-2 ${className}`}
    >
      <ArrowLeft className="h-4 w-4" />
      Back to Hub
    </Button>
  );
};

export default BackToHubButton;