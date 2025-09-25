-- Phase 1B: Data Protection - Vehicle Data Security
-- Create public vehicle view that excludes sensitive data
CREATE OR REPLACE VIEW public.public_vehicles AS 
SELECT 
  id,
  make,
  model,
  year,
  mileage,
  price,
  fuel_type,
  transmission,
  condition,
  description,
  images,
  body_type,
  status,
  created_at,
  dealer_id
FROM public.vehicles 
WHERE status = 'available';

-- Enable RLS on the view
-- Note: Views inherit RLS from underlying tables, but we want explicit control
ALTER VIEW public.public_vehicles SET (security_barrier = true);

-- Update Lead RLS Policy - Replace overly permissive policy with restricted one
DROP POLICY IF EXISTS "Public insert leads only" ON public.leads;

-- Create new restrictive policy for public lead insertion via function only
CREATE POLICY "Public leads via function only" ON public.leads
FOR INSERT 
TO PUBLIC
WITH CHECK (false); -- Prevents direct inserts

-- Allow the create_public_lead function to insert leads by using security definer
-- The function already has proper validation and rate limiting

-- Update vehicle RLS policy to be more specific about what data is exposed
DROP POLICY IF EXISTS "Public can view available vehicles" ON public.vehicles;

-- Create new policy that limits what vehicle data is publicly accessible
CREATE POLICY "Public can view limited vehicle data" ON public.vehicles
FOR SELECT 
TO PUBLIC
USING (
  status = 'available' AND
  -- Additional security: only show vehicles from active dealers
  dealer_id IN (
    SELECT id FROM public.dealers 
    WHERE is_active = true AND status = 'active'
  )
);

-- Enhanced input validation function
CREATE OR REPLACE FUNCTION public.validate_lead_creation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Enhanced email validation (more strict RFC compliance)
  IF NEW.email !~ '^[a-zA-Z0-9.!#$%&''*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$' THEN
    RAISE EXCEPTION 'Invalid email format provided';
  END IF;
  
  -- Enhanced name validation
  IF LENGTH(TRIM(NEW.first_name)) < 2 OR LENGTH(TRIM(NEW.last_name)) < 1 THEN
    RAISE EXCEPTION 'Valid first name (min 2 chars) and last name are required';
  END IF;
  
  -- Check for suspicious patterns in names (all caps, repeated characters, etc.)
  IF NEW.first_name ~ '^[A-Z]{3,}$' OR NEW.last_name ~ '^[A-Z]{3,}$' THEN
    RAISE EXCEPTION 'Invalid name format detected';
  END IF;
  
  -- Validate phone number format if provided
  IF NEW.phone IS NOT NULL AND LENGTH(TRIM(NEW.phone)) > 0 THEN
    -- Remove common formatting characters for validation
    IF LENGTH(REGEXP_REPLACE(NEW.phone, '[^0-9]', '', 'g')) < 10 THEN
      RAISE EXCEPTION 'Phone number must contain at least 10 digits';
    END IF;
  END IF;
  
  -- Enhanced duplicate prevention (check for similar names + email combo)
  IF EXISTS (
    SELECT 1 FROM public.leads 
    WHERE LOWER(TRIM(email)) = LOWER(TRIM(NEW.email))
    AND LOWER(TRIM(first_name)) = LOWER(TRIM(NEW.first_name))
    AND dealer_id = NEW.dealer_id 
    AND created_at > NOW() - INTERVAL '24 hours'
  ) THEN
    RAISE EXCEPTION 'A similar lead submission was already received recently. Please contact us directly if you need immediate assistance.';
  END IF;
  
  -- Sanitize and normalize input data
  NEW.first_name := TRIM(INITCAP(NEW.first_name));
  NEW.last_name := TRIM(INITCAP(NEW.last_name));
  NEW.email := LOWER(TRIM(NEW.email));
  
  -- Clean and limit notes
  IF NEW.notes IS NOT NULL THEN
    NEW.notes := TRIM(NEW.notes);
    -- Remove excessive whitespace
    NEW.notes := REGEXP_REPLACE(NEW.notes, '\s+', ' ', 'g');
    -- Limit length
    IF LENGTH(NEW.notes) > 1000 THEN
      NEW.notes := LEFT(NEW.notes, 997) || '...';
    END IF;
  END IF;
  
  -- Clean phone number
  IF NEW.phone IS NOT NULL THEN
    NEW.phone := TRIM(NEW.phone);
  END IF;
  
  RETURN NEW;
END;
$function$;