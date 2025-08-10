import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

export type MonthlySalesPoint = { month: string; total: number };

type Props = {
  data: MonthlySalesPoint[];
};

const MonthlySalesChart: React.FC<Props> = ({ data }) => {
  return (
    <Card className="hover-scale">
      <CardHeader>
        <CardTitle>Monthly Sales (6 months)</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{ sales: { label: "Sales", color: "hsl(var(--primary))" } }}
          className="w-full"
        >
          <AreaChart data={data} margin={{ left: 12, right: 12 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="month" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} width={40} />
            <Area type="monotone" dataKey="total" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.15)" />
            <ChartTooltip content={<ChartTooltipContent nameKey="sales" />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default MonthlySalesChart;
