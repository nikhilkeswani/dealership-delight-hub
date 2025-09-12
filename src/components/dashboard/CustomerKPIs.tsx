import React from "react";
import { Users, UserPlus, DollarSign, TrendingUp } from "lucide-react";
import StatCard from "./StatCard";
import { formatCurrency } from "@/lib/format";
import { useCustomers, type Customer } from "@/hooks/useCustomers";
import { useDealer } from "@/hooks/useDealer";
import LoadingState from "@/components/common/LoadingState";

interface CustomerKPIsProps {
  data: Customer[] | undefined;
  isLoading: boolean;
  error: Error | null;
}

const CustomerKPIs: React.FC<CustomerKPIsProps> = ({ data, isLoading, error }) => {
  // Add debugging
  React.useEffect(() => {
    console.log("CustomerKPIs render:", { 
      hasData: !!data, 
      dataLength: data?.length, 
      isLoading, 
      hasError: !!error 
    });
  }, [data, isLoading, error]);

  // Calculate KPIs safely
  const kpis = React.useMemo(() => {
    if (!data) {
      return {
        totalCustomers: 0,
        totalSpent: 0,
        avgSpent: 0,
        newThisMonth: 0
      };
    }

    try {
      const totalCustomers = data.length;
      const totalSpent = data.reduce((sum, c) => sum + Number(c.total_spent ?? 0), 0);
      const avgSpent = totalCustomers > 0 ? totalSpent / totalCustomers : 0;
      
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const newThisMonth = data.filter((c) => 
        c.created_at && new Date(c.created_at) >= startOfMonth
      ).length;

      return {
        totalCustomers,
        totalSpent,
        avgSpent,
        newThisMonth
      };
    } catch (err) {
      console.error("Error calculating KPIs:", err);
      return {
        totalCustomers: 0,
        totalSpent: 0,
        avgSpent: 0,
        newThisMonth: 0
      };
    }
  }, [data]);

  // Show loading state
  if (isLoading) {
    return (
      <section aria-label="KPIs" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <LoadingState message="Loading customer statistics..." className="col-span-full" />
      </section>
    );
  }

  // Show error state
  if (error) {
    return (
      <section aria-label="KPIs" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="col-span-full text-center py-8">
          <p className="text-destructive">Error loading customer data: {error.message}</p>
        </div>
      </section>
    );
  }

  // Show KPI cards
  return (
    <section aria-label="KPIs" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Customers"
        value={kpis.totalCustomers.toString()}
        icon={Users}
        helperText={`+${kpis.newThisMonth} this month`}
        isLoading={false}
      />
      
      <StatCard
        title="New This Month"
        value={kpis.newThisMonth.toString()}
        icon={UserPlus}
        helperText="From this month"
        isLoading={false}
      />
      
      <StatCard
        title="Total Revenue"
        value={formatCurrency(kpis.totalSpent)}
        icon={DollarSign}
        helperText="Lifetime value"
        isLoading={false}
      />
      
      <StatCard
        title="Avg. Spent"
        value={formatCurrency(kpis.avgSpent)}
        icon={TrendingUp}
        helperText="Per customer"
        isLoading={false}
      />
    </section>
  );
};

export default CustomerKPIs;