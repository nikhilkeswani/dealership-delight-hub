-- Create subscription_plans table to define available tiers
CREATE TABLE public.subscription_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  tier dealer_tier NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  price_monthly NUMERIC NOT NULL,
  price_yearly NUMERIC,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  limits JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create usage_tracking table to monitor feature usage
CREATE TABLE public.usage_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dealer_id UUID NOT NULL,
  feature_name TEXT NOT NULL,
  usage_count INTEGER NOT NULL DEFAULT 0,
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create billing_history table for payment records
CREATE TABLE public.billing_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subscription_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL,
  payment_date TIMESTAMP WITH TIME ZONE,
  invoice_url TEXT,
  stripe_invoice_id TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create payment_methods table for stored payment info
CREATE TABLE public.payment_methods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dealer_id UUID NOT NULL,
  stripe_payment_method_id TEXT,
  type TEXT NOT NULL,
  last_four TEXT,
  exp_month INTEGER,
  exp_year INTEGER,
  brand TEXT,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Stripe-related fields to subscriptions table
ALTER TABLE public.subscriptions 
ADD COLUMN stripe_customer_id TEXT,
ADD COLUMN stripe_subscription_id TEXT,
ADD COLUMN current_period_start TIMESTAMP WITH TIME ZONE,
ADD COLUMN current_period_end TIMESTAMP WITH TIME ZONE,
ADD COLUMN cancel_at_period_end BOOLEAN DEFAULT false,
ADD COLUMN trial_end TIMESTAMP WITH TIME ZONE;

-- Add usage tracking fields to dealers table
ALTER TABLE public.dealers
ADD COLUMN monthly_leads_count INTEGER DEFAULT 0,
ADD COLUMN monthly_vehicles_count INTEGER DEFAULT 0,
ADD COLUMN monthly_customers_count INTEGER DEFAULT 0,
ADD COLUMN last_usage_reset TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Enable RLS on new tables
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscription_plans (public read access)
CREATE POLICY "Anyone can view subscription plans"
ON public.subscription_plans
FOR SELECT
USING (is_active = true);

-- RLS Policies for usage_tracking
CREATE POLICY "Dealers can view their own usage tracking"
ON public.usage_tracking
FOR SELECT
USING (dealer_id IN (SELECT id FROM dealers WHERE user_id = auth.uid()));

CREATE POLICY "System can manage usage tracking"
ON public.usage_tracking
FOR ALL
USING (true);

CREATE POLICY "Providers can view all usage tracking"
ON public.usage_tracking
FOR SELECT
USING (is_provider(auth.uid()));

-- RLS Policies for billing_history
CREATE POLICY "Dealers can view their own billing history"
ON public.billing_history
FOR SELECT
USING (subscription_id IN (
  SELECT s.id FROM subscriptions s
  JOIN dealers d ON s.dealer_id = d.id
  WHERE d.user_id = auth.uid()
));

CREATE POLICY "Providers can view all billing history"
ON public.billing_history
FOR SELECT
USING (is_provider(auth.uid()));

CREATE POLICY "System can manage billing history"
ON public.billing_history
FOR ALL
USING (true);

-- RLS Policies for payment_methods
CREATE POLICY "Dealers can manage their own payment methods"
ON public.payment_methods
FOR ALL
USING (dealer_id IN (SELECT id FROM dealers WHERE user_id = auth.uid()));

CREATE POLICY "Providers can view all payment methods"
ON public.payment_methods
FOR SELECT
USING (is_provider(auth.uid()));

-- Create indexes for performance
CREATE INDEX idx_usage_tracking_dealer_feature ON usage_tracking(dealer_id, feature_name);
CREATE INDEX idx_usage_tracking_period ON usage_tracking(period_start, period_end);
CREATE INDEX idx_billing_history_subscription ON billing_history(subscription_id);
CREATE INDEX idx_payment_methods_dealer ON payment_methods(dealer_id);
CREATE INDEX idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_stripe_subscription ON subscriptions(stripe_subscription_id);

-- Insert default subscription plans
INSERT INTO public.subscription_plans (name, tier, display_name, description, price_monthly, price_yearly, features, limits, sort_order) VALUES
('basic', 'basic', 'Basic Plan', 'Perfect for small dealerships getting started', 29.99, 299.99, 
 '["Lead Management", "Basic Vehicle Inventory", "Customer Database", "Email Support"]'::jsonb,
 '{"leads_per_month": 100, "vehicles": 50, "customers": 500}'::jsonb, 1),
('premium', 'premium', 'Premium Plan', 'Great for growing dealerships with advanced needs', 79.99, 799.99,
 '["Everything in Basic", "Advanced Analytics", "Custom Website", "Priority Support", "API Access"]'::jsonb,
 '{"leads_per_month": 500, "vehicles": 200, "customers": 2000}'::jsonb, 2),
('enterprise', 'enterprise', 'Enterprise Plan', 'Complete solution for large dealership groups', 199.99, 1999.99,
 '["Everything in Premium", "Multi-Location Management", "Dedicated Support", "Custom Integrations", "White Label"]'::jsonb,
 '{"leads_per_month": -1, "vehicles": -1, "customers": -1}'::jsonb, 3);

-- Create triggers for updated_at
CREATE TRIGGER update_subscription_plans_updated_at
  BEFORE UPDATE ON public.subscription_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_usage_tracking_updated_at
  BEFORE UPDATE ON public.usage_tracking
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payment_methods_updated_at
  BEFORE UPDATE ON public.payment_methods
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to reset monthly usage counters
CREATE OR REPLACE FUNCTION public.reset_monthly_usage()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.dealers 
  SET 
    monthly_leads_count = 0,
    monthly_vehicles_count = 0,
    monthly_customers_count = 0,
    last_usage_reset = now()
  WHERE last_usage_reset < date_trunc('month', now());
END;
$$;

-- Function to check subscription limits
CREATE OR REPLACE FUNCTION public.check_subscription_limit(
  _dealer_id UUID,
  _feature_name TEXT,
  _current_count INTEGER DEFAULT 1
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  subscription_limits JSONB;
  feature_limit INTEGER;
BEGIN
  -- Get the dealer's subscription limits
  SELECT sp.limits INTO subscription_limits
  FROM public.subscriptions s
  JOIN public.subscription_plans sp ON s.tier = sp.tier
  WHERE s.dealer_id = _dealer_id AND s.status = 'active';
  
  IF subscription_limits IS NULL THEN
    RETURN false;
  END IF;
  
  -- Get the specific feature limit
  feature_limit := (subscription_limits ->> _feature_name)::INTEGER;
  
  -- -1 means unlimited
  IF feature_limit = -1 THEN
    RETURN true;
  END IF;
  
  -- Check if current usage is within limit
  RETURN _current_count <= feature_limit;
END;
$$;