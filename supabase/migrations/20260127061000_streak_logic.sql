-- Streak tracking logic
CREATE OR REPLACE FUNCTION public.update_user_streak()
RETURNS TRIGGER AS $$
DECLARE
    v_last_study_date DATE;
    v_today DATE := current_date;
BEGIN
    -- Get current streak info
    SELECT last_study_date INTO v_last_study_date
    FROM public.user_streaks
    WHERE user_id = NEW.user_id;

    -- If no streak record exists (shouldn't happen due to handle_new_user trigger)
    IF NOT FOUND THEN
        INSERT INTO public.user_streaks (user_id, current_streak, longest_streak, last_study_date)
        VALUES (NEW.user_id, 1, 1, v_today);
        RETURN NEW;
    END IF;

    -- If studied today, do nothing to current_streak
    IF v_last_study_date = v_today THEN
        RETURN NEW;
    END IF;

    -- If studied yesterday, increment streak
    IF v_last_study_date = (v_today - INTERVAL '1 day')::DATE THEN
        UPDATE public.user_streaks
        SET current_streak = current_streak + 1,
            longest_streak = GREATEST(longest_streak, current_streak + 1),
            last_study_date = v_today,
            updated_at = now()
        WHERE user_id = NEW.user_id;
    -- If streak broken or first time
    ELSE
        UPDATE public.user_streaks
        SET current_streak = 1,
            longest_streak = GREATEST(longest_streak, 1),
            last_study_date = v_today,
            updated_at = now()
        WHERE user_id = NEW.user_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for streak updates
DROP TRIGGER IF EXISTS on_question_attempt_streak ON public.question_attempts;
CREATE TRIGGER on_question_attempt_streak
    AFTER INSERT ON public.question_attempts
    FOR EACH ROW EXECUTE FUNCTION public.update_user_streak();

DROP TRIGGER IF EXISTS on_flashcard_review_streak ON public.flashcard_progress;
CREATE TRIGGER on_flashcard_review_streak
    AFTER UPDATE ON public.flashcard_progress
    FOR EACH ROW EXECUTE FUNCTION public.update_user_streak();
