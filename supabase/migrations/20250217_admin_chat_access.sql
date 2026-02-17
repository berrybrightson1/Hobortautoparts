-- Allow admins to view ALL messages
-- This is necessary for the "Inbox" view where they see messages from everyone

-- 1. Drop existing policy if it conflicts (unlikely but safe)
DROP POLICY IF EXISTS "Admins can view all messages" ON public.messages;

-- 2. Create the policy
CREATE POLICY "Admins can view all messages"
ON public.messages
FOR SELECT
TO authenticated
USING (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
    and profiles.role = 'admin'
  )
);

-- 3. Ensure admins can INSERT messages to anyone (already covered by standard insert usually, but let's be safe)
-- If we have a policy "Users can insert own messages", that covers admins sending AS themselves.
-- But if we restrict recipient_id, we might need a policy. 
-- Standard policy usually: "Users can insert rows where sender_id = auth.uid()" -> This is enough for admins.

-- 4. Verify/Ensure public profiles are readable (Redundant but harmless if already done)
-- Done in previous migration: "Public profiles are viewable by everyone"
