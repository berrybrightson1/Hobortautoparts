-- Enable Realtime for request_messages table
-- This is required for the FeedbackPanel to receive live updates.

ALTER PUBLICATION supabase_realtime ADD TABLE request_messages;
