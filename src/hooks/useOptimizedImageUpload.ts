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

    // Get authenticated user ID (required for RLS policy)
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id;
    
    if (!userId) {
      toast.error('Authentication required for image upload');
      return [];
    }

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
              const filePath = `${userId}/${folder}/${vehicleId}/${sizeName}/${fileName}`;
              
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
   * Delete optimized images (all sizes) using list and delete approach
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

      // Get authenticated user ID
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user?.id;
      
      if (!userId) {
        console.error('Authentication required for image deletion');
        return false;
      }

      // Extract the base filename pattern from the URL to identify related files
      const urlPath = imageUrl.split('/dealer-assets/')[1];
      if (!urlPath) {
        console.error('Could not parse image URL path:', imageUrl);
        return false;
      }

      // Get the filename from the URL to identify the specific image set
      const filename = urlPath.split('/').pop();
      if (!filename) {
        console.error('Could not extract filename from URL:', imageUrl);
        return false;
      }

      // Extract the base identifier from the filename (everything before the size and timestamp)
      // Format: vehicleId_size_timestamp_randomId.jpg
      const filenameParts = filename.split('_');
      if (filenameParts.length < 4) {
        console.error('Unexpected filename format:', filename);
        return false;
      }
      
      const baseIdentifier = filenameParts[0]; // This should be the vehicleId
      console.log(`Looking for files matching vehicle ${baseIdentifier} in user ${userId}`);

      // List all files in the vehicle's directory
      const vehicleFolder = `${userId}/vehicles/${vehicleId}`;
      console.log(`Listing files in folder: ${vehicleFolder}`);

      // Get all files in all size subdirectories
      const sizeNames = ['thumbnail', 'medium', 'large', 'original'];
      const filesToDelete: string[] = [];

      for (const sizeName of sizeNames) {
        const sizePath = `${vehicleFolder}/${sizeName}`;
        
        const { data: files, error: listError } = await supabase.storage
          .from('dealer-assets')
          .list(sizePath);

        if (listError) {
          console.log(`No files found in ${sizePath} (this is normal):`, listError.message);
          continue;
        }

        if (files && files.length > 0) {
          // Find files that match the base identifier
          const matchingFiles = files.filter(file => 
            file.name.startsWith(baseIdentifier) && file.name.includes(filename.split('_')[3])
          );
          
          matchingFiles.forEach(file => {
            filesToDelete.push(`${sizePath}/${file.name}`);
          });
          
          console.log(`Found ${matchingFiles.length} matching files in ${sizePath}:`, matchingFiles.map(f => f.name));
        }
      }

      console.log(`Total files to delete: ${filesToDelete.length}`, filesToDelete);

      // Delete all found files
      if (filesToDelete.length > 0) {
        const { data: deletedFiles, error: deleteError } = await supabase.storage
          .from('dealer-assets')
          .remove(filesToDelete);

        if (deleteError) {
          console.error('Failed to delete files:', deleteError);
          return false;
        }

        console.log(`Successfully deleted ${filesToDelete.length} files:`, deletedFiles);
        toast.success(`Deleted image and all its optimized sizes`);
      } else {
        console.log('No matching files found to delete');
        toast.success('Image deleted from database');
      }

      return true;

    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete image');
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
    if (!baseUrl.includes('/vehicles/')) return baseUrl;
    
    // Parse the URL structure: .../userId/vehicles/{vehicleId}/{currentSize}/{filename}
    const urlParts = baseUrl.split('/vehicles/');
    if (urlParts.length !== 2) return baseUrl;
    
    const [basePart, pathPart] = urlParts;
    const pathSegments = pathPart.split('/');
    
    if (pathSegments.length < 3) return baseUrl;
    
    const [vehicleId, currentSize, ...filenameParts] = pathSegments;
    const filename = filenameParts.join('/');
    
    // Construct new URL with desired size - maintain the userId prefix
    return `${basePart}/vehicles/${vehicleId}/${size}/${filename}`;
  };

  /**
   * Update image metadata (alt text, description) in database
   */
  const updateImageMetadata = async (
    vehicleId: string,
    imageUrl: string,
    metadata: Partial<ImageMetadata>
  ): Promise<boolean> => {
    try {
      // Get current vehicle data
      const { data: vehicle, error: fetchError } = await supabase
        .from('vehicles')
        .select('image_metadata')
        .eq('id', vehicleId)
        .single();

      if (fetchError) {
        console.error('Failed to fetch vehicle:', fetchError);
        return false;
      }

      // Update the metadata for this specific image
      const currentMetadata = Array.isArray(vehicle.image_metadata) ? vehicle.image_metadata : [];
      const updatedMetadata = currentMetadata.map((img: any) => 
        img.url === imageUrl ? { ...img, ...metadata } : img
      );

      // If image not found in metadata, add it
      if (!currentMetadata.find((img: any) => img.url === imageUrl)) {
        updatedMetadata.push({
          url: imageUrl,
          alt: metadata.alt || '',
          description: metadata.description || '',
          isPrimary: updatedMetadata.length === 0
        });
      }

      // Update vehicle with new metadata
      const { error: updateError } = await supabase
        .from('vehicles')
        .update({ image_metadata: updatedMetadata as any })
        .eq('id', vehicleId);

      if (updateError) {
        console.error('Failed to update metadata:', updateError);
        return false;
      }

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