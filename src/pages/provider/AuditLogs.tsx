import React, { useState } from "react";
import SEO from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, FileText, Activity } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const AuditLogs: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: auditLogs = [], isLoading } = useQuery({
    queryKey: ["audit-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      return data;
    },
  });

  const filteredLogs = auditLogs.filter(log =>
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.resource_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getActionBadge = (action: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      create: "default",
      update: "secondary",
      delete: "destructive",
      grant_free_months: "outline",
      login: "secondary"
    };
    
    const baseAction = action.split("_")[0];
    return <Badge variant={variants[action] || variants[baseAction] || "outline"}>{action}</Badge>;
  };

  const getResourceIcon = (resourceType: string) => {
    switch (resourceType) {
      case "dealer":
        return "🏢";
      case "subscription":
        return "💳";
      case "user":
        return "👤";
      case "lead":
        return "📋";
      default:
        return "📄";
    }
  };

  return (
    <div className="space-y-6">
      <SEO 
        title="Audit Logs | Provider Control" 
        description="System audit logs and activity tracking" 
        noIndex 
      />
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Audit Logs</h1>
          <p className="text-muted-foreground mt-2">
            Track all system activities and changes
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Activity className="h-5 w-5 text-green-500" />
          <span className="text-sm text-muted-foreground">Live monitoring</span>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by action or resource type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4 text-muted-foreground">Loading audit logs...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Resource</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No audit logs found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-sm">
                        {new Date(log.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {log.user_id ? `${log.user_id.slice(0, 8)}...` : "System"}
                      </TableCell>
                      <TableCell>{getActionBadge(log.action)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{getResourceIcon(log.resource_type)}</span>
                          <span>{log.resource_type}</span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-md">
                        <div className="text-sm text-muted-foreground">
                          {log.details && typeof log.details === 'object' ? (
                            <div className="space-y-1">
                              {Object.entries(log.details as Record<string, any>).map(([key, value]) => (
                                <div key={key} className="flex justify-between">
                                  <span className="font-medium">{key}:</span>
                                  <span className="truncate">{String(value)}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            String(log.details) || "No additional details"
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditLogs;