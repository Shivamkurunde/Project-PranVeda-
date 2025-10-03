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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      ai_interactions: {
        Row: {
          context_data: Json | null
          created_at: string
          id: string
          message_content: string
          message_type: string
          response_audio_url: string | null
          session_context: string | null
          user_id: string
        }
        Insert: {
          context_data?: Json | null
          created_at?: string
          id?: string
          message_content: string
          message_type: string
          response_audio_url?: string | null
          session_context?: string | null
          user_id: string
        }
        Update: {
          context_data?: Json | null
          created_at?: string
          id?: string
          message_content?: string
          message_type?: string
          response_audio_url?: string | null
          session_context?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_interactions_session_context_fkey"
            columns: ["session_context"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      celebrations: {
        Row: {
          audio_played: boolean | null
          celebration_type: string
          created_at: string
          id: string
          message: string
          title: string
          user_id: string
          value: number | null
          visual_effect: string | null
        }
        Insert: {
          audio_played?: boolean | null
          celebration_type: string
          created_at?: string
          id?: string
          message: string
          title: string
          user_id: string
          value?: number | null
          visual_effect?: string | null
        }
        Update: {
          audio_played?: boolean | null
          celebration_type?: string
          created_at?: string
          id?: string
          message?: string
          title?: string
          user_id?: string
          value?: number | null
          visual_effect?: string | null
        }
        Relationships: []
      }
      mood_logs: {
        Row: {
          ai_analysis: Json | null
          created_at: string
          description: string | null
          id: string
          intensity: number
          mood: string
          session_id: string | null
          triggers: string[] | null
          user_id: string
        }
        Insert: {
          ai_analysis?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          intensity: number
          mood: string
          session_id?: string | null
          triggers?: string[] | null
          user_id: string
        }
        Update: {
          ai_analysis?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          intensity?: number
          mood?: string
          session_id?: string | null
          triggers?: string[] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mood_logs_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          experience_level: string | null
          id: string
          notification_preferences: Json | null
          preferred_language: string | null
          updated_at: string
          user_id: string
          wellness_goals: string[] | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          experience_level?: string | null
          id?: string
          notification_preferences?: Json | null
          preferred_language?: string | null
          updated_at?: string
          user_id: string
          wellness_goals?: string[] | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          experience_level?: string | null
          id?: string
          notification_preferences?: Json | null
          preferred_language?: string | null
          updated_at?: string
          user_id?: string
          wellness_goals?: string[] | null
        }
        Relationships: []
      }
      sessions: {
        Row: {
          audio_preview_url: string | null
          calories_burned: number | null
          category: string
          created_at: string
          description: string | null
          difficulty: string | null
          duration_minutes: number
          equipment_needed: string[] | null
          id: string
          instructor: string | null
          is_featured: boolean | null
          language: string | null
          participant_count: number | null
          rating: number | null
          session_type: string
          tags: string[] | null
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          audio_preview_url?: string | null
          calories_burned?: number | null
          category: string
          created_at?: string
          description?: string | null
          difficulty?: string | null
          duration_minutes: number
          equipment_needed?: string[] | null
          id?: string
          instructor?: string | null
          is_featured?: boolean | null
          language?: string | null
          participant_count?: number | null
          rating?: number | null
          session_type: string
          tags?: string[] | null
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          audio_preview_url?: string | null
          calories_burned?: number | null
          category?: string
          created_at?: string
          description?: string | null
          difficulty?: string | null
          duration_minutes?: number
          equipment_needed?: string[] | null
          id?: string
          instructor?: string | null
          is_featured?: boolean | null
          language?: string | null
          participant_count?: number | null
          rating?: number | null
          session_type?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      user_progress: {
        Row: {
          achievements: string[] | null
          badges_earned: string[] | null
          created_at: string
          current_level: number | null
          current_streak: number | null
          experience_points: number | null
          id: string
          last_session_date: string | null
          longest_streak: number | null
          total_minutes: number | null
          total_sessions: number | null
          updated_at: string
          user_id: string
          weekly_goal_minutes: number | null
          weekly_progress_minutes: number | null
        }
        Insert: {
          achievements?: string[] | null
          badges_earned?: string[] | null
          created_at?: string
          current_level?: number | null
          current_streak?: number | null
          experience_points?: number | null
          id?: string
          last_session_date?: string | null
          longest_streak?: number | null
          total_minutes?: number | null
          total_sessions?: number | null
          updated_at?: string
          user_id: string
          weekly_goal_minutes?: number | null
          weekly_progress_minutes?: number | null
        }
        Update: {
          achievements?: string[] | null
          badges_earned?: string[] | null
          created_at?: string
          current_level?: number | null
          current_streak?: number | null
          experience_points?: number | null
          id?: string
          last_session_date?: string | null
          longest_streak?: number | null
          total_minutes?: number | null
          total_sessions?: number | null
          updated_at?: string
          user_id?: string
          weekly_goal_minutes?: number | null
          weekly_progress_minutes?: number | null
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          celebration_triggered: boolean | null
          completed_at: string | null
          created_at: string
          duration_minutes: number | null
          id: string
          mood_after: string | null
          mood_before: string | null
          notes: string | null
          rating: number | null
          session_id: string
          user_id: string
        }
        Insert: {
          celebration_triggered?: boolean | null
          completed_at?: string | null
          created_at?: string
          duration_minutes?: number | null
          id?: string
          mood_after?: string | null
          mood_before?: string | null
          notes?: string | null
          rating?: number | null
          session_id: string
          user_id: string
        }
        Update: {
          celebration_triggered?: boolean | null
          completed_at?: string | null
          created_at?: string
          duration_minutes?: number | null
          id?: string
          mood_after?: string | null
          mood_before?: string | null
          notes?: string | null
          rating?: number | null
          session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_sessions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
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
      [_ in never]: never
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
    Enums: {},
  },
} as const
