import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Pie, PieChart, Cell } from "recharts";

export type LeadsStatusDatum = { name: string; value: number };

type Props = {
  data: LeadsStatusDatum[];
};

const colorMap: Record<string, string> = {
  new: "hsl(var(--primary))",
  contacted: "hsl(var(--secondary))",
  qualified: "hsl(var(--accent))",
  converted: "hsl(var(--foreground))",
  lost: "hsl(var(--muted-foreground))",
};

const LeadsStatusDonut: React.FC<Props> = ({ data }) => {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <Card className="hover-scale">
      <CardHeader>
        <CardTitle>Leads by Status</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{}} className="w-full">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80}>
              {data.map((entry, idx) => (
                <Cell key={`cell-${idx}`} fill={colorMap[entry.name] || "hsl(var(--muted-foreground))"} />
              ))}
            </Pie>
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent nameKey="name" />} />
          </PieChart>
        </ChartContainer>
        <div className="mt-2 text-center text-xs text-muted-foreground">Total: {total}</div>

      </CardContent>
    </Card>
  );
};

export default LeadsStatusDonut;
