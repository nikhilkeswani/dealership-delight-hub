import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { WebsiteConfigParams } from "@/types/website";
import type { ApiError } from "@/types/api";
import type { Tables, Json } from "@/integrations/supabase/types";

export const useWebsitePublishing = () => {
  const queryClient = useQueryClient();

  // Get current website status
  const { data: websiteData, isLoading } = useQuery({
    queryKey: ["dealer-website"],
    queryFn: async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const uid = sessionData.session?.user?.id;
      if (!uid) return null;

      const { data: dealer } = await supabase
        .from("dealers")
        .select("id")
        .eq("user_id", uid)
        .maybeSingle();

      if (!dealer) return null;

      const { data, error } = await supabase
        .from("dealer_websites")
        .select("*")
        .eq("dealer_id", dealer.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
  });

  // Publish website mutation
  const publishMutation = useMutation({
    mutationFn: async (websiteConfig?: WebsiteConfigParams) => {
      const { data: sessionData } = await supabase.auth.getSession();
      const uid = sessionData.session?.user?.id;
      if (!uid) throw new Error("Not authenticated");

      const { data: dealer } = await supabase
        .from("dealers")
        .select("*")
        .eq("user_id", uid)
        .maybeSingle();

      if (!dealer) throw new Error("Dealer not found");

      const websiteData = {
        dealer_id: dealer.id,
        is_published: true,
        business_name: dealer.business_name,
        logo_url: dealer.logo_url,
        city: dealer.city,
        state: dealer.state,
        theme_config: (websiteConfig?.theme_config || {}) as Json,
        seo_config: (websiteConfig?.seo_config || {}) as Json,
        contact_config: (websiteConfig?.contact_config || {}) as Json,
        domain_name: websiteConfig?.domain_name,
      };

      const { data, error } = await supabase
        .from("dealer_websites")
        .upsert(websiteData, { onConflict: "dealer_id" })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dealer-website"] });
      toast.success("Website published successfully!");
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "Failed to publish website");
    },
  });

  // Unpublish website mutation
  const unpublishMutation = useMutation({
    mutationFn: async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const uid = sessionData.session?.user?.id;
      if (!uid) throw new Error("Not authenticated");

      const { data: dealer } = await supabase
        .from("dealers")
        .select("id")
        .eq("user_id", uid)
        .maybeSingle();

      if (!dealer) throw new Error("Dealer not found");

      const { data, error } = await supabase
        .from("dealer_websites")
        .update({ is_published: false })
        .eq("dealer_id", dealer.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dealer-website"] });
      toast.success("Website unpublished successfully");
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "Failed to unpublish website");
    },
  });

  return {
    websiteData,
    isLoading,
    isPublished: websiteData?.is_published || false,
    publish: publishMutation.mutate,
    unpublish: unpublishMutation.mutate,
    isPublishing: publishMutation.isPending,
    isUnpublishing: unpublishMutation.isPending,
  };
};