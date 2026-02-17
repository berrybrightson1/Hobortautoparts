-- Enable RLS on profiles if not already (safeguard)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users (including admins) to VIEW basic profile info (needed for chat)
-- Check if policy exists first to avoid error, or just recreate. Supabase policies replace if exist usually depends.
-- Safest is DROP IF EXISTS then CREATE.

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT 
TO authenticated 
USING (true);

-- Allow admins to UPDATE any profile (optional managed access)
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
CREATE POLICY "Admins can update any profile" 
ON public.profiles FOR UPDATE 
TO authenticated 
USING (
  exists (
    select 1 from public.profiles
    where id = auth.uid() and (role = 'admin' OR email IN ('berrybrightson@gmail.com', 'berry@hobort.com'))
  )
);

-- Ensure the admin user has the 'admin' role if not already
UPDATE public.profiles 
SET role = 'admin' 
WHERE email IN ('berrybrightson@gmail.com', 'berry@hobort.com');
