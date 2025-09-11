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
      variant: "default" as const,
    },
    {
      title: "Open CRM Dashboard", 
      description: "Access leads, customers, inventory, and reports.",
      icon: LayoutDashboard,
      href: "/app/dashboard",
      buttonText: "Open Dashboard",
      variant: "secondary" as const,
    },
    {
      title: "Manage My Account",
      description: "Update profile, manage dealers & teams, billing settings, and account preferences.",
      icon: User,
      href: "/app/settings/profile",
      buttonText: "Manage Account", 
      variant: "outline" as const,
    },
  ];

  return (
    <div className="grid gap-8 md:grid-cols-3">
      {actionCards.map((card) => {
        const IconComponent = card.icon;
        return (
          <Card key={card.title} className="glass-card hover-scale group border-border/50 hover:border-primary/20 transition-all duration-300">
            <CardHeader className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center group-hover:from-primary/20 group-hover:to-primary/10 transition-all duration-300">
                <IconComponent className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
                {card.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground text-sm leading-relaxed">
                {card.description}
              </p>
              <NavLink to={card.href} className="block">
                <Button 
                  variant={card.variant} 
                  className="w-full group/btn"
                  size="lg"
                >
                  {card.buttonText}
                  <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform duration-200" />
                </Button>
              </NavLink>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default MainActionCards;