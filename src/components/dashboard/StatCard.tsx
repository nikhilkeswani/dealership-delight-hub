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
  // Add defensive checks and debugging
  React.useEffect(() => {
    console.log("StatCard render:", { title, value, isLoading, hasIcon: !!Icon });
  }, [title, value, isLoading, Icon]);

  // Defensive checks
  if (!title || !Icon) {
    console.warn("StatCard missing required props:", { title, hasIcon: !!Icon });
    return null;
  }

  return (
    <Card className="glass-card hover-scale transition-all duration-300 group border-0 shadow-lg hover:shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
          {title}
        </CardTitle>
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center group-hover:from-primary/20 group-hover:to-primary/10 transition-all duration-300">
          <Icon className="h-6 w-6 text-primary group-hover:scale-110 transition-transform duration-300" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
        ) : (
          <>
            <div className="flex items-baseline gap-3">
              <div className="text-3xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                {value ?? "—"}
              </div>
              {delta && (
                <div className={`flex items-center text-sm font-medium ${
                  trend === "down" 
                    ? "text-destructive bg-destructive/10 px-2 py-1 rounded-full" 
                    : "text-primary bg-primary/10 px-2 py-1 rounded-full"
                }`}>
                  {trend === "down" ? (
                    <ArrowDownRight className="mr-1 h-4 w-4" />
                  ) : (
                    <ArrowUpRight className="mr-1 h-4 w-4" />
                  )}
                  {delta}
                </div>
              )}
            </div>
            {helperText && (
              <p className="text-sm text-muted-foreground group-hover:text-muted-foreground/80 transition-colors">
                {helperText}
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard;
