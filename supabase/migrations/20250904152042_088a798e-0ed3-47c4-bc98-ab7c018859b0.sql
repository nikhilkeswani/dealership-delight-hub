-- Create app role enum
CREATE TYPE public.app_role AS ENUM ('provider', 'admin', 'dealer');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create providers table
CREATE TABLE public.providers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  company_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on providers
ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;

-- Add provider_id to dealers table
ALTER TABLE public.dealers ADD COLUMN provider_id UUID REFERENCES public.providers(id);
ALTER TABLE public.dealers ADD COLUMN status TEXT NOT NULL DEFAULT 'active';

-- Create audit_logs table for tracking provider actions
CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to check if user is provider
CREATE OR REPLACE FUNCTION public.is_provider(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'provider')
$$;

-- Create function to get user's provider id
CREATE OR REPLACE FUNCTION public.get_user_provider_id(_user_id UUID)
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id
  FROM public.providers p
  WHERE p.user_id = _user_id
$$;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Providers can view all user roles"
ON public.user_roles
FOR SELECT
USING (public.is_provider(auth.uid()));

-- RLS Policies for providers
CREATE POLICY "Providers can view their own profile"
ON public.providers
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Providers can update their own profile"
ON public.providers
FOR UPDATE
USING (user_id = auth.uid());

-- RLS Policies for audit_logs
CREATE POLICY "Providers can view all audit logs"
ON public.audit_logs
FOR SELECT
USING (public.is_provider(auth.uid()));

CREATE POLICY "All users can create audit logs"
ON public.audit_logs
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Update dealers RLS policies to allow provider access
CREATE POLICY "Providers can view all dealers"
ON public.dealers
FOR SELECT
USING (public.is_provider(auth.uid()));

CREATE POLICY "Providers can manage all dealers"
ON public.dealers
FOR ALL
USING (public.is_provider(auth.uid()));

-- Update vehicles RLS policies for provider access
CREATE POLICY "Providers can view all vehicles"
ON public.vehicles
FOR SELECT
USING (public.is_provider(auth.uid()));

-- Update leads RLS policies for provider access
CREATE POLICY "Providers can view all leads"
ON public.leads
FOR SELECT
USING (public.is_provider(auth.uid()));

-- Update sales RLS policies for provider access  
CREATE POLICY "Providers can view all sales"
ON public.sales
FOR SELECT
USING (public.is_provider(auth.uid()));

-- Update customers RLS policies for provider access
CREATE POLICY "Providers can view all customers"
ON public.customers
FOR SELECT
USING (public.is_provider(auth.uid()));

-- Update subscriptions RLS policies for provider access
CREATE POLICY "Providers can view all subscriptions"
ON public.subscriptions
FOR SELECT
USING (public.is_provider(auth.uid()));

CREATE POLICY "Providers can manage subscriptions"
ON public.subscriptions
FOR ALL
USING (public.is_provider(auth.uid()));

-- Update dealer_websites RLS policies for provider access
CREATE POLICY "Providers can view all dealer websites"
ON public.dealer_websites
FOR SELECT
USING (public.is_provider(auth.uid()));

-- Create trigger for updating providers updated_at
CREATE TRIGGER update_providers_updated_at
BEFORE UPDATE ON public.providers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to log audit actions
CREATE OR REPLACE FUNCTION public.log_audit_action(
  _action TEXT,
  _resource_type TEXT,
  _resource_id UUID DEFAULT NULL,
  _details JSONB DEFAULT '{}'
)
RETURNS VOID
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  INSERT INTO public.audit_logs (user_id, action, resource_type, resource_id, details)
  VALUES (auth.uid(), _action, _resource_type, _resource_id, _details)
$$;