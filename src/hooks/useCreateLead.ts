import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { LeadFormData } from "@/types/form";
import type { ApiError } from "@/types/api";

export const useCreateLead = () => {
  return useMutation({
    mutationFn: async (leadData: LeadFormData) => {
      const { data, error } = await supabase
        .from("leads")
        .insert({
          first_name: leadData.first_name,
          last_name: leadData.last_name,
          email: leadData.email,
          phone: leadData.phone || null,
          notes: leadData.message || null,
          dealer_id: leadData.dealer_id,
          source: leadData.source || 'website',
          status: 'new',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
  });
};