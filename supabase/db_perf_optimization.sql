-- DATABASE PERFORMANCE & RELIABILITY OPTIMIZATION
-- Run this in the Supabase SQL Editor to resolve RLS bottlenecks and data type issues.

-- 1. Create a security definer function for role checks
-- This is MUCH faster than subqueries in RLS policies and prevents recursion.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role = 'admin'
    FROM public.profiles
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Convert MONEY types to NUMERIC
-- The MONEY type is problematic for many drivers and PostgREST. NUMERIC is the standard.
ALTER TABLE sourcing_requests ALTER COLUMN budget_min TYPE NUMERIC(12,2) USING budget_min::numeric;
ALTER TABLE sourcing_requests ALTER COLUMN budget_max TYPE NUMERIC(12,2) USING budget_max::numeric;

ALTER TABLE quotes ALTER COLUMN item_price TYPE NUMERIC(12,2) USING item_price::numeric;
ALTER TABLE quotes ALTER COLUMN shipping_cost TYPE NUMERIC(12,2) USING shipping_cost::numeric;
ALTER TABLE quotes ALTER COLUMN service_fee TYPE NUMERIC(12,2) USING service_fee::numeric;
ALTER TABLE quotes ALTER COLUMN total_amount TYPE NUMERIC(12,2) USING total_amount::numeric;

ALTER TABLE commissions ALTER COLUMN amount_earned TYPE NUMERIC(12,2) USING amount_earned::numeric;

-- 3. Refactor RLS Policies for Performance
-- Sourcing Requests
DROP POLICY IF EXISTS "Admins can mange all sourcing requests" ON sourcing_requests;
CREATE POLICY "Admins can manage all sourcing requests" ON sourcing_requests FOR ALL 
USING (public.is_admin());

-- Quotes
DROP POLICY IF EXISTS "Admins can manage all quotes" ON quotes;
CREATE POLICY "Admins can manage all quotes" ON quotes FOR ALL 
USING (public.is_admin());

-- Orders
DROP POLICY IF EXISTS "Admins can manage all orders" ON orders;
CREATE POLICY "Admins can manage all orders" ON orders FOR ALL 
USING (public.is_admin());

-- Shipments
DROP POLICY IF EXISTS "Admins can manage all shipments" ON shipments;
CREATE POLICY "Admins can manage all shipments" ON shipments FOR ALL 
USING (public.is_admin());

-- Commissions
DROP POLICY IF EXISTS "Admins can manage all commissions" ON commissions;
CREATE POLICY "Admins can manage all commissions" ON commissions FOR ALL 
USING (public.is_admin());

-- Agents
DROP POLICY IF EXISTS "Admins can manage all agents" ON agents;
CREATE POLICY "Admins can manage all agents" ON agents FOR ALL 
USING (public.is_admin());
