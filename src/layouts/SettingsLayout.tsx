import React from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { User, Users, CreditCard } from "lucide-react";
import BackToHubButton from "@/components/common/BackToHubButton";
import { useDealer } from "@/hooks/useDealer";
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

const settingsNavItems = [
  { title: "Profile & Account", url: "/app/settings/profile", icon: User },
  { title: "Dealers & Teams", url: "/app/settings/dealers", icon: Users },
  { title: "Billing", url: "/app/settings/billing", icon: CreditCard },
];

function SettingsSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

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
          <SidebarGroupLabel>Account Settings</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsNavItems.map((item) => (
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

const SettingsLayout: React.FC = () => {
  const location = useLocation();
  const { data: dealer } = useDealer();
  const segments = location.pathname.split("/").filter(Boolean);
  const page = segments[2] ?? "settings";
  const titles: Record<string, string> = {
    profile: "Profile & Account",
    dealers: "Dealers & Teams", 
    billing: "Billing",
  };
  const pageLabel = titles[page] ?? "Settings";

  return (
    <SidebarProvider>
      <SettingsSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-50 glass-card border-b">
          <div className="flex h-16 items-center gap-2 px-6">
            <SidebarTrigger className="mr-2" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <NavLink to="/app/settings/profile">Settings</NavLink>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {pageLabel !== "Settings" && (
                  <>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage className="font-medium">{pageLabel}</BreadcrumbPage>
                    </BreadcrumbItem>
                  </>
                )}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        
        <div className="p-6 lg:p-8 space-y-8">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default SettingsLayout;