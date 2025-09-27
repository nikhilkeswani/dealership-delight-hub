import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useDealer } from "./useDealer";
import { toast } from "sonner";
import { errorHandlers } from "@/lib/errors";
import { useOptimizedImageUpload } from "./useOptimizedImageUpload";
import type { StagedImage } from "@/components/ui/image-staging";
import type { 
  Vehicle, 
  VehicleFormValues,
  DatabaseError,
  MutationError,
  ValidationError
} from "@/types/database";
import type {
  UseVehiclesResult,
  UseCreateVehicleResult,
  UseUpdateVehicleResult,
  UseDeleteVehicleResult
} from "@/types/hooks";

// Extended form values for two-phase upload
export type VehicleFormSubmitValues = VehicleFormValues & {
  stagedImages?: StagedImage[];
};

// Re-export types for components
export type { Vehicle, VehicleFormValues };

export const useVehicles = (): UseVehiclesResult => {
  const { data: dealer } = useDealer();
  
  return useQuery<Vehicle[], DatabaseError>({
    queryKey: ["vehicles"],
    queryFn: async () => {
      if (!dealer?.id) {
        const error: DatabaseError = new Error("No dealer found") as DatabaseError;
        error.table = "dealers";
        error.operation = "select";
        throw error;
      }
      
      const { data, error } = await supabase
        .from("vehicles")
        .select("*")
        .eq("dealer_id", dealer.id)
        .order("updated_at", { ascending: false });
      
      if (error) {
        const dbError: DatabaseError = new Error(error.message) as DatabaseError;
        dbError.code = error.code;
        dbError.details = error.details;
        dbError.hint = error.hint;
        dbError.table = "vehicles";
        dbError.operation = "select";
        throw dbError;
      }
      return data || [];
    },
    enabled: !!dealer?.id,
  });
};

export const useCreateVehicle = (): UseCreateVehicleResult => {
  const queryClient = useQueryClient();
  const { data: dealer } = useDealer();
  const { uploadOptimizedImages } = useOptimizedImageUpload();

  return useMutation<Vehicle, MutationError, VehicleFormSubmitValues>({
    mutationFn: async (values: VehicleFormSubmitValues) => {
      if (!dealer?.id) throw new Error("No dealer found");

      // Phase 1: Create vehicle without images
      const vehicleData = {
        make: values.make,
        model: values.model,
        year: values.year,
        price: values.price,
        mileage: values.mileage,
        vin: values.vin,
        status: values.status,
        description: values.description,
        features: values.features,
        dealer_id: dealer.id,
        images: [], // Start with empty images array
      };

      const { data: vehicle, error } = await supabase
        .from("vehicles")
        .insert(vehicleData)
        .select()
        .single();

      if (error) throw error;

      // Phase 2: Upload staged images if any
      if (values.stagedImages && values.stagedImages.length > 0) {
        try {
          // Convert staged images to File array
          const files = values.stagedImages.map(img => img.file);
          
          // Upload optimized images with the new vehicle ID
          const uploadedImages = await uploadOptimizedImages(
            files,
            vehicle.id,
            {
              make: values.make,
              model: values.model,
              year: values.year,
              condition: values.status === 'available' ? 'used' : values.status,
            }
          );

          // Extract URLs and preserve alt text from staged images
          const imageUrls = uploadedImages.map((uploadedImg, index) => {
            const stagedImg = values.stagedImages![index];
            return uploadedImg.url;
          });

          // Update vehicle with uploaded image URLs
          const { data: updatedVehicle, error: updateError } = await supabase
            .from("vehicles")
            .update({ images: imageUrls })
            .eq("id", vehicle.id)
            .select()
            .single();

          if (updateError) throw updateError;
          return updatedVehicle;
        } catch (uploadError) {
          console.error('Image upload failed:', uploadError);
          toast.error('Vehicle created but image upload failed. You can add images later.');
          return vehicle; // Return vehicle even if image upload fails
        }
      }

      return vehicle;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      toast.success("Vehicle added successfully");
    },
    onError: (error: MutationError) => {
      errorHandlers.database(error as DatabaseError);
    },
  });
};

export const useUpdateVehicle = (): UseUpdateVehicleResult => {
  const queryClient = useQueryClient();

  return useMutation<Vehicle, MutationError, { id: string; values: Partial<VehicleFormValues> }>({
    mutationFn: async ({ id, values }: { id: string; values: Partial<VehicleFormValues> }) => {
      const { data, error } = await supabase
        .from("vehicles")
        .update(values)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      toast.success("Vehicle updated successfully");
    },
    onError: (error: MutationError) => {
      errorHandlers.database(error as DatabaseError);
    },
  });
};

export const useDeleteVehicle = (): UseDeleteVehicleResult => {
  const queryClient = useQueryClient();

  return useMutation<void, MutationError, string>({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("vehicles")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      toast.success("Vehicle deleted successfully");
    },
    onError: (error: MutationError) => {
      errorHandlers.database(error as DatabaseError);
    },
  });
};