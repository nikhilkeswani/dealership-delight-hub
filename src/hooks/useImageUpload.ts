import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { errorHandlers, ERROR_CODES, ERROR_MESSAGES } from "@/lib/errors";

export function useImageUpload() {
  const [isUploading, setIsUploading] = useState(false);

  const uploadImage = async (
    file: File,
    folder: string = "public",
    userId?: string
  ): Promise<string | null> => {
    if (!file.type.startsWith('image/')) {
      const error = ERROR_MESSAGES[ERROR_CODES.FILE_INVALID_TYPE];
      toast.error(error.userMessage);
      return null;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      const error = ERROR_MESSAGES[ERROR_CODES.FILE_TOO_LARGE];
      toast.error(error.userMessage);
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
      errorHandlers.upload(error);
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
      errorHandlers.database(error);
      return false;
    }
  };

  return {
    uploadImage,
    deleteImage,
    isUploading,
  };
}