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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      blocked_users: {
        Row: {
          blocked_id: string
          blocker_id: string
          created_at: string | null
          id: string
        }
        Insert: {
          blocked_id: string
          blocker_id: string
          created_at?: string | null
          id?: string
        }
        Update: {
          blocked_id?: string
          blocker_id?: string
          created_at?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blocked_users_blocked_id_fkey"
            columns: ["blocked_id"]
            isOneToOne: false
            referencedRelation: "public_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blocked_users_blocked_id_fkey"
            columns: ["blocked_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blocked_users_blocker_id_fkey"
            columns: ["blocker_id"]
            isOneToOne: false
            referencedRelation: "public_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blocked_users_blocker_id_fkey"
            columns: ["blocker_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      business_applications: {
        Row: {
          business_name: string
          business_type: string
          created_at: string
          description: string | null
          id: string
          instagram_handle: string | null
          location_label: string | null
          reviewed_at: string | null
          status: string
          user_id: string | null
          website: string | null
        }
        Insert: {
          business_name: string
          business_type: string
          created_at?: string
          description?: string | null
          id?: string
          instagram_handle?: string | null
          location_label?: string | null
          reviewed_at?: string | null
          status?: string
          user_id?: string | null
          website?: string | null
        }
        Update: {
          business_name?: string
          business_type?: string
          created_at?: string
          description?: string | null
          id?: string
          instagram_handle?: string | null
          location_label?: string | null
          reviewed_at?: string | null
          status?: string
          user_id?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_applications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_applications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      business_profiles: {
        Row: {
          bio: string | null
          business_name: string
          created_at: string
          id: string
          instagram_handle: string | null
          is_sponsored: boolean
          lat: number | null
          lng: number | null
          location: unknown
          location_label: string | null
          logo_url: string | null
          price_range_high: number | null
          price_range_low: number | null
          service_radius_miles: number | null
          slug: string | null
          sponsored_until: string | null
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          bio?: string | null
          business_name: string
          created_at?: string
          id?: string
          instagram_handle?: string | null
          is_sponsored?: boolean
          lat?: number | null
          lng?: number | null
          location?: unknown
          location_label?: string | null
          logo_url?: string | null
          price_range_high?: number | null
          price_range_low?: number | null
          service_radius_miles?: number | null
          slug?: string | null
          sponsored_until?: string | null
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          bio?: string | null
          business_name?: string
          created_at?: string
          id?: string
          instagram_handle?: string | null
          is_sponsored?: boolean
          lat?: number | null
          lng?: number | null
          location?: unknown
          location_label?: string | null
          logo_url?: string | null
          price_range_high?: number | null
          price_range_low?: number | null
          service_radius_miles?: number | null
          slug?: string | null
          sponsored_until?: string | null
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "public_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      deletion_requests: {
        Row: {
          created_at: string | null
          id: string
          processed_at: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          processed_at?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          processed_at?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deletion_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deletion_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      listing_photos: {
        Row: {
          created_at: string
          display_order: number
          id: string
          is_primary: boolean
          listing_id: string
          storage_path: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          is_primary?: boolean
          listing_id: string
          storage_path: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          is_primary?: boolean
          listing_id?: string
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "listing_photos_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      listings: {
        Row: {
          accepts_offers: boolean
          board_type: Database["public"]["Enums"]["board_type"] | null
          bump_count: number
          business_id: string | null
          condition: Database["public"]["Enums"]["board_condition"] | null
          created_at: string
          currency: string
          description: string | null
          era: Database["public"]["Enums"]["board_era"] | null
          fin_setup: Database["public"]["Enums"]["fin_setup"] | null
          fin_system: Database["public"]["Enums"]["fin_system"] | null
          id: string
          is_featured: boolean
          is_rideable: boolean | null
          is_sponsored: boolean
          last_bumped_at: string | null
          lead_time_weeks: number | null
          length_inches: number | null
          listing_type: Database["public"]["Enums"]["listing_type"]
          location: unknown
          location_label: string | null
          payment_notes: string | null
          price: number
          provenance: string | null
          save_count: number
          shaper_brand: string | null
          shipping_notes: string | null
          ships_domestically: boolean
          ships_internationally: boolean
          sponsored_tier: Database["public"]["Enums"]["sponsored_tier"] | null
          sponsored_until: string | null
          status: Database["public"]["Enums"]["listing_status"]
          thickness_inches: number | null
          title: string
          updated_at: string
          user_id: string
          view_count: number
          volume: number | null
          width_inches: number | null
        }
        Insert: {
          accepts_offers?: boolean
          board_type?: Database["public"]["Enums"]["board_type"] | null
          bump_count?: number
          business_id?: string | null
          condition?: Database["public"]["Enums"]["board_condition"] | null
          created_at?: string
          currency?: string
          description?: string | null
          era?: Database["public"]["Enums"]["board_era"] | null
          fin_setup?: Database["public"]["Enums"]["fin_setup"] | null
          fin_system?: Database["public"]["Enums"]["fin_system"] | null
          id?: string
          is_featured?: boolean
          is_rideable?: boolean | null
          is_sponsored?: boolean
          last_bumped_at?: string | null
          lead_time_weeks?: number | null
          length_inches?: number | null
          listing_type?: Database["public"]["Enums"]["listing_type"]
          location?: unknown
          location_label?: string | null
          payment_notes?: string | null
          price: number
          provenance?: string | null
          save_count?: number
          shaper_brand?: string | null
          shipping_notes?: string | null
          ships_domestically?: boolean
          ships_internationally?: boolean
          sponsored_tier?: Database["public"]["Enums"]["sponsored_tier"] | null
          sponsored_until?: string | null
          status?: Database["public"]["Enums"]["listing_status"]
          thickness_inches?: number | null
          title: string
          updated_at?: string
          user_id: string
          view_count?: number
          volume?: number | null
          width_inches?: number | null
        }
        Update: {
          accepts_offers?: boolean
          board_type?: Database["public"]["Enums"]["board_type"] | null
          bump_count?: number
          business_id?: string | null
          condition?: Database["public"]["Enums"]["board_condition"] | null
          created_at?: string
          currency?: string
          description?: string | null
          era?: Database["public"]["Enums"]["board_era"] | null
          fin_setup?: Database["public"]["Enums"]["fin_setup"] | null
          fin_system?: Database["public"]["Enums"]["fin_system"] | null
          id?: string
          is_featured?: boolean
          is_rideable?: boolean | null
          is_sponsored?: boolean
          last_bumped_at?: string | null
          lead_time_weeks?: number | null
          length_inches?: number | null
          listing_type?: Database["public"]["Enums"]["listing_type"]
          location?: unknown
          location_label?: string | null
          payment_notes?: string | null
          price?: number
          provenance?: string | null
          save_count?: number
          shaper_brand?: string | null
          shipping_notes?: string | null
          ships_domestically?: boolean
          ships_internationally?: boolean
          sponsored_tier?: Database["public"]["Enums"]["sponsored_tier"] | null
          sponsored_until?: string | null
          status?: Database["public"]["Enums"]["listing_status"]
          thickness_inches?: number | null
          title?: string
          updated_at?: string
          user_id?: string
          view_count?: number
          volume?: number | null
          width_inches?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "listings_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          body: string
          business_id: string | null
          created_at: string
          id: string
          listing_id: string
          read_at: string | null
          recipient_id: string
          sender_id: string
          status: Database["public"]["Enums"]["message_status"]
          thread_id: string
        }
        Insert: {
          body: string
          business_id?: string | null
          created_at?: string
          id?: string
          listing_id: string
          read_at?: string | null
          recipient_id: string
          sender_id: string
          status?: Database["public"]["Enums"]["message_status"]
          thread_id: string
        }
        Update: {
          body?: string
          business_id?: string | null
          created_at?: string
          id?: string
          listing_id?: string
          read_at?: string | null
          recipient_id?: string
          sender_id?: string
          status?: Database["public"]["Enums"]["message_status"]
          thread_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "public_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "public_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "threads"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          created_at: string | null
          id: string
          reason: string
          reported_listing_id: string | null
          reported_user_id: string | null
          reporter_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          reason: string
          reported_listing_id?: string | null
          reported_user_id?: string | null
          reporter_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          reason?: string
          reported_listing_id?: string | null
          reported_user_id?: string | null
          reporter_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_reported_listing_id_fkey"
            columns: ["reported_listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reported_user_id_fkey"
            columns: ["reported_user_id"]
            isOneToOne: false
            referencedRelation: "public_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reported_user_id_fkey"
            columns: ["reported_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "public_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_listings: {
        Row: {
          listing_id: string
          saved_at: string
          user_id: string
        }
        Insert: {
          listing_id: string
          saved_at?: string
          user_id: string
        }
        Update: {
          listing_id?: string
          saved_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_listings_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_listings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_listings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      threads: {
        Row: {
          buyer_id: string | null
          created_at: string
          id: string
          last_message: string | null
          last_message_at: string | null
          listing_id: string
          seller_id: string | null
        }
        Insert: {
          buyer_id?: string | null
          created_at?: string
          id?: string
          last_message?: string | null
          last_message_at?: string | null
          listing_id: string
          seller_id?: string | null
        }
        Update: {
          buyer_id?: string | null
          created_at?: string
          id?: string
          last_message?: string | null
          last_message_at?: string | null
          listing_id?: string
          seller_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "threads_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "public_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "threads_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "threads_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "threads_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "public_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "threads_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          currency: string
          email: string
          full_name: string | null
          id: string
          is_active: boolean
          is_verified: boolean
          last_seen_at: string | null
          lat: number | null
          lng: number | null
          location: unknown
          location_label: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          stripe_customer_id: string | null
          tier: Database["public"]["Enums"]["user_tier"]
          tier_expires_at: string | null
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          currency: string
          email: string
          full_name?: string | null
          id?: string
          is_active?: boolean
          is_verified?: boolean
          last_seen_at?: string | null
          lat?: number | null
          lng?: number | null
          location?: unknown
          location_label?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          stripe_customer_id?: string | null
          tier?: Database["public"]["Enums"]["user_tier"]
          tier_expires_at?: string | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          currency?: string
          email?: string
          full_name?: string | null
          id?: string
          is_active?: boolean
          is_verified?: boolean
          last_seen_at?: string | null
          lat?: number | null
          lng?: number | null
          location?: unknown
          location_label?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          stripe_customer_id?: string | null
          tier?: Database["public"]["Enums"]["user_tier"]
          tier_expires_at?: string | null
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      public_users: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string | null
          is_verified: boolean | null
          location_label: string | null
          role: Database["public"]["Enums"]["user_role"] | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string | null
          is_verified?: boolean | null
          location_label?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string | null
          is_verified?: boolean | null
          location_label?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
        }
        Relationships: []
      }
    }
    Functions: {
      create_listing: {
        Args: {
          p_board_type: Database["public"]["Enums"]["board_type"]
          p_condition: Database["public"]["Enums"]["board_condition"]
          p_currency: string
          p_description: string
          p_era: Database["public"]["Enums"]["board_era"]
          p_fin_setup: Database["public"]["Enums"]["fin_setup"]
          p_fin_system: Database["public"]["Enums"]["fin_system"]
          p_is_rideable: boolean
          p_lat: number
          p_lead_time_weeks: number
          p_length_inches: number
          p_listing_type: Database["public"]["Enums"]["listing_type"]
          p_lng: number
          p_location_label: string
          p_price: number
          p_provenance: string
          p_shaper_brand: string
          p_thickness_inches: number
          p_title: string
          p_user_id: string
          p_volume: number
          p_width_inches: number
        }
        Returns: string
      }
      get_inbox: {
        Args: { p_user_id: string }
        Returns: {
          buyer: Json
          buyer_id: string
          id: string
          last_message: string
          last_message_at: string
          listing: Json
          seller: Json
          seller_id: string
        }[]
      }
      get_listings_nearby: {
        Args: {
          p_board_type?: Database["public"]["Enums"]["board_type"]
          p_fin_system?: Database["public"]["Enums"]["fin_system"]
          p_lat: number
          p_length_max?: number
          p_length_min?: number
          p_limit?: number
          p_listing_type?: Database["public"]["Enums"]["listing_type"]
          p_lng: number
          p_offset?: number
          p_price_max?: number
          p_radius_miles?: number
          p_search_term?: string
          p_user_id?: string
          p_volume_max?: number
          p_volume_min?: number
        }
        Returns: {
          board_type: Database["public"]["Enums"]["board_type"]
          condition: Database["public"]["Enums"]["board_condition"]
          currency: string
          distance_miles: number
          fin_setup: Database["public"]["Enums"]["fin_setup"]
          fin_system: Database["public"]["Enums"]["fin_system"]
          id: string
          is_sponsored: boolean
          length_inches: number
          listing_type: Database["public"]["Enums"]["listing_type"]
          location_label: string
          price: number
          primary_photo: string
          title: string
          user_id: string
          volume: number
        }[]
      }
      send_message: {
        Args: {
          p_body: string
          p_listing_id: string
          p_sender_id: string
          p_thread_id?: string
        }
        Returns: string
      }
      update_business_location: {
        Args: {
          p_label: string
          p_lat: number
          p_lng: number
          p_user_id: string
        }
        Returns: undefined
      }
      update_listing_location: {
        Args: {
          p_label: string
          p_lat: number
          p_listing_id: string
          p_lng: number
        }
        Returns: undefined
      }
      update_user_location: {
        Args: {
          p_label: string
          p_lat: number
          p_lng: number
          p_user_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      board_condition: "new" | "excellent" | "good" | "fair" | "poor"
      board_era: "1950s" | "1960s" | "1970s" | "1980s" | "1990s"
      board_type:
        | "shortboard"
        | "longboard"
        | "midlength"
        | "fish"
        | "hybrid"
        | "groveler"
        | "step_up"
        | "gun"
        | "soft_top"
        | "sup"
        | "foilboard"
        | "other"
      fin_setup:
        | "single"
        | "twin"
        | "thruster"
        | "quad"
        | "five_fin"
        | "2_plus_1"
        | "other"
      fin_system: "fcs2" | "futures" | "fcs1" | "single" | "other" | "unknown"
      listing_status: "active" | "sold" | "hidden" | "pending_review"
      listing_type: "for_sale" | "in_stock" | "vintage" | "custom_order"
      message_status: "sent" | "delivered" | "read"
      sponsored_tier: "basic" | "featured" | "premium"
      user_role: "buyer_seller" | "shop" | "shaper" | "admin"
      user_tier: "free" | "starter" | "pro" | "business"
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
      board_condition: ["new", "excellent", "good", "fair", "poor"],
      board_era: ["1950s", "1960s", "1970s", "1980s", "1990s"],
      board_type: [
        "shortboard",
        "longboard",
        "midlength",
        "fish",
        "hybrid",
        "groveler",
        "step_up",
        "gun",
        "soft_top",
        "sup",
        "foilboard",
        "other",
      ],
      fin_setup: [
        "single",
        "twin",
        "thruster",
        "quad",
        "five_fin",
        "2_plus_1",
        "other",
      ],
      fin_system: ["fcs2", "futures", "fcs1", "single", "other", "unknown"],
      listing_status: ["active", "sold", "hidden", "pending_review"],
      listing_type: ["for_sale", "in_stock", "vintage", "custom_order"],
      message_status: ["sent", "delivered", "read"],
      sponsored_tier: ["basic", "featured", "premium"],
      user_role: ["buyer_seller", "shop", "shaper", "admin"],
      user_tier: ["free", "starter", "pro", "business"],
    },
  },
} as const
