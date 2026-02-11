-- Add promo expiry tracking to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS promo_expires_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS promo_code TEXT;
