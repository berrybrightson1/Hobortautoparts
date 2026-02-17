-- Add link column to notifications
ALTER TABLE public.notifications 
ADD COLUMN IF NOT EXISTS link TEXT;

-- Enable real-time for notifications table if not already enabled
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'request_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.request_messages;
  END IF;
END $$;

-- Ensure RLS is enabled and policies are correct
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to see their own notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications" 
ON public.notifications FOR SELECT 
USING (auth.uid() = user_id);

-- Policy to allow users to update their own notifications (mark as read)
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications" 
ON public.notifications FOR UPDATE 
USING (auth.uid() = user_id);
