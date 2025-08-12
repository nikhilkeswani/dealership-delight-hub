import React from "react";
import SEO from "@/components/SEO";
import PageHeader from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Profile: React.FC = () => {
  return (
    <main className="space-y-6">
      <SEO title="Profile & Account | Dealer CRM" description="Manage your personal details and account settings." />
      <PageHeader title="Profile & Account" description="Update your personal information and preferences" />
      <section className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Personal details</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Form coming soon — name, email, password.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Configure email alerts and reminders.</p>
          </CardContent>
        </Card>
      </section>
    </main>
  );
};

export default Profile;
