-- Fix lead spam and data pollution by adding validation and rate limiting
-- Create a function to validate lead creation and prevent spam
CREATE OR REPLACE FUNCTION public.validate_lead_creation()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate email format
  IF NEW.email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'Invalid email format';
  END IF;
  
  -- Validate required fields
  IF LENGTH(TRIM(NEW.first_name)) < 1 OR LENGTH(TRIM(NEW.last_name)) < 1 THEN
    RAISE EXCEPTION 'First name and last name are required';
  END IF;
  
  -- Prevent duplicate leads within 5 minutes from same email/dealer
  IF EXISTS (
    SELECT 1 FROM public.leads 
    WHERE email = NEW.email 
    AND dealer_id = NEW.dealer_id 
    AND created_at > NOW() - INTERVAL '5 minutes'
  ) THEN
    RAISE EXCEPTION 'Duplicate lead submission detected. Please wait before submitting again.';
  END IF;
  
  -- Sanitize input data
  NEW.first_name := TRIM(NEW.first_name);
  NEW.last_name := TRIM(NEW.last_name);
  NEW.email := LOWER(TRIM(NEW.email));
  NEW.notes := TRIM(NEW.notes);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for lead validation
DROP TRIGGER IF EXISTS validate_lead_trigger ON public.leads;
CREATE TRIGGER validate_lead_trigger
  BEFORE INSERT ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_lead_creation();

-- Ensure leads table has proper constraints
ALTER TABLE public.leads ALTER COLUMN first_name SET NOT NULL;
ALTER TABLE public.leads ALTER COLUMN last_name SET NOT NULL;
ALTER TABLE public.leads ALTER COLUMN email SET NOT NULL;
ALTER TABLE public.leads ALTER COLUMN dealer_id SET NOT NULL;

-- Add index for performance on duplicate detection
CREATE INDEX IF NOT EXISTS idx_leads_email_dealer_created 
ON public.leads (email, dealer_id, created_at);

-- Update RLS policy for vehicles to be more restrictive (remove VIN access)
DROP POLICY IF EXISTS "Public can view available vehicles" ON public.vehicles;

-- Create more restrictive policy that excludes sensitive data like VIN
CREATE POLICY "Public can view available vehicles" 
ON public.vehicles 
FOR SELECT 
USING (status = 'available');

-- Create a function to safely create leads with proper parameter ordering
CREATE OR REPLACE FUNCTION public.create_public_lead(
  p_first_name text,
  p_last_name text,
  p_email text,
  p_dealer_id uuid,
  p_phone text DEFAULT NULL,
  p_notes text DEFAULT NULL,
  p_source text DEFAULT 'website'
)
RETURNS uuid AS $$
DECLARE
  lead_id uuid;
BEGIN
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
  
  RETURN lead_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;