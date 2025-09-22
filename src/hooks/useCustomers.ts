import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useDealer } from "./useDealer";
import type { Tables } from "@/integrations/supabase/types";

export type Customer = Tables<"customers">;
export type Lead = Tables<"leads">;

// Combined type for display purposes - a unified interface
export interface CustomerOrLead {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  city?: string | null;
  state?: string | null;
  created_at: string;
  isLead?: boolean;
  status?: string; // For leads
  source?: string; // For leads
  total_spent?: number | null; // For customers
  lead_id?: string | null; // For customers
}

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
  
  return useQuery<CustomerOrLead[]>({
    queryKey: ["customers-and-leads", dealer?.id],
    queryFn: async () => {
      if (!dealer?.id) throw new Error("No dealer found");
      
      // Get customers
      const { data: customers, error: customersError } = await supabase
        .from("customers")
        .select("*")
        .eq("dealer_id", dealer.id)
        .order("created_at", { ascending: false });
      
      if (customersError) throw customersError;
      
      // Get leads that haven't been converted to customers
      const { data: leads, error: leadsError } = await supabase
        .from("leads")
        .select("*")
        .eq("dealer_id", dealer.id)
        .neq("status", "converted") // Don't show converted leads
        .order("created_at", { ascending: false });
      
      if (leadsError) throw leadsError;
      
      // Transform data to unified format
      const transformedCustomers: CustomerOrLead[] = (customers || []).map(customer => ({
        id: customer.id,
        first_name: customer.first_name,
        last_name: customer.last_name,
        email: customer.email,
        phone: customer.phone,
        city: customer.city,
        state: customer.state,
        created_at: customer.created_at,
        total_spent: customer.total_spent,
        lead_id: customer.lead_id,
        isLead: false
      }));
      
      const transformedLeads: CustomerOrLead[] = (leads || []).map(lead => ({
        id: lead.id,
        first_name: lead.first_name,
        last_name: lead.last_name,
        email: lead.email,
        phone: lead.phone,
        created_at: lead.created_at,
        status: lead.status,
        source: lead.source,
        city: null,
        state: null,
        isLead: true
      }));
      
      // Combine and sort by created_at
      const combined = [...transformedCustomers, ...transformedLeads]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      // Debug logging
      if (import.meta.env.DEV) {
        console.log("useCustomers data received:", { 
          customersCount: customers?.length || 0,
          leadsCount: leads?.length || 0,
          totalCount: combined.length,
          firstItem: combined[0] ? {
            id: combined[0].id,
            firstName: combined[0].first_name,
            lastName: combined[0].last_name,
            email: combined[0].email,
            isLead: combined[0].isLead
          } : null
        });
      }
      
      return combined;
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
      queryClient.invalidateQueries({ queryKey: ["customers-and-leads", dealer?.id] });
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
      queryClient.invalidateQueries({ queryKey: ["customers-and-leads", dealer?.id] });
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
      queryClient.invalidateQueries({ queryKey: ["customers-and-leads", dealer?.id] });
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
      queryClient.invalidateQueries({ queryKey: ["customers-and-leads", dealer?.id] });
    },
  });
};