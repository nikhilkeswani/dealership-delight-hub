import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { errorHandlers } from "@/lib/errors";

type DataCleanupResult = {
  action_type: string;
  lead_id: string;
  customer_id: string | null;
  details: string;
};

// Hook to clean up orphaned lead-customer data
export const useDataCleanup = () => {
  return useMutation({
    mutationFn: async (): Promise<DataCleanupResult[]> => {
      const { data, error } = await supabase
        .rpc('cleanup_orphaned_lead_customer_data');

      if (error) throw error;
      return data || [];
    },
    onSuccess: (results) => {
      if (results.length > 0) {
        toast.success(`Data cleanup completed: ${results.length} issues resolved`);
        console.log('Data cleanup results:', results);
      } else {
        toast.info('No data integrity issues found');
      }
    },
    onError: (error: any) => {
      errorHandlers.database(error);
    },
  });
};

// Hook to validate lead-customer relationship consistency
export const useValidateLeadCustomerConsistency = () => {
  return useQuery({
    queryKey: ["lead-customer-consistency"],
    queryFn: async () => {
      // Check for converted leads without customers
      const { data: orphanedLeads, error: leadsError } = await supabase
        .from("leads")
        .select("id, first_name, last_name, email")
        .eq("status", "converted")
        .not("id", "in", `(
          SELECT lead_id FROM customers WHERE lead_id IS NOT NULL
        )`);

      if (leadsError) throw leadsError;

      // Check for customers without converted leads
      const { data: orphanedCustomers, error: customersError } = await supabase
        .from("customers")
        .select(`
          id, first_name, last_name, email, lead_id,
          leads!inner(id, status)
        `)
        .neq("leads.status", "converted");

      if (customersError) throw customersError;

      return {
        orphanedLeads: orphanedLeads || [],
        orphanedCustomers: orphanedCustomers || [],
        hasIssues: (orphanedLeads?.length || 0) > 0 || (orphanedCustomers?.length || 0) > 0
      };
    },
    refetchInterval: 30000, // Check every 30 seconds
    staleTime: 10000, // Consider data stale after 10 seconds
  });
};

// Hook to revert a lead conversion (remove customer and change status)
export const useRevertLeadConversion = () => {
  return useMutation({
    mutationFn: async (leadId: string) => {
      // First check if customer exists
      const { data: customer, error: customerError } = await supabase
        .from("customers")
        .select("id")
        .eq("lead_id", leadId)
        .maybeSingle();

      if (customerError) throw customerError;

      // Delete customer if exists
      if (customer) {
        const { error: deleteError } = await supabase
          .from("customers")
          .delete()
          .eq("id", customer.id);

        if (deleteError) throw deleteError;
      }

      // Update lead status back to qualified
      const { error: leadError } = await supabase
        .from("leads")
        .update({ status: "qualified" })
        .eq("id", leadId);

      if (leadError) throw leadError;

      return { leadId, customerId: customer?.id };
    },
    onSuccess: ({ leadId, customerId }) => {
      toast.success("Lead conversion reverted successfully");
      console.log(`Reverted conversion for lead ${leadId}, removed customer ${customerId}`);
    },
    onError: (error: any) => {
      errorHandlers.database(error);
    },
  });
};

// Hook to check if a lead can be safely updated to "converted" status
export const useValidateLeadStatusChange = () => {
  return useMutation({
    mutationFn: async ({ leadId, newStatus }: { leadId: string; newStatus: string }) => {
      if (newStatus !== "converted") {
        return { isValid: true, reason: null };
      }

      // Check if customer exists for this lead
      const { data: customer, error } = await supabase
        .from("customers")
        .select("id")
        .eq("lead_id", leadId)
        .maybeSingle();

      if (error) throw error;

      if (!customer) {
        return { 
          isValid: false, 
          reason: "Cannot set status to converted without creating a customer record first. Use the 'Convert to Customer' button instead." 
        };
      }

      return { isValid: true, reason: null };
    },
  });
};