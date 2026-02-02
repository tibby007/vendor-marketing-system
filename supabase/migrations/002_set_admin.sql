-- Set admin user
-- Run this after the user has signed up

UPDATE public.profiles
SET is_admin = TRUE
WHERE email = 'cheryl@commcapconnect.com';
