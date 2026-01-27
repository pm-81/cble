-- Add subscription tracking to profiles
CREATE TYPE public.subscription_tier AS ENUM ('free', 'pro', 'elite');

ALTER TABLE public.profiles 
ADD COLUMN subscription_tier public.subscription_tier DEFAULT 'free',
ADD COLUMN stripe_customer_id TEXT,
ADD COLUMN subscription_id TEXT;

-- Create an index for faster lookups by stripe_customer_id
CREATE INDEX idx_profiles_stripe_customer_id ON public.profiles(stripe_customer_id);
