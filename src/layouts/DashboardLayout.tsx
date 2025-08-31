import React from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { Car, Users, Inbox, LayoutDashboard, DollarSign } from "lucide-react";
import BackToHubButton from "@/components/common/BackToHubButton";
import PageHeader from "@/components/common/PageHeader";
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
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const navItems = [
  { title: "Dashboard", url: "/app/dashboard", icon: LayoutDashboard },
  { title: "Inventory", url: "/app/inventory", icon: Car },
  { title: "Leads", url: "/app/leads", icon: Inbox },
  { title: "Sales", url: "/app/sales", icon: DollarSign },
  { title: "Customers", url: "/app/customers", icon: Users },
];

function AppSidebar() {
  const queryClient = useQueryClient();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const prefetch = (path: string) => {
    if (path.includes("/inventory")) {
      queryClient.prefetchQuery({
        queryKey: ["vehicles"],
        queryFn: async () => {
          const { data } = await supabase.from("vehicles").select("id").limit(1);
          return data ?? [];
        },
      });
    } else if (path.includes("/leads")) {
      queryClient.prefetchQuery({
        queryKey: ["leads"],
        queryFn: async () => {
          const { data } = await supabase.from("leads").select("id").limit(1);
          return data ?? [];
        },
      });
    } else if (path.includes("/customers")) {
      queryClient.prefetchQuery({
        queryKey: ["customers"],
        queryFn: async () => {
          const { data } = await supabase.from("customers").select("id").limit(1);
          return data ?? [];
        },
      });
    } else if (path.includes("/sales")) {
      queryClient.prefetchQuery({
        queryKey: ["sales"],
        queryFn: async () => {
          const { data } = await supabase.from("sales").select("id").limit(1);
          return data ?? [];
        },
      });
    }
  };

  return (
    <Sidebar collapsible="icon" variant="inset" className="bg-secondary border-secondary">
      <SidebarContent className="bg-secondary">
        <SidebarGroup>
          <SidebarGroupContent>
            <div className="px-2 py-2">
              <BackToHubButton />
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
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
                      onMouseEnter={() => prefetch(item.url)}
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
  const location = useLocation();
  const segments = location.pathname.split("/").filter(Boolean);
  const page = segments[1] ?? "overview";
  const titles: Record<string, string> = {
    dashboard: "Dashboard",
    overview: "Overview",
    inventory: "Inventory",
    leads: "Leads",
    sales: "Sales",
    customers: "Customers",
  };
  const pageLabel = titles[page] ?? "Overview";

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-14 items-center gap-2 px-4">
            <SidebarTrigger className="mr-2" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <NavLink to="/app/dashboard">Dashboard</NavLink>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {pageLabel !== "Dashboard" && (
                  <>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage>{pageLabel}</BreadcrumbPage>
                    </BreadcrumbItem>
                  </>
                )}
              </BreadcrumbList>
            </Breadcrumb>
            <div className="ml-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button aria-label="Open user menu" className="rounded-full focus:outline-none focus:ring-2 focus:ring-ring/50">
                    <Avatar>
                      <AvatarFallback>DC</AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <NavLink to="/app/settings/dealers">Dealers & Teams</NavLink>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <NavLink to="/app/settings/billing">Billing</NavLink>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={robustSignOut}>Sign out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>
        
        <div className="p-4 md:p-6 space-y-6">
          <PageHeader 
            title="CRM Dashboard" 
          />
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default DashboardLayout;
