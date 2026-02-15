export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type SubscriptionTier = 'free' | 'starter' | 'pro' | 'enterprise'
export type LeadStatus = 'new_lead' | 'contacted' | 'replied' | 'call_booked' | 'activated' | 'dead'
export type LeadSource = 'ai_finder' | 'smart_search' | 'manual' | 'csv_import'
export type SearchType = 'ai_finder' | 'smart_search'
export type TemplateCategory = 'intro' | 'follow_up' | 'partnership' | 'custom' | 'cadence'
export type CadenceAngle = 'A' | 'B' | 'C'
export type CadenceStatus = 'active' | 'paused' | 'completed' | 'stopped'
export type CadenceStepStatus = 'pending' | 'ready' | 'sent' | 'skipped' | 'cancelled'
export type FinancePartnerStatus = 'yes' | 'no' | 'unknown'
export type OutreachEventType = 'email_sent' | 'reply_received' | 'call_booked' | 'deal_activated'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          company_name: string | null
          phone: string | null
          subscription_tier: SubscriptionTier
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          searches_this_month: number
          searches_reset_date: string | null
          is_admin: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          company_name?: string | null
          phone?: string | null
          subscription_tier?: SubscriptionTier
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          searches_this_month?: number
          searches_reset_date?: string | null
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          company_name?: string | null
          phone?: string | null
          subscription_tier?: SubscriptionTier
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          searches_this_month?: number
          searches_reset_date?: string | null
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      leads: {
        Row: {
          id: string
          user_id: string
          company_name: string
          contact_name: string | null
          email: string | null
          phone: string | null
          website: string | null
          address: string | null
          city: string | null
          state: string | null
          zip_code: string | null
          equipment_types: string[] | null
          source: LeadSource
          source_url: string | null
          status: LeadStatus
          follow_up_date: string | null
          notes: string | null
          last_contacted: string | null
          angle_used: CadenceAngle | null
          has_existing_finance_partner: FinancePartnerStatus
          offers_financing_on_website: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          company_name: string
          contact_name?: string | null
          email?: string | null
          phone?: string | null
          website?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          equipment_types?: string[] | null
          source: LeadSource
          source_url?: string | null
          status?: LeadStatus
          follow_up_date?: string | null
          notes?: string | null
          last_contacted?: string | null
          angle_used?: CadenceAngle | null
          has_existing_finance_partner?: FinancePartnerStatus
          offers_financing_on_website?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          company_name?: string
          contact_name?: string | null
          email?: string | null
          phone?: string | null
          website?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          equipment_types?: string[] | null
          source?: LeadSource
          source_url?: string | null
          status?: LeadStatus
          follow_up_date?: string | null
          notes?: string | null
          last_contacted?: string | null
          angle_used?: CadenceAngle | null
          has_existing_finance_partner?: FinancePartnerStatus
          offers_financing_on_website?: boolean | null
          created_at?: string
          updated_at?: string
        }
      }
      search_history: {
        Row: {
          id: string
          user_id: string
          search_type: SearchType
          criteria: Json
          results_count: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          search_type: SearchType
          criteria: Json
          results_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          search_type?: SearchType
          criteria?: Json
          results_count?: number
          created_at?: string
        }
      }
      email_templates: {
        Row: {
          id: string
          name: string
          subject: string
          body: string
          category: TemplateCategory | null
          is_default: boolean
          tier_required: SubscriptionTier
          angle: CadenceAngle | null
          cadence_step: number | null
          cadence_day: number | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          subject: string
          body: string
          category?: TemplateCategory | null
          is_default?: boolean
          tier_required?: SubscriptionTier
          angle?: CadenceAngle | null
          cadence_step?: number | null
          cadence_day?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          subject?: string
          body?: string
          category?: TemplateCategory | null
          is_default?: boolean
          tier_required?: SubscriptionTier
          angle?: CadenceAngle | null
          cadence_step?: number | null
          cadence_day?: number | null
          created_at?: string
        }
      }
      cadences: {
        Row: {
          id: string
          lead_id: string
          user_id: string
          angle: CadenceAngle
          status: CadenceStatus
          started_at: string
          stopped_at: string | null
          stop_reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          lead_id: string
          user_id: string
          angle: CadenceAngle
          status?: CadenceStatus
          started_at?: string
          stopped_at?: string | null
          stop_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          lead_id?: string
          user_id?: string
          angle?: CadenceAngle
          status?: CadenceStatus
          started_at?: string
          stopped_at?: string | null
          stop_reason?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      cadence_steps: {
        Row: {
          id: string
          cadence_id: string
          step_number: number
          template_id: string | null
          scheduled_date: string
          status: CadenceStepStatus
          sent_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          cadence_id: string
          step_number: number
          template_id?: string | null
          scheduled_date: string
          status?: CadenceStepStatus
          sent_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          cadence_id?: string
          step_number?: number
          template_id?: string | null
          scheduled_date?: string
          status?: CadenceStepStatus
          sent_at?: string | null
          created_at?: string
        }
      }
      outreach_log: {
        Row: {
          id: string
          user_id: string
          lead_id: string | null
          event_type: OutreachEventType
          cadence_step_id: string | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          lead_id?: string | null
          event_type: OutreachEventType
          cadence_step_id?: string | null
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          lead_id?: string | null
          event_type?: OutreachEventType
          cadence_step_id?: string | null
          metadata?: Json
          created_at?: string
        }
      }
      scoreboard_targets: {
        Row: {
          id: string
          user_id: string
          weekly_leads_found: number
          weekly_emails_sent: number
          weekly_replies: number
          weekly_calls_booked: number
          weekly_deals_activated: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          weekly_leads_found?: number
          weekly_emails_sent?: number
          weekly_replies?: number
          weekly_calls_booked?: number
          weekly_deals_activated?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          weekly_leads_found?: number
          weekly_emails_sent?: number
          weekly_replies?: number
          weekly_calls_booked?: number
          weekly_deals_activated?: number
          created_at?: string
          updated_at?: string
        }
      }
      platform_stats: {
        Row: {
          id: string
          date: string
          total_users: number
          active_users: number
          total_searches: number
          total_leads_added: number
          starter_subscribers: number
          pro_subscribers: number
          enterprise_subscribers: number
          mrr: number
          created_at: string
        }
        Insert: {
          id?: string
          date: string
          total_users?: number
          active_users?: number
          total_searches?: number
          total_leads_added?: number
          starter_subscribers?: number
          pro_subscribers?: number
          enterprise_subscribers?: number
          mrr?: number
          created_at?: string
        }
        Update: {
          id?: string
          date?: string
          total_users?: number
          active_users?: number
          total_searches?: number
          total_leads_added?: number
          starter_subscribers?: number
          pro_subscribers?: number
          enterprise_subscribers?: number
          mrr?: number
          created_at?: string
        }
      }
    }
  }
}

// Helper types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Lead = Database['public']['Tables']['leads']['Row']
export type SearchHistory = Database['public']['Tables']['search_history']['Row']
export type EmailTemplate = Database['public']['Tables']['email_templates']['Row']
export type Cadence = Database['public']['Tables']['cadences']['Row']
export type CadenceStep = Database['public']['Tables']['cadence_steps']['Row']
export type OutreachLog = Database['public']['Tables']['outreach_log']['Row']
export type ScoreboardTargets = Database['public']['Tables']['scoreboard_targets']['Row']
export type PlatformStats = Database['public']['Tables']['platform_stats']['Row']
