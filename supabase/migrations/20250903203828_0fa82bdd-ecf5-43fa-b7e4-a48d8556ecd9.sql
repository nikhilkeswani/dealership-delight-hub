-- Add new columns to vehicles table for enhanced filtering
ALTER TABLE public.vehicles 
ADD COLUMN body_type TEXT,
ADD COLUMN fuel_type TEXT,
ADD COLUMN transmission TEXT,
ADD COLUMN condition TEXT DEFAULT 'used';

-- Create indexes for better query performance
CREATE INDEX idx_vehicles_body_type ON public.vehicles(body_type);
CREATE INDEX idx_vehicles_fuel_type ON public.vehicles(fuel_type);
CREATE INDEX idx_vehicles_transmission ON public.vehicles(transmission);
CREATE INDEX idx_vehicles_condition ON public.vehicles(condition);

-- Update existing vehicles with sample data to demonstrate filtering
UPDATE public.vehicles 
SET 
  body_type = CASE 
    WHEN LOWER(make || ' ' || model) LIKE '%sedan%' THEN 'sedan'
    WHEN LOWER(make || ' ' || model) LIKE '%suv%' OR LOWER(make || ' ' || model) LIKE '%explorer%' OR LOWER(make || ' ' || model) LIKE '%tahoe%' THEN 'suv'
    WHEN LOWER(make || ' ' || model) LIKE '%hatch%' OR LOWER(make || ' ' || model) LIKE '%civic%' THEN 'hatch'
    WHEN LOWER(make || ' ' || model) LIKE '%truck%' OR LOWER(make || ' ' || model) LIKE '%f-150%' THEN 'truck'
    ELSE 'sedan'
  END,
  fuel_type = CASE 
    WHEN LOWER(make || ' ' || model) LIKE '%hybrid%' THEN 'hybrid'
    WHEN LOWER(make || ' ' || model) LIKE '%electric%' OR LOWER(make || ' ' || model) LIKE '%tesla%' THEN 'electric'
    WHEN LOWER(make || ' ' || model) LIKE '%diesel%' THEN 'diesel'
    ELSE 'gasoline'
  END,
  transmission = CASE 
    WHEN RANDOM() > 0.2 THEN 'automatic'
    ELSE 'manual'
  END,
  condition = CASE 
    WHEN year >= 2024 THEN 'new'
    WHEN year >= 2020 AND mileage < 50000 THEN 'certified-pre-owned'
    ELSE 'used'
  END
WHERE body_type IS NULL;