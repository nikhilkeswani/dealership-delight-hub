import { supabase } from "@/integrations/supabase/client";

// Thoroughly clear any existing Supabase auth state to avoid limbo states
export const cleanupAuthState = () => {
  try {
    // Remove standard auth tokens (legacy keys)
    localStorage.removeItem("supabase.auth.token");

    // Remove all Supabase-related keys from localStorage
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("supabase.auth.") || key.includes("sb-")) {
        localStorage.removeItem(key);
      }
    });

    // Remove all Supabase-related keys from sessionStorage
    Object.keys(sessionStorage || {}).forEach((key) => {
      if (key.startsWith("supabase.auth.") || key.includes("sb-")) {
        sessionStorage.removeItem(key);
      }
    });
  } catch (_) {
    // noop
  }
};

export const robustSignOut = async () => {
  try {
    cleanupAuthState();
    try {
      await supabase.auth.signOut({ scope: "global" });
    } catch (_) {
      // ignore
    }
  } finally {
    window.location.href = "/auth";
  }
};
