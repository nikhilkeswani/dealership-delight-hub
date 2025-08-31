import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

export type SalesPipelinePoint = { stage: string; count: number; value: number };

type Props = {
  data: SalesPipelinePoint[];
};

const SalesPipelineChart: React.FC<Props> = ({ data }) => {
  return (
    <Card className="hover-scale">
      <CardHeader>
        <CardTitle>Sales Pipeline</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{ 
            count: { label: "Deals", color: "hsl(var(--primary))" },
          }}
          className="w-full"
        >
          <BarChart data={data} margin={{ left: 12, right: 12 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis 
              dataKey="stage" 
              tickLine={false} 
              axisLine={false}
              tick={{ fontSize: 12 }}
            />
            <YAxis tickLine={false} axisLine={false} width={40} />
            <Bar 
              dataKey="count" 
              fill="hsl(var(--primary))" 
              radius={[4, 4, 0, 0]}
            />
            <ChartTooltip 
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                const data = payload[0].payload;
                return (
                  <div className="bg-popover border rounded-lg p-3 shadow-lg">
                    <p className="font-medium capitalize">{label.replace('_', ' ')}</p>
                    <p className="text-sm text-muted-foreground">
                      {data.count} deals • ${data.value?.toLocaleString() || 0}
                    </p>
                  </div>
                );
              }}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default SalesPipelineChart;