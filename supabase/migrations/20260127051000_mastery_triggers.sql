-- Function to update mastery progress after a question attempt
CREATE OR REPLACE FUNCTION public.update_mastery_on_attempt()
RETURNS TRIGGER AS $$
DECLARE
    v_domain_id UUID;
BEGIN
    -- Get domain_id from the question
    SELECT domain_id INTO v_domain_id 
    FROM public.questions 
    WHERE id = NEW.question_id;

    IF v_domain_id IS NOT NULL THEN
        -- Upsert mastery progress
        INSERT INTO public.mastery_progress (
            user_id, 
            domain_id, 
            total_attempts, 
            correct_attempts, 
            confidence_sum,
            last_practiced,
            mastery_level
        )
        VALUES (
            NEW.user_id,
            v_domain_id,
            1,
            CASE WHEN NEW.is_correct THEN 1 ELSE 0 END,
            COALESCE(NEW.confidence_rating, 3),
            NEW.created_at,
            -- Initial mastery level calculation (very basic: correct/total * 5)
            CASE WHEN NEW.is_correct THEN 1 ELSE 0 END * 5
        )
        ON CONFLICT (user_id, domain_id, topic_id) DO UPDATE SET
            total_attempts = mastery_progress.total_attempts + 1,
            correct_attempts = mastery_progress.correct_attempts + CASE WHEN EXCLUDED.correct_attempts = 1 THEN 1 ELSE 0 END,
            confidence_sum = mastery_progress.confidence_sum + EXCLUDED.confidence_sum,
            last_practiced = EXCLUDED.last_practiced,
            updated_at = now(),
            -- Updated mastery level calculation: (correct / total) * 5
            mastery_level = FLOOR(((mastery_progress.correct_attempts + CASE WHEN EXCLUDED.correct_attempts = 1 THEN 1 ELSE 0 END)::DECIMAL / (mastery_progress.total_attempts + 1)) * 5);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for mastery updates
DROP TRIGGER IF EXISTS on_question_attempt_insert ON public.question_attempts;
CREATE TRIGGER on_question_attempt_insert
    AFTER INSERT ON public.question_attempts
    FOR EACH ROW EXECUTE FUNCTION public.update_mastery_on_attempt();

-- Update existing mastery_progress table unique constraint to handle NULL topics
-- The previous migration already had a unique constraint (user_id, domain_id, topic_id)
-- But topic_id is often NULL. In Postgres, (val, val, NULL) != (val, val, NULL) for unique constraints.
-- We need a partial index or a better constraint if we want to support NULL topics correctly.

DROP INDEX IF EXISTS idx_mastery_user_domain_no_topic;
CREATE UNIQUE INDEX idx_mastery_user_domain_no_topic ON public.mastery_progress (user_id, domain_id) WHERE topic_id IS NULL;
