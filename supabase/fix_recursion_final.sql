-- FIX INFINITE RECURSION IN ORDERS RLS
-- The "infinite recursion" error happens because the 'orders' policy checks 'profiles' (for admin role),
-- and 'profiles' likely has a policy that checks 'orders' (e.g. for agents/customers to see relevant profiles), which creates a loop.
--
-- FIX: Use a SECURITY DEFINER function to check admin status. 
-- SECURITY DEFINER functions run with the privileges of the creator (postgres/admin), bypassing RLS on 'profiles'.

-- 1. Create the helper function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Fix Orders Policies
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Admins can manage all orders" ON orders;

CREATE POLICY "Admins can manage all orders" ON orders FOR ALL
USING (is_admin());

-- 3. Fix Sourcing Requests Policies (Prevent potential recursion here too)
ALTER TABLE sourcing_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can mange all sourcing requests" ON sourcing_requests;
DROP POLICY IF EXISTS "Admins can manage all sourcing requests" ON sourcing_requests;

CREATE POLICY "Admins can manage all sourcing requests" ON sourcing_requests FOR ALL
USING (is_admin());

-- 4. Fix Quotes Policies
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage all quotes" ON quotes;

CREATE POLICY "Admins can manage all quotes" ON quotes FOR ALL
USING (is_admin());

-- 5. Fix Profiles Policies (Ensure it's public readable to stop other recursions)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON profiles;
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);

-- 6. Fix Shipments Policies
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage all shipments" ON shipments;

CREATE POLICY "Admins can manage all shipments" ON shipments FOR ALL
USING (is_admin());

-- 7. Fix Agents Policies
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage all agents" ON agents;

CREATE POLICY "Admins can manage all agents" ON agents FOR ALL
USING (is_admin());

-- 8. Fix Commissions Policies
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage all commissions" ON commissions;

CREATE POLICY "Admins can manage all commissions" ON commissions FOR ALL
USING (is_admin());
