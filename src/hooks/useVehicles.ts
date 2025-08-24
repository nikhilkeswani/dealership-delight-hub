import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useDealer } from "./useDealer";
import type { Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";

export type Vehicle = Tables<"vehicles">;

export type VehicleFormValues = {
  make: string;
  model: string;
  year: number;
  price?: number;
  mileage?: number;
  vin?: string;
  status: "available" | "sold" | "pending" | "service";
  description?: string;
  features?: Record<string, any>;
  images?: string[];
};

export const useVehicles = () => {
  const { data: dealer } = useDealer();
  
  return useQuery<Vehicle[]>({
    queryKey: ["vehicles"],
    queryFn: async () => {
      if (!dealer?.id) throw new Error("No dealer found");
      
      const { data, error } = await supabase
        .from("vehicles")
        .select("*")
        .eq("dealer_id", dealer.id)
        .order("updated_at", { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!dealer?.id,
  });
};

export const useCreateVehicle = () => {
  const queryClient = useQueryClient();
  const { data: dealer } = useDealer();

  return useMutation({
    mutationFn: async (values: VehicleFormValues) => {
      if (!dealer?.id) throw new Error("No dealer found");

      const { data, error } = await supabase
        .from("vehicles")
        .insert({
          ...values,
          dealer_id: dealer.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      toast.success("Vehicle added successfully");
    },
    onError: (error: any) => {
      toast.error("Failed to add vehicle: " + error.message);
    },
  });
};

export const useUpdateVehicle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, values }: { id: string; values: Partial<VehicleFormValues> }) => {
      const { data, error } = await supabase
        .from("vehicles")
        .update(values)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      toast.success("Vehicle updated successfully");
    },
    onError: (error: any) => {
      toast.error("Failed to update vehicle: " + error.message);
    },
  });
};

export const useDeleteVehicle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("vehicles")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      toast.success("Vehicle deleted successfully");
    },
    onError: (error: any) => {
      toast.error("Failed to delete vehicle: " + error.message);
    },
  });
};