import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface PublicLeadFormValues {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  notes?: string;
  source?: string;
  dealer_id: string;
  honeypot?: string; // Spam detection field
}

// Function to get client IP (simple approximation)
const getClientIP = async (): Promise<string | null> => {
  try {
    // In a real app, you might get this from headers or a service
    // For now, we'll let the database handle IP tracking
    return null;
  } catch {
    return null;
  }
};

export const useCreatePublicLead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (values: PublicLeadFormValues) => {
      // Basic honeypot validation (client-side spam detection)
      if (values.honeypot && values.honeypot.trim() !== '') {
        throw new Error("Spam submission detected");
      }

      // Basic client-side validation
      if (!values.first_name?.trim() || !values.last_name?.trim() || !values.email?.trim()) {
        throw new Error("Please fill in all required fields");
      }

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(values.email)) {
        throw new Error("Please enter a valid email address");
      }

      // Get client IP for rate limiting
      const clientIP = await getClientIP();
      
      // Call the secure database function
      const { data, error } = await supabase.rpc('create_public_lead', {
        p_first_name: values.first_name.trim(),
        p_last_name: values.last_name.trim(),
        p_email: values.email.trim().toLowerCase(),
        p_phone: values.phone?.trim() || null,
        p_notes: values.notes?.trim() || null,
        p_source: values.source || 'website',
        p_dealer_id: values.dealer_id,
        p_ip_address: clientIP
      });

      if (error) {
        // Handle rate limiting and validation errors with user-friendly messages
        if (error.message.includes('Rate limit exceeded')) {
          throw new Error("Too many submissions. Please wait a few minutes before trying again.");
        }
        if (error.message.includes('similar lead submission')) {
          throw new Error("We already received your request recently. We'll contact you shortly!");
        }
        if (error.message.includes('Invalid email format')) {
          throw new Error("Please enter a valid email address.");
        }
        if (error.message.includes('wait at least 30 seconds')) {
          throw new Error("Please wait a moment before submitting again.");
        }
        throw new Error(error.message || "Unable to submit request. Please try again.");
      }

      return data;
    },
    onSuccess: () => {
      // Invalidate any lead-related queries that might be cached
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["public-leads"] });
      
      toast({
        title: "Request submitted successfully!",
        description: "Thank you for your interest. We'll contact you shortly.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Unable to submit request",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};