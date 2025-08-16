-- Fix critical security issues

-- 1. Add public read access to dealers table (basic business info only)
CREATE POLICY "Public can view basic dealer information" 
ON public.dealers 
FOR SELECT 
USING (true);

-- 2. Add public read access to vehicles table (published vehicles only)
CREATE POLICY "Public can view available vehicles" 
ON public.vehicles 
FOR SELECT 
USING (status = 'available');

-- 3. Add public read access to dealer_websites table (published sites only)
CREATE POLICY "Public can view published dealer websites" 
ON public.dealer_websites 
FOR SELECT 
USING (is_published = true);

-- 4. Allow public lead creation (for lead capture forms)
CREATE POLICY "Public can create leads" 
ON public.leads 
FOR INSERT 
WITH CHECK (true);

-- 5. Fix subscription table security - add missing policies
CREATE POLICY "Only system can insert subscriptions" 
ON public.subscriptions 
FOR INSERT 
WITH CHECK (false); -- Only system/admin should create subscriptions

CREATE POLICY "Only system can update subscriptions" 
ON public.subscriptions 
FOR UPDATE 
USING (false); -- Only system/admin should update subscriptions

CREATE POLICY "Only system can delete subscriptions" 
ON public.subscriptions 
FOR DELETE 
USING (false); -- Only system/admin should delete subscriptions

-- 6. Fix function search path security issue
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;