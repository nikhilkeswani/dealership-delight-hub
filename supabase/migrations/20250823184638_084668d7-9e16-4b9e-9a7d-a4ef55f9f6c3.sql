-- Create storage bucket for dealer website assets (logos, images, etc.)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('dealer-assets', 'dealer-assets', true);

-- Storage policies for dealer assets
CREATE POLICY "Dealers can upload their own assets" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'dealer-assets' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Dealers can view their own assets" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'dealer-assets' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Dealers can update their own assets" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'dealer-assets' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Dealers can delete their own assets" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'dealer-assets' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Public access for published dealer assets
CREATE POLICY "Published dealer assets are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'dealer-assets' 
  AND (storage.foldername(name))[2] = 'public'
);