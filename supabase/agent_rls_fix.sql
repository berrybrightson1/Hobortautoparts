-- AGENT PORTAL SECURITY & SCHEMA REPAIR (v2)
-- Run this in the Supabase SQL Editor

-- 1. ADD MISSING COLUMNS
-- Add agent_id to sourcing_requests if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sourcing_requests' AND column_name='agent_id') THEN
        ALTER TABLE sourcing_requests ADD COLUMN agent_id UUID REFERENCES agents(id);
    END IF;
END $$;

-- Ensure agent_id exists on orders (usually there, but let's be safe)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='agent_id') THEN
        ALTER TABLE orders ADD COLUMN agent_id UUID REFERENCES agents(id);
    END IF;
END $$;

-- 2. ENABLE RLS
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- 3. APPLY POLICIES (Drop first to avoid "already exists" errors)
DROP POLICY IF EXISTS "Agents can view assigned requests" ON sourcing_requests;
DROP POLICY IF EXISTS "Agents can view assigned orders" ON orders;
DROP POLICY IF EXISTS "Agents can view assigned quotes" ON quotes;
DROP POLICY IF EXISTS "Users can view own orders" ON orders;

-- Grant agents access to view requests assigned to them
CREATE POLICY "Agents can view assigned requests" ON sourcing_requests 
FOR SELECT USING (agent_id = auth.uid());

-- Grant agents access to view orders assigned to them
CREATE POLICY "Agents can view assigned orders" ON orders 
FOR SELECT USING (agent_id = auth.uid());

-- Allow agents to view quotes linked to their assigned requests
CREATE POLICY "Agents can view assigned quotes" ON quotes 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM sourcing_requests 
    WHERE sourcing_requests.id = quotes.request_id 
    AND (sourcing_requests.agent_id = auth.uid() OR sourcing_requests.user_id = auth.uid())
  )
);

-- Ensure customers can view their own orders
CREATE POLICY "Users can view own orders" ON orders 
FOR SELECT USING (user_id = auth.uid());
