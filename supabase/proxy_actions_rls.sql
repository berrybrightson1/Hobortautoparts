-- PROXY ACTIONS RLS ENHANCEMENTS
-- Allow Agents to act on behalf of customers for their assigned requests.

-- 1. Allow Agents to insert orders for their assigned requests
DROP POLICY IF EXISTS "Agents can insert orders for their requests" ON orders;
CREATE POLICY "Agents can insert orders for their requests" ON orders 
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM sourcing_requests 
    WHERE sourcing_requests.id = (SELECT request_id FROM quotes WHERE quotes.id = quote_id)
    AND sourcing_requests.agent_id = auth.uid()
  )
);

-- 2. Allow Agents to update status of their requests (to mark as processing/completed)
DROP POLICY IF EXISTS "Agents can update status of their requests" ON sourcing_requests;
CREATE POLICY "Agents can update status of their requests" ON sourcing_requests 
FOR UPDATE USING (agent_id = auth.uid()) 
WITH CHECK (agent_id = auth.uid());

-- 3. Ensure Agents can view all profiles (needed for name display in proxy flow)
-- Profiles already have public read policy, but let's be explicit if needed.
-- (Existing policy "Public profiles are viewable by everyone" is sufficient).
