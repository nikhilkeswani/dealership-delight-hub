import React from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { Car, Users, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { robustSignOut } from "@/lib/auth";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarInset,
  useSidebar,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "Inventory", url: "/app/inventory", icon: Car },
  { title: "Leads", url: "/app/leads", icon: Inbox },
  { title: "Customers", url: "/app/customers", icon: Users },
];

function AppSidebar() {
  
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Dealer CRM</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className={({ isActive: routeActive }) =>
                        `${routeActive ? "bg-muted text-primary font-medium" : "hover:bg-muted/50"} flex items-center px-2 py-2 rounded-md`
                      }
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

const DashboardLayout: React.FC = () => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-14 items-center gap-2 px-4">
            <SidebarTrigger className="mr-2" />
            <div className="text-lg font-semibold">Dealer CRM</div>
            <div className="ml-auto">
              <Button variant="outline" onClick={robustSignOut}>
                Sign out
              </Button>
            </div>
          </div>
        </header>
        <div className="p-4 md:p-6">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default DashboardLayout;
