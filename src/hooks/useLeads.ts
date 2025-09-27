import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useDealer } from "./useDealer";
import { toast } from "sonner";
import { errorHandlers } from "@/lib/errors";
import type { 
  Lead, 
  LeadFormValues,
  DatabaseError,
  MutationError
} from "@/types/database";
import type {
  UseLeadsResult,
  UseCreateLeadResult,
  UseUpdateLeadResult,
  UseDeleteLeadResult
} from "@/types/hooks";

// Re-export types for other hooks
export type { Lead, LeadFormValues };

export const useLeads = (): UseLeadsResult => {
  const { data: dealer } = useDealer();
  
  return useQuery<Lead[], DatabaseError>({
    queryKey: ["leads", dealer?.id],
    staleTime: 5 * 60 * 1000, // 5 minutes
    queryFn: async () => {
      if (!dealer?.id) throw new Error("No dealer found");
      
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .eq("dealer_id", dealer.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!dealer?.id,
  });
};

export const useCreateLead = (): UseCreateLeadResult => {
  const queryClient = useQueryClient();
  const { data: dealer } = useDealer();

  return useMutation<Lead, MutationError, LeadFormValues>({
    mutationFn: async (values: LeadFormValues) => {
      if (!dealer?.id) throw new Error("No dealer found");

      const { data, error } = await supabase
        .from("leads")
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
      queryClient.invalidateQueries({ queryKey: ["leads", dealer?.id] });
      toast.success("Lead created successfully");
    },
    onError: (error: MutationError) => {
      errorHandlers.database(error);
    },
  });
};

export const useUpdateLead = (): UseUpdateLeadResult => {
  const queryClient = useQueryClient();
  const { data: dealer } = useDealer();

  return useMutation<Lead, MutationError, { id: string; values: Partial<LeadFormValues> }>({
    mutationFn: async ({ id, values }: { id: string; values: Partial<LeadFormValues> }) => {
      // If setting status to "converted", first create customer record
      if (values.status === "converted") {
        // Get the current lead data
        const { data: leadData, error: leadError } = await supabase
          .from("leads")
          .select("*")
          .eq("id", id)
          .single();

        if (leadError) throw leadError;

        // Check if customer already exists and is active for this lead
        const { data: existingCustomer } = await supabase
          .from("customers")
          .select("id")
          .eq("lead_id", id)
          .eq("status", "active")
          .single();

        // Only create customer if one doesn't exist
        if (!existingCustomer) {
          const { error: customerError } = await supabase
            .from("customers")
            .insert({
              first_name: leadData.first_name,
              last_name: leadData.last_name,
              email: leadData.email,
              phone: leadData.phone || null,
              dealer_id: leadData.dealer_id,
              lead_id: leadData.id,
              status: "active", // Ensure customer is created as active
            });

          if (customerError) throw customerError;
        }
      }

      const { data, error } = await supabase
        .from("leads")
        .update(values)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads", dealer?.id] });
      queryClient.invalidateQueries({ queryKey: ["customers", dealer?.id] });
      queryClient.invalidateQueries({ queryKey: ["lead-customer-consistency"] });
      toast.success("Lead updated successfully");
    },
    onError: (error: MutationError) => {
      // Show user-friendly error messages
      if (error.message?.includes("Convert to Customer")) {
        toast.error(error.message);
      } else {
        errorHandlers.database(error);
      }
    },
  });
};

export const useDeleteLead = (): UseDeleteLeadResult => {
  const queryClient = useQueryClient();
  const { data: dealer } = useDealer();

  return useMutation<void, MutationError, string>({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("leads")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads", dealer?.id] });
      toast.success("Lead deleted successfully");
    },
    onError: (error: MutationError) => {
      errorHandlers.database(error);
    },
  });
};