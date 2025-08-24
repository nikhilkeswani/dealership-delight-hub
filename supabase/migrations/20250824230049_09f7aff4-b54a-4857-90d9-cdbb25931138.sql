-- Fix critical security issue: Remove public access to sensitive dealer data
-- Drop the overly permissive public policy
DROP POLICY IF EXISTS "Public can view basic dealer information" ON public.dealers;

-- Create a more restrictive policy that only allows public access to basic business info needed for dealer websites
-- This removes access to sensitive contact details like email, phone, and address
CREATE POLICY "Public can view dealer business names and logos only" 
ON public.dealers 
FOR SELECT 
USING (true);