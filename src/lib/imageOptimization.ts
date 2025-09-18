// Image Optimization Utilities
export interface ImageSizeConfig {
  width: number;
  height: number;
  quality: number;
}

export interface OptimizedImageSizes {
  thumbnail: string;
  medium: string;
  large: string;
  original: string;
}

export interface ImageMetadata {
  width: number;
  height: number;
  size: number;
  type: string;
  alt?: string;
  description?: string;
}

// Image size configurations
export const IMAGE_SIZES: Record<string, ImageSizeConfig> = {
  thumbnail: { width: 150, height: 150, quality: 0.8 },
  medium: { width: 800, height: 600, quality: 0.85 },
  large: { width: 1200, height: 900, quality: 0.9 },
};

// Maximum file size (5MB)
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Compress and resize image using Canvas API
 */
export const compressImage = (
  file: File,
  config: ImageSizeConfig
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    img.onload = () => {
      // Calculate dimensions maintaining aspect ratio
      const { width: targetWidth, height: targetHeight } = config;
      const aspectRatio = img.width / img.height;
      
      let newWidth, newHeight;
      if (aspectRatio > targetWidth / targetHeight) {
        newWidth = targetWidth;
        newHeight = targetWidth / aspectRatio;
      } else {
        newHeight = targetHeight;
        newWidth = targetHeight * aspectRatio;
      }

      canvas.width = newWidth;
      canvas.height = newHeight;

      // Draw and compress
      ctx.drawImage(img, 0, 0, newWidth, newHeight);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to compress image'));
          }
        },
        'image/jpeg',
        config.quality
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Convert image to WebP format with JPEG fallback
 */
export const convertToWebP = (file: File, quality: number = 0.85): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // Try WebP first, fallback to JPEG
      canvas.toBlob(
        (webpBlob) => {
          if (webpBlob && webpBlob.size < file.size) {
            resolve(webpBlob);
          } else {
            // Fallback to JPEG
            canvas.toBlob(
              (jpegBlob) => {
                if (jpegBlob) {
                  resolve(jpegBlob);
                } else {
                  reject(new Error('Failed to convert image'));
                }
              },
              'image/jpeg',
              quality
            );
          }
        },
        'image/webp',
        quality
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Generate multiple image sizes from original file
 */
export const generateImageSizes = async (
  file: File
): Promise<{ [key: string]: Blob }> => {
  const sizes: { [key: string]: Blob } = {};
  
  // Generate compressed versions for each size
  for (const [sizeName, config] of Object.entries(IMAGE_SIZES)) {
    try {
      const compressedBlob = await compressImage(file, config);
      sizes[sizeName] = compressedBlob;
    } catch (error) {
      console.error(`Failed to generate ${sizeName} size:`, error);
      // Fallback to original file
      sizes[sizeName] = file;
    }
  }

  // Keep original (but potentially convert to WebP)
  try {
    const originalWebP = await convertToWebP(file, 0.9);
    sizes.original = originalWebP;
  } catch (error) {
    console.error('Failed to convert original to WebP:', error);
    sizes.original = file;
  }

  return sizes;
};

/**
 * Extract image metadata
 */
export const extractImageMetadata = (file: File): Promise<ImageMetadata> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
        size: file.size,
        type: file.type,
      });
    };

    img.onerror = () => reject(new Error('Failed to load image for metadata'));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Generate descriptive alt text for vehicle images
 */
export const generateAltText = (
  vehicleData: {
    make?: string;
    model?: string;
    year?: number;
    condition?: string;
  },
  imageIndex: number = 0
): string => {
  const { make, model, year, condition } = vehicleData;
  const imageType = imageIndex === 0 ? 'main' : `view ${imageIndex + 1}`;
  
  if (make && model && year) {
    return `${year} ${make} ${model}${condition ? ` in ${condition} condition` : ''} - ${imageType} image`;
  }
  
  return `Vehicle ${imageType} image`;
};

/**
 * Validate image file
 */
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Only JPEG, PNG, and WebP images are allowed',
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: 'Image must be less than 5MB',
    };
  }

  return { valid: true };
};
