import React from "react";
import { Badge } from "@/components/ui/badge";

export type StatusKind =
  | "new"
  | "contacted"
  | "qualified"
  | "converted"
  | "lost"
  | "active"
  | "inactive"
  | string;

type Props = {
  status?: StatusKind | null;
  className?: string;
};

const colorByStatus = (status: string) => {
  const s = status.toLowerCase();
  if (["new"].includes(s)) return "bg-primary/10 text-primary border-primary/20";
  if (["contacted", "qualified", "active"].includes(s))
    return "bg-secondary/20 text-secondary-foreground border-secondary/30";
  if (["converted"].includes(s)) return "bg-green-500/10 text-green-600 border-green-500/20 dark:text-green-400";
  if (["lost", "inactive"].includes(s)) return "bg-destructive/10 text-destructive border-destructive/20";
  return "bg-muted text-muted-foreground border-muted-foreground/20";
};

const StatusBadge: React.FC<Props> = ({ status, className }) => {
  if (!status) return null;
  return <Badge className={`${colorByStatus(status)} ${className ?? ""}`}>{status}</Badge>;
};

export default StatusBadge;
