import React from "react";
import SEO from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NavLink } from "react-router-dom";
import PageHeader from "@/components/common/PageHeader";
import { LayoutDashboard, Settings } from "lucide-react";

const Overview: React.FC = () => {
  return (
    <>
      <SEO
        title="Welcome Hub | Dealer CRM"
        description="Choose to configure your website or open the CRM dashboard."
      />
      <main className="space-y-6 animate-fade-in">
        <PageHeader
          title="Welcome"
          description="Pick where you'd like to start"
        />

        <section aria-label="Choose your next step" className="grid gap-4 md:grid-cols-2">
          <Card className="glass-card hover-scale">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium">Configure your Website</CardTitle>
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                <Settings className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Customize your public site theme, branding, and contact details.</p>
              <NavLink to="/app/onboarding">
                <Button variant="hero">Open Configurator</Button>
              </NavLink>
            </CardContent>
          </Card>

          <Card className="glass-card hover-scale">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium">CRM Dashboard</CardTitle>
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                <LayoutDashboard className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Track leads, customers, and sales performance.</p>
              <NavLink to="/app/dashboard">
                <Button variant="secondary">Open Dashboard</Button>
              </NavLink>
            </CardContent>
          </Card>
        </section>
      </main>
    </>
  );
};

export default Overview;

