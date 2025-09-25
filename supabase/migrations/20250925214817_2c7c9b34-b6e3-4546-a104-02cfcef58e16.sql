-- Fix Security Definer View issue
-- Drop and recreate the view without security definer property
DROP VIEW IF EXISTS public.public_vehicles;

-- Create a simple view without security definer (safer approach)
CREATE VIEW public.public_vehicles AS 
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

-- The view will inherit the RLS policies from the underlying vehicles table
-- which is what we want for proper security