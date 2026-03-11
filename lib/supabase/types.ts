export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          role: "buyer" | "agent" | "investor" | "admin";
          vibe_profile: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          role?: "buyer" | "agent" | "investor" | "admin";
          vibe_profile?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          role?: "buyer" | "agent" | "investor" | "admin";
          vibe_profile?: Json | null;
          updated_at?: string;
        };
      };
      properties: {
        Row: {
          id: string;
          address: string;
          city: string;
          state: string;
          zip: string;
          price: number;
          beds: number;
          baths: number;
          sqft: number;
          lot_size: number;
          year_built: number;
          property_type: "single_family" | "condo" | "townhouse" | "multi_family";
          status: "active" | "pending" | "sold";
          images: string[];
          description: string;
          tags: string[];
          agent_id: string;
          neighborhood_id: string;
          match_score: number;
          days_on_market: number;
          list_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          address: string;
          city: string;
          state: string;
          zip: string;
          price: number;
          beds: number;
          baths: number;
          sqft: number;
          lot_size?: number;
          year_built: number;
          property_type?: "single_family" | "condo" | "townhouse" | "multi_family";
          status?: "active" | "pending" | "sold";
          images?: string[];
          description?: string;
          tags?: string[];
          agent_id: string;
          neighborhood_id: string;
          match_score?: number;
          days_on_market?: number;
          list_date?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["properties"]["Insert"]>;
      };
      agents: {
        Row: {
          id: string;
          user_id: string | null;
          name: string;
          avatar: string;
          brokerage: string;
          years_exp: number;
          license_number: string;
          homes_sold_ytd: number;
          avg_days_to_close: number;
          avg_sale_vs_list: number;
          rating: number;
          review_count: number;
          specialties: string[];
          neighborhoods: string[];
          bio: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          name: string;
          avatar?: string;
          brokerage: string;
          years_exp?: number;
          license_number: string;
          homes_sold_ytd?: number;
          avg_days_to_close?: number;
          avg_sale_vs_list?: number;
          rating?: number;
          review_count?: number;
          specialties?: string[];
          neighborhoods?: string[];
          bio?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["agents"]["Insert"]>;
      };
      neighborhoods: {
        Row: {
          id: string;
          name: string;
          city: string;
          state: string;
          median_price: number;
          price_change_yoy: string;
          avg_days_on_market: number;
          active_listings: number;
          resident_count: number;
          vibe_scores: Json;
          description: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          city: string;
          state: string;
          median_price?: number;
          price_change_yoy?: string;
          avg_days_on_market?: number;
          active_listings?: number;
          resident_count?: number;
          vibe_scores?: Json;
          description?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["neighborhoods"]["Insert"]>;
      };
      likes: {
        Row: {
          id: string;
          user_id: string;
          property_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          property_id: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["likes"]["Insert"]>;
      };
      saves: {
        Row: {
          id: string;
          user_id: string;
          property_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          property_id: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["saves"]["Insert"]>;
      };
      comments: {
        Row: {
          id: string;
          user_id: string;
          property_id: string;
          text: string;
          parent_id: string | null;
          like_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          property_id: string;
          text: string;
          parent_id?: string | null;
          like_count?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["comments"]["Insert"]>;
      };
      boards: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          is_public: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["boards"]["Insert"]>;
      };
      board_properties: {
        Row: {
          id: string;
          board_id: string;
          property_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          board_id: string;
          property_id: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["board_properties"]["Insert"]>;
      };
      follows: {
        Row: {
          id: string;
          user_id: string;
          target_type: "agent" | "neighborhood";
          target_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          target_type: "agent" | "neighborhood";
          target_id: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["follows"]["Insert"]>;
      };
      reviews: {
        Row: {
          id: string;
          neighborhood_id: string;
          user_id: string;
          user_name: string;
          years_lived: number;
          rating: number;
          text: string;
          helpful: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          neighborhood_id: string;
          user_id: string;
          user_name: string;
          years_lived?: number;
          rating: number;
          text: string;
          helpful?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["reviews"]["Insert"]>;
      };
      messages: {
        Row: {
          id: string;
          sender_id: string;
          receiver_id: string;
          text: string;
          property_id: string | null;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          sender_id: string;
          receiver_id: string;
          text: string;
          property_id?: string | null;
          read?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["messages"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_property_stats: {
        Args: { p_id: string };
        Returns: { like_count: number; comment_count: number; save_count: number };
      };
    };
    Enums: {
      user_role: "buyer" | "agent" | "investor" | "admin";
      property_type: "single_family" | "condo" | "townhouse" | "multi_family";
      property_status: "active" | "pending" | "sold";
      follow_target: "agent" | "neighborhood";
    };
  };
}
