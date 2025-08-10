import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type StatCardProps = {
  title: string;
  value: string | number;
  icon: LucideIcon;
  helperText?: string;
  isLoading?: boolean;
};

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, helperText, isLoading }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
        {helperText && (
          <p className="text-xs text-muted-foreground mt-1">{helperText}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard;
