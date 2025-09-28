-- Simple fix to ensure public_vehicles view doesn't have SECURITY DEFINER
-- This addresses the security concern about bypassing RLS

DROP VIEW IF EXISTS public.public_vehicles;

-- Recreate the view without SECURITY DEFINER to ensure RLS is respected
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

-- Test that we can access the view (should return count of available vehicles)
SELECT COUNT(*) as available_vehicles_count FROM public.public_vehicles;