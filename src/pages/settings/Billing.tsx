import React from "react";
import SEO from "@/components/SEO";
import PageHeader from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Billing: React.FC = () => {
  return (
    <main className="space-y-6">
      <SEO title="Billing | Dealer CRM" description="Manage your subscription and payment details." />
      <PageHeader title="Billing" description="View plan, invoices, and payment method" />
      <section className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Current plan and usage — coming soon.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Download invoices — coming soon.</p>
          </CardContent>
        </Card>
      </section>
    </main>
  );
};

export default Billing;
