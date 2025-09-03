export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      customers: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          dealer_id: string
          email: string
          first_name: string
          id: string
          last_name: string
          lead_id: string | null
          phone: string | null
          purchase_history: Json | null
          state: string | null
          total_spent: number | null
          updated_at: string
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          dealer_id: string
          email: string
          first_name: string
          id?: string
          last_name: string
          lead_id?: string | null
          phone?: string | null
          purchase_history?: Json | null
          state?: string | null
          total_spent?: number | null
          updated_at?: string
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          dealer_id?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          lead_id?: string | null
          phone?: string | null
          purchase_history?: Json | null
          state?: string | null
          total_spent?: number | null
          updated_at?: string
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_dealer_id_fkey"
            columns: ["dealer_id"]
            isOneToOne: false
            referencedRelation: "dealers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      dealer_websites: {
        Row: {
          business_name: string | null
          city: string | null
          contact_config: Json | null
          created_at: string
          dealer_id: string
          domain_name: string | null
          id: string
          is_published: boolean
          logo_url: string | null
          seo_config: Json | null
          state: string | null
          theme_config: Json | null
          updated_at: string
        }
        Insert: {
          business_name?: string | null
          city?: string | null
          contact_config?: Json | null
          created_at?: string
          dealer_id: string
          domain_name?: string | null
          id?: string
          is_published?: boolean
          logo_url?: string | null
          seo_config?: Json | null
          state?: string | null
          theme_config?: Json | null
          updated_at?: string
        }
        Update: {
          business_name?: string | null
          city?: string | null
          contact_config?: Json | null
          created_at?: string
          dealer_id?: string
          domain_name?: string | null
          id?: string
          is_published?: boolean
          logo_url?: string | null
          seo_config?: Json | null
          state?: string | null
          theme_config?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dealer_websites_dealer_id_fkey"
            columns: ["dealer_id"]
            isOneToOne: true
            referencedRelation: "dealers"
            referencedColumns: ["id"]
          },
        ]
      }
      dealers: {
        Row: {
          address: string | null
          business_name: string
          city: string | null
          contact_email: string
          created_at: string
          id: string
          is_active: boolean
          logo_url: string | null
          onboarded_at: string | null
          phone: string | null
          state: string | null
          tier: Database["public"]["Enums"]["dealer_tier"]
          updated_at: string
          user_id: string
          website_url: string | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          business_name: string
          city?: string | null
          contact_email: string
          created_at?: string
          id?: string
          is_active?: boolean
          logo_url?: string | null
          onboarded_at?: string | null
          phone?: string | null
          state?: string | null
          tier?: Database["public"]["Enums"]["dealer_tier"]
          updated_at?: string
          user_id: string
          website_url?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          business_name?: string
          city?: string | null
          contact_email?: string
          created_at?: string
          id?: string
          is_active?: boolean
          logo_url?: string | null
          onboarded_at?: string | null
          phone?: string | null
          state?: string | null
          tier?: Database["public"]["Enums"]["dealer_tier"]
          updated_at?: string
          user_id?: string
          website_url?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      leads: {
        Row: {
          created_at: string
          dealer_id: string
          email: string
          first_name: string
          follow_up_date: string | null
          id: string
          interested_vehicles: Json | null
          last_name: string
          notes: string | null
          phone: string | null
          source: Database["public"]["Enums"]["lead_source"]
          status: Database["public"]["Enums"]["lead_status"]
          updated_at: string
          vehicle_id: string | null
        }
        Insert: {
          created_at?: string
          dealer_id: string
          email: string
          first_name: string
          follow_up_date?: string | null
          id?: string
          interested_vehicles?: Json | null
          last_name: string
          notes?: string | null
          phone?: string | null
          source?: Database["public"]["Enums"]["lead_source"]
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
          vehicle_id?: string | null
        }
        Update: {
          created_at?: string
          dealer_id?: string
          email?: string
          first_name?: string
          follow_up_date?: string | null
          id?: string
          interested_vehicles?: Json | null
          last_name?: string
          notes?: string | null
          phone?: string | null
          source?: Database["public"]["Enums"]["lead_source"]
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_dealer_id_fkey"
            columns: ["dealer_id"]
            isOneToOne: false
            referencedRelation: "dealers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      sales: {
        Row: {
          commission: number | null
          created_at: string
          customer_id: string | null
          deal_notes: string | null
          dealer_id: string
          expected_close_date: string | null
          id: string
          lead_id: string | null
          notes: string | null
          sale_date: string | null
          sale_price: number | null
          stage: string
          vehicle_id: string
        }
        Insert: {
          commission?: number | null
          created_at?: string
          customer_id?: string | null
          deal_notes?: string | null
          dealer_id: string
          expected_close_date?: string | null
          id?: string
          lead_id?: string | null
          notes?: string | null
          sale_date?: string | null
          sale_price?: number | null
          stage?: string
          vehicle_id: string
        }
        Update: {
          commission?: number | null
          created_at?: string
          customer_id?: string | null
          deal_notes?: string | null
          dealer_id?: string
          expected_close_date?: string | null
          id?: string
          lead_id?: string | null
          notes?: string | null
          sale_date?: string | null
          sale_price?: number | null
          stage?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_dealer_id_fkey"
            columns: ["dealer_id"]
            isOneToOne: false
            referencedRelation: "dealers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          amount: number
          billing_cycle: string
          created_at: string
          dealer_id: string
          id: string
          next_billing_date: string | null
          status: Database["public"]["Enums"]["subscription_status"]
          tier: Database["public"]["Enums"]["dealer_tier"]
          updated_at: string
        }
        Insert: {
          amount: number
          billing_cycle?: string
          created_at?: string
          dealer_id: string
          id?: string
          next_billing_date?: string | null
          status?: Database["public"]["Enums"]["subscription_status"]
          tier: Database["public"]["Enums"]["dealer_tier"]
          updated_at?: string
        }
        Update: {
          amount?: number
          billing_cycle?: string
          created_at?: string
          dealer_id?: string
          id?: string
          next_billing_date?: string | null
          status?: Database["public"]["Enums"]["subscription_status"]
          tier?: Database["public"]["Enums"]["dealer_tier"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_dealer_id_fkey"
            columns: ["dealer_id"]
            isOneToOne: true
            referencedRelation: "dealers"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          body_type: string | null
          condition: string | null
          created_at: string
          dealer_id: string
          description: string | null
          features: Json | null
          fuel_type: string | null
          id: string
          images: string[] | null
          make: string
          mileage: number | null
          model: string
          price: number | null
          status: Database["public"]["Enums"]["vehicle_status"]
          transmission: string | null
          updated_at: string
          vin: string | null
          year: number
        }
        Insert: {
          body_type?: string | null
          condition?: string | null
          created_at?: string
          dealer_id: string
          description?: string | null
          features?: Json | null
          fuel_type?: string | null
          id?: string
          images?: string[] | null
          make: string
          mileage?: number | null
          model: string
          price?: number | null
          status?: Database["public"]["Enums"]["vehicle_status"]
          transmission?: string | null
          updated_at?: string
          vin?: string | null
          year: number
        }
        Update: {
          body_type?: string | null
          condition?: string | null
          created_at?: string
          dealer_id?: string
          description?: string | null
          features?: Json | null
          fuel_type?: string | null
          id?: string
          images?: string[] | null
          make?: string
          mileage?: number | null
          model?: string
          price?: number | null
          status?: Database["public"]["Enums"]["vehicle_status"]
          transmission?: string | null
          updated_at?: string
          vin?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_dealer_id_fkey"
            columns: ["dealer_id"]
            isOneToOne: false
            referencedRelation: "dealers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      dealer_tier: "basic" | "premium" | "enterprise"
      lead_source:
        | "website"
        | "phone"
        | "email"
        | "referral"
        | "walk_in"
        | "social_media"
      lead_status: "new" | "contacted" | "qualified" | "converted" | "lost"
      subscription_status: "active" | "inactive" | "cancelled" | "past_due"
      vehicle_status: "available" | "sold" | "pending" | "service"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      dealer_tier: ["basic", "premium", "enterprise"],
      lead_source: [
        "website",
        "phone",
        "email",
        "referral",
        "walk_in",
        "social_media",
      ],
      lead_status: ["new", "contacted", "qualified", "converted", "lost"],
      subscription_status: ["active", "inactive", "cancelled", "past_due"],
      vehicle_status: ["available", "sold", "pending", "service"],
    },
  },
} as const
