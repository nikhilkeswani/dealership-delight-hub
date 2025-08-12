import React from "react";
import SEO from "@/components/SEO";
import PageHeader from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Dealers: React.FC = () => {
  return (
    <main className="space-y-6">
      <SEO title="Dealers & Teams | Dealer CRM" description="Manage dealers, team members, and roles." />
      <PageHeader title="Dealers & Teams" description="Link multiple dealer accounts and manage team access" />
      <section className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Your dealers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">List of dealers you manage — coming soon.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Members</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Invite users and assign roles — coming soon.</p>
          </CardContent>
        </Card>
      </section>
    </main>
  );
};

export default Dealers;
