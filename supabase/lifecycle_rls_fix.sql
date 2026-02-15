-- ORDER LIFECYCLE RLS POLICIES
-- Run this in the Supabase SQL Editor to enable customers to accept quotes and create orders.

-- 1. Orders table: Allow customers to create orders for themselves
CREATE POLICY "Users can create own orders" ON orders 
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 2. Orders table: Allow customers to view their own orders
-- (Already exists in agent_rls_fix.sql but repeating for completeness)
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
CREATE POLICY "Users can view own orders" ON orders 
FOR SELECT USING (user_id = auth.uid());

-- 3. Sourcing Requests: Allow users to update the status of their own requests
-- This is needed so customers can mark their status as 'processing' after accepting a quote.
CREATE POLICY "Users can update own requests" ON sourcing_requests 
FOR UPDATE USING (auth.uid() = user_id);

-- 4. Quotes: Allow customers to view quotes for their own requests
-- (Already exists in agent_rls_fix.sql but repeating for completeness)
DROP POLICY IF EXISTS "Agents can view assigned quotes" ON quotes;
CREATE POLICY "Users and Agents can view relevant quotes" ON quotes 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM sourcing_requests 
    WHERE sourcing_requests.id = quotes.request_id 
    AND (sourcing_requests.user_id = auth.uid() OR sourcing_requests.agent_id = auth.uid())
  )
);
