-- Add image metadata support to vehicles table
ALTER TABLE public.vehicles 
ADD COLUMN IF NOT EXISTS image_metadata JSONB DEFAULT '[]'::jsonb;

-- Add comment to explain the structure
COMMENT ON COLUMN public.vehicles.image_metadata IS 'Array of image metadata objects containing url, alt_text, description, dimensions, etc.';

-- Create index for better performance when querying image metadata
CREATE INDEX IF NOT EXISTS idx_vehicles_image_metadata 
ON public.vehicles USING GIN (image_metadata);

-- Update existing vehicles to have proper image metadata structure
-- Using a different approach to avoid window function in aggregate
UPDATE public.vehicles 
SET image_metadata = (
  SELECT jsonb_agg(
    jsonb_build_object(
      'url', t.image_url,
      'alt_text', CASE 
        WHEN vehicles.make IS NOT NULL AND vehicles.model IS NOT NULL AND vehicles.year IS NOT NULL 
        THEN vehicles.year || ' ' || vehicles.make || ' ' || vehicles.model || ' - vehicle image'
        ELSE 'Vehicle image'
      END,
      'description', CASE 
        WHEN vehicles.make IS NOT NULL AND vehicles.model IS NOT NULL AND vehicles.year IS NOT NULL 
        THEN vehicles.year || ' ' || vehicles.make || ' ' || vehicles.model
        ELSE 'Vehicle'
      END,
      'size', 'medium',
      'is_primary', (t.idx = 1)
    )
  )
  FROM (
    SELECT image_url, row_number() OVER () as idx
    FROM unnest(COALESCE(vehicles.images, '{}')) AS image_url
  ) t
)
WHERE images IS NOT NULL AND array_length(images, 1) > 0 AND image_metadata = '[]'::jsonb;