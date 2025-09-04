import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useUserRoles = () => {
  return useQuery<string[], Error>({
    queryKey: ["user-roles"],
    queryFn: async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const uid = sessionData.session?.user?.id;
      if (!uid) return [];

      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", uid);

      if (error) throw error;
      return data.map(item => item.role);
    },
    staleTime: 60 * 1000,
  });
};

export const useIsProvider = () => {
  const { data: roles = [], isLoading } = useUserRoles();
  return {
    isProvider: roles.includes("provider"),
    isLoading
  };
};