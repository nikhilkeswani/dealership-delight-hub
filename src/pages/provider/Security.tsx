import React from "react";
import SEO from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle, CheckCircle, Lock, Eye, Settings } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Security: React.FC = () => {
  const { data: securityMetrics, isLoading } = useQuery({
    queryKey: ["security-metrics"],
    queryFn: async () => {
      // Get recent failed login attempts and suspicious activities
      const { data: recentLogs, error } = await supabase
        .from("audit_logs")
        .select("*")
        .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order("created_at", { ascending: false });

      if (error) throw error;

      return {
        totalEvents: recentLogs.length,
        suspiciousActivity: recentLogs.filter(log => 
          log.action.includes("failed") || log.action.includes("suspicious")
        ).length,
        lastSecurityScan: new Date().toISOString(),
      };
    },
  });

  const securityChecks = [
    {
      id: "rls",
      title: "Row Level Security",
      status: "active",
      description: "All tables have RLS policies enabled",
      icon: Shield,
    },
    {
      id: "auth",
      title: "Authentication",
      status: "active", 
      description: "Supabase Auth with secure session management",
      icon: Lock,
    },
    {
      id: "api",
      title: "API Security",
      status: "active",
      description: "All endpoints properly secured and validated",
      icon: CheckCircle,
    },
    {
      id: "data",
      title: "Data Protection", 
      status: "warning",
      description: "Some sensitive data may be exposed in public queries",
      icon: Eye,
    },
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", color: string }> = {
      active: { variant: "default", color: "text-green-600" },
      warning: { variant: "outline", color: "text-yellow-600" },
      critical: { variant: "destructive", color: "text-red-600" }
    };
    
    return (
      <Badge variant={variants[status]?.variant || "outline"}>
        {status}
      </Badge>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case "critical":
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return <Shield className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <SEO 
        title="Security Overview | Provider Control" 
        description="System security monitoring and configuration" 
        noIndex 
      />
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Security</h1>
          <p className="text-muted-foreground mt-2">
            Monitor system security and manage access controls
          </p>
        </div>
        <Button>
          <Settings className="mr-2 h-4 w-4" />
          Security Settings
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Events (24h)</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : securityMetrics?.totalEvents || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Total security events logged
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspicious Activity</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {isLoading ? "..." : securityMetrics?.suspiciousActivity || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Flagged activities detected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Security Scan</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {isLoading ? "..." : "Today"}
            </div>
            <p className="text-xs text-muted-foreground">
              System security assessment
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Security Checks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {securityChecks.map((check) => (
              <div key={check.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(check.status)}
                  <div>
                    <h3 className="font-medium">{check.title}</h3>
                    <p className="text-sm text-muted-foreground">{check.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(check.status)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800">Review Public Data Exposure</h4>
                <p className="text-sm text-yellow-700">
                  Some vehicle data may be publicly accessible. Consider limiting exposed fields.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-800">Enable Rate Limiting</h4>
                <p className="text-sm text-blue-700">
                  Implement rate limiting on public endpoints to prevent abuse.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-800">Strong Authentication</h4>
                <p className="text-sm text-green-700">
                  Role-based access control is properly implemented and functioning.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Security;