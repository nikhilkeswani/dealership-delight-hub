import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { TablesUpdate } from "@/integrations/supabase/types";
import { toast } from "sonner";

export const useDealerProfile = () => {
  const queryClient = useQueryClient();

  const updateProfile = useMutation({
    mutationFn: async (values: TablesUpdate<"dealers">) => {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user?.id;
      if (!userId) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("dealers")
        .update(values)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dealer"] });
      toast.success("Profile updated successfully");
    },
    onError: (error: any) => {
      const msg = error?.message || "Failed to update profile";
      toast.error(msg);
    },
  });

  return {
    updateProfile: updateProfile.mutate,
    isUpdating: updateProfile.isPending,
  };
};