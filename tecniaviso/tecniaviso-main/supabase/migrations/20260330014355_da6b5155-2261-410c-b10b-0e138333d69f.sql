
CREATE TABLE public.repairs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  client_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  device_model TEXT NOT NULL DEFAULT '',
  problem TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'in-progress' CHECK (status IN ('in-progress', 'done')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.repairs ENABLE ROW LEVEL SECURITY;

-- Active users can read their own repairs
CREATE POLICY "Users can read own repairs"
ON public.repairs FOR SELECT
TO authenticated
USING (user_id = auth.uid() AND is_active_user(auth.uid()));

-- Active users can insert their own repairs
CREATE POLICY "Users can insert own repairs"
ON public.repairs FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid() AND is_active_user(auth.uid()));

-- Active users can update their own repairs
CREATE POLICY "Users can update own repairs"
ON public.repairs FOR UPDATE
TO authenticated
USING (user_id = auth.uid() AND is_active_user(auth.uid()))
WITH CHECK (user_id = auth.uid() AND is_active_user(auth.uid()));

-- Active users can delete their own repairs
CREATE POLICY "Users can delete own repairs"
ON public.repairs FOR DELETE
TO authenticated
USING (user_id = auth.uid() AND is_active_user(auth.uid()));
