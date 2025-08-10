import React from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { Car, Users, Inbox, LayoutDashboard } from "lucide-react";
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
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@/components/ui/breadcrumb";
import CommandMenu from "@/components/dashboard/CommandMenu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem } from "@/components/ui/dropdown-menu";

const navItems = [
  { title: "Dashboard", url: "/app/overview", icon: LayoutDashboard },
  { title: "Inventory", url: "/app/inventory", icon: Car },
  { title: "Leads", url: "/app/leads", icon: Inbox },
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
    }
  };

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
  const [cmdOpen, setCmdOpen] = React.useState(false);
  const location = useLocation();
  const segments = location.pathname.split("/").filter(Boolean);
  const page = segments[1] ?? "overview";
  const titles: Record<string, string> = {
    overview: "Overview",
    inventory: "Inventory",
    leads: "Leads",
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
                    <NavLink to="/app/overview">Dashboard</NavLink>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{pageLabel}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <div className="ml-auto flex items-center gap-2">
              <Button variant="outline" onClick={() => setCmdOpen(true)} aria-label="Open command menu">
                Search ⌘K
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button aria-label="Open user menu">
                    <Avatar>
                      <AvatarFallback>DC</AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={robustSignOut}>Sign out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>
        <CommandMenu open={cmdOpen} onOpenChange={setCmdOpen} />
        <div className="p-4 md:p-6">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default DashboardLayout;
