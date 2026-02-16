
-- ORDERS RLS FIX
-- The missing link! The tracking query uses "orders!inner", so users MUST have select access to orders.

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
DROP POLICY IF EXISTS "Agents can view assigned orders" ON orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;

-- 1. Customers: View own orders
CREATE POLICY "Users can view their own orders" ON orders FOR SELECT
USING (auth.uid() = user_id);

-- 2. Agents: View assigned orders
CREATE POLICY "Agents can view assigned orders" ON orders FOR SELECT
USING (auth.uid() = agent_id);

-- 3. Admins: View all
CREATE POLICY "Admins can view all orders" ON orders FOR SELECT
USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
