-- Add persona_verified boolean to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS persona_verified BOOLEAN DEFAULT false;
