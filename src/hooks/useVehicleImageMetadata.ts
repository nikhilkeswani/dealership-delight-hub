import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ImageMetadata {
  url: string;
  alt: string;
  description?: string;
  isPrimary?: boolean;
}

export const useVehicleImageMetadata = (vehicleId?: string) => {
  const [metadata, setMetadata] = useState<ImageMetadata[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (vehicleId && vehicleId !== 'temp-' && !vehicleId.startsWith('temp-')) {
      loadMetadata();
    }
  }, [vehicleId]);

  const loadMetadata = async () => {
    if (!vehicleId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('image_metadata')
        .eq('id', vehicleId)
        .single();

      if (error) {
        console.error('Failed to load image metadata:', error);
        return;
      }

      setMetadata((Array.isArray(data.image_metadata) ? data.image_metadata : []) as unknown as ImageMetadata[]);
    } catch (error) {
      console.error('Failed to load image metadata:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAltText = (imageUrl: string): string => {
    const meta = metadata.find(m => m.url === imageUrl);
    return meta?.alt || '';
  };

  const updateAltText = async (imageUrl: string, altText: string): Promise<boolean> => {
    if (!vehicleId || vehicleId.startsWith('temp-')) return false;

    try {
      const updatedMetadata = metadata.map(m => 
        m.url === imageUrl ? { ...m, alt: altText } : m
      );

      // If image not found, add it
      if (!metadata.find(m => m.url === imageUrl)) {
        updatedMetadata.push({
          url: imageUrl,
          alt: altText,
          isPrimary: updatedMetadata.length === 0
        });
      }

      const { error } = await supabase
        .from('vehicles')
        .update({ image_metadata: updatedMetadata as any })
        .eq('id', vehicleId);

      if (error) {
        console.error('Failed to update alt text:', error);
        return false;
      }

      setMetadata(updatedMetadata);
      return true;
    } catch (error) {
      console.error('Failed to update alt text:', error);
      return false;
    }
  };

  return {
    metadata,
    loading,
    getAltText,
    updateAltText,
    refreshMetadata: loadMetadata
  };
};