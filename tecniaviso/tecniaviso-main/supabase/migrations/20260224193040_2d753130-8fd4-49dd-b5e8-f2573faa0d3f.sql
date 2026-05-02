
-- Table for technician's custom knowledge/instructions
CREATE TABLE public.technician_knowledge (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Seed default knowledge entry
INSERT INTO public.technician_knowledge (key, content) VALUES 
  ('system_prompt', ''),
  ('pricing', ''),
  ('procedures', '');

-- No RLS needed for now (MVP single-user, no auth yet)
ALTER TABLE public.technician_knowledge ENABLE ROW LEVEL SECURITY;

-- Allow public read/write for MVP (single technician use)
CREATE POLICY "Allow all access to technician_knowledge" 
ON public.technician_knowledge FOR ALL USING (true) WITH CHECK (true);
