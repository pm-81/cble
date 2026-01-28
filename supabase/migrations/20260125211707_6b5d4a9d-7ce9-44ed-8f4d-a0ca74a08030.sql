-- Create app role enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user roles table (security best practice)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    display_name TEXT,
    avatar_url TEXT,
    exam_date DATE,
    weekly_study_minutes INTEGER DEFAULT 120,
    preferred_session_length INTEGER DEFAULT 20,
    onboarding_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create domains table (8 CBLE areas)
CREATE TABLE public.domains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    color TEXT,
    icon TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.domains ENABLE ROW LEVEL SECURITY;

-- Create topics table (subtopics within domains)
CREATE TABLE public.topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain_id UUID REFERENCES public.domains(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;

-- Create questions table
CREATE TABLE public.questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain_id UUID REFERENCES public.domains(id) ON DELETE SET NULL,
    topic_id UUID REFERENCES public.topics(id) ON DELETE SET NULL,
    stem TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT NOT NULL,
    option_e TEXT NOT NULL,
    correct_answer CHAR(1) NOT NULL CHECK (correct_answer IN ('A', 'B', 'C', 'D', 'E')),
    rationale TEXT,
    reference_cue TEXT,
    difficulty INTEGER DEFAULT 3 CHECK (difficulty >= 1 AND difficulty <= 5),
    tags TEXT[],
    last_reviewed TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

-- Create flashcards table
CREATE TABLE public.flashcards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain_id UUID REFERENCES public.domains(id) ON DELETE SET NULL,
    topic_id UUID REFERENCES public.topics(id) ON DELETE SET NULL,
    front TEXT NOT NULL,
    back TEXT NOT NULL,
    reference_cue TEXT,
    tags TEXT[],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;

-- Create user question attempts table (tracks all practice)
CREATE TABLE public.question_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
    selected_answer CHAR(1) NOT NULL CHECK (selected_answer IN ('A', 'B', 'C', 'D', 'E')),
    is_correct BOOLEAN NOT NULL,
    confidence_rating INTEGER CHECK (confidence_rating >= 1 AND confidence_rating <= 5),
    was_lucky_guess BOOLEAN DEFAULT false,
    time_spent_seconds INTEGER,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.question_attempts ENABLE ROW LEVEL SECURITY;

-- Create user flashcard progress table (spaced repetition tracking)
CREATE TABLE public.flashcard_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    flashcard_id UUID REFERENCES public.flashcards(id) ON DELETE CASCADE NOT NULL,
    ease_factor DECIMAL(4,2) DEFAULT 2.5,
    interval_days INTEGER DEFAULT 1,
    repetitions INTEGER DEFAULT 0,
    due_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
    last_reviewed TIMESTAMP WITH TIME ZONE,
    lapses INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, flashcard_id)
);

ALTER TABLE public.flashcard_progress ENABLE ROW LEVEL SECURITY;

-- Create user mastery progress table (per domain/topic)
CREATE TABLE public.mastery_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    domain_id UUID REFERENCES public.domains(id) ON DELETE CASCADE NOT NULL,
    topic_id UUID REFERENCES public.topics(id) ON DELETE SET NULL,
    mastery_level INTEGER DEFAULT 0 CHECK (mastery_level >= 0 AND mastery_level <= 5),
    total_attempts INTEGER DEFAULT 0,
    correct_attempts INTEGER DEFAULT 0,
    confidence_sum INTEGER DEFAULT 0,
    last_practiced TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, domain_id, topic_id)
);

ALTER TABLE public.mastery_progress ENABLE ROW LEVEL SECURITY;

-- Create study plans table
CREATE TABLE public.study_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    exam_date DATE NOT NULL,
    weekly_minutes INTEGER DEFAULT 120,
    session_length_minutes INTEGER DEFAULT 20,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.study_plans ENABLE ROW LEVEL SECURITY;

-- Create study sessions table (scheduled and completed)
CREATE TABLE public.study_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    study_plan_id UUID REFERENCES public.study_plans(id) ON DELETE SET NULL,
    scheduled_date DATE NOT NULL,
    session_type TEXT NOT NULL CHECK (session_type IN ('quick_drill', 'flashcards', 'case_scenarios', 'mixed_review', 'exam_simulation')),
    target_duration_minutes INTEGER DEFAULT 20,
    actual_duration_minutes INTEGER,
    questions_attempted INTEGER DEFAULT 0,
    questions_correct INTEGER DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;

