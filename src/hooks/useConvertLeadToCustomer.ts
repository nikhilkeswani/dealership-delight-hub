import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useDealer } from "./useDealer";
import type { Lead } from "./useLeads";
import { toast } from "sonner";
import { errorHandlers } from "@/lib/errors";

export const useConvertLeadToCustomer = () => {
  const queryClient = useQueryClient();
  const { data: dealer } = useDealer();

  return useMutation({
    mutationFn: async (lead: Lead) => {
      if (!dealer?.id) throw new Error("No dealer found");

      // First, create the customer
      const { data: customer, error: customerError } = await supabase
        .from("customers")
        .insert({
          first_name: lead.first_name,
          last_name: lead.last_name,
          email: lead.email,
          phone: lead.phone || null,
          dealer_id: dealer.id,
          lead_id: lead.id,
        })
        .select()
        .single();

      if (customerError) throw customerError;

      // Then, update the lead status to converted
      const { error: leadError } = await supabase
        .from("leads")
        .update({ status: "converted" })
        .eq("id", lead.id);

      if (leadError) throw leadError;

      return { customer, lead };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads", dealer?.id] });
      queryClient.invalidateQueries({ queryKey: ["customers", dealer?.id] });
      toast.success("Lead converted to customer successfully");
    },
    onError: (error: any) => {
      errorHandlers.database(error);
    },
  });
};