-- 1. Enable UUID extension
-- Enable the UUID extension for generating unique identifiers
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Define Enums (The "Types")
-- Define custom types for better data integrity
CREATE TYPE user_role AS ENUM ('admin', 'agent', 'customer');
CREATE TYPE request_status AS ENUM ('pending', 'processing', 'quoted', 'shipped', 'completed', 'cancelled');
CREATE TYPE shipment_status AS ENUM ('received_at_hub', 'in_transit_air', 'in_transit_sea', 'clearing_customs', 'ready_for_pickup', 'delivered');
CREATE TYPE freight_type AS ENUM ('air', 'sea');
CREATE TYPE currency_code AS ENUM ('USD', 'GHS');

-- 3. Profiles (Extends Auth)
-- Stores user profile data, separate from auth.users
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role user_role DEFAULT 'customer',
  full_name TEXT,
  phone_number TEXT,
  country TEXT DEFAULT 'Ghana',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- 4. Agents (Business Logic for Partners)
-- Stores agent-specific data like referral codes and commission rates
CREATE TABLE agents (
  id UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
  referral_code TEXT UNIQUE NOT NULL,
  commission_rate DECIMAL(5, 2) DEFAULT 0.05, -- 5% default
  momo_number TEXT,
  bank_details JSONB,
  total_earnings MONEY DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- 5. Sourcing Requests (The "Ask")
-- Initial request from a customer looking for a part
CREATE TABLE sourcing_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  vin TEXT,
  part_name TEXT NOT NULL,
  part_number TEXT,
  vehicle_info TEXT, -- "2019 Toyota Camry LE"
  budget_min MONEY,
  budget_max MONEY,
  status request_status DEFAULT 'pending',
  images TEXT[], -- Array of image URLs
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- 6. Quotes (The "Offer")
-- Admin's response to a sourcing request with pricing
CREATE TABLE quotes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  request_id UUID REFERENCES sourcing_requests(id) ON DELETE CASCADE NOT NULL,
  admin_id UUID REFERENCES profiles(id), -- Who created the quote
  item_price MONEY NOT NULL,
  shipping_cost MONEY NOT NULL,
  service_fee MONEY NOT NULL, -- Our markup
  total_amount MONEY NOT NULL,
  currency currency_code DEFAULT 'USD',
  valid_until TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- 7. Orders (The "Deal")
-- Created when a user accepts a quote
CREATE TABLE orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  quote_id UUID REFERENCES quotes(id) UNIQUE NOT NULL,
  agent_id UUID REFERENCES agents(id), -- Optional: if an agent referred this deal
  status TEXT DEFAULT 'pending_payment' CHECK (status IN ('pending_payment', 'paid', 'processing', 'completed', 'cancelled')),
  payment_method TEXT,
  transaction_ref TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- 8. Shipments (The "Journey")
-- Tracking information for a paid order
CREATE TABLE shipments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  tracking_number TEXT UNIQUE NOT NULL, -- "HB-1002"
  freight_type freight_type DEFAULT 'air',
  status shipment_status DEFAULT 'received_at_hub',
  origin_hub TEXT DEFAULT 'Atlanta Export Hub',
  destination_hub TEXT DEFAULT 'Tema Port',
  estimated_arrival TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- 9. Shipment Events (The "Timeline")
-- Granular updates for the tracking widget timeline
CREATE TABLE shipment_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  shipment_id UUID REFERENCES shipments(id) ON DELETE CASCADE NOT NULL,
  status shipment_status NOT NULL,
  location TEXT NOT NULL, -- "Customs Warehouse, Tema"
  description TEXT,
  occurred_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- 10. Commissions (The "Payout")
-- Log of earnings for agents
CREATE TABLE commissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  agent_id UUID REFERENCES agents(id) NOT NULL,
  order_id UUID REFERENCES orders(id) NOT NULL,
  amount_earned MONEY NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'void')),
  payout_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- 11. Row Level Security (RLS) Policies
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sourcing_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;

-- Profiles: Public read (for avatars), edit own
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = id);

-- Sourcing Requests: View own, Admin view all
CREATE POLICY "Users can view own requests." ON sourcing_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create requests." ON sourcing_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
-- (Admin policies would be added here, usually checking if auth.uid() is in a whitelist or has 'admin' role)

-- Automatic Profile Creation Trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', 'customer');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
