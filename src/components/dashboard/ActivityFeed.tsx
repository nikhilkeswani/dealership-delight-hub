import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate } from "@/lib/format";
import { Mail, PhoneCall, CalendarClock } from "lucide-react";

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
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Recent Leads</CardTitle>
        </CardHeader>
        <CardContent>
          {recentLeads.length === 0 ? (
            <p className="text-sm text-muted-foreground">No recent leads.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentLeads.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="font-medium">{l.first_name} {l.last_name}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      <div className="flex flex-col gap-1">
                        {l.email && (
                          <span className="inline-flex items-center gap-1"><Mail className="h-3 w-3" /> {l.email}</span>
                        )}
                        {l.phone && (
                          <span className="inline-flex items-center gap-1"><PhoneCall className="h-3 w-3" /> {l.phone}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{l.status ?? "-"}</Badge>
                    </TableCell>
                    <TableCell>{formatDate(l.created_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Today’s Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          {todaysAppointments.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nothing scheduled for today.</p>
          ) : (
            <ul className="space-y-3">
              {todaysAppointments.map((a) => (
                <li key={a.id} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{a.first_name} {a.last_name}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <CalendarClock className="h-3 w-3" /> {formatDate(a.follow_up_date)}
                    </div>
                  </div>
                  <Badge variant="outline">{a.status ?? "-"}</Badge>
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
