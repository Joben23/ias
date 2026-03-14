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
      applicants: {
        Row: {
          application_date: string
          certifications: string[] | null
          cover_letter: string | null
          created_at: string
          department: string
          education: string | null
          email: string
          experience: string | null
          full_name: string
          id: string
          job_posting_id: string | null
          phone: string | null
          position_applied: string
          rating: number | null
          resume_file: string | null
          skills: string[] | null
          status: string
        }
        Insert: {
          application_date?: string
          certifications?: string[] | null
          cover_letter?: string | null
          created_at?: string
          department: string
          education?: string | null
          email: string
          experience?: string | null
          full_name: string
          id?: string
          job_posting_id?: string | null
          phone?: string | null
          position_applied: string
          rating?: number | null
          resume_file?: string | null
          skills?: string[] | null
          status?: string
        }
        Update: {
          application_date?: string
          certifications?: string[] | null
          cover_letter?: string | null
          created_at?: string
          department?: string
          education?: string | null
          email?: string
          experience?: string | null
          full_name?: string
          id?: string
          job_posting_id?: string | null
          phone?: string | null
          position_applied?: string
          rating?: number | null
          resume_file?: string | null
          skills?: string[] | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "applicants_job_posting_id_fkey"
            columns: ["job_posting_id"]
            isOneToOne: false
            referencedRelation: "job_postings"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          applicant_id: string | null
          created_at: string | null
          department: string
          email: string
          employee_id: string
          full_name: string
          id: string
          onboarding_status: string
          phone: string | null
          position: string
          start_date: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          applicant_id?: string | null
          created_at?: string | null
          department: string
          email: string
          employee_id: string
          full_name: string
          id?: string
          onboarding_status?: string
          phone?: string | null
          position: string
          start_date?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          applicant_id?: string | null
          created_at?: string | null
          department?: string
          email?: string
          employee_id?: string
          full_name?: string
          id?: string
          onboarding_status?: string
          phone?: string | null
          position?: string
          start_date?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employees_applicant_id_fkey"
            columns: ["applicant_id"]
            isOneToOne: false
            referencedRelation: "applicants"
            referencedColumns: ["id"]
          },
        ]
      }
      interview_evaluations: {
        Row: {
          applicant_id: string
          comments: string | null
          communication_skills: number
          created_at: string
          cultural_fit: number
          evaluator_name: string
          id: string
          interview_id: string
          medical_knowledge: number
          overall_score: number | null
          professionalism: number
          recommendation: string
          technical_skills: number
        }
        Insert: {
          applicant_id: string
          comments?: string | null
          communication_skills: number
          created_at?: string
          cultural_fit: number
          evaluator_name: string
          id?: string
          interview_id: string
          medical_knowledge: number
          overall_score?: number | null
          professionalism: number
          recommendation?: string
          technical_skills: number
        }
        Update: {
          applicant_id?: string
          comments?: string | null
          communication_skills?: number
          created_at?: string
          cultural_fit?: number
          evaluator_name?: string
          id?: string
          interview_id?: string
          medical_knowledge?: number
          overall_score?: number | null
          professionalism?: number
          recommendation?: string
          technical_skills?: number
        }
        Relationships: [
          {
            foreignKeyName: "interview_evaluations_applicant_id_fkey"
            columns: ["applicant_id"]
            isOneToOne: false
            referencedRelation: "applicants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interview_evaluations_interview_id_fkey"
            columns: ["interview_id"]
            isOneToOne: false
            referencedRelation: "interviews"
            referencedColumns: ["id"]
          },
        ]
      }
      interviews: {
        Row: {
          applicant_id: string
          created_at: string
          id: string
          interview_date: string
          interview_time: string
          interview_type: string
          job_posting_id: string | null
          location: string | null
          meeting_link: string | null
          notes: string | null
          panel_members: string[] | null
          status: string
          updated_at: string
        }
        Insert: {
          applicant_id: string
          created_at?: string
          id?: string
          interview_date: string
          interview_time: string
          interview_type?: string
          job_posting_id?: string | null
          location?: string | null
          meeting_link?: string | null
          notes?: string | null
          panel_members?: string[] | null
          status?: string
          updated_at?: string
        }
        Update: {
          applicant_id?: string
          created_at?: string
          id?: string
          interview_date?: string
          interview_time?: string
          interview_type?: string
          job_posting_id?: string | null
          location?: string | null
          meeting_link?: string | null
          notes?: string | null
          panel_members?: string[] | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "interviews_applicant_id_fkey"
            columns: ["applicant_id"]
            isOneToOne: false
            referencedRelation: "applicants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interviews_job_posting_id_fkey"
            columns: ["job_posting_id"]
            isOneToOne: false
            referencedRelation: "job_postings"
            referencedColumns: ["id"]
          },
        ]
      }
      job_offers: {
        Row: {
          applicant_id: string
          candidate_name: string
          contract_type: string
          created_at: string
          department: string
          id: string
          notes: string | null
          offer_date: string
          position: string
          salary_offer: string
          start_date: string
          status: string
          updated_at: string
        }
        Insert: {
          applicant_id: string
          candidate_name: string
          contract_type?: string
          created_at?: string
          department: string
          id?: string
          notes?: string | null
          offer_date?: string
          position: string
          salary_offer: string
          start_date: string
          status?: string
          updated_at?: string
        }
        Update: {
          applicant_id?: string
          candidate_name?: string
          contract_type?: string
          created_at?: string
          department?: string
          id?: string
          notes?: string | null
          offer_date?: string
          position?: string
          salary_offer?: string
          start_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_offers_applicant_id_fkey"
            columns: ["applicant_id"]
            isOneToOne: false
            referencedRelation: "applicants"
            referencedColumns: ["id"]
          },
        ]
      }
      job_postings: {
        Row: {
          applicant_count: number
          closing_date: string | null
          created_at: string
          department: string
          description: string
          employment_type: string
          id: string
          location: string | null
          position: string
          posted_date: string
          requirements: string[] | null
          status: string
          title: string
        }
        Insert: {
          applicant_count?: number
          closing_date?: string | null
          created_at?: string
          department: string
          description: string
          employment_type?: string
          id?: string
          location?: string | null
          position?: string
          posted_date?: string
          requirements?: string[] | null
          status?: string
          title: string
        }
        Update: {
          applicant_count?: number
          closing_date?: string | null
          created_at?: string
          department?: string
          description?: string
          employment_type?: string
          id?: string
          location?: string | null
          position?: string
          posted_date?: string
          requirements?: string[] | null
          status?: string
          title?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean
          related_applicant_id: string | null
          title: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean
          related_applicant_id?: string | null
          title: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          related_applicant_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_related_applicant_id_fkey"
            columns: ["related_applicant_id"]
            isOneToOne: false
            referencedRelation: "applicants"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_documents: {
        Row: {
          document_name: string
          document_type: string
          employee_id: string
          file_path: string
          id: string
          task_id: string | null
          uploaded_at: string
        }
        Insert: {
          document_name: string
          document_type: string
          employee_id: string
          file_path: string
          id?: string
          task_id?: string | null
          uploaded_at?: string
        }
        Update: {
          document_name?: string
          document_type?: string
          employee_id?: string
          file_path?: string
          id?: string
          task_id?: string | null
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_documents_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_documents_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "onboarding_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_tasks: {
        Row: {
          completed_at: string | null
          created_at: string
          employee_id: string
          id: string
          status: string
          task_category: string
          task_name: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          employee_id: string
          id?: string
          status?: string
          task_category?: string
          task_name: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          employee_id?: string
          id?: string
          status?: string
          task_category?: string
          task_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_tasks_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      orientations: {
        Row: {
          created_at: string
          employee_id: string
          id: string
          location: string
          notes: string | null
          orientation_date: string
          orientation_time: string
          status: string
          trainer_name: string
        }
        Insert: {
          created_at?: string
          employee_id: string
          id?: string
          location?: string
          notes?: string | null
          orientation_date: string
          orientation_time: string
          status?: string
          trainer_name: string
        }
        Update: {
          created_at?: string
          employee_id?: string
          id?: string
          location?: string
          notes?: string | null
          orientation_date?: string
          orientation_time?: string
          status?: string
          trainer_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "orientations_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          department: string | null
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          role: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          role?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      recognitions: {
        Row: {
          award_type: string
          comments: number
          created_at: string
          date: string
          department: string | null
          description: string | null
          employee_name: string
          id: string
          likes: number
          position: string | null
        }
        Insert: {
          award_type: string
          comments?: number
          created_at?: string
          date?: string
          department?: string | null
          description?: string | null
          employee_name: string
          id?: string
          likes?: number
          position?: string | null
        }
        Update: {
          award_type?: string
          comments?: number
          created_at?: string
          date?: string
          department?: string | null
          description?: string | null
          employee_name?: string
          id?: string
          likes?: number
          position?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
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
      app_role: "admin" | "hr" | "employee"
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
      app_role: ["admin", "hr", "employee"],
    },
  },
} as const
