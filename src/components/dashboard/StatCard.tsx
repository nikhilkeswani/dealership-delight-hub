import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

type StatCardProps = {
  title: string;
  value: string | number;
  icon: LucideIcon;
  helperText?: string;
  isLoading?: boolean;
  delta?: string;
  trend?: "up" | "down";
};

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, helperText, isLoading, delta, trend }) => {
  return (
    <Card className="hover-scale transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <div className="flex items-baseline gap-2">
            <div className="text-2xl font-bold">{value}</div>
            {delta && (
              <div className={`flex items-center text-xs ${trend === "down" ? "text-destructive" : "text-primary"}`}>
                {trend === "down" ? (
                  <ArrowDownRight className="mr-1 h-4 w-4" />
                ) : (
                  <ArrowUpRight className="mr-1 h-4 w-4" />
                )}
                {delta}
              </div>
            )}
          </div>
        )}
        {helperText && (
          <p className="text-xs text-muted-foreground mt-1">{helperText}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard;
