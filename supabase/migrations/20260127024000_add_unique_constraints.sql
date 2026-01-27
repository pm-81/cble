-- Add unique constraint to domains name for idempotency
ALTER TABLE public.domains ADD CONSTRAINT domains_name_key UNIQUE (name);

-- Add unique constraint to topics name for idempotency (within a domain)
ALTER TABLE public.topics ADD CONSTRAINT topics_domain_id_name_key UNIQUE (domain_id, name);
