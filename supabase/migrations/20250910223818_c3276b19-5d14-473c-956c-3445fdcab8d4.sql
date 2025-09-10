-- Grant provider role to the user keswani06@gmail.com
DO $$
DECLARE
  target_user_id uuid := '927261c3-d1e7-4cd1-8fe4-607c138d6bcb';
BEGIN
  -- Check if user already has provider role
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = target_user_id AND role = 'provider'
  ) THEN
    -- Grant provider role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (target_user_id, 'provider'::app_role);
    
    RAISE NOTICE 'Provider role granted successfully';
  ELSE
    RAISE NOTICE 'User already has provider role';
  END IF;
  
  -- Create provider profile if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM public.providers 
    WHERE user_id = target_user_id
  ) THEN
    INSERT INTO public.providers (
      user_id,
      company_name,
      contact_email,
      is_active
    ) VALUES (
      target_user_id,
      'DealerDelight Platform',
      'keswani06@gmail.com',
      true
    );
    
    RAISE NOTICE 'Provider profile created successfully';
  ELSE
    RAISE NOTICE 'Provider profile already exists';
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
      'email', 'keswani06@gmail.com',
      'granted_at', now(),
      'method', 'manual_setup'
    )
  );
END $$;