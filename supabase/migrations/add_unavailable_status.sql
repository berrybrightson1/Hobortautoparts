-- Add 'unavailable' to the existing request_status enum
-- This allows admins to mark sourcing requests that cannot be fulfilled.

ALTER TYPE request_status ADD VALUE IF NOT EXISTS 'unavailable';
