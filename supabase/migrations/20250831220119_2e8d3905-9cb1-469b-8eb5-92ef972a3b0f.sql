-- Add stage column to sales table to track deal progression
-- Make customer_id nullable since deals start without customers
-- Add lead_id to link back to original lead

-- First, add the new columns
ALTER TABLE public.sales 
ADD COLUMN stage text NOT NULL DEFAULT 'lead',
ADD COLUMN lead_id uuid REFERENCES public.leads(id),
ADD COLUMN expected_close_date timestamp with time zone,
ADD COLUMN deal_notes text;

-- Make customer_id nullable since deals can start without customers
ALTER TABLE public.sales ALTER COLUMN customer_id DROP NOT NULL;

-- Make sale_date nullable since deals might not be closed yet
ALTER TABLE public.sales ALTER COLUMN sale_date DROP NOT NULL;

-- Make sale_price nullable since deals might not have final price yet
ALTER TABLE public.sales ALTER COLUMN sale_price DROP NOT NULL;

-- Create index for better performance
CREATE INDEX idx_sales_stage ON public.sales(stage);
CREATE INDEX idx_sales_dealer_stage ON public.sales(dealer_id, stage);
CREATE INDEX idx_sales_lead_id ON public.sales(lead_id);