import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type CreateLeadData = {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  message?: string;
  dealer_id: string;
  source?: string;
};

export const useCreateLead = () => {
  return useMutation({
    mutationFn: async (leadData: CreateLeadData) => {
      const { data, error } = await supabase
        .from("leads")
        .insert({
          first_name: leadData.first_name,
          last_name: leadData.last_name,
          email: leadData.email,
          phone: leadData.phone || null,
          notes: leadData.message || null,
          dealer_id: leadData.dealer_id,
          source: (leadData.source as any) || 'website',
          status: 'new',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
  });
};