import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NavLink } from "react-router-dom";
import { Plus, Users, Car } from "lucide-react";

const QuickActions: React.FC = () => {
  return (
    <Card className="glass-card hover-scale transition-all duration-300 border-0 shadow-lg hover:shadow-xl">
      <CardHeader className="pb-6">
        <CardTitle className="text-xl font-semibold text-center">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 sm:grid-cols-3">
          <NavLink to="/app/leads" className="group">
            <div className="flex flex-col items-center p-6 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 hover:from-primary/10 hover:to-primary/20 transition-all duration-300 hover:scale-105">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Plus className="h-6 w-6 text-primary" />
              </div>
              <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                Add Lead
              </span>
              <span className="text-sm text-muted-foreground mt-1 text-center">
                Create new sales lead
              </span>
            </div>
          </NavLink>
          
          <NavLink to="/app/inventory" className="group">
            <div className="flex flex-col items-center p-6 rounded-xl bg-gradient-to-br from-secondary/5 to-secondary/10 hover:from-secondary/10 hover:to-secondary/20 transition-all duration-300 hover:scale-105">
              <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center mb-4 group-hover:bg-secondary/20 transition-colors">
                <Car className="h-6 w-6 text-secondary-foreground" />
              </div>
              <span className="font-medium text-foreground group-hover:text-secondary-foreground transition-colors">
                Add Vehicle
              </span>
              <span className="text-sm text-muted-foreground mt-1 text-center">
                Manage inventory
              </span>
            </div>
          </NavLink>
          
          <NavLink to="/app/customers" className="group">
            <div className="flex flex-col items-center p-6 rounded-xl bg-gradient-to-br from-accent/5 to-accent/10 hover:from-accent/10 hover:to-accent/20 transition-all duration-300 hover:scale-105">
              <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                <Users className="h-6 w-6 text-accent-foreground" />
              </div>
              <span className="font-medium text-foreground group-hover:text-accent-foreground transition-colors">
                View Customers
              </span>
              <span className="text-sm text-muted-foreground mt-1 text-center">
                Customer database
              </span>
            </div>
          </NavLink>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
