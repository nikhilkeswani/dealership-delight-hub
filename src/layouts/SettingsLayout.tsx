import React from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from "@/components/ui/breadcrumb";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { robustSignOut } from "@/lib/auth";
import { useDealer } from "@/hooks/useDealer";
import { User, Users, CreditCard } from "lucide-react";
import BackToHubButton from "@/components/common/BackToHubButton";

const SettingsLayout: React.FC = () => {
  const location = useLocation();
  const { data: dealer } = useDealer();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes("/profile")) return "Profile & Account";
    if (path.includes("/dealers")) return "Dealers & Teams";
    if (path.includes("/billing")) return "Billing";
    return "Settings";
  };

  const settingsNavItems = [
    { 
      to: "/app/settings/profile", 
      label: "Profile & Account", 
      icon: User 
    },
    { 
      to: "/app/settings/dealers", 
      label: "Dealers & Teams", 
      icon: Users 
    },
    { 
      to: "/app/settings/billing", 
      label: "Billing", 
      icon: CreditCard 
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BackToHubButton />
          </div>

          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {dealer?.business_name?.charAt(0)?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuItem onClick={robustSignOut}>Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Settings Navigation */}
          <aside className="lg:col-span-1">
            <nav className="space-y-2">
              <h2 className="text-lg font-semibold mb-4">Account Settings</h2>
              {settingsNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.to;
                
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                      isActive 
                        ? "bg-primary text-primary-foreground" 
                        : "hover:bg-muted"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </NavLink>
                );
              })}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default SettingsLayout;