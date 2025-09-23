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
      
      const { data: customers, error } = await supabase
        .from("customers")
        .select("*")
        .eq("dealer_id", dealer.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      return customers || [];
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

export const useConvertLeadToCustomer = () => {
  const queryClient = useQueryClient();
  const { data: dealer } = useDealer();

  return useMutation({
    mutationFn: async (leadId: string) => {
      if (!dealer?.id) throw new Error("No dealer found");

      // Get the lead data
      const { data: lead, error: leadError } = await supabase
        .from("leads")
        .select("*")
        .eq("id", leadId)
        .single();

      if (leadError) throw leadError;

      // Create customer from lead data
      const { data: customer, error: customerError } = await supabase
        .from("customers")
        .insert({
          dealer_id: dealer.id,
          lead_id: leadId,
          first_name: lead.first_name,
          last_name: lead.last_name,
          email: lead.email,
          phone: lead.phone,
        })
        .select()
        .single();

      if (customerError) throw customerError;

      // Mark lead as converted
      const { error: updateError } = await supabase
        .from("leads")
        .update({ status: "converted" })
        .eq("id", leadId);

      if (updateError) throw updateError;

      return customer;
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