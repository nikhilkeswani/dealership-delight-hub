-- Remove the problematic view and fix the RLS policy instead
DROP VIEW IF EXISTS public.public_dealers;

-- Update the RLS policy to be more secure - remove all public access to dealers table
DROP POLICY IF EXISTS "Public can view basic dealer business info" ON public.dealers;

-- Only allow authenticated users to see their own dealer profile, and public access through specific endpoints
CREATE POLICY "Users can view their own dealer profile only" 
ON public.dealers 
FOR SELECT 
USING (auth.uid() = user_id);

-- For public dealer websites, we'll access dealer info through the dealer_websites table instead
-- Update dealer_websites to include necessary dealer info for public display
ALTER TABLE public.dealer_websites 
ADD COLUMN IF NOT EXISTS business_name text,
ADD COLUMN IF NOT EXISTS logo_url text,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS state text;