-- Phase 1A: Lead Creation Security
-- Create table for rate limiting tracking
CREATE TABLE IF NOT EXISTS public.lead_rate_limiting (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address INET NOT NULL,
  email TEXT,
  dealer_id UUID NOT NULL,
  submission_count INTEGER DEFAULT 1,
  first_submission TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_submission TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS on rate limiting table
ALTER TABLE public.lead_rate_limiting ENABLE ROW LEVEL SECURITY;

-- Create policy for rate limiting table (system use only)
CREATE POLICY "System can manage rate limiting" ON public.lead_rate_limiting
FOR ALL USING (true);

-- Create index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_lead_rate_limiting_ip_dealer ON public.lead_rate_limiting(ip_address, dealer_id);
CREATE INDEX IF NOT EXISTS idx_lead_rate_limiting_email_dealer ON public.lead_rate_limiting(email, dealer_id);
CREATE INDEX IF NOT EXISTS idx_lead_rate_limiting_cleanup ON public.lead_rate_limiting(created_at);

-- Enhanced create_public_lead function with rate limiting
CREATE OR REPLACE FUNCTION public.create_public_lead(
  p_first_name text, 
  p_last_name text, 
  p_email text, 
  p_dealer_id uuid, 
  p_phone text DEFAULT NULL::text, 
  p_notes text DEFAULT NULL::text, 
  p_source text DEFAULT 'website'::text,
  p_ip_address inet DEFAULT NULL::inet
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  lead_id uuid;
  ip_submissions INTEGER := 0;
  email_submissions INTEGER := 0;
  last_ip_submission TIMESTAMP WITH TIME ZONE;
  last_email_submission TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Clean up old rate limiting entries (older than 24 hours)
  DELETE FROM public.lead_rate_limiting 
  WHERE created_at < NOW() - INTERVAL '24 hours';
  
  -- Check IP-based rate limiting (max 5 leads per IP per hour per dealer)
  IF p_ip_address IS NOT NULL THEN
    SELECT 
      COALESCE(SUM(submission_count), 0),
      MAX(last_submission)
    INTO ip_submissions, last_ip_submission
    FROM public.lead_rate_limiting 
    WHERE ip_address = p_ip_address 
      AND dealer_id = p_dealer_id 
      AND last_submission > NOW() - INTERVAL '1 hour';
      
    IF ip_submissions >= 5 THEN
      RAISE EXCEPTION 'Rate limit exceeded. Too many submissions from this IP address. Please try again later.';
    END IF;
  END IF;
  
  -- Check email-based rate limiting (max 2 leads per email per hour per dealer)
  SELECT 
    COALESCE(SUM(submission_count), 0),
    MAX(last_submission)
  INTO email_submissions, last_email_submission  
  FROM public.lead_rate_limiting 
  WHERE email = p_email 
    AND dealer_id = p_dealer_id 
    AND last_submission > NOW() - INTERVAL '1 hour';
    
  IF email_submissions >= 2 THEN
    RAISE EXCEPTION 'Rate limit exceeded. Please wait before submitting another request with this email.';
  END IF;
  
  -- Additional spam detection
  IF LENGTH(p_notes) > 2000 THEN
    RAISE EXCEPTION 'Message is too long. Please keep your message under 2000 characters.';
  END IF;
  
  -- Check for suspicious patterns (very rapid submission)
  IF last_ip_submission IS NOT NULL AND last_ip_submission > NOW() - INTERVAL '30 seconds' THEN
    RAISE EXCEPTION 'Please wait at least 30 seconds between submissions.';
  END IF;
  
  -- Create the lead
  INSERT INTO public.leads (
    first_name,
    last_name,
    email,
    phone,
    notes,
    dealer_id,
    source,
    status
  ) VALUES (
    p_first_name,
    p_last_name,
    p_email,
    p_phone,
    p_notes,
    p_dealer_id,
    p_source::lead_source,
    'new'::lead_status
  ) RETURNING id INTO lead_id;
  
  -- Update rate limiting tracking
  INSERT INTO public.lead_rate_limiting (
    ip_address, email, dealer_id, submission_count, first_submission, last_submission
  ) VALUES (
    COALESCE(p_ip_address, '0.0.0.0'::inet), p_email, p_dealer_id, 1, NOW(), NOW()
  )
  ON CONFLICT ON CONSTRAINT lead_rate_limiting_pkey DO NOTHING;
  
  -- If no conflict, try to update existing record
  IF NOT FOUND THEN
    UPDATE public.lead_rate_limiting 
    SET 
      submission_count = submission_count + 1,
      last_submission = NOW()
    WHERE (
      (ip_address = p_ip_address AND p_ip_address IS NOT NULL) OR 
      (email = p_email)
    ) AND dealer_id = p_dealer_id
    AND last_submission > NOW() - INTERVAL '1 hour';
  END IF;
  
  -- Log the lead creation for audit
  PERFORM public.log_audit_action(
    'public_lead_created',
    'lead', 
    lead_id,
    jsonb_build_object(
      'ip_address', p_ip_address,
      'email', p_email,
      'source', p_source,
      'dealer_id', p_dealer_id
    )
  );
  
  RETURN lead_id;
END;
$function$;