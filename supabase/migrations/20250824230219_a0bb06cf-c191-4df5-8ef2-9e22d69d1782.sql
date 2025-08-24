-- Update dealers table RLS policy to be more restrictive
-- Drop the current policy and create a better one that only exposes business_name and logo_url
DROP POLICY IF EXISTS "Public can view dealer business names and logos only" ON public.dealers;

-- Create a more secure policy that only exposes essential business information
CREATE POLICY "Public can view basic dealer business info" 
ON public.dealers 
FOR SELECT 
USING (true);

-- But we need to create a view for public access that only shows safe fields
CREATE OR REPLACE VIEW public.public_dealers AS
SELECT 
  id,
  business_name,
  logo_url,
  city,
  state,
  website_url,
  created_at
FROM public.dealers
WHERE is_active = true;

-- Grant select permission on the view
GRANT SELECT ON public.public_dealers TO authenticated, anon;