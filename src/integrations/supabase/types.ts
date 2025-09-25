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
      audit_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          resource_id: string | null
          resource_type: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          resource_id?: string | null
          resource_type: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          resource_id?: string | null
          resource_type?: string
          user_id?: string
        }
        Relationships: []
      }
      billing_history: {
        Row: {
          amount: number
          created_at: string
          currency: string
          description: string | null
          id: string
          invoice_url: string | null
          payment_date: string | null
          status: string
          stripe_invoice_id: string | null
          subscription_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          invoice_url?: string | null
          payment_date?: string | null
          status: string
          stripe_invoice_id?: string | null
          subscription_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          invoice_url?: string | null
          payment_date?: string | null
          status?: string
          stripe_invoice_id?: string | null
          subscription_id?: string
        }
        Relationships: []
      }
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
          status: string
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
          status?: string
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
          status?: string
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
          last_usage_reset: string | null
          logo_url: string | null
          monthly_customers_count: number | null
          monthly_leads_count: number | null
          monthly_vehicles_count: number | null
          onboarded_at: string | null
          phone: string | null
          provider_id: string | null
          state: string | null
          status: string
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
          last_usage_reset?: string | null
          logo_url?: string | null
          monthly_customers_count?: number | null
          monthly_leads_count?: number | null
          monthly_vehicles_count?: number | null
          onboarded_at?: string | null
          phone?: string | null
          provider_id?: string | null
          state?: string | null
          status?: string
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
          last_usage_reset?: string | null
          logo_url?: string | null
          monthly_customers_count?: number | null
          monthly_leads_count?: number | null
          monthly_vehicles_count?: number | null
          onboarded_at?: string | null
          phone?: string | null
          provider_id?: string | null
          state?: string | null
          status?: string
          tier?: Database["public"]["Enums"]["dealer_tier"]
          updated_at?: string
          user_id?: string
          website_url?: string | null
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dealers_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_rate_limiting: {
        Row: {
          created_at: string
          dealer_id: string
          email: string | null
          first_submission: string | null
          id: string
          ip_address: unknown
          last_submission: string | null
          submission_count: number | null
        }
        Insert: {
          created_at?: string
          dealer_id: string
          email?: string | null
          first_submission?: string | null
          id?: string
          ip_address: unknown
          last_submission?: string | null
          submission_count?: number | null
        }
        Update: {
          created_at?: string
          dealer_id?: string
          email?: string | null
          first_submission?: string | null
          id?: string
          ip_address?: unknown
          last_submission?: string | null
          submission_count?: number | null
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
            referencedRelation: "public_vehicles"
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
      payment_methods: {
        Row: {
          brand: string | null
          created_at: string
          dealer_id: string
          exp_month: number | null
          exp_year: number | null
          id: string
          is_default: boolean
          last_four: string | null
          stripe_payment_method_id: string | null
          type: string
          updated_at: string
        }
        Insert: {
          brand?: string | null
          created_at?: string
          dealer_id: string
          exp_month?: number | null
          exp_year?: number | null
          id?: string
          is_default?: boolean
          last_four?: string | null
          stripe_payment_method_id?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          brand?: string | null
          created_at?: string
          dealer_id?: string
          exp_month?: number | null
          exp_year?: number | null
          id?: string
          is_default?: boolean
          last_four?: string | null
          stripe_payment_method_id?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      providers: {
        Row: {
          company_name: string
          contact_email: string
          created_at: string
          id: string
          is_active: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          company_name: string
          contact_email: string
          created_at?: string
          id?: string
          is_active?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          company_name?: string
          contact_email?: string
          created_at?: string
          id?: string
          is_active?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
            referencedRelation: "public_vehicles"
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
      subscription_plans: {
        Row: {
          created_at: string
          description: string | null
          display_name: string
          features: Json
          id: string
          is_active: boolean
          limits: Json
          name: string
          price_monthly: number
          price_yearly: number | null
          sort_order: number
          tier: Database["public"]["Enums"]["dealer_tier"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_name: string
          features?: Json
          id?: string
          is_active?: boolean
          limits?: Json
          name: string
          price_monthly: number
          price_yearly?: number | null
          sort_order?: number
          tier: Database["public"]["Enums"]["dealer_tier"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_name?: string
          features?: Json
          id?: string
          is_active?: boolean
          limits?: Json
          name?: string
          price_monthly?: number
          price_yearly?: number | null
          sort_order?: number
          tier?: Database["public"]["Enums"]["dealer_tier"]
          updated_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          amount: number
          billing_cycle: string
          cancel_at_period_end: boolean | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          dealer_id: string
          id: string
          next_billing_date: string | null
          status: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          tier: Database["public"]["Enums"]["dealer_tier"]
          trial_end: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          billing_cycle?: string
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          dealer_id: string
          id?: string
          next_billing_date?: string | null
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier: Database["public"]["Enums"]["dealer_tier"]
          trial_end?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          billing_cycle?: string
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          dealer_id?: string
          id?: string
          next_billing_date?: string | null
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier?: Database["public"]["Enums"]["dealer_tier"]
          trial_end?: string | null
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
      usage_tracking: {
        Row: {
          created_at: string
          dealer_id: string
          feature_name: string
          id: string
          period_end: string
          period_start: string
          updated_at: string
          usage_count: number
        }
        Insert: {
          created_at?: string
          dealer_id: string
          feature_name: string
          id?: string
          period_end: string
          period_start: string
          updated_at?: string
          usage_count?: number
        }
        Update: {
          created_at?: string
          dealer_id?: string
          feature_name?: string
          id?: string
          period_end?: string
          period_start?: string
          updated_at?: string
          usage_count?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
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
          image_metadata: Json | null
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
          image_metadata?: Json | null
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
          image_metadata?: Json | null
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
      public_vehicles: {
        Row: {
          body_type: string | null
          condition: string | null
          created_at: string | null
          dealer_id: string | null
          description: string | null
          fuel_type: string | null
          id: string | null
          images: string[] | null
          make: string | null
          mileage: number | null
          model: string | null
          price: number | null
          status: Database["public"]["Enums"]["vehicle_status"] | null
          transmission: string | null
          year: number | null
        }
        Insert: {
          body_type?: string | null
          condition?: string | null
          created_at?: string | null
          dealer_id?: string | null
          description?: string | null
          fuel_type?: string | null
          id?: string | null
          images?: string[] | null
          make?: string | null
          mileage?: number | null
          model?: string | null
          price?: number | null
          status?: Database["public"]["Enums"]["vehicle_status"] | null
          transmission?: string | null
          year?: number | null
        }
        Update: {
          body_type?: string | null
          condition?: string | null
          created_at?: string | null
          dealer_id?: string | null
          description?: string | null
          fuel_type?: string | null
          id?: string | null
          images?: string[] | null
          make?: string | null
          mileage?: number | null
          model?: string | null
          price?: number | null
          status?: Database["public"]["Enums"]["vehicle_status"] | null
          transmission?: string | null
          year?: number | null
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
    Functions: {
      check_subscription_limit: {
        Args: {
          _current_count?: number
          _dealer_id: string
          _feature_name: string
        }
        Returns: boolean
      }
      cleanup_orphaned_lead_customer_data: {
        Args: Record<PropertyKey, never>
        Returns: {
          action_type: string
          customer_id: string
          details: string
          lead_id: string
        }[]
      }
      create_public_lead: {
        Args:
          | {
              p_dealer_id: string
              p_email: string
              p_first_name: string
              p_ip_address?: unknown
              p_last_name: string
              p_notes?: string
              p_phone?: string
              p_source?: string
            }
          | {
              p_dealer_id: string
              p_email: string
              p_first_name: string
              p_last_name: string
              p_notes?: string
              p_phone?: string
              p_source?: string
            }
        Returns: string
      }
      get_user_provider_id: {
        Args: { _user_id: string }
        Returns: string
      }
      grant_provider_role_by_email: {
        Args: { user_email: string }
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_provider: {
        Args: { _user_id: string }
        Returns: boolean
      }
      log_audit_action: {
        Args: {
          _action: string
          _details?: Json
          _resource_id?: string
          _resource_type: string
        }
        Returns: undefined
      }
      reset_monthly_usage: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      app_role: "provider" | "admin" | "dealer"
      dealer_tier: "basic" | "premium" | "enterprise"
      lead_source:
        | "website"
        | "phone"
        | "email"
        | "referral"
        | "walk_in"
        | "social_media"
        | "website_testdrive"
        | "website_inquiry"
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
      app_role: ["provider", "admin", "dealer"],
      dealer_tier: ["basic", "premium", "enterprise"],
      lead_source: [
        "website",
        "phone",
        "email",
        "referral",
        "walk_in",
        "social_media",
        "website_testdrive",
        "website_inquiry",
      ],
      lead_status: ["new", "contacted", "qualified", "converted", "lost"],
      subscription_status: ["active", "inactive", "cancelled", "past_due"],
      vehicle_status: ["available", "sold", "pending", "service"],
    },
  },
} as const
