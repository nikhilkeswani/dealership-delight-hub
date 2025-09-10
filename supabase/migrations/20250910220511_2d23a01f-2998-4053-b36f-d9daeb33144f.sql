-- CRITICAL SECURITY FIX: Prevent public access to leads table
-- This fixes the vulnerability where competitors could steal customer contact information

-- First, ensure RLS is enabled on leads table
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Remove all existing policies to start fresh
DROP POLICY IF EXISTS "Dealers can manage their own leads" ON public.leads;
DROP POLICY IF EXISTS "Providers can view all leads" ON public.leads;  
DROP POLICY IF EXISTS "Public can create leads" ON public.leads;
DROP POLICY IF EXISTS "Public can create leads only" ON public.leads;
DROP POLICY IF EXISTS "Deny public SELECT access to leads" ON public.leads;
DROP POLICY IF EXISTS "Deny public UPDATE access to leads" ON public.leads;
DROP POLICY IF EXISTS "Deny public DELETE access to leads" ON public.leads;

-- Policy 1: Only dealers can manage their own leads (authenticated users only)
CREATE POLICY "Dealers manage own leads" 
ON public.leads 
FOR ALL 
TO authenticated
USING (dealer_id IN (
  SELECT d.id FROM public.dealers d WHERE d.user_id = auth.uid()
))
WITH CHECK (dealer_id IN (
  SELECT d.id FROM public.dealers d WHERE d.user_id = auth.uid()
));

-- Policy 2: Only providers can view all leads (authenticated users only)  
CREATE POLICY "Providers view all leads" 
ON public.leads 
FOR SELECT 
TO authenticated
USING (public.is_provider(auth.uid()));

-- Policy 3: Allow public to INSERT leads only (for lead forms on dealer websites)
CREATE POLICY "Public insert leads only" 
ON public.leads 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- CRITICAL: No SELECT policy for public users means they cannot read any leads
-- This prevents competitors from accessing customer contact information