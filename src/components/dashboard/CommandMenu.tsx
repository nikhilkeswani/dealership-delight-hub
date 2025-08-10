import React from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { LayoutDashboard, Car, Inbox, Users, Plus } from "lucide-react";

type CommandMenuProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const CommandMenu: React.FC<CommandMenuProps> = ({ open, onOpenChange }) => {
  const navigate = useNavigate();

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onOpenChange]);

  const go = (to: string) => {
    navigate(to);
    onOpenChange(false);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search pages and actions..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Go to">
          <CommandItem onSelect={() => go("/app/overview")}> 
            <LayoutDashboard className="mr-2 h-4 w-4" /> Overview
          </CommandItem>
          <CommandItem onSelect={() => go("/app/inventory")}>
            <Car className="mr-2 h-4 w-4" /> Inventory
          </CommandItem>
          <CommandItem onSelect={() => go("/app/leads")}>
            <Inbox className="mr-2 h-4 w-4" /> Leads
          </CommandItem>
          <CommandItem onSelect={() => go("/app/customers")}>
            <Users className="mr-2 h-4 w-4" /> Customers
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Create">
          <CommandItem onSelect={() => go("/app/leads")}>
            <Plus className="mr-2 h-4 w-4" /> Add Lead
          </CommandItem>
          <CommandItem onSelect={() => go("/app/inventory")}>
            <Plus className="mr-2 h-4 w-4" /> Add Vehicle
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};

export default CommandMenu;
