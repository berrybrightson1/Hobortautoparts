-- ADMIN RLS SETUP
-- RUN THIS IN SUPABASE SQL EDITOR

-- 1. Profiles: Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles" 
ON profiles FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- 2. Sourcing Requests: Allow admins full access
CREATE POLICY "Admins can manage all sourcing requests" 
ON sourcing_requests FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- 3. Quotes: Allow admins full access (needed for Quote Builder)
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage all quotes" 
ON quotes FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- 4. Orders: Allow admins full access (needed for Reconciliation)
CREATE POLICY "Admins can manage all orders" 
ON orders FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- 5. Shipments: Allow admins full access (needed for Logistics)
CREATE POLICY "Admins can manage all shipments" 
ON shipments FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- 6. Commissions: Allow admins full access
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage all commissions" 
ON commissions FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- 7. Agents: Allow admins full access
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage all agents" 
ON agents FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);
