import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useDealer } from "./useDealer";
import type { Tables, TablesUpdate } from "@/integrations/supabase/types";
import { toast } from "sonner";
import { errorHandlers } from "@/lib/errors";

export type Lead = Tables<"leads">;

export type LeadFormValues = {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  source: "website" | "phone" | "email" | "referral" | "walk_in" | "social_media" | "website_testdrive" | "website_inquiry";
  status: "new" | "contacted" | "qualified" | "converted" | "lost";
  notes?: string;
  follow_up_date?: string;
};

export const useLeads = () => {
  const { data: dealer } = useDealer();
  
  return useQuery<Lead[]>({
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

export const useCreateLead = () => {
  const queryClient = useQueryClient();
  const { data: dealer } = useDealer();

  return useMutation({
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
    onError: (error: any) => {
      errorHandlers.database(error);
    },
  });
};

export const useUpdateLead = () => {
  const queryClient = useQueryClient();
  const { data: dealer } = useDealer();

  return useMutation({
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

        // Check if customer already exists for this lead
        const { data: existingCustomer } = await supabase
          .from("customers")
          .select("id")
          .eq("lead_id", id)
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
    onError: (error: any) => {
      // Show user-friendly error messages
      if (error.message?.includes("Convert to Customer")) {
        toast.error(error.message);
      } else {
        errorHandlers.database(error);
      }
    },
  });
};

export const useDeleteLead = () => {
  const queryClient = useQueryClient();
  const { data: dealer } = useDealer();

  return useMutation({
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
    onError: (error: any) => {
      errorHandlers.database(error);
    },
  });
};