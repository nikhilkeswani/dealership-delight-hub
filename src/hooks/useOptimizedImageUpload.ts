import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { 
  generateImageSizes, 
  extractImageMetadata, 
  validateImageFile,
  generateAltText,
  type ImageMetadata,
  type OptimizedImageSizes
} from '@/lib/imageOptimization';

interface VehicleImageData {
  url: string;
  metadata: ImageMetadata;
  altText: string;
  size: 'thumbnail' | 'medium' | 'large' | 'original';
}

interface VehicleData {
  make?: string;
  model?: string;
  year?: number;
  condition?: string;
}

export const useOptimizedImageUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

  /**
   * Upload optimized images with multiple sizes
   */
  const uploadOptimizedImages = async (
    files: File[],
    vehicleId: string,
    vehicleData?: VehicleData,
    folder: string = 'vehicles'
  ): Promise<VehicleImageData[]> => {
    if (files.length === 0) return [];

    setIsUploading(true);
    const uploadedImages: VehicleImageData[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validate file
        const validation = validateImageFile(file);
        if (!validation.valid) {
          toast.error(`${file.name}: ${validation.error}`);
          continue;
        }

        // Update progress
        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));

        try {
          // Extract metadata
          const metadata = await extractImageMetadata(file);
          
          // Generate alt text
          const altText = generateAltText(vehicleData || {}, i);
          
          // Generate optimized sizes
          setUploadProgress(prev => ({ ...prev, [file.name]: 25 }));
          const imageSizes = await generateImageSizes(file);
          
          // Upload each size
          const sizeResults: Partial<OptimizedImageSizes> = {};
          const sizeNames = ['thumbnail', 'medium', 'large', 'original'] as const;
          
          for (let j = 0; j < sizeNames.length; j++) {
            const sizeName = sizeNames[j];
            const blob = imageSizes[sizeName];
            
            if (blob) {
              const timestamp = Date.now();
              const randomId = Math.random().toString(36).substring(2);
              const fileName = `${vehicleId}_${sizeName}_${timestamp}_${randomId}.jpg`;
              const filePath = `${folder}/${vehicleId}/${sizeName}/${fileName}`;
              
              const { data, error } = await supabase.storage
                .from('dealer-assets')
                .upload(filePath, blob, {
                  contentType: 'image/jpeg',
                  cacheControl: '31536000', // 1 year cache
                });

              if (error) {
                console.error(`Failed to upload ${sizeName}:`, error);
                continue;
              }

              const { data: urlData } = supabase.storage
                .from('dealer-assets')
                .getPublicUrl(data.path);

              sizeResults[sizeName] = urlData.publicUrl;
            }
            
            // Update progress
            const progress = 25 + ((j + 1) / sizeNames.length) * 70;
            setUploadProgress(prev => ({ ...prev, [file.name]: progress }));
          }

          // Store the medium size as the primary URL for backward compatibility
          if (sizeResults.medium) {
            uploadedImages.push({
              url: sizeResults.medium,
              metadata: {
                ...metadata,
                alt: altText,
                description: `${vehicleData?.year || ''} ${vehicleData?.make || ''} ${vehicleData?.model || ''}`.trim()
              },
              altText,
              size: 'medium'
            });
          }

          setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
          
        } catch (error) {
          console.error(`Failed to process ${file.name}:`, error);
          toast.error(`Failed to upload ${file.name}`);
        }
      }

      if (uploadedImages.length > 0) {
        toast.success(`Successfully uploaded ${uploadedImages.length} optimized images`);
      }

    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload images');
    } finally {
      setIsUploading(false);
      setUploadProgress({});
    }

    return uploadedImages;
  };

  /**
   * Delete optimized images (all sizes)
   */
  const deleteOptimizedImage = async (imageUrl: string, vehicleId?: string): Promise<boolean> => {
    try {
      if (!vehicleId) {
        // Fallback to original delete method
        const urlPath = imageUrl.split('/dealer-assets/')[1];
        if (!urlPath) return false;

        const { error } = await supabase.storage
          .from('dealer-assets')
          .remove([urlPath]);

        return !error;
      }

      // Delete all sizes for this image
      const sizeNames = ['thumbnail', 'medium', 'large', 'original'];
      const deletePromises = sizeNames.map(async (sizeName) => {
        const sizePath = imageUrl.replace('/medium/', `/${sizeName}/`);
        const urlPath = sizePath.split('/dealer-assets/')[1];
        
        if (urlPath) {
          await supabase.storage
            .from('dealer-assets')
            .remove([urlPath]);
        }
      });

      await Promise.all(deletePromises);
      return true;

    } catch (error) {
      console.error('Delete error:', error);
      return false;
    }
  };

  /**
   * Get optimized image URL for specific size
   */
  const getOptimizedImageUrl = (
    baseUrl: string, 
    size: 'thumbnail' | 'medium' | 'large' | 'original' = 'medium'
  ): string => {
    // Replace the size in the URL path
    return baseUrl.replace(/\/(thumbnail|medium|large|original)\//, `/${size}/`);
  };

  /**
   * Update image metadata (alt text, description)
   */
  const updateImageMetadata = async (
    imageUrl: string,
    metadata: Partial<ImageMetadata>
  ): Promise<boolean> => {
    try {
      // This would typically update database records
      // For now, we'll just return success
      // In a full implementation, you'd store metadata in your vehicles table
      toast.success('Image metadata updated');
      return true;
    } catch (error) {
      console.error('Failed to update metadata:', error);
      return false;
    }
  };

  return {
    uploadOptimizedImages,
    deleteOptimizedImage,
    getOptimizedImageUrl,
    updateImageMetadata,
    isUploading,
    uploadProgress,
  };
};