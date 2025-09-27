import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { X, Upload, Image, Loader2, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useOptimizedImageUpload } from '@/hooks/useOptimizedImageUpload';
import { toast } from 'sonner';
import OptimizedImage from '@/components/ui/OptimizedImage';
import { useVehicleImageMetadata } from '@/hooks/useVehicleImageMetadata';

interface ImageUploaderProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  className?: string;
  vehicleId?: string;
  vehicleData?: {
    make?: string;
    model?: string;
    year?: number;
    condition?: string;
  };
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  images,
  onImagesChange,
  maxImages = 10,
  className = '',
  vehicleId,
  vehicleData,
}) => {
  const { uploadOptimizedImages, deleteOptimizedImage, updateImageMetadata, isUploading, uploadProgress } = useOptimizedImageUpload();
  const { getAltText, updateAltText } = useVehicleImageMetadata(vehicleId);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [editingAltText, setEditingAltText] = useState<{ [key: string]: string }>({});
  const [showAltTextEditor, setShowAltTextEditor] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (images.length + acceptedFiles.length > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }

    if (!vehicleId) {
      console.error('ImageUploader: No vehicleId provided for upload');
      toast.error("Unable to upload images: Vehicle must be saved first. Please save the vehicle details and try again.");
      return;
    }

    try {
      const uploadedImages = await uploadOptimizedImages(
        acceptedFiles,
        vehicleId,
        vehicleData,
        'vehicles'
      );
      
      if (uploadedImages.length > 0) {
        const newUrls = uploadedImages.map(img => img.url);
        const updatedImages = [...images, ...newUrls];
        onImagesChange(updatedImages);
      } else {
        toast.error("No images were uploaded successfully. Please try again.");
      }
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error("Failed to upload images. Please try again.");
    }
  }, [images, maxImages, uploadOptimizedImages, onImagesChange, vehicleId, vehicleData]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    multiple: true,
    disabled: isUploading
  });

  const removeImage = async (index: number) => {
    const imageUrl = images[index];
    
    // Optimistic update: immediately remove from UI
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
    
    try {
      // Attempt actual deletion
      const deleted = await deleteOptimizedImage(imageUrl, vehicleId);
      if (deleted) {
        toast.success('Image deleted successfully');
      } else {
        // Revert optimistic update on failure
        onImagesChange(images);
        toast.error('Failed to delete image');
      }
    } catch (error) {
      // Revert optimistic update on error
      onImagesChange(images);
      toast.error('Failed to delete image - please try again');
      console.error('Image deletion error:', error);
    }
  };

  const reorderImages = (fromIndex: number, toIndex: number) => {
    const newImages = [...images];
    const [removed] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, removed);
    onImagesChange(newImages);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      reorderImages(draggedIndex, index);
      setDraggedIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Zone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'}
          ${isUploading ? 'opacity-50 pointer-events-none' : ''}
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          {isUploading ? (
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          ) : (
            <Upload className="h-8 w-8 text-muted-foreground" />
          )}
          <div className="text-sm">
            {isDragActive ? (
              <p className="text-primary">Drop images here...</p>
            ) : (
              <>
                <p className="text-foreground">Drag & drop images here, or <span className="text-primary">browse</span></p>
                <p className="text-muted-foreground">PNG, JPG, WEBP up to 5MB each</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((imageUrl, index) => (
            <div
              key={imageUrl}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`
                relative group aspect-square rounded-lg overflow-hidden border bg-muted cursor-move
                ${draggedIndex === index ? 'opacity-50' : ''}
                ${index === 0 ? 'ring-2 ring-primary ring-offset-2' : ''}
              `}
            >
              <OptimizedImage
                src={imageUrl}
                alt={getAltText(imageUrl) || editingAltText[imageUrl] || `${vehicleData?.year || ''} ${vehicleData?.make || ''} ${vehicleData?.model || ''} - image ${index + 1}`.trim()}
                className="w-full h-full object-cover"
                vehicleId={vehicleId}
                imageType="medium"
                priority={index === 0}
              />
              
              {/* Upload Progress */}
              {Object.keys(uploadProgress).length > 0 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="text-white text-sm">
                    {Math.round(Object.values(uploadProgress)[0] || 0)}%
                  </div>
                </div>
              )}
              
              {/* Primary badge */}
              {index === 0 && (
                <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                  Primary
                </div>
              )}
              
              {/* Action buttons */}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {/* Edit Alt Text button */}
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => setShowAltTextEditor(showAltTextEditor === imageUrl ? null : imageUrl)}
                >
                  <Edit3 className="h-3 w-3" />
                </Button>
                
                {/* Remove button */}
                <Button
                  variant="destructive"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => removeImage(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              
              {/* Alt Text Editor */}
              {showAltTextEditor === imageUrl && (
                <div className="absolute bottom-2 left-2 right-2 bg-background/95 p-2 rounded border">
                  <Input
                    placeholder="Alt text for accessibility..."
                    value={editingAltText[imageUrl] || getAltText(imageUrl) || ''}
                    onChange={(e) => setEditingAltText(prev => ({ ...prev, [imageUrl]: e.target.value }))}
                    className="text-xs h-6"
                    onKeyDown={async (e) => {
                      if (e.key === 'Enter') {
                        const altText = editingAltText[imageUrl];
                        if (vehicleId && altText) {
                          const success = await updateAltText(imageUrl, altText);
                          if (success) {
                            setEditingAltText(prev => {
                              const updated = { ...prev };
                              delete updated[imageUrl];
                              return updated;
                            });
                          }
                        }
                        setShowAltTextEditor(null);
                      } else if (e.key === 'Escape') {
                        setShowAltTextEditor(null);
                      }
                    }}
                  />
                  <div className="text-xs text-muted-foreground mt-1">
                    Press Enter to save, Esc to cancel
                  </div>
                </div>
              )}
              
              {/* Drag handle */}
              <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-background/80 rounded p-1">
                  <Image className="h-3 w-3 text-muted-foreground" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {images.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            {images.length}/{maxImages} images • First image will be the primary image • Drag to reorder
          </p>
          <p className="text-xs text-muted-foreground">
            Images are automatically optimized with compression, WebP conversion, and multiple sizes for better performance
          </p>
        </div>
      )}
    </div>
  );
};