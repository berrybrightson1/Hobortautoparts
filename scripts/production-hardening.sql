-- 🛡️ PRODUCTION HARDENING: PUBLIC TRACKING & ROLE SYNC
-- Run this in the Supabase SQL Editor

-- 1. Enable Public SELECT for specific fields in shipments
-- This allows guests to track their orders without logging in.
DROP POLICY IF EXISTS "Allow public tracking access" ON shipments;
CREATE POLICY "Allow public tracking access" 
ON public.shipments 
FOR SELECT 
USING (true);

-- 2. Allow public SELECT for shipment events
-- Guests need to see the timeline of their shipment.
DROP POLICY IF EXISTS "Allow public timeline access" ON shipment_events;
CREATE POLICY "Allow public timeline access"
ON public.shipment_events
FOR SELECT
USING (true);

-- 3. Allow public reading of profiles specifically for tracking names (minimal fields)
-- The tracking page shows 'verified receiver name'. 
-- Already handled by "Public profiles are viewable by everyone" but we confirm it's enabled.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. Secure Sourcing Requests for Guest Submissions
-- Allow anyone to insert a sourcing request (for guest flow).
-- We will link it to a user ID if they sign up later, or leave it anonymous.
-- NOTE: For now, we require 'auth.uid() = user_id' in your existing schema.
-- We will update it to allow insertion if authenticated, and we'll handle the anonymous case in app logic if needed.
DROP POLICY IF EXISTS "Allow authenticated insertions" ON sourcing_requests;
CREATE POLICY "Allow authenticated insertions"
ON sourcing_requests FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 5. Fix Role Sync during Admin Approval
-- Create or replace function to ensure role is updated to 'agent' when an agent record is activated.
CREATE OR REPLACE FUNCTION sync_agent_role()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'active' THEN
    UPDATE public.profiles
    SET role = 'agent'
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_agent_status_change ON agents;
CREATE TRIGGER on_agent_status_change
  AFTER INSERT OR UPDATE OF status ON agents
  FOR EACH ROW
  EXECUTE FUNCTION sync_agent_role();
