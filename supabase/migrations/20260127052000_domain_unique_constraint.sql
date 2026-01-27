-- Add unique constraint to domains name column
ALTER TABLE public.domains ADD CONSTRAINT domains_name_key UNIQUE (name);
