import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NavLink } from "react-router-dom";
import { Plus, Users, Car } from "lucide-react";

const QuickActions: React.FC = () => {
  return (
    <Card className="glass-card hover-scale">
      <CardHeader>
        <CardTitle>Quick actions</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-3">
        <NavLink to="/app/leads">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add Lead
          </Button>
        </NavLink>
        <NavLink to="/app/inventory">
          <Button variant="secondary">
            <Car className="mr-2 h-4 w-4" /> Add Vehicle
          </Button>
        </NavLink>
        <NavLink to="/app/customers">
          <Button variant="outline">
            <Users className="mr-2 h-4 w-4" /> View Customers
          </Button>
        </NavLink>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
