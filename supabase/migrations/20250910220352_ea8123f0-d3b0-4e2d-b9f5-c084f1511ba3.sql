-- Enhanced security for leads table - ensure no public SELECT access
-- Drop existing policies to recreate them with explicit restrictions
DROP POLICY IF EXISTS "Dealers can manage their own leads" ON public.leads;
DROP POLICY IF EXISTS "Providers can view all leads" ON public.leads;  
DROP POLICY IF EXISTS "Public can create leads" ON public.leads;

-- Recreate policies with explicit public SELECT restriction
-- 1. Dealers can only manage their own leads
CREATE POLICY "Dealers can manage their own leads" 
ON public.leads 
FOR ALL 
TO authenticated
USING (dealer_id IN ( SELECT dealers.id FROM dealers WHERE dealers.user_id = auth.uid()))
WITH CHECK (dealer_id IN ( SELECT dealers.id FROM dealers WHERE dealers.user_id = auth.uid()));

-- 2. Providers can view all leads
CREATE POLICY "Providers can view all leads" 
ON public.leads 
FOR SELECT 
TO authenticated
USING (is_provider(auth.uid()));

-- 3. Public can only insert leads (no SELECT access)
CREATE POLICY "Public can create leads only" 
ON public.leads 
FOR INSERT 
TO anon
WITH CHECK (true);

-- 4. Explicitly deny all other public access
CREATE POLICY "Deny public SELECT access to leads" 
ON public.leads 
FOR SELECT 
TO anon
USING (false);

-- 5. Explicitly deny public UPDATE/DELETE access
CREATE POLICY "Deny public UPDATE access to leads" 
ON public.leads 
FOR UPDATE 
TO anon
USING (false);

CREATE POLICY "Deny public DELETE access to leads" 
ON public.leads 
FOR DELETE 
TO anon  
USING (false);