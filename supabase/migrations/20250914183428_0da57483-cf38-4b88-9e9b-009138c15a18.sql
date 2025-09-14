-- Update subscription plans with new limits and features
UPDATE public.subscription_plans 
SET 
  limits = jsonb_build_object(
    'vehicles', 100,
    'leads_per_month', 200,
    'customers', 500,
    'domain_type', 'subdomain',
    'support_level', 'email'
  ),
  features = jsonb_build_array(
    '100 vehicle listings',
    '200 leads per month', 
    '500 customers',
    'Subdomain included',
    'Email support',
    'Inventory management',
    'Lead tracking',
    'Customer database',
    'Analytics dashboard',
    'Powered by Dealer Delight'
  )
WHERE tier = 'basic';

UPDATE public.subscription_plans 
SET 
  limits = jsonb_build_object(
    'vehicles', 500,
    'leads_per_month', 1000,
    'customers', 2000,
    'domain_type', 'custom',
    'support_level', 'priority'
  ),
  features = jsonb_build_array(
    '500 vehicle listings',
    '1000 leads per month',
    '2000 customers', 
    'Custom domain support',
    'Priority support',
    'Advanced analytics',
    'Inventory management',
    'Lead tracking',
    'Customer database',
    'Team collaboration',
    'Powered by Dealer Delight'
  )
WHERE tier = 'premium';