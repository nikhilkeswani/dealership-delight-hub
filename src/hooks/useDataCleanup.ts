import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { errorHandlers } from "@/lib/errors";

interface CleanupResult {
  action_type: string;
  lead_id: string;
  customer_id: string;
  details: string;
}

export const useDataCleanup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<CleanupResult[]> => {
      const { data, error } = await supabase.rpc('cleanup_orphaned_lead_customer_data');
      
      if (error) throw error;
      return data || [];
    },
    onSuccess: (results) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      
      if (results.length > 0) {
        const createdCustomers = results.filter(r => r.action_type === 'created_customer').length;
        const updatedLeads = results.filter(r => r.action_type === 'updated_lead_status').length;
        
        toast.success(
          `Data cleanup completed: ${createdCustomers} customers created, ${updatedLeads} lead statuses updated`
        );
      } else {
        toast.success("Data is already consistent - no cleanup needed");
      }
    },
    onError: (error: any) => {
      errorHandlers.database(error);
    },
  });
};