-- Restore original two-tier pricing structure
-- Delete Enterprise tier
DELETE FROM public.subscription_plans WHERE tier = 'enterprise';

-- Update Basic plan pricing to $179/month
UPDATE public.subscription_plans 
SET 
  price_monthly = 179.00,
  price_yearly = 179.00 * 12 * 0.9, -- 10% discount for yearly
  display_name = 'Basic',
  description = 'Perfect for small dealerships getting started',
  features = '[
    "50 vehicle listings",
    "100 leads per month", 
    "500 customers",
    "Lead management",
    "Email support"
  ]'::jsonb,
  limits = '{
    "vehicles": 50,
    "leads": 100,
    "customers": 500
  }'::jsonb,
  sort_order = 1
WHERE tier = 'basic';

-- Update Premium plan pricing to $279/month
UPDATE public.subscription_plans 
SET 
  price_monthly = 279.00,
  price_yearly = 279.00 * 12 * 0.9, -- 10% discount for yearly
  display_name = 'Premium',
  description = 'Great for growing dealerships with advanced needs',
  features = '[
    "200 vehicle listings",
    "500 leads per month",
    "2,000 customers", 
    "Advanced analytics",
    "Priority support"
  ]'::jsonb,
  limits = '{
    "vehicles": 200,
    "leads": 500,
    "customers": 2000
  }'::jsonb,
  sort_order = 2
WHERE tier = 'premium';

-- Update any existing Enterprise subscriptions to Premium
UPDATE public.subscriptions 
SET tier = 'premium'::dealer_tier, amount = 279.00
WHERE tier = 'enterprise';