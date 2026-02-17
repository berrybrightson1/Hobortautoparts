-- Migration: Allow agents to create proxy orders
-- Description: Adds an RLS policy to the 'orders' table.

-- Currently, the 'orders' table likely only allows users to create orders for themselves (user_id = auth.uid()).
-- We need to allow agents to create orders for ANY user, as long as they are the assigned 'agent_id'.

DROP POLICY IF EXISTS "Agents can create proxy orders" ON public.orders;

CREATE POLICY "Agents can create proxy orders"
ON public.orders
FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() = agent_id
);

-- Also need to ensure they can view the orders they created
DROP POLICY IF EXISTS "Agents can view their assigned orders" ON public.orders;

CREATE POLICY "Agents can view their assigned orders"
ON public.orders
FOR SELECT
TO authenticated
USING (
    auth.uid() = agent_id OR auth.uid() = user_id
);
