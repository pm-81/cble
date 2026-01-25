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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      domain_confidence: {
        Row: {
          confidence_level: number | null
          created_at: string
          domain_id: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          confidence_level?: number | null
          created_at?: string
          domain_id: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          confidence_level?: number | null
          created_at?: string
          domain_id?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "domain_confidence_domain_id_fkey"
            columns: ["domain_id"]
            isOneToOne: false
            referencedRelation: "domains"
            referencedColumns: ["id"]
          },
        ]
      }
      domains: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
          sort_order: number | null
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          sort_order?: number | null
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      flashcard_progress: {
        Row: {
          created_at: string
          due_date: string | null
          ease_factor: number | null
          flashcard_id: string
          id: string
          interval_days: number | null
          lapses: number | null
          last_reviewed: string | null
          repetitions: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          due_date?: string | null
          ease_factor?: number | null
          flashcard_id: string
          id?: string
          interval_days?: number | null
          lapses?: number | null
          last_reviewed?: string | null
          repetitions?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          due_date?: string | null
          ease_factor?: number | null
          flashcard_id?: string
          id?: string
          interval_days?: number | null
          lapses?: number | null
          last_reviewed?: string | null
          repetitions?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "flashcard_progress_flashcard_id_fkey"
            columns: ["flashcard_id"]
            isOneToOne: false
            referencedRelation: "flashcards"
            referencedColumns: ["id"]
          },
        ]
      }
      flashcards: {
        Row: {
          back: string
          created_at: string
          domain_id: string | null
          front: string
          id: string
          is_active: boolean | null
          reference_cue: string | null
          tags: string[] | null
          topic_id: string | null
          updated_at: string
        }
        Insert: {
          back: string
          created_at?: string
          domain_id?: string | null
          front: string
          id?: string
          is_active?: boolean | null
          reference_cue?: string | null
          tags?: string[] | null
          topic_id?: string | null
          updated_at?: string
        }
        Update: {
          back?: string
          created_at?: string
          domain_id?: string | null
          front?: string
          id?: string
          is_active?: boolean | null
          reference_cue?: string | null
          tags?: string[] | null
          topic_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "flashcards_domain_id_fkey"
            columns: ["domain_id"]
            isOneToOne: false
            referencedRelation: "domains"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flashcards_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      mastery_progress: {
        Row: {
          confidence_sum: number | null
          correct_attempts: number | null
          created_at: string
          domain_id: string
          id: string
          last_practiced: string | null
          mastery_level: number | null
          topic_id: string | null
          total_attempts: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          confidence_sum?: number | null
          correct_attempts?: number | null
          created_at?: string
          domain_id: string
          id?: string
          last_practiced?: string | null
          mastery_level?: number | null
          topic_id?: string | null
          total_attempts?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          confidence_sum?: number | null
          correct_attempts?: number | null
          created_at?: string
          domain_id?: string
          id?: string
          last_practiced?: string | null
          mastery_level?: number | null
          topic_id?: string | null
          total_attempts?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mastery_progress_domain_id_fkey"
            columns: ["domain_id"]
            isOneToOne: false
            referencedRelation: "domains"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mastery_progress_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          exam_date: string | null
          id: string
          onboarding_completed: boolean | null
          preferred_session_length: number | null
          updated_at: string
          user_id: string
          weekly_study_minutes: number | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          exam_date?: string | null
          id?: string
          onboarding_completed?: boolean | null
          preferred_session_length?: number | null
          updated_at?: string
          user_id: string
          weekly_study_minutes?: number | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          exam_date?: string | null
          id?: string
          onboarding_completed?: boolean | null
          preferred_session_length?: number | null
          updated_at?: string
          user_id?: string
          weekly_study_minutes?: number | null
        }
        Relationships: []
      }
      question_attempts: {
        Row: {
          confidence_rating: number | null
          created_at: string
          id: string
          is_correct: boolean
          question_id: string
          selected_answer: string
          time_spent_seconds: number | null
          user_id: string
          was_lucky_guess: boolean | null
        }
        Insert: {
          confidence_rating?: number | null
          created_at?: string
          id?: string
          is_correct: boolean
          question_id: string
          selected_answer: string
          time_spent_seconds?: number | null
          user_id: string
          was_lucky_guess?: boolean | null
        }
        Update: {
          confidence_rating?: number | null
          created_at?: string
          id?: string
          is_correct?: boolean
          question_id?: string
          selected_answer?: string
          time_spent_seconds?: number | null
          user_id?: string
          was_lucky_guess?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "question_attempts_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          correct_answer: string
          created_at: string
          difficulty: number | null
          domain_id: string | null
          id: string
          is_active: boolean | null
          last_reviewed: string | null
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          option_e: string
          rationale: string | null
          reference_cue: string | null
          stem: string
          tags: string[] | null
          topic_id: string | null
          updated_at: string
        }
        Insert: {
          correct_answer: string
          created_at?: string
          difficulty?: number | null
          domain_id?: string | null
          id?: string
          is_active?: boolean | null
          last_reviewed?: string | null
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          option_e: string
          rationale?: string | null
          reference_cue?: string | null
          stem: string
          tags?: string[] | null
          topic_id?: string | null
          updated_at?: string
        }
        Update: {
          correct_answer?: string
          created_at?: string
          difficulty?: number | null
          domain_id?: string | null
          id?: string
          is_active?: boolean | null
          last_reviewed?: string | null
          option_a?: string
          option_b?: string
          option_c?: string
          option_d?: string
          option_e?: string
          rationale?: string | null
          reference_cue?: string | null
          stem?: string
          tags?: string[] | null
          topic_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "questions_domain_id_fkey"
            columns: ["domain_id"]
            isOneToOne: false
            referencedRelation: "domains"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      study_plans: {
        Row: {
          created_at: string
          exam_date: string
          id: string
          is_active: boolean | null
          session_length_minutes: number | null
          updated_at: string
          user_id: string
          weekly_minutes: number | null
        }
        Insert: {
          created_at?: string
          exam_date: string
          id?: string
          is_active?: boolean | null
          session_length_minutes?: number | null
          updated_at?: string
          user_id: string
          weekly_minutes?: number | null
        }
        Update: {
          created_at?: string
          exam_date?: string
          id?: string
          is_active?: boolean | null
          session_length_minutes?: number | null
          updated_at?: string
          user_id?: string
          weekly_minutes?: number | null
        }
        Relationships: []
      }
      study_sessions: {
        Row: {
          actual_duration_minutes: number | null
          completed_at: string | null
          created_at: string
          id: string
          questions_attempted: number | null
          questions_correct: number | null
          scheduled_date: string
          session_type: string
          study_plan_id: string | null
          target_duration_minutes: number | null
          user_id: string
        }
        Insert: {
          actual_duration_minutes?: number | null
          completed_at?: string | null
          created_at?: string
          id?: string
          questions_attempted?: number | null
          questions_correct?: number | null
          scheduled_date: string
          session_type: string
          study_plan_id?: string | null
          target_duration_minutes?: number | null
          user_id: string
        }
        Update: {
          actual_duration_minutes?: number | null
          completed_at?: string | null
          created_at?: string
          id?: string
          questions_attempted?: number | null
          questions_correct?: number | null
          scheduled_date?: string
          session_type?: string
          study_plan_id?: string | null
          target_duration_minutes?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_sessions_study_plan_id_fkey"
            columns: ["study_plan_id"]
            isOneToOne: false
            referencedRelation: "study_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      topics: {
        Row: {
          created_at: string
          description: string | null
          domain_id: string
          id: string
          name: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          domain_id: string
          id?: string
          name: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          domain_id?: string
          id?: string
          name?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "topics_domain_id_fkey"
            columns: ["domain_id"]
            isOneToOne: false
            referencedRelation: "domains"
            referencedColumns: ["id"]
          },
        ]
      }
      user_notes: {
        Row: {
          content: string
          created_at: string
          domain_id: string | null
          flashcard_id: string | null
          id: string
          is_mnemonic: boolean | null
          question_id: string | null
          tags: string[] | null
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          domain_id?: string | null
          flashcard_id?: string | null
          id?: string
          is_mnemonic?: boolean | null
          question_id?: string | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          domain_id?: string | null
          flashcard_id?: string | null
          id?: string
          is_mnemonic?: boolean | null
          question_id?: string | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_notes_domain_id_fkey"
            columns: ["domain_id"]
            isOneToOne: false
            referencedRelation: "domains"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_notes_flashcard_id_fkey"
            columns: ["flashcard_id"]
            isOneToOne: false
            referencedRelation: "flashcards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_notes_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
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
          role?: Database["public"]["Enums"]["app_role"]
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
      user_streaks: {
        Row: {
          created_at: string
          current_streak: number | null
          id: string
          last_study_date: string | null
          longest_streak: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_streak?: number | null
          id?: string
          last_study_date?: string | null
          longest_streak?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_streak?: number | null
          id?: string
          last_study_date?: string | null
          longest_streak?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