-- Create user notes table
CREATE TABLE public.user_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    domain_id UUID REFERENCES public.domains(id) ON DELETE SET NULL,
    question_id UUID REFERENCES public.questions(id) ON DELETE SET NULL,
    flashcard_id UUID REFERENCES public.flashcards(id) ON DELETE SET NULL,
    title TEXT,
    content TEXT NOT NULL,
    is_mnemonic BOOLEAN DEFAULT false,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.user_notes ENABLE ROW LEVEL SECURITY;

-- Create user streaks table
CREATE TABLE public.user_streaks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_study_date DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;

-- Create domain baseline confidence (from onboarding)
CREATE TABLE public.domain_confidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    domain_id UUID REFERENCES public.domains(id) ON DELETE CASCADE NOT NULL,
    confidence_level INTEGER DEFAULT 3 CHECK (confidence_level >= 1 AND confidence_level <= 5),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, domain_id)
);

ALTER TABLE public.domain_confidence ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- User roles policies
CREATE POLICY "Users can view their own roles" ON public.user_roles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" ON public.user_roles
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can insert profiles" ON public.profiles
    FOR INSERT WITH CHECK (true);

-- Domains policies (public read)
CREATE POLICY "Anyone can view domains" ON public.domains
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage domains" ON public.domains
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can insert domains" ON public.domains
    FOR INSERT WITH CHECK (true);

-- Topics policies (public read)
CREATE POLICY "Anyone can view topics" ON public.topics
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage topics" ON public.topics
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Questions policies (authenticated read)
CREATE POLICY "Anyone can view active questions" ON public.questions
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage all questions" ON public.questions
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can insert questions" ON public.questions
    FOR INSERT WITH CHECK (true);

-- Flashcards policies (authenticated read)
CREATE POLICY "Anyone can view active flashcards" ON public.flashcards
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage all flashcards" ON public.flashcards
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can insert flashcards" ON public.flashcards
    FOR INSERT WITH CHECK (true);

-- Question attempts policies (user own data)
CREATE POLICY "Users can view their own attempts" ON public.question_attempts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own attempts" ON public.question_attempts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Flashcard progress policies (user own data)
CREATE POLICY "Users can view their own flashcard progress" ON public.flashcard_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own flashcard progress" ON public.flashcard_progress
    FOR ALL USING (auth.uid() = user_id);

-- Mastery progress policies (user own data)
CREATE POLICY "Users can view their own mastery progress" ON public.mastery_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own mastery progress" ON public.mastery_progress
    FOR ALL USING (auth.uid() = user_id);

-- Study plans policies (user own data)
CREATE POLICY "Users can view their own study plans" ON public.study_plans
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own study plans" ON public.study_plans
    FOR ALL USING (auth.uid() = user_id);

-- Study sessions policies (user own data)
CREATE POLICY "Users can view their own study sessions" ON public.study_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own study sessions" ON public.study_sessions
    FOR ALL USING (auth.uid() = user_id);

-- User notes policies (user own data)
CREATE POLICY "Users can view their own notes" ON public.user_notes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own notes" ON public.user_notes
    FOR ALL USING (auth.uid() = user_id);

-- User streaks policies (user own data)
CREATE POLICY "Users can view their own streaks" ON public.user_streaks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own streaks" ON public.user_streaks
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Anyone can insert streaks" ON public.user_streaks
    FOR INSERT WITH CHECK (true);

-- Domain confidence policies (user own data)
CREATE POLICY "Users can view their own confidence" ON public.domain_confidence
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own confidence" ON public.domain_confidence
    FOR ALL USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON public.questions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_flashcards_updated_at BEFORE UPDATE ON public.flashcards
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_flashcard_progress_updated_at BEFORE UPDATE ON public.flashcard_progress
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mastery_progress_updated_at BEFORE UPDATE ON public.mastery_progress
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_study_plans_updated_at BEFORE UPDATE ON public.study_plans
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_notes_updated_at BEFORE UPDATE ON public.user_notes
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_streaks_updated_at BEFORE UPDATE ON public.user_streaks
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_domain_confidence_updated_at BEFORE UPDATE ON public.domain_confidence
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, display_name)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'display_name');
    
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user');
    
    INSERT INTO public.user_streaks (user_id)
    VALUES (NEW.id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();