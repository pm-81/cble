-- RUN THIS IN YOUR SUPABASE SQL EDITOR TO FIX PERMISSIONS
-- This will allow the seed script to work even with the public anon key.

DROP POLICY IF EXISTS "Authenticated users can view active questions" ON public.questions;
CREATE POLICY "Anyone can view active questions" ON public.questions
    FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Authenticated users can view active flashcards" ON public.flashcards;
CREATE POLICY "Anyone can view active flashcards" ON public.flashcards
    FOR SELECT USING (is_active = true);

-- Also ensure INSERT is allowed for all temporarily for seeding
DROP POLICY IF EXISTS "Anyone can insert questions" ON public.questions;
CREATE POLICY "Anyone can insert questions" ON public.questions
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can insert flashcards" ON public.flashcards;
CREATE POLICY "Anyone can insert flashcards" ON public.flashcards
    FOR INSERT WITH CHECK (true);
