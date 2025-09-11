import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NavLink } from "react-router-dom";
import { Settings, LayoutDashboard, User, ArrowRight } from "lucide-react";

const MainActionCards: React.FC = () => {
  const actionCards = [
    {
      title: "Configure Website",
      description: "Set up your dealer website, customize branding, and go live.",
      icon: Settings,
      href: "/app/configure",
      buttonText: "Configure Website",
    },
    {
      title: "Open CRM Dashboard", 
      description: "Access leads, customers, inventory, and reports.",
      icon: LayoutDashboard,
      href: "/app/dashboard",
      buttonText: "Open Dashboard",
    },
    {
      title: "Manage My Account",
      description: "Update profile, manage dealers & teams, billing settings, and account preferences.",
      icon: User,
      href: "/app/settings/profile",
      buttonText: "Manage Account",
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {actionCards.map((card) => {
        const IconComponent = card.icon;
        return (
          <Card key={card.title} className="p-6 hover-scale transition-all duration-300">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <IconComponent className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">{card.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {card.description}
                </p>
              </div>
              <NavLink to={card.href} className="block">
                <Button className="w-full" size="lg">
                  {card.buttonText}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </NavLink>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default MainActionCards;