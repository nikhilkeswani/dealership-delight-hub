-- Add status field to customers table to track active vs reverted customers
ALTER TABLE public.customers 
ADD COLUMN status TEXT NOT NULL DEFAULT 'active';

-- Add check constraint for customer status
ALTER TABLE public.customers 
ADD CONSTRAINT customers_status_check CHECK (status IN ('active', 'reverted'));

-- Update the validation function to allow status changes from converted
CREATE OR REPLACE FUNCTION public.validate_lead_customer_relationship()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  customer_exists BOOLEAN := FALSE;
BEGIN
  -- If status is being changed to 'converted', ensure customer exists
  IF NEW.status = 'converted' THEN
    SELECT EXISTS (
      SELECT 1 FROM public.customers 
      WHERE lead_id = NEW.id AND status = 'active'
    ) INTO customer_exists;
    
    IF NOT customer_exists THEN
      RAISE EXCEPTION 'Cannot set lead status to converted without corresponding active customer record. Use proper conversion process.';
    END IF;
  END IF;
  
  -- If status is being changed from 'converted' to something else, mark customer as reverted
  IF OLD.status = 'converted' AND NEW.status != 'converted' THEN
    -- Mark existing customer as reverted instead of preventing the change
    UPDATE public.customers 
    SET status = 'reverted', updated_at = now()
    WHERE lead_id = NEW.id AND status = 'active';
    
    -- Log the reversion
    PERFORM public.log_audit_action(
      'lead_conversion_reverted',
      'lead',
      NEW.id,
      jsonb_build_object(
        'from_status', OLD.status,
        'to_status', NEW.status,
        'lead_email', NEW.email,
        'reversion_method', 'status_change'
      )
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Update existing customers to have 'active' status
UPDATE public.customers SET status = 'active' WHERE status IS NULL;