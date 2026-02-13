-- 1. Fix user_role enum if it doesn't have 'agent' (which it should, but let's be sure)
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'agent';

-- 2. Drop the existing trigger and function to recreate them cleanly
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 3. Recreate the function with better error handling (or just cleaner logic)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_role public.user_role;
BEGIN
  -- Safe casting with default fallback
  BEGIN
    new_role := (new.raw_user_meta_data->>'role')::public.user_role;
  EXCEPTION WHEN OTHERS THEN
    new_role := 'customer'; -- Fallback if cast fails
  END;
  
  -- Use COALESCE to ensure we don't insert NULL
  new_role := COALESCE(new_role, 'customer');

  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new_role
  );
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Re-enable the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 5. Grant permissions (just in case)
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
