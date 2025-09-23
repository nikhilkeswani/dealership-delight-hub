import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useDealer } from "./useDealer";
import type { Lead } from "./useLeads";
import { toast } from "sonner";
import { errorHandlers } from "@/lib/errors";

export const useRevertConversion = () => {
  const queryClient = useQueryClient();
  const { data: dealer } = useDealer();

  return useMutation({
    mutationFn: async (lead: Lead) => {
      if (!dealer?.id) throw new Error("No dealer found");

      // First, delete the customer record
      const { error: customerError } = await supabase
        .from("customers")
        .delete()
        .eq("lead_id", lead.id);

      if (customerError) throw customerError;

      // Then, update the lead status to qualified (assuming they were converted from qualified)
      const { error: leadError } = await supabase
        .from("leads")
        .update({ status: "qualified" })
        .eq("id", lead.id);

      if (leadError) throw leadError;

      return { lead };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads", dealer?.id] });
      queryClient.invalidateQueries({ queryKey: ["customers", dealer?.id] });
      toast.success("Conversion reverted successfully - customer removed and lead status updated");
    },
    onError: (error: any) => {
      errorHandlers.database(error);
    },
  });
};