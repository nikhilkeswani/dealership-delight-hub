import React from "react";
import SEO from "@/components/SEO";
import { DealerInfoCard } from "@/components/settings/DealerInfoCard";
import { TeamMembersCard } from "@/components/settings/TeamMembersCard";

const Dealers: React.FC = () => {
  return (
    <main className="space-y-6">
      <SEO title="Dealers & Teams | Dealer CRM" description="Manage dealers, team members, and roles." />
      <section className="grid gap-6 md:grid-cols-2">
        <DealerInfoCard />
        <TeamMembersCard />
      </section>
    </main>
  );
};

export default Dealers;
