import React, { useState } from "react";
import SEO from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useProvider } from "@/hooks/useProvider";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Settings as SettingsIcon, Building, Mail, Bell, Shield } from "lucide-react";

const Settings: React.FC = () => {
  const { data: provider } = useProvider();
  const queryClient = useQueryClient();
  
  const [companyName, setCompanyName] = useState(provider?.company_name || "");
  const [contactEmail, setContactEmail] = useState(provider?.contact_email || "");
  const [notifications, setNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);

  const updateProviderMutation = useMutation({
    mutationFn: async (values: { company_name?: string; contact_email?: string }) => {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user?.id;
      if (!userId) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("providers")
        .update(values)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["provider"] });
      toast.success("Settings updated successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to update settings: ${error.message}`);
    },
  });

  const handleSaveProfile = () => {
    updateProviderMutation.mutate({
      company_name: companyName,
      contact_email: contactEmail,
    });
  };

  return (
    <div className="space-y-6">
      <SEO 
        title="Provider Settings | Control Center" 
        description="Manage your provider account settings and preferences" 
        noIndex 
      />
      
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your provider account and system preferences
        </p>
      </div>

      <div className="grid gap-6">
        {/* Provider Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building className="mr-2 h-5 w-5" />
              Provider Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="company">Company Name</Label>
                <Input
                  id="company"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Your company name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Contact Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="contact@yourcompany.com"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button 
                onClick={handleSaveProfile}
                disabled={updateProviderMutation.isPending}
              >
                {updateProviderMutation.isPending ? "Saving..." : "Save Profile"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="mr-2 h-5 w-5" />
              Notification Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Push Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive real-time notifications for important events
                </p>
              </div>
              <Switch
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Email Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Get email notifications for new dealers and critical events
                </p>
              </div>
              <Switch
                checked={emailAlerts}
                onCheckedChange={setEmailAlerts}
              />
            </div>
          </CardContent>
        </Card>

        {/* System Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <SettingsIcon className="mr-2 h-5 w-5" />
              System Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label className="text-sm font-medium">Provider Status</Label>
                <div className="mt-1">
                  <Badge variant="default">Active</Badge>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Account Created</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {provider?.created_at ? new Date(provider.created_at).toLocaleDateString() : "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="mr-2 h-5 w-5" />
              Security Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Enable 2FA
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Label>API Access Keys</Label>
                  <p className="text-sm text-muted-foreground">
                    Manage API keys for system integrations
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Manage Keys
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;