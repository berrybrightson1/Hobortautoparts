-- SHIPMENT RLS FIXES
-- This script allows Customers and Agents to view shipments and events linked to their orders.

-- 1. Enable RLS on shipment_events (if not already)
ALTER TABLE shipment_events ENABLE ROW LEVEL SECURITY;

-- 2. Shipments Policies
DROP POLICY IF EXISTS "Admins can manage all shipments" ON shipments;
DROP POLICY IF EXISTS "Customers can view their own shipments" ON shipments;
DROP POLICY IF EXISTS "Agents can view assigned shipments" ON shipments;

-- Admin: Full Access (based on profile role)
CREATE POLICY "Admins can manage all shipments" ON shipments FOR ALL 
USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Customer: View if linked to their order
CREATE POLICY "Customers can view their own shipments" ON shipments FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = shipments.order_id 
    AND orders.user_id = auth.uid()
  )
);

-- Agent: View if assigned to the order
CREATE POLICY "Agents can view assigned shipments" ON shipments FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = shipments.order_id 
    AND orders.agent_id = auth.uid()
  )
);

-- 3. Shipment Events Policies (Tracking Timeline)
DROP POLICY IF EXISTS "Admins can manage all shipment events" ON shipment_events;
DROP POLICY IF EXISTS "Users can view events for their shipments" ON shipment_events;

CREATE POLICY "Admins can manage all shipment events" ON shipment_events FOR ALL 
USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Users can view events for their shipments" ON shipment_events FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM shipments 
    JOIN orders ON orders.id = shipments.order_id
    WHERE shipments.id = shipment_events.shipment_id 
    AND (orders.user_id = auth.uid() OR orders.agent_id = auth.uid() OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin')
  )
);

-- 4. Quotes Policies (Needed for Shipment Details)
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Customers can view quotes for their orders" ON quotes;

CREATE POLICY "Customers can view quotes for their orders" ON quotes FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.quote_id = quotes.id
    AND orders.user_id = auth.uid()
  )
);

-- 5. Sourcing Requests Policies (Needed for Part Name)
ALTER TABLE sourcing_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Customers can view their own requests" ON sourcing_requests;

CREATE POLICY "Customers can view their own requests" ON sourcing_requests FOR SELECT
USING (auth.uid() = user_id);
