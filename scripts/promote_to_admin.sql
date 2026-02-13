-- Script to promote the user back to Admin
-- Run this in the Supabase SQL Editor

UPDATE public.profiles
SET role = 'admin'
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'berrybrightson@gmail.com'
);

-- Verify the change (optional)
SELECT * FROM public.profiles 
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'berrybrightson@gmail.com'
);
