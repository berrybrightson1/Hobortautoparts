-- Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- references public profile for easy joins
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Enable RLS for Audit Logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Admins can view all logs
CREATE POLICY "Admins can view all audit logs" ON audit_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Server/Backend can insert logs (or authenticated users via server actions if using service role, 
-- but detailed logging often happens via postgres triggers or server-side calls). 
-- For now, allow authenticated users to insert their *own* actions if we do client-side logging, 
-- but ideally this is done via a secure server action. 
-- Let's allow insert for authenticated users for now to simplify `logAction` from client/server actions.
CREATE POLICY "Authenticated users can insert audit logs" ON audit_logs
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');


-- Messages Table for Real-time Chat
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- Nullable for public/group/support channels
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Enable RLS for Messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Users can view messages they sent or received
CREATE POLICY "Users can view their own messages" ON messages
  FOR SELECT
  USING (
    auth.uid() = sender_id OR auth.uid() = recipient_id
    OR 
    -- Admins can view all support messages (optional, or if recipient_id is NULL/special support ID)
    (
       EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
      )
    )
  );

-- Users can insert messages where they are the sender
CREATE POLICY "Users can insert messages" ON messages
  FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- Enable Realtime for messages table
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
