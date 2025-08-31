import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useDealer } from "./useDealer";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

export type Sale = Tables<"sales">;

export type SaleFormValues = {
  vehicle_id: string;
  lead_id?: string;
  customer_id?: string;
  sale_price?: number;
  commission?: number;
  stage: string;
  expected_close_date?: string;
  deal_notes?: string;
  notes?: string;
};

export type ConvertLeadToSaleData = {
  lead_id: string;
  vehicle_id: string;
  expected_close_date?: string;
  deal_notes?: string;
};

export const useSales = () => {
  const { data: dealer } = useDealer();
  
  return useQuery<Sale[]>({
    queryKey: ["sales"],
    queryFn: async () => {
      if (!dealer?.id) throw new Error("No dealer found");
      
      const { data, error } = await supabase
        .from("sales")
        .select(`
          *,
          leads (
            first_name,
            last_name,
            email,
            phone
          ),
          vehicles (
            make,
            model,
            year,
            vin
          ),
          customers (
            first_name,
            last_name,
            email,
            phone
          )
        `)
        .eq("dealer_id", dealer.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!dealer?.id,
  });
};

export const useCreateSale = () => {
  const queryClient = useQueryClient();
  const { data: dealer } = useDealer();

  return useMutation({
    mutationFn: async (values: SaleFormValues) => {
      if (!dealer?.id) throw new Error("No dealer found");

      const { data, error } = await supabase
        .from("sales")
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
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      toast.success("Deal created successfully");
    },
    onError: (error: any) => {
      toast.error("Failed to create deal: " + error.message);
    },
  });
};

export const useConvertLeadToSale = () => {
  const queryClient = useQueryClient();
  const { data: dealer } = useDealer();

  return useMutation({
    mutationFn: async (data: ConvertLeadToSaleData) => {
      if (!dealer?.id) throw new Error("No dealer found");

      const { data: sale, error } = await supabase
        .from("sales")
        .insert({
          dealer_id: dealer.id,
          lead_id: data.lead_id,
          vehicle_id: data.vehicle_id,
          stage: "qualified",
          expected_close_date: data.expected_close_date,
          deal_notes: data.deal_notes,
        })
        .select()
        .single();

      if (error) throw error;

      // Update lead status to converted
      await supabase
        .from("leads")
        .update({ status: "converted" })
        .eq("id", data.lead_id);

      return sale;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast.success("Lead converted to deal successfully");
    },
    onError: (error: any) => {
      toast.error("Failed to convert lead: " + error.message);
    },
  });
};

export const useUpdateSale = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, values }: { id: string; values: Partial<SaleFormValues> }) => {
      const { data, error } = await supabase
        .from("sales")
        .update(values)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      // If closing the deal, update vehicle status and create customer if needed
      if (values.stage === "closed_won" && data.lead_id) {
        // Update vehicle status to sold
        if (data.vehicle_id) {
          await supabase
            .from("vehicles")
            .update({ status: "sold" })
            .eq("id", data.vehicle_id);
        }

        // Create customer from lead if doesn't exist
        if (!data.customer_id) {
          const { data: lead } = await supabase
            .from("leads")
            .select("*")
            .eq("id", data.lead_id)
            .single();
          
          if (lead) {
            const { data: customer } = await supabase
              .from("customers")
              .insert({
                dealer_id: data.dealer_id,
                lead_id: data.lead_id,
                first_name: lead.first_name,
                last_name: lead.last_name,
                email: lead.email,
                phone: lead.phone,
              })
              .select()
              .single();

            if (customer) {
              await supabase
                .from("sales")
                .update({ 
                  customer_id: customer.id,
                  sale_date: new Date().toISOString()
                })
                .eq("id", id);
            }
          }
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Deal updated successfully");
    },
    onError: (error: any) => {
      toast.error("Failed to update deal: " + error.message);
    },
  });
};

export const useDeleteSale = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("sales")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      toast.success("Deal deleted successfully");
    },
    onError: (error: any) => {
      toast.error("Failed to delete deal: " + error.message);
    },
  });
};