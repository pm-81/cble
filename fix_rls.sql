-- Enable public access for seeding (RUN THIS IN SUPABASE SQL EDITOR)
-- This allows anyone to insert questions and flashcards temporarily.
-- For production, you should restrict this to admin users.

ALTER POLICY "Enable read access for all users" ON public.questions USING (true);
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.questions;
CREATE POLICY "Enable insert for all" ON public.questions FOR INSERT WITH CHECK (true);

ALTER POLICY "Enable read access for all users" ON public.flashcards USING (true);
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.flashcards;
CREATE POLICY "Enable insert for all" ON public.flashcards FOR INSERT WITH CHECK (true);

ALTER POLICY "Enable read access for all users" ON public.domains USING (true);
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.domains;
CREATE POLICY "Enable insert for all" ON public.domains FOR INSERT WITH CHECK (true);
