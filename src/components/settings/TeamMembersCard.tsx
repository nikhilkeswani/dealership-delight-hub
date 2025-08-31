import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Users, Crown } from "lucide-react";
import { useDealer } from "@/hooks/useDealer";

export const TeamMembersCard: React.FC = () => {
  const { data: dealer, isLoading } = useDealer();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Mock current user as owner
  const mockTeamMembers = dealer ? [
    {
      id: "1",
      name: dealer.business_name,
      email: dealer.contact_email,
      role: "Owner",
      avatar: null,
      status: "active"
    }
  ] : [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Team Members
        </CardTitle>
        <Button variant="outline" size="sm" disabled>
          <UserPlus className="h-4 w-4 mr-2" />
          Invite Member
        </Button>
      </CardHeader>
      <CardContent>
        {mockTeamMembers.length > 0 ? (
          <div className="space-y-3">
            {mockTeamMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{member.name}</p>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Crown className="h-3 w-3" />
                    {member.role}
                  </Badge>
                </div>
              </div>
            ))}
            
            <div className="border-t pt-4">
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Team management features coming soon
                </p>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>• Invite team members</p>
                  <p>• Assign roles (Admin, Editor, Viewer)</p>
                  <p>• Manage permissions</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <Users className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No team members</p>
            <p className="text-xs text-muted-foreground mt-1">
              Invite team members to collaborate
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};