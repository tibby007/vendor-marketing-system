-- Ultimate Vendor Marketing System - Initial Database Schema
-- Run this in the Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- PROFILES TABLE (extends auth.users)
-- =============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  company_name TEXT,
  phone TEXT,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'starter', 'pro', 'enterprise')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  searches_this_month INTEGER DEFAULT 0,
  searches_reset_date TIMESTAMP WITH TIME ZONE,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for email lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer ON public.profiles(stripe_customer_id);

-- =============================================
-- LEADS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  company_name TEXT NOT NULL,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  website TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  equipment_types TEXT[],
  source TEXT DEFAULT 'manual' CHECK (source IN ('ai_finder', 'smart_search', 'manual', 'csv_import')),
  source_url TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'follow_up', 'converted', 'not_interested')),
  follow_up_date DATE,
  notes TEXT,
  last_contacted TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for leads queries
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON public.leads(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);

-- =============================================
-- SEARCH HISTORY TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.search_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  search_type TEXT NOT NULL CHECK (search_type IN ('ai_finder', 'smart_search')),
  criteria JSONB NOT NULL,
  results_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_search_history_user_id ON public.search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_search_history_created_at ON public.search_history(created_at DESC);

-- =============================================
-- EMAIL TEMPLATES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.email_templates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  category TEXT CHECK (category IN ('intro', 'follow_up', 'partnership', 'custom')),
  is_default BOOLEAN DEFAULT FALSE,
  tier_required TEXT DEFAULT 'starter' CHECK (tier_required IN ('free', 'starter', 'pro', 'enterprise')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- PLATFORM STATS TABLE (for admin analytics)
-- =============================================
CREATE TABLE IF NOT EXISTS public.platform_stats (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  total_users INTEGER DEFAULT 0,
  active_users INTEGER DEFAULT 0,
  total_searches INTEGER DEFAULT 0,
  total_leads_added INTEGER DEFAULT 0,
  starter_subscribers INTEGER DEFAULT 0,
  pro_subscribers INTEGER DEFAULT 0,
  enterprise_subscribers INTEGER DEFAULT 0,
  mrr DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_platform_stats_date ON public.platform_stats(date DESC);

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_stats ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admin can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- LEADS POLICIES
CREATE POLICY "Users can view own leads"
  ON public.leads FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own leads"
  ON public.leads FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own leads"
  ON public.leads FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own leads"
  ON public.leads FOR DELETE
  USING (auth.uid() = user_id);

-- SEARCH HISTORY POLICIES
CREATE POLICY "Users can view own search history"
  ON public.search_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own search history"
  ON public.search_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- EMAIL TEMPLATES POLICIES (read for all authenticated)
CREATE POLICY "Authenticated users can read templates"
  ON public.email_templates FOR SELECT
  TO authenticated
  USING (true);

-- PLATFORM STATS POLICIES (admin only)
CREATE POLICY "Admin can view platform stats"
  ON public.platform_stats FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

CREATE POLICY "Admin can insert platform stats"
  ON public.platform_stats FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- =============================================
-- TRIGGERS & FUNCTIONS
-- =============================================

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- SEED DEFAULT EMAIL TEMPLATES
-- =============================================
INSERT INTO public.email_templates (name, subject, body, category, is_default, tier_required) VALUES
(
  'Introduction',
  'Partnership Opportunity - Equipment Financing for {{company_name}}',
  E'Hi {{contact_name}},\n\nI came across {{company_name}} and noticed you sell quality {{equipment_type}} in the area. I work with equipment dealers to help their customers secure competitive financing options.\n\nWould you be open to a quick call to discuss how a financing partnership could help you close more sales?\n\nBest regards,\n[Your Name]\n[Your Company]\n[Phone]',
  'intro',
  TRUE,
  'starter'
),
(
  'Follow Up',
  'Following Up - Financing Partnership',
  E'Hi {{contact_name}},\n\nI wanted to follow up on my previous message about a potential financing partnership with {{company_name}}.\n\nMany dealers find that offering financing options helps close deals faster and increases average transaction sizes. I''d love to show you how we can help.\n\nDo you have 10 minutes this week for a quick call?\n\nBest,\n[Your Name]',
  'follow_up',
  TRUE,
  'starter'
),
(
  'Partnership Proposal',
  'Let''s Help Your Customers Get Financing',
  E'Hi {{contact_name}},\n\nI specialize in equipment financing and work with dealers like {{company_name}} to provide their customers with flexible payment options.\n\nHere''s what I can offer your customers:\n- Competitive rates\n- Fast approvals (often same day)\n- Terms from 12-72 months\n- No prepayment penalties\n\nCan we schedule a brief call to discuss how this could benefit your business?\n\nThanks,\n[Your Name]',
  'partnership',
  TRUE,
  'starter'
)
ON CONFLICT DO NOTHING;

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's lead stats
CREATE OR REPLACE FUNCTION public.get_lead_stats(p_user_id UUID)
RETURNS TABLE (
  total_leads BIGINT,
  new_leads BIGINT,
  contacted_leads BIGINT,
  follow_up_leads BIGINT,
  converted_leads BIGINT,
  not_interested_leads BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) as total_leads,
    COUNT(*) FILTER (WHERE status = 'new') as new_leads,
    COUNT(*) FILTER (WHERE status = 'contacted') as contacted_leads,
    COUNT(*) FILTER (WHERE status = 'follow_up') as follow_up_leads,
    COUNT(*) FILTER (WHERE status = 'converted') as converted_leads,
    COUNT(*) FILTER (WHERE status = 'not_interested') as not_interested_leads
  FROM public.leads
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment search count
CREATE OR REPLACE FUNCTION public.increment_search_count(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  current_count INTEGER;
  reset_date TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get current values
  SELECT searches_this_month, searches_reset_date
  INTO current_count, reset_date
  FROM public.profiles
  WHERE id = p_user_id;

  -- Reset if it's a new month
  IF reset_date IS NULL OR reset_date < date_trunc('month', NOW()) THEN
    UPDATE public.profiles
    SET searches_this_month = 1,
        searches_reset_date = date_trunc('month', NOW())
    WHERE id = p_user_id;
    RETURN 1;
  ELSE
    -- Increment count
    UPDATE public.profiles
    SET searches_this_month = searches_this_month + 1
    WHERE id = p_user_id
    RETURNING searches_this_month INTO current_count;
    RETURN current_count;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
