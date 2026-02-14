-- Add agent_id to sourcing_requests
ALTER TABLE public.sourcing_requests 
ADD COLUMN IF NOT EXISTS agent_id UUID REFERENCES public.agents(id);

-- Update RLS for sourcing_requests
-- Allow agents to view requests assigned to them
DROP POLICY IF EXISTS "Agents can view assigned requests" ON public.sourcing_requests;
CREATE POLICY "Agents can view assigned requests" 
ON public.sourcing_requests 
FOR SELECT 
USING (
  auth.uid() = agent_id OR 
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Allow admins to update agent_id
DROP POLICY IF EXISTS "Admins can update requests" ON public.sourcing_requests;
CREATE POLICY "Admins can update requests" 
ON public.sourcing_requests 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);
