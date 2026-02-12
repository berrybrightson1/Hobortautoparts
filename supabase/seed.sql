-- SEED DATA for Hobort Auto Express

-- 1. Create a Test User (Profile)
-- Note: In real Supabase, users are in auth.users. This mimics a profile that would be created by the trigger.
INSERT INTO public.profiles (id, role, full_name, phone_number, country)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'customer', 'Kwame Mensah', '+233541234567', 'Ghana'),
  ('00000000-0000-0000-0000-000000000002', 'agent', 'Yaa Asantewaa', '+233249876543', 'Ghana'),
  ('00000000-0000-0000-0000-000000000003', 'admin', 'Hobort Admin', '+14045550199', 'USA');

-- 2. Create Agent Record
INSERT INTO public.agents (id, referral_code, commission_rate, momo_number, status)
VALUES
  ('00000000-0000-0000-0000-000000000002', 'YAA2024', 0.05, '0249876543', 'active');

-- 3. Create a Sourcing Request (Customer asking for a part)
INSERT INTO public.sourcing_requests (id, user_id, part_name, vehicle_info, status, vin)
VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '00000000-0000-0000-0000-000000000001', 'Headlight Assembly (Right)', '2018 Toyota Highlander', 'quoted', '5TDKZRFH9JS123456');

-- 4. Create a Quote (Admin responding)
INSERT INTO public.quotes (id, request_id, admin_id, item_price, shipping_cost, service_fee, total_amount, currency)
VALUES
  ('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '00000000-0000-0000-0000-000000000003', 450.00, 120.00, 50.00, 620.00, 'USD');

-- 5. Create an Order (Customer accepted quote)
INSERT INTO public.orders (id, user_id, quote_id, agent_id, status, payment_method)
VALUES
  ('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', '00000000-0000-0000-0000-000000000001', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', '00000000-0000-0000-0000-000000000002', 'paid', 'Credit Card');

-- 6. Create Shipment (Logistics team processing)
INSERT INTO public.shipments (id, order_id, tracking_number, freight_type, status, estimated_arrival)
VALUES
  ('d3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'HB-1002', 'air', 'in_transit_air', NOW() + INTERVAL '5 days');

-- 7. Create Shipment Events (Tracking history)
INSERT INTO public.shipment_events (shipment_id, status, location, description, occurred_at)
VALUES
  ('d3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'received_at_hub', 'Atlanta Export Hub', 'Package received and inspected.', NOW() - INTERVAL '2 days'),
  ('d3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'in_transit_air', 'Hartsfield-Jackson Airport', 'Departed for Accra.', NOW() - INTERVAL '1 day');
