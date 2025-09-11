import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate } from "@/lib/format";
import { Mail, PhoneCall, CalendarClock, Users } from "lucide-react";

export type LeadItem = {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  status?: string | null;
  created_at?: string | null;
};

export type AppointmentItem = {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  status?: string | null;
  follow_up_date?: string | null;
};

type Props = {
  recentLeads?: LeadItem[];
  todaysAppointments?: AppointmentItem[];
};

const ActivityFeed: React.FC<Props> = ({ recentLeads = [], todaysAppointments = [] }) => {
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <Card className="glass-card hover-scale transition-all duration-300 border-0 shadow-lg hover:shadow-xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary"></div>
            Recent Leads
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentLeads.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">No recent leads.</p>
            </div>
          ) : (
            <div className="space-y-1">
              <Table>
                <TableHeader>
                  <TableRow className="border-muted/50">
                    <TableHead className="font-semibold">Name</TableHead>
                    <TableHead className="font-semibold">Contact</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentLeads.map((l) => (
                    <TableRow key={l.id} className="hover:bg-muted/30 transition-colors border-muted/30">
                      <TableCell className="font-medium text-foreground">
                        {l.first_name} {l.last_name}
                      </TableCell>
                      <TableCell className="text-sm">
                        <div className="flex flex-col gap-1.5">
                          {l.email && (
                            <span className="inline-flex items-center gap-2 text-muted-foreground">
                              <Mail className="h-3 w-3 text-primary" /> 
                              <span className="truncate max-w-[150px]">{l.email}</span>
                            </span>
                          )}
                          {l.phone && (
                            <span className="inline-flex items-center gap-2 text-muted-foreground">
                              <PhoneCall className="h-3 w-3 text-primary" /> {l.phone}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize">
                          {l.status ?? "pending"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(l.created_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="glass-card hover-scale transition-all duration-300 border-0 shadow-lg hover:shadow-xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary"></div>
            Today's Appointments
          </CardTitle>
        </CardHeader>
        <CardContent>
          {todaysAppointments.length === 0 ? (
            <div className="text-center py-12">
              <CalendarClock className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">Nothing scheduled for today.</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {todaysAppointments.map((a) => (
                <li key={a.id} className="group">
                  <div className="flex items-center justify-between p-4 rounded-lg hover:bg-muted/30 transition-colors">
                    <div className="space-y-1">
                      <div className="font-medium text-foreground group-hover:text-primary transition-colors">
                        {a.first_name} {a.last_name}
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <CalendarClock className="h-4 w-4 text-primary" /> 
                        {formatDate(a.follow_up_date)}
                      </div>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {a.status ?? "scheduled"}
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ActivityFeed;