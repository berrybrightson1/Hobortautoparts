-- Add structured vehicle columns to sourcing_requests
ALTER TABLE sourcing_requests 
ADD COLUMN IF NOT EXISTS year TEXT,
ADD COLUMN IF NOT EXISTS make TEXT,
ADD COLUMN IF NOT EXISTS model TEXT,
ADD COLUMN IF NOT EXISTS submodel TEXT,
ADD COLUMN IF NOT EXISTS engine TEXT;

-- Add agent and proxy related columns if missing (defensive)
ALTER TABLE sourcing_requests 
ADD COLUMN IF NOT EXISTS agent_id UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS is_proxy_request BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS customer_name TEXT,
ADD COLUMN IF NOT EXISTS customer_phone TEXT;

-- Add comments for documentation
COMMENT ON COLUMN sourcing_requests.year IS 'Production year of the vehicle';
COMMENT ON COLUMN sourcing_requests.make IS 'Vehicle manufacturer';
COMMENT ON COLUMN sourcing_requests.model IS 'Vehicle series/model';
COMMENT ON COLUMN sourcing_requests.submodel IS 'Vehicle trim/sub-model';
COMMENT ON COLUMN sourcing_requests.engine IS 'Vehicle engine configuration';
