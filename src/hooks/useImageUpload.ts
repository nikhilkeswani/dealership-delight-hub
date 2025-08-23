import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useImageUpload() {
  const [isUploading, setIsUploading] = useState(false);

  const uploadImage = async (
    file: File,
    folder: string = "public",
    userId?: string
  ): Promise<string | null> => {
    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file");
      return null;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error("Image size should be less than 5MB");
      return null;
    }

    setIsUploading(true);
    
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const currentUserId = sessionData.session?.user?.id;
      
      if (!currentUserId) {
        throw new Error("Not authenticated");
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = userId 
        ? `${currentUserId}/${folder}/${fileName}`
        : `${currentUserId}/${fileName}`;

      const { data, error } = await supabase.storage
        .from('dealer-assets')
        .upload(filePath, file);

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('dealer-assets')
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || "Failed to upload image");
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const deleteImage = async (url: string): Promise<boolean> => {
    try {
      // Extract file path from URL
      const urlParts = url.split('/');
      const bucketIndex = urlParts.findIndex(part => part === 'dealer-assets');
      if (bucketIndex === -1) return false;
      
      const filePath = urlParts.slice(bucketIndex + 1).join('/');

      const { error } = await supabase.storage
        .from('dealer-assets')
        .remove([filePath]);

      if (error) throw error;
      
      return true;
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error("Failed to delete image");
      return false;
    }
  };

  return {
    uploadImage,
    deleteImage,
    isUploading,
  };
}