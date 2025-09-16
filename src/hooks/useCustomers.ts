import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useDealer } from "./useDealer";
import type { Tables } from "@/integrations/supabase/types";

export type Customer = Tables<"customers">;

export type CustomerFormValues = {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  city?: string;
  state?: string;
};

export const useCustomers = () => {
  const { data: dealer } = useDealer();
  
  return useQuery<Customer[]>({
    queryKey: ["customers", dealer?.id],
    queryFn: async () => {
      if (!dealer?.id) throw new Error("No dealer found");
      
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .eq("dealer_id", dealer.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      // Debug logging and data validation in development
      if (import.meta.env.DEV) {
        console.log("useCustomers data received:", { 
          count: data?.length || 0,
          firstCustomer: data?.[0] ? {
            id: data[0].id,
            firstName: data[0].first_name,
            lastName: data[0].last_name,
            email: data[0].email
          } : null,
          allCustomersValid: data?.every(c => c.first_name && c.last_name) || false
        });
        
        // Check for data corruption
        const corruptedCustomers = data?.filter(c => !c.first_name || !c.last_name);
        if (corruptedCustomers && corruptedCustomers.length > 0) {
          console.error("Detected corrupted customer data:", corruptedCustomers);
        }
      }
      
      return data || [];
    },
    enabled: !!dealer?.id,
  });
};

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  const { data: dealer } = useDealer();

  return useMutation({
    mutationFn: async (values: CustomerFormValues) => {
      if (!dealer?.id) throw new Error("No dealer found");

      const { data, error } = await supabase
        .from("customers")
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
      queryClient.invalidateQueries({ queryKey: ["customers", dealer?.id] });
    },
  });
};

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();
  const { data: dealer } = useDealer();

  return useMutation({
    mutationFn: async ({ id, values }: { id: string; values: Partial<CustomerFormValues> }) => {
      const { data, error } = await supabase
        .from("customers")
        .update(values)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers", dealer?.id] });
    },
  });
};

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();
  const { data: dealer } = useDealer();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("customers")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers", dealer?.id] });
    },
  });
};