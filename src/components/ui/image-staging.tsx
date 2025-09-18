import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, X, Edit3, GripVertical, Image as ImageIcon } from "lucide-react";
import { validateImageFile } from "@/lib/imageOptimization";
import { toast } from "sonner";

// Staged image with file data for later upload
export interface StagedImage {
  id: string;
  file: File;
  preview: string;
  altText?: string;
  isPrimary?: boolean;
}

interface ImageStagingProps {
  images: StagedImage[];
  onImagesChange: (images: StagedImage[]) => void;
  maxImages?: number;
  className?: string;
  vehicleData?: {
    make?: string;
    model?: string;
    year?: number;
    condition?: string;
  };
}

export const ImageStaging: React.FC<ImageStagingProps> = ({
  images,
  onImagesChange,
  maxImages = 8,
  className,
  vehicleData,
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [editingAltText, setEditingAltText] = useState<string | null>(null);
  const [showAltTextEditor, setShowAltTextEditor] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const remainingSlots = maxImages - images.length;
      const filesToProcess = acceptedFiles.slice(0, remainingSlots);
      
      if (acceptedFiles.length > remainingSlots) {
        toast.warning(`Only ${remainingSlots} more images can be added`);
      }

      const newStagedImages: StagedImage[] = [];
      
      filesToProcess.forEach((file) => {
        const validation = validateImageFile(file);
        if (!validation.valid) {
          toast.error(`${file.name}: ${validation.error}`);
          return;
        }

        const preview = URL.createObjectURL(file);
        const stagedImage: StagedImage = {
          id: `staged-${Date.now()}-${Math.random()}`,
          file,
          preview,
          altText: vehicleData ? 
            `${vehicleData.year || ''} ${vehicleData.make || ''} ${vehicleData.model || ''}`.trim() || 'Vehicle image' :
            'Vehicle image',
          isPrimary: images.length === 0 && newStagedImages.length === 0, // First image is primary
        };
        
        newStagedImages.push(stagedImage);
      });

      onImagesChange([...images, ...newStagedImages]);
    },
    [images, maxImages, onImagesChange, vehicleData]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    multiple: true,
    disabled: images.length >= maxImages,
  });

  const removeImage = (imageId: string) => {
    const filteredImages = images.filter(img => img.id !== imageId);
    
    // If we removed the primary image, make the first remaining image primary
    if (filteredImages.length > 0) {
      const hadPrimaryImage = images.some(img => img.isPrimary);
      const stillHasPrimary = filteredImages.some(img => img.isPrimary);
      
      if (hadPrimaryImage && !stillHasPrimary) {
        filteredImages[0].isPrimary = true;
      }
    }
    
    // Clean up preview URL
    const removedImage = images.find(img => img.id === imageId);
    if (removedImage?.preview) {
      URL.revokeObjectURL(removedImage.preview);
    }
    
    onImagesChange(filteredImages);
  };

  const reorderImages = (dragIndex: number, hoverIndex: number) => {
    const draggedImage = images[dragIndex];
    const reorderedImages = [...images];
    reorderedImages.splice(dragIndex, 1);
    reorderedImages.splice(hoverIndex, 0, draggedImage);
    onImagesChange(reorderedImages);
  };

  const updateAltText = (imageId: string, altText: string) => {
    const updatedImages = images.map(img =>
      img.id === imageId ? { ...img, altText } : img
    );
    onImagesChange(updatedImages);
    setEditingAltText(null);
    setShowAltTextEditor(null);
  };

  const setPrimaryImage = (imageId: string) => {
    const updatedImages = images.map(img => ({
      ...img,
      isPrimary: img.id === imageId
    }));
    onImagesChange(updatedImages);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Area */}
      {images.length < maxImages && (
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
            isDragActive 
              ? "border-primary bg-primary/5" 
              : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
          )}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground mb-1">
            {isDragActive ? "Drop images here..." : "Drag & drop images here, or click to select"}
          </p>
          <p className="text-xs text-muted-foreground">
            {images.length}/{maxImages} images • PNG, JPG, WebP up to 5MB each
          </p>
        </div>
      )}

      {/* Image Previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div
              key={image.id}
              className="relative group aspect-square bg-muted rounded-lg overflow-hidden"
              draggable
              onDragStart={() => setDraggedIndex(index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (draggedIndex !== null && draggedIndex !== index) {
                  reorderImages(draggedIndex, index);
                }
                setDraggedIndex(null);
              }}
            >
              <img
                src={image.preview}
                alt={image.altText || 'Vehicle image'}
                className="w-full h-full object-cover"
              />
              
              {/* Overlay with controls */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute top-2 left-2 flex gap-1">
                  {image.isPrimary && (
                    <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                      Primary
                    </span>
                  )}
                </div>
                
                <div className="absolute top-2 right-2 flex gap-1">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-8 w-8 p-0"
                    onClick={() => setShowAltTextEditor(showAltTextEditor === image.id ? null : image.id)}
                  >
                    <Edit3 className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="h-8 w-8 p-0"
                    onClick={() => removeImage(image.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                
                <div className="absolute bottom-2 left-2 right-2 flex gap-1">
                  {!image.isPrimary && (
                    <Button
                      size="sm"
                      variant="secondary"
                      className="text-xs px-2 py-1 h-6"
                      onClick={() => setPrimaryImage(image.id)}
                    >
                      Set Primary
                    </Button>
                  )}
                  <div className="flex-1" />
                  <div className="cursor-move p-1">
                    <GripVertical className="h-3 w-3 text-white" />
                  </div>
                </div>
              </div>

              {/* Alt Text Editor */}
              {showAltTextEditor === image.id && (
                <div className="absolute inset-x-2 bottom-2 bg-background border rounded p-2 shadow-lg">
                  <Input
                    type="text"
                    placeholder="Enter alt text..."
                    defaultValue={image.altText || ''}
                    className="text-xs h-8 mb-2"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        updateAltText(image.id, e.currentTarget.value);
                      } else if (e.key === 'Escape') {
                        setShowAltTextEditor(null);
                      }
                    }}
                    autoFocus
                  />
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      className="text-xs h-6 px-2"
                      onClick={(e) => {
                        const input = e.currentTarget.parentElement?.parentElement?.querySelector('input');
                        if (input) {
                          updateAltText(image.id, input.value);
                        }
                      }}
                    >
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-6 px-2"
                      onClick={() => setShowAltTextEditor(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Info Text */}
      {images.length > 0 && (
        <div className="text-sm text-muted-foreground space-y-1">
          <p>• The first image will be used as the primary image</p>
          <p>• Images will be optimized automatically when saved</p>
          <p>• Drag images to reorder them</p>
        </div>
      )}
    </div>
  );
};