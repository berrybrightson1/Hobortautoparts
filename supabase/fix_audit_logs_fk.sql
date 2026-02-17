-- Fix for Audit Logs "Error fetching logs"
-- The previous definition referenced auth.users which prevents joining with public.profiles in the API.
-- This script changes the reference to public.profiles.

ALTER TABLE audit_logs
DROP CONSTRAINT IF EXISTS audit_logs_user_id_fkey;

ALTER TABLE audit_logs
ADD CONSTRAINT audit_logs_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(id)
ON DELETE SET NULL;
