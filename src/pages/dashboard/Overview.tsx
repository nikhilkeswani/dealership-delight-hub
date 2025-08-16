import React from "react";
import SEO from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, Settings, User } from "lucide-react";

const Overview: React.FC = () => {
  return (
    <>
      <SEO
        title="Welcome Hub | Dealer CRM"
        description="Choose to configure your website or open the CRM dashboard."
      />
      <main className="min-h-[70vh] flex items-center justify-center">
        <section aria-label="Choose your next step" className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-5xl w-full p-4">
          <Card className="glass-card hover-scale">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold">Configure Website</CardTitle>
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                <Settings className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Set theme, branding, and contact details for your public site.</p>
              <NavLink to="/app/onboarding" aria-label="Open Website Configurator">
                <Button variant="hero">Open Configurator</Button>
              </NavLink>
            </CardContent>
          </Card>

          <Card className="glass-card hover-scale">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold">Open CRM Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Access leads, customers, inventory, and reports.</p>
              <NavLink to="/app/dashboard" aria-label="Open CRM Dashboard">
                <Button variant="secondary">Open Dashboard</Button>
              </NavLink>
            </CardContent>
          </Card>

          <Card className="glass-card hover-scale">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold">Manage My Account</CardTitle>
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                <User className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Update profile, manage dealers & teams, billing settings, and account preferences.</p>
              <NavLink to="/app/settings/profile" aria-label="Manage Account Settings">
                <Button variant="outline">Manage Account</Button>
              </NavLink>
            </CardContent>
          </Card>
        </section>
      </main>
    </>
  );
};

export default Overview;

