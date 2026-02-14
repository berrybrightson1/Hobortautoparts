-- FINAL ROBUST RLS SETUP
-- RUN THIS IN SUPABASE SQL EDITOR

-- 1. Profiles: Clear existing policies and set explicit recursive-safe ones
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can edit own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- 2. Sourcing Requests: Standard + Admin
DROP POLICY IF EXISTS "Users can view own requests." ON sourcing_requests;
DROP POLICY IF EXISTS "Users can create requests." ON sourcing_requests;
DROP POLICY IF EXISTS "Admins can manage all sourcing requests" ON sourcing_requests;
DROP POLICY IF EXISTS "Admins can mange all sourcing requests" ON sourcing_requests;

CREATE POLICY "Users can view own requests." ON sourcing_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create requests." ON sourcing_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can mange all sourcing requests" ON sourcing_requests FOR ALL 
USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- 3. Quotes: Enable RLS and add policies
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage all quotes" ON quotes;
DROP POLICY IF EXISTS "Users can view quotes for their requests" ON quotes;

CREATE POLICY "Admins can manage all quotes" ON quotes FOR ALL 
USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Users can view quotes for their requests" ON quotes FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM sourcing_requests 
    WHERE sourcing_requests.id = quotes.request_id 
    AND sourcing_requests.user_id = auth.uid()
  )
);

-- 4. Orders: Standard + Admin
DROP POLICY IF EXISTS "Admins can manage all orders" ON orders;
CREATE POLICY "Admins can manage all orders" ON orders FOR ALL 
USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- 5. Shipments: Standard + Admin
DROP POLICY IF EXISTS "Admins can manage all shipments" ON shipments;
CREATE POLICY "Admins can manage all shipments" ON shipments FOR ALL 
USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- 6. Commissions: Enable RLS and add policies
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage all commissions" ON commissions;
CREATE POLICY "Admins can manage all commissions" ON commissions FOR ALL 
USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Agents can view own commissions" ON commissions FOR SELECT 
USING (agent_id = auth.uid());

-- 7. Agents: Enable RLS and add policies
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage all agents" ON agents;
CREATE POLICY "Admins can manage all agents" ON agents FOR ALL 
USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Agents can manage own profile" ON agents FOR ALL 
USING (id = auth.uid());
