import React from "react";
import SEO from "@/components/SEO";
import PageHeader from "@/components/common/PageHeader";
import { CurrentPlanCard } from "@/components/settings/CurrentPlanCard";
import { InvoicesCard } from "@/components/settings/InvoicesCard";

const Billing: React.FC = () => {
  return (
    <main className="space-y-6">
      <SEO title="Billing | Dealer CRM" description="Manage your subscription and payment details." />
      <PageHeader title="Billing" description="View plan, invoices, and payment method" />
      <section className="grid gap-6 md:grid-cols-2">
        <CurrentPlanCard />
        <InvoicesCard />
      </section>
    </main>
  );
};

export default Billing;
