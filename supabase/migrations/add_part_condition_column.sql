-- Add 'part_condition' column to sourcing_requests table
ALTER TABLE sourcing_requests 
ADD COLUMN IF NOT EXISTS part_condition text DEFAULT 'New (OEM)';

-- Add comment for documentation
COMMENT ON COLUMN sourcing_requests.part_condition IS 'The preferred condition of the part: New (OEM), Aftermarket, or Used';
