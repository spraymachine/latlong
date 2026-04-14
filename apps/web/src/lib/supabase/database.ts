export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      voyages: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string;
          start_name: string;
          start_latitude: number;
          start_longitude: number;
          end_name: string;
          end_latitude: number;
          end_longitude: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string;
          start_name: string;
          start_latitude: number;
          start_longitude: number;
          end_name: string;
          end_latitude: number;
          end_longitude: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string;
          start_name?: string;
          start_latitude?: number;
          start_longitude?: number;
          end_name?: string;
          end_latitude?: number;
          end_longitude?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "voyages_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      posts: {
        Row: {
          id: string;
          voyage_id: string;
          user_id: string;
          image_path: string;
          caption: string;
          latitude: number;
          longitude: number;
          posted_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          voyage_id: string;
          user_id: string;
          image_path: string;
          caption?: string;
          latitude: number;
          longitude: number;
          posted_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          voyage_id?: string;
          user_id?: string;
          image_path?: string;
          caption?: string;
          latitude?: number;
          longitude?: number;
          posted_at?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "posts_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "posts_voyage_owner_fkey";
            columns: ["voyage_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "voyages";
            referencedColumns: ["id", "user_id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
  storage: {
    Tables: {
      buckets: {
        Row: {
          id: string;
          name: string;
          owner: string | null;
          public: boolean | null;
          avif_autodetection: boolean | null;
          file_size_limit: number | null;
          allowed_mime_types: string[] | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          name: string;
          owner?: string | null;
          public?: boolean | null;
          avif_autodetection?: boolean | null;
          file_size_limit?: number | null;
          allowed_mime_types?: string[] | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          owner?: string | null;
          public?: boolean | null;
          avif_autodetection?: boolean | null;
          file_size_limit?: number | null;
          allowed_mime_types?: string[] | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      objects: {
        Row: {
          id: string;
          bucket_id: string | null;
          name: string | null;
          owner: string | null;
          created_at: string | null;
          updated_at: string | null;
          last_accessed_at: string | null;
          metadata: Json | null;
          path_tokens: string[] | null;
          version: string | null;
          owner_id: string | null;
          user_metadata: Json | null;
        };
        Insert: {
          id?: string;
          bucket_id?: string | null;
          name?: string | null;
          owner?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          last_accessed_at?: string | null;
          metadata?: Json | null;
          path_tokens?: string[] | null;
          version?: string | null;
          owner_id?: string | null;
          user_metadata?: Json | null;
        };
        Update: {
          id?: string;
          bucket_id?: string | null;
          name?: string | null;
          owner?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          last_accessed_at?: string | null;
          metadata?: Json | null;
          path_tokens?: string[] | null;
          version?: string | null;
          owner_id?: string | null;
          user_metadata?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: "objects_bucketId_fkey";
            columns: ["bucket_id"];
            isOneToOne: false;
            referencedRelation: "buckets";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
