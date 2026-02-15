-- Migration 004: Pipeline stages, tracking fields, cadence tables, scoreboard
-- Run in Supabase SQL Editor

-- =============================================
-- STEP 1: CHANGE LEAD PIPELINE STAGES
-- =============================================

-- Drop the old CHECK constraint on leads.status
ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS leads_status_check;

-- Migrate existing data to new status values
UPDATE public.leads SET status = 'new_lead' WHERE status = 'new';
UPDATE public.leads SET status = 'activated' WHERE status = 'converted';
UPDATE public.leads SET status = 'dead' WHERE status = 'not_interested';
-- follow_up → contacted (closest match)
UPDATE public.leads SET notes = CONCAT(COALESCE(notes, ''), E'\n[Migrated from follow_up status]')
  WHERE status = 'follow_up';
UPDATE public.leads SET status = 'contacted' WHERE status = 'follow_up';

-- Add the new CHECK constraint
ALTER TABLE public.leads ADD CONSTRAINT leads_status_check
  CHECK (status IN ('new_lead', 'contacted', 'replied', 'call_booked', 'activated', 'dead'));

-- =============================================
-- STEP 2: ADD TRACKING FIELDS TO LEADS
-- =============================================

ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS angle_used TEXT
  CHECK (angle_used IN ('A', 'B', 'C'));

ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS has_existing_finance_partner TEXT
  DEFAULT 'unknown'
  CHECK (has_existing_finance_partner IN ('yes', 'no', 'unknown'));

ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS offers_financing_on_website BOOLEAN
  DEFAULT NULL;

-- =============================================
-- STEP 3: UPDATE email_templates TABLE
-- =============================================

-- Drop old category CHECK constraint
ALTER TABLE public.email_templates DROP CONSTRAINT IF EXISTS email_templates_category_check;

-- Add cadence template columns
ALTER TABLE public.email_templates ADD COLUMN IF NOT EXISTS angle TEXT
  CHECK (angle IN ('A', 'B', 'C'));

ALTER TABLE public.email_templates ADD COLUMN IF NOT EXISTS cadence_step INTEGER
  CHECK (cadence_step BETWEEN 1 AND 4);

ALTER TABLE public.email_templates ADD COLUMN IF NOT EXISTS cadence_day INTEGER
  CHECK (cadence_day IN (1, 3, 7, 14));

-- Expand category constraint
ALTER TABLE public.email_templates ADD CONSTRAINT email_templates_category_check
  CHECK (category IN ('intro', 'follow_up', 'partnership', 'custom', 'cadence'));

-- =============================================
-- STEP 4: CREATE CADENCES TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS public.cadences (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  angle TEXT NOT NULL CHECK (angle IN ('A', 'B', 'C')),
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'paused', 'completed', 'stopped')),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  stopped_at TIMESTAMP WITH TIME ZONE,
  stop_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Only one active cadence per lead
CREATE UNIQUE INDEX IF NOT EXISTS idx_cadences_active_lead
  ON public.cadences(lead_id) WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_cadences_user_id ON public.cadences(user_id);
CREATE INDEX IF NOT EXISTS idx_cadences_status ON public.cadences(status);

-- =============================================
-- STEP 5: CREATE CADENCE_STEPS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS public.cadence_steps (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  cadence_id UUID REFERENCES public.cadences(id) ON DELETE CASCADE NOT NULL,
  step_number INTEGER NOT NULL CHECK (step_number BETWEEN 1 AND 4),
  template_id UUID REFERENCES public.email_templates(id) ON DELETE SET NULL,
  scheduled_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'ready', 'sent', 'skipped', 'cancelled')),
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cadence_steps_cadence ON public.cadence_steps(cadence_id);
CREATE INDEX IF NOT EXISTS idx_cadence_steps_due
  ON public.cadence_steps(scheduled_date) WHERE status = 'pending';

-- =============================================
-- STEP 6: CREATE OUTREACH_LOG TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS public.outreach_log (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL
    CHECK (event_type IN ('email_sent', 'reply_received', 'call_booked', 'deal_activated')),
  cadence_step_id UUID REFERENCES public.cadence_steps(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_outreach_log_user ON public.outreach_log(user_id);
CREATE INDEX IF NOT EXISTS idx_outreach_log_created ON public.outreach_log(created_at DESC);

-- =============================================
-- STEP 7: SCOREBOARD TARGETS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS public.scoreboard_targets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  weekly_leads_found INTEGER DEFAULT 20,
  weekly_emails_sent INTEGER DEFAULT 30,
  weekly_replies INTEGER DEFAULT 5,
  weekly_calls_booked INTEGER DEFAULT 3,
  weekly_deals_activated INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- STEP 8: RLS POLICIES
-- =============================================

ALTER TABLE public.cadences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cadence_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outreach_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scoreboard_targets ENABLE ROW LEVEL SECURITY;

-- Cadences
CREATE POLICY "Users can view own cadences"
  ON public.cadences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own cadences"
  ON public.cadences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own cadences"
  ON public.cadences FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own cadences"
  ON public.cadences FOR DELETE USING (auth.uid() = user_id);

-- Cadence steps (access through cadence ownership)
CREATE POLICY "Users can view own cadence steps"
  ON public.cadence_steps FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.cadences
    WHERE cadences.id = cadence_steps.cadence_id AND cadences.user_id = auth.uid()
  ));
