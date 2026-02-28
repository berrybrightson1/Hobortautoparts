-- Enable Supabase Realtime for the audit_logs table
-- This allows clients to subscribe to INSERT events on this table for instant notifications

-- 1. Ensure the publication exists (Supabase creates 'supabase_realtime' by default)
-- If it doesn't exist, this will safely fail or do nothing if already created.

-- 2. Add the table to the publication
ALTER PUBLICATION supabase_realtime ADD TABLE audit_logs;

-- Verification: You can check the active realtime tables using:
-- SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
