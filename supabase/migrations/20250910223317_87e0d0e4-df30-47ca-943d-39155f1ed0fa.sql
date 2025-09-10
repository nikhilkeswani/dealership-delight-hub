-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_dealer_id uuid;
BEGIN
  -- Create dealer profile for new user
  INSERT INTO public.dealers (
    user_id,
    business_name,
    contact_email,
    tier,
    status,
    is_active
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'business_name', 'New Business'),
    NEW.email,
    'basic'::dealer_tier,
    'active',
    true
  ) RETURNING id INTO new_dealer_id;
  
  -- Assign dealer role
  INSERT INTO public.user_roles (
    user_id,
    role
  ) VALUES (
    NEW.id,
    'dealer'::app_role
  );
  
  -- Create basic subscription
  INSERT INTO public.subscriptions (
    dealer_id,
    tier,
    status,
    amount,
    billing_cycle,
    next_billing_date
  ) VALUES (
    new_dealer_id,
    'basic'::dealer_tier,
    'active'::subscription_status,
    2999, -- $29.99 per month
    'monthly',
    NOW() + INTERVAL '1 month'
  );
  
  -- Log the registration
  INSERT INTO public.audit_logs (
    user_id,
    action,
    resource_type,
    resource_id,
    details
  ) VALUES (
    NEW.id,
    'user_signup',
    'dealer',
    new_dealer_id,
    jsonb_build_object(
      'email', NEW.email,
      'signup_method', 'email',
      'tier', 'basic'
    )
  );
  
  RETURN NEW;
END;
$$;

-- Trigger to automatically create dealer profile on user signup
CREATE OR REPLACE TRIGGER on_auth_user_created_dealer
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_signup();