CREATE POLICY "Users can insert own cadence steps"
  ON public.cadence_steps FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.cadences
    WHERE cadences.id = cadence_steps.cadence_id AND cadences.user_id = auth.uid()
  ));
CREATE POLICY "Users can update own cadence steps"
  ON public.cadence_steps FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.cadences
    WHERE cadences.id = cadence_steps.cadence_id AND cadences.user_id = auth.uid()
  ));

-- Outreach log
CREATE POLICY "Users can view own outreach log"
  ON public.outreach_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own outreach log"
  ON public.outreach_log FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Scoreboard targets
CREATE POLICY "Users can view own targets"
  ON public.scoreboard_targets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can upsert own targets"
  ON public.scoreboard_targets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own targets"
  ON public.scoreboard_targets FOR UPDATE USING (auth.uid() = user_id);

-- =============================================
-- STEP 9: DB FUNCTIONS
-- =============================================

-- Updated lead stats with new pipeline stages + stale count
CREATE OR REPLACE FUNCTION public.get_lead_stats(p_user_id UUID)
RETURNS TABLE (
  total_leads BIGINT,
  new_leads BIGINT,
  contacted_leads BIGINT,
  replied_leads BIGINT,
  call_booked_leads BIGINT,
  activated_leads BIGINT,
  dead_leads BIGINT,
  stale_leads BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) as total_leads,
    COUNT(*) FILTER (WHERE status = 'new_lead') as new_leads,
    COUNT(*) FILTER (WHERE status = 'contacted') as contacted_leads,
    COUNT(*) FILTER (WHERE status = 'replied') as replied_leads,
    COUNT(*) FILTER (WHERE status = 'call_booked') as call_booked_leads,
    COUNT(*) FILTER (WHERE status = 'activated') as activated_leads,
    COUNT(*) FILTER (WHERE status = 'dead') as dead_leads,
    COUNT(*) FILTER (
      WHERE status = 'contacted'
      AND updated_at < NOW() - INTERVAL '14 days'
    ) as stale_leads
  FROM public.leads
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get cadence steps that are due today or overdue
CREATE OR REPLACE FUNCTION public.get_due_cadence_steps(p_user_id UUID)
RETURNS TABLE (
  step_id UUID,
  cadence_id UUID,
  lead_id UUID,
  step_number INTEGER,
  template_id UUID,
  scheduled_date DATE,
  company_name TEXT,
  contact_name TEXT,
  email TEXT,
  equipment_types TEXT[],
  angle TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    cs.id as step_id,
    cs.cadence_id,
    c.lead_id,
    cs.step_number,
    cs.template_id,
    cs.scheduled_date,
    l.company_name,
    l.contact_name,
    l.email,
    l.equipment_types,
    c.angle
  FROM public.cadence_steps cs
  JOIN public.cadences c ON c.id = cs.cadence_id
  JOIN public.leads l ON l.id = c.lead_id
  WHERE c.user_id = p_user_id
    AND c.status = 'active'
    AND cs.status = 'pending'
    AND cs.scheduled_date <= CURRENT_DATE
  ORDER BY cs.scheduled_date ASC, cs.step_number ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Weekly scoreboard stats
CREATE OR REPLACE FUNCTION public.get_weekly_scoreboard(p_user_id UUID)
RETURNS TABLE (
  leads_found BIGINT,
  emails_sent BIGINT,
  replies_received BIGINT,
  calls_booked BIGINT,
  deals_activated BIGINT
) AS $$
DECLARE
  week_start TIMESTAMP WITH TIME ZONE := date_trunc('week', CURRENT_DATE)::TIMESTAMP WITH TIME ZONE;
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM public.leads
     WHERE user_id = p_user_id AND created_at >= week_start) as leads_found,
    (SELECT COUNT(*) FROM public.outreach_log
     WHERE user_id = p_user_id AND event_type = 'email_sent' AND created_at >= week_start) as emails_sent,
    (SELECT COUNT(*) FROM public.outreach_log
     WHERE user_id = p_user_id AND event_type = 'reply_received' AND created_at >= week_start) as replies_received,
    (SELECT COUNT(*) FROM public.outreach_log
     WHERE user_id = p_user_id AND event_type = 'call_booked' AND created_at >= week_start) as calls_booked,
    (SELECT COUNT(*) FROM public.outreach_log
     WHERE user_id = p_user_id AND event_type = 'deal_activated' AND created_at >= week_start) as deals_activated;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- STEP 10: TRIGGERS FOR NEW TABLES
-- =============================================

CREATE TRIGGER update_cadences_updated_at
  BEFORE UPDATE ON public.cadences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_scoreboard_targets_updated_at
  BEFORE UPDATE ON public.scoreboard_targets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
