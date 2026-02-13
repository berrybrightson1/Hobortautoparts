-- Update agents table to support pending approval status
ALTER TABLE agents DROP CONSTRAINT IF EXISTS agents_status_check;
ALTER TABLE agents ADD CONSTRAINT agents_status_check CHECK (status IN ('pending', 'active', 'suspended'));

-- Update default status to 'pending' for new agents
ALTER TABLE agents ALTER COLUMN status SET DEFAULT 'pending';
