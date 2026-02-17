-- Enable RLS on profiles if not already (safeguard)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users (including admins) to VIEW basic profile info (needed for chat)
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
    where id = auth.uid() and role = 'admin'
  )
);

-- Ensure the admin user has the 'admin' role if not already
-- We cannot use email here as the column does not exist!
-- We must rely on the ID matching the auth.users ID
-- But since we cannot join auth.users in a simple update here easily without permissions,
-- we will just manually set the role for the KNOWN admin ID if possible.
-- ALTERNATIVELY: The user must set this via the dashboard on the row that matches their ID.

-- Trying a logical update based on ID if known, otherwise skipping the specific update line that failed.
-- The policy change above is the most critical part for VIEWING.
