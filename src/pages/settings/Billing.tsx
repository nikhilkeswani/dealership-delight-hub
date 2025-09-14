import React, { useState } from "react";
import SEO from "@/components/SEO";
import PageHeader from "@/components/common/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CurrentPlanCard } from "@/components/settings/CurrentPlanCard";
import { InvoicesCard } from "@/components/settings/InvoicesCard";
import { PlanUpgradeCard } from "@/components/settings/PlanUpgradeCard";
import { UsageDashboard } from "@/components/settings/UsageDashboard";

const Billing: React.FC = () => {
  return (
    <main className="space-y-6">
      <SEO title="Billing | Dealer CRM" description="Manage your subscription and payment details." />
      <PageHeader 
        title="Billing & Subscription" 
        description="Manage your subscription, view usage, and billing history" 
      />
      
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
          <TabsTrigger value="plans">Plans</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <CurrentPlanCard />
            <InvoicesCard />
          </div>
        </TabsContent>

        <TabsContent value="usage" className="space-y-6">
          <UsageDashboard />
        </TabsContent>

        <TabsContent value="plans" className="space-y-6">
          <PlanUpgradeCard />
        </TabsContent>
      </Tabs>
    </main>
  );
};

export default Billing;