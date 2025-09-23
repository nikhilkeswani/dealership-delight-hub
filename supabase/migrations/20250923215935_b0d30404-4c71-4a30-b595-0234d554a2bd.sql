-- Drop existing trigger if it exists and recreate
DROP TRIGGER IF EXISTS validate_lead_customer_relationship_trigger ON public.leads;
DROP TRIGGER IF EXISTS log_lead_conversion_audit_trigger ON public.leads;

-- Function to validate lead-customer relationship consistency
CREATE OR REPLACE FUNCTION public.validate_lead_customer_relationship()
RETURNS TRIGGER AS $$
DECLARE
  customer_exists BOOLEAN := FALSE;
BEGIN
  -- If status is being changed to 'converted', ensure customer exists
  IF NEW.status = 'converted' THEN
    SELECT EXISTS (
      SELECT 1 FROM public.customers 
      WHERE lead_id = NEW.id
    ) INTO customer_exists;
    
    IF NOT customer_exists THEN
      RAISE EXCEPTION 'Cannot set lead status to converted without corresponding customer record. Use proper conversion process.';
    END IF;
  END IF;
  
  -- If status is being changed from 'converted' to something else, handle customer
  IF OLD.status = 'converted' AND NEW.status != 'converted' THEN
    -- Option 1: Prevent the change if customer exists
    SELECT EXISTS (
      SELECT 1 FROM public.customers 
      WHERE lead_id = NEW.id
    ) INTO customer_exists;
    
    IF customer_exists THEN
      RAISE EXCEPTION 'Cannot change status of converted lead with existing customer. Remove customer first or use proper reversion process.';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to clean up orphaned data
CREATE OR REPLACE FUNCTION public.cleanup_orphaned_lead_customer_data()
RETURNS TABLE(action_type TEXT, lead_id UUID, customer_id UUID, details TEXT) AS $$
DECLARE
  rec RECORD;
BEGIN
  -- Find converted leads without customers
  FOR rec IN 
    SELECT l.id as lead_id, l.first_name, l.last_name, l.email
    FROM public.leads l
    WHERE l.status = 'converted'
    AND NOT EXISTS (
      SELECT 1 FROM public.customers c WHERE c.lead_id = l.id
    )
  LOOP
    -- Create missing customer record
    INSERT INTO public.customers (
      first_name, last_name, email, phone, dealer_id, lead_id
    )
    SELECT l.first_name, l.last_name, l.email, l.phone, l.dealer_id, l.id
    FROM public.leads l
    WHERE l.id = rec.lead_id;
    
    RETURN QUERY SELECT 
      'created_customer'::TEXT, 
      rec.lead_id, 
      (SELECT id FROM public.customers WHERE lead_id = rec.lead_id)::UUID,
      ('Created customer for orphaned converted lead: ' || rec.first_name || ' ' || rec.last_name)::TEXT;
  END LOOP;
  
  -- Find customers without converted leads
  FOR rec IN
    SELECT c.id as customer_id, c.lead_id, c.first_name, c.last_name
    FROM public.customers c
    LEFT JOIN public.leads l ON c.lead_id = l.id
    WHERE c.lead_id IS NOT NULL 
    AND (l.id IS NULL OR l.status != 'converted')
  LOOP
    -- Update lead status to converted if lead exists but isn't converted
    IF EXISTS (SELECT 1 FROM public.leads WHERE id = rec.lead_id) THEN
      UPDATE public.leads 
      SET status = 'converted' 
      WHERE id = rec.lead_id;
      
      RETURN QUERY SELECT 
        'updated_lead_status'::TEXT,
        rec.lead_id,
        rec.customer_id,
        ('Updated lead status to converted for customer: ' || rec.first_name || ' ' || rec.last_name)::TEXT;
    END IF;
  END LOOP;
  
  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function for audit logging
CREATE OR REPLACE FUNCTION public.log_lead_conversion_audit()
RETURNS TRIGGER AS $$
BEGIN
  -- Log conversion events
  IF OLD.status != 'converted' AND NEW.status = 'converted' THEN
    PERFORM public.log_audit_action(
      'lead_converted',
      'lead',
      NEW.id,
      jsonb_build_object(
        'from_status', OLD.status,
        'to_status', NEW.status,
        'lead_email', NEW.email,
        'conversion_method', 'manual_status_change'
      )
    );
  END IF;
  
  -- Log reversion events
  IF OLD.status = 'converted' AND NEW.status != 'converted' THEN
    PERFORM public.log_audit_action(
      'lead_conversion_reverted',
      'lead',
      NEW.id,
      jsonb_build_object(
        'from_status', OLD.status,
        'to_status', NEW.status,
        'lead_email', NEW.email
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Add triggers
CREATE TRIGGER validate_lead_customer_relationship_trigger
  BEFORE UPDATE OF status ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_lead_customer_relationship();

CREATE TRIGGER log_lead_conversion_audit_trigger
  AFTER UPDATE OF status ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.log_lead_conversion_audit();