-- Function to grant provider role to a specific user (for platform setup)
-- Replace 'your-email@example.com' with your actual email address
CREATE OR REPLACE FUNCTION grant_provider_role_by_email(user_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_user_id uuid;
  existing_provider_record uuid;
BEGIN
  -- Find the user by email
  SELECT id INTO target_user_id 
  FROM auth.users 
  WHERE email = user_email;
  
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', user_email;
  END IF;
  
  -- Check if user already has provider role
  IF EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = target_user_id AND role = 'provider'
  ) THEN
    RAISE NOTICE 'User % already has provider role', user_email;
    RETURN;
  END IF;
  
  -- Grant provider role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, 'provider'::app_role);
  
  -- Create provider profile if it doesn't exist
  SELECT id INTO existing_provider_record
  FROM public.providers 
  WHERE user_id = target_user_id;
  
  IF existing_provider_record IS NULL THEN
    INSERT INTO public.providers (
      user_id,
      company_name,
      contact_email,
      is_active
    ) VALUES (
      target_user_id,
      'DealerDelight Platform',
      user_email,
      true
    );
  END IF;
  
  -- Log the action
  INSERT INTO public.audit_logs (
    user_id,
    action,
    resource_type,
    details
  ) VALUES (
    target_user_id,
    'grant_provider_role',
    'user',
    jsonb_build_object(
      'email', user_email,
      'granted_at', now(),
      'method', 'manual_setup'
    )
  );
  
  RAISE NOTICE 'Provider role granted successfully to %', user_email;
END;
$$;