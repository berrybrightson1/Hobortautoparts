-- Migration: Add proxy ordering fields to sourcing_requests
-- Description: Enables agents to create requests on behalf of external customers.

ALTER TABLE public.sourcing_requests 
ADD COLUMN IF NOT EXISTS is_proxy_request BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS customer_name TEXT,
ADD COLUMN IF NOT EXISTS customer_phone TEXT;

-- Add comments for documentation
COMMENT ON COLUMN public.sourcing_requests.is_proxy_request IS 'True if an agent is creating this request for an external customer';
COMMENT ON COLUMN public.sourcing_requests.customer_name IS 'Name of the external customer (only for proxy requests)';
COMMENT ON COLUMN public.sourcing_requests.customer_phone IS 'Phone number of the external customer (only for proxy requests)';
