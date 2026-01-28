import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Loader2,
  RotateCcw,
  Home,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  ThumbsUp,
  ThumbsDown,
  Minus,
  Zap,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { calculateSM2, ratingToQuality } from '@/lib/spaced-repetition';

interface Flashcard {
  id: string;
  front: string;
  back: string;
  reference_cue: string | null;
  domain_id: string | null;
}

interface FlashcardProgress {
  flashcard_id: string;
  ease_factor: number;
  interval_days: number;
  repetitions: number;
  due_date: string;
}

type Rating = 'again' | 'hard' | 'good' | 'easy';

export default function Flashcards() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [progress, setProgress] = useState<Map<string, FlashcardProgress>>(new Map());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reviewed, setReviewed] = useState<Set<string>>(new Set());
  const [sessionComplete, setSessionComplete] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    async function fetchFlashcards() {
      if (!user) return;

      try {
        setLoading(true);
        // 1. Fetch user's flashcard progress for ALL cards
        const { data: progressData, error: progressError } = await supabase
          .from('flashcard_progress')
          .select('*')
          .eq('user_id', user.id);

        if (progressError) throw progressError;

        // Create progress map
        const progressMap = new Map<string, FlashcardProgress>();
        const reviewedIds = new Set<string>();

        progressData?.forEach(p => {
          progressMap.set(p.flashcard_id, {
            flashcard_id: p.flashcard_id,
            ease_factor: p.ease_factor || 2.5,
            interval_days: p.interval_days || 1,
            repetitions: p.repetitions || 0,
            due_date: p.due_date || new Date().toISOString(),
          });
          reviewedIds.add(p.flashcard_id);
        });

        // 2. Identify due card IDs
        const now = new Date();
        const dueIds = progressData
          ?.filter(p => new Date(p.due_date) <= now)
          .map(p => p.flashcard_id) || [];

        let finalCards: Flashcard[] = [];

        // 3. If there are due cards, fetch them
        if (dueIds.length > 0) {
          const { data: dueCards, error: dueError } = await supabase
            .from('flashcards')
            .select('*, domains(name)')
            .in('id', dueIds.slice(0, 20))
            .eq('is_active', true);

          if (dueError) throw dueError;
          if (dueCards) finalCards = [...dueCards];
        }

        // 4. If we have fewer than 20 cards, fetch some new ones
        if (finalCards.length < 20) {
          const limit = 20 - finalCards.length;

          // Fetch cards that haven't been reviewed yet
          // Since we can't easily do NOT IN in a single simple query with many IDs
          // we'll fetch a batch and filter in JS, or use a better query if IDs are few

          let query = supabase
            .from('flashcards')
            .select('*, domains(name)')
            .eq('is_active', true)
            .limit(50); // Get a larger batch to filter

          const { data: potentialNewCards, error: newError } = await query;

          if (newError) throw newError;

          if (potentialNewCards) {
            const reallyNewCards = potentialNewCards
              .filter(c => !reviewedIds.has(c.id))
              .slice(0, limit);

            finalCards = [...finalCards, ...reallyNewCards];
          }
        }

        // Sort: Due date first, then new
        finalCards.sort((a, b) => {
          const progA = progressMap.get(a.id);
          const progB = progressMap.get(b.id);

          if (progA && progB) {
            return new Date(progA.due_date).getTime() - new Date(progB.due_date).getTime();
          }
          if (progA) return -1;
          if (progB) return 1;
          return 0;
        });

        setFlashcards(finalCards);
        setProgress(progressMap);
      } catch (error) {
        console.error('Error fetching flashcards:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchFlashcards();
  }, [user]);

  const currentCard = flashcards[currentIndex];
  const currentProgress = currentCard ? progress.get(currentCard.id) : null;

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleRating = async (rating: Rating) => {
    if (!currentCard || !user) return;

    const quality = ratingToQuality(rating);
    const currentEF = currentProgress?.ease_factor || 2.5;
    const currentInterval = currentProgress?.interval_days || 1;
    const currentReps = currentProgress?.repetitions || 0;

    const sm2Result = calculateSM2({
      quality,
      previousEaseFactor: currentEF,
      previousInterval: currentInterval,
      previousRepetitions: currentReps,
    });

    try {
      // Upsert progress
      await supabase
        .from('flashcard_progress')
        .upsert({
          user_id: user.id,
          flashcard_id: currentCard.id,
          ease_factor: sm2Result.easeFactor,
          interval_days: sm2Result.interval,
          repetitions: sm2Result.repetitions,
          due_date: sm2Result.dueDate.toISOString(),
          last_reviewed: new Date().toISOString(),
          lapses: quality < 3 ? (currentProgress?.repetitions || 0) > 0 ? 1 : 0 : 0,
        }, { onConflict: 'user_id,flashcard_id' });

      // Update local progress
      setProgress(prev => {
        const updated = new Map(prev);
        updated.set(currentCard.id, {
          flashcard_id: currentCard.id,
          ease_factor: sm2Result.easeFactor,
          interval_days: sm2Result.interval,
          repetitions: sm2Result.repetitions,
          due_date: sm2Result.dueDate.toISOString(),
        });
        return updated;
      });

      // Mark as reviewed
      if (rating !== 'again') {
        setReviewed(prev => new Set(prev).add(currentCard.id));
      }

      // Move to next card or re-queue
      if (rating === 'again') {
        setFlashcards(prev => {
          const updated = [...prev];
          const [card] = updated.splice(currentIndex, 1);
          updated.push(card);
          return updated;
        });
        setIsFlipped(false);
        // currentIndex stays the same because the card moved to end and next card is now at currentIndex
      } else {
        if (currentIndex < flashcards.length - 1) {
          setCurrentIndex(prev => prev + 1);
          setIsFlipped(false);
        } else {
          setSessionComplete(true);
        }
      }
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsFlipped(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
    }
  };

  if (authLoading || loading) {
    return (
      <Layout showFooter={false}>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!user) return null;

  if (flashcards.length === 0) {
    return (
      <Layout showFooter={false}>
        <div className="container py-12 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
          <h2 className="mt-4 text-xl font-semibold">No Flashcards Available</h2>
          <p className="mt-2 text-muted-foreground">
            Flashcards are being prepared. Check back soon!
          </p>
          <Button asChild className="mt-6">
            <a href="/dashboard">Return to Dashboard</a>
          </Button>
        </div>
      </Layout>
    );
  }

  if (sessionComplete) {
    return (
      <Layout showFooter={false}>
        <div className="min-h-[calc(100vh-4rem)] bg-muted/30 dark:bg-background flex items-center justify-center p-4">
          <Card className="max-w-xl w-full text-center card-premium overflow-visible p-1">
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full gradient-primary flex items-center justify-center shadow-xl border-4 border-background animate-fade-in-up">
              <Sparkles className="h-12 w-12 text-primary-foreground" />
            </div>

            <CardContent className="pt-16 pb-12 px-8">
              <h2 className="font-display text-4xl font-bold tracking-tight mb-2">Session Mastered!</h2>
              <p className="text-muted-foreground text-lg mb-10">
                You've strengthened your recall on {reviewed.size} key concepts.
              </p>

              <div className="grid grid-cols-2 gap-6 mb-10">
                <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10 shadow-sm transition-all hover:shadow-md">
                  <p className="text-4xl font-black text-primary mb-1">{reviewed.size}</p>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest text-primary/70">Reviewed</p>
                </div>
                <div className="p-6 rounded-3xl bg-success/5 border border-success/10 shadow-sm transition-all hover:shadow-md">
                  <p className="text-4xl font-black text-success mb-1">100%</p>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest text-success/70">Retention</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button variant="outline" size="lg" asChild className="rounded-2xl border-2 px-8 h-14 font-bold text-base">
                  <a href="/dashboard" className="gap-2">
                    <Home className="h-5 w-5" />
                    Dashboard
                  </a>
                </Button>
                <Button
                  size="lg"
                  className="gradient-primary shadow-glow rounded-2xl px-8 h-14 font-bold text-base"
                  onClick={() => window.location.reload()}
                >
                  <RotateCcw className="h-5 w-5 mr-1" />
                  Continue Session
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showFooter={false}>
      <div className="min-h-[calc(100vh-4rem)] bg-muted/30 dark:bg-background flex flex-col items-center py-6 sm:py-12 px-4">
        <div className="w-full max-w-2xl">
          {/* Progress Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between text-sm font-medium text-muted-foreground mb-3">
              <span className="bg-background px-3 py-1 rounded-full border shadow-sm">
                Card <span className="text-primary font-bold">{currentIndex + 1}</span> of {flashcards.length}
              </span>
              <span className="flex items-center gap-2 bg-background px-3 py-1 rounded-full border shadow-sm">
                <Zap className="h-4 w-4 text-primary" />
                {reviewed.size} reviewed
              </span>
            </div>
            <Progress value={((currentIndex + 1) / flashcards.length) * 100} className="h-2.5 shadow-inner" />
          </div>

          {/* Flashcard Container */}
          <div
            className="perspective-1000 cursor-pointer group mb-10"
            onClick={handleFlip}
          >
            <div
              className={`relative transition-all duration-700 ease-in-out transform-style-3d min-h-[400px] sm:min-h-[450px] ${isFlipped ? 'rotate-y-180' : ''
                }`}
              style={{
                transformStyle: 'preserve-3d',
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
              }}
            >
              {/* Front Side */}
              <Card
                className={`absolute inset-0 shadow-2xl border-2 border-primary/10 bg-card flex items-center justify-center backface-hidden transition-all group-hover:border-primary/30 ${isFlipped ? 'pointer-events-none' : ''}`}
                style={{ backfaceVisibility: 'hidden' }}
              >
                <CardContent className="flex flex-col items-center justify-center p-8 sm:p-12 text-center h-full w-full">
                  <div className="absolute top-6 left-6 flex items-center gap-2">
                    <Badge variant="outline" className="px-3 py-1 bg-primary/5 text-primary border-primary/20 text-[10px] uppercase font-black tracking-[0.2em]">
                      QUESTION
                    </Badge>
                  </div>

                  <div className="mb-8 p-3 rounded-2xl bg-primary/5 text-primary">
                    <BookOpen className="h-8 w-8" />
                  </div>

                  <h3 className="text-2xl sm:text-4xl font-display font-bold leading-tight tracking-tight text-foreground">
                    {currentCard?.front}
                  </h3>

                  <div className="mt-6">
                    <Badge variant="secondary" className="px-3 py-1 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                      {(currentCard as any)?.domains?.name || 'General Knowledge'}
                    </Badge>
                  </div>

                  <div className="absolute bottom-10 flex flex-col items-center gap-3 animate-bounce opacity-30">
                    <RotateCcw className="h-5 w-5" />
                    <span className="text-[10px] uppercase font-bold tracking-[0.2em]">Tap to flip</span>
                  </div>
                </CardContent>
              </Card>

              {/* Back Side */}
              <Card
                className={`absolute inset-0 shadow-2xl border-2 border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card flex items-center justify-center backface-hidden ${!isFlipped ? 'pointer-events-none' : ''}`}
                style={{
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)'
                }}
              >
                <CardContent className="flex flex-col items-center justify-center p-8 sm:p-12 text-center h-full w-full">
                  <div className="absolute top-6 right-6">
                    <Badge className="gradient-primary border-none px-4 py-1.5 font-black text-[10px] uppercase tracking-[0.2em] shadow-lg">
                      THE ANSWER
                    </Badge>
                  </div>

                  <div className="mb-8 p-3 rounded-2xl bg-success/10 text-success">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>

                  <p className="text-xl sm:text-3xl font-medium leading-relaxed text-foreground/90 max-w-[90%] font-display">
                    {currentCard?.back}
                  </p>

                  {currentCard?.reference_cue && (
                    <div className="mt-10 flex items-center gap-3 px-5 py-3 rounded-xl bg-muted/80 backdrop-blur-sm border-2 border-dashed font-mono text-xs text-muted-foreground uppercase tracking-wider">
                      <span className="bg-primary/20 text-primary px-2 py-0.5 rounded font-bold text-[10px]">REF</span>
                      {currentCard.reference_cue}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Rating Buttons (shown when flipped) */}
          {isFlipped && (
            <div className="grid grid-cols-4 gap-2 mb-6">
              <Button
                variant="outline"
                className="flex-col h-auto py-3 border-destructive/50 hover:bg-destructive/10"
                onClick={() => handleRating('again')}
              >
                <ThumbsDown className="h-5 w-5 mb-1 text-destructive" />
                <span className="text-xs">Again</span>
                <span className="text-[10px] text-muted-foreground">&lt;1 min</span>
              </Button>
              <Button
                variant="outline"
                className="flex-col h-auto py-3 border-warning/50 hover:bg-warning/10"
                onClick={() => handleRating('hard')}
              >
                <Minus className="h-5 w-5 mb-1 text-warning" />
                <span className="text-xs">Hard</span>
                <span className="text-[10px] text-muted-foreground">
                  {currentProgress ? Math.max(1, Math.round(currentProgress.interval_days * 0.8)) : 1}d
                </span>
              </Button>
              <Button
                variant="outline"
                className="flex-col h-auto py-3 border-success/50 hover:bg-success/10"
                onClick={() => handleRating('good')}
              >
                <ThumbsUp className="h-5 w-5 mb-1 text-success" />
                <span className="text-xs">Good</span>
                <span className="text-[10px] text-muted-foreground">
                  {currentProgress ? currentProgress.interval_days : 1}d
                </span>
              </Button>
              <Button
                variant="outline"
                className="flex-col h-auto py-3 border-primary/50 hover:bg-primary/10"
                onClick={() => handleRating('easy')}
              >
                <Zap className="h-5 w-5 mb-1 text-primary" />
                <span className="text-xs">Easy</span>
                <span className="text-[10px] text-muted-foreground">
                  {currentProgress ? Math.round(currentProgress.interval_days * 1.3) : 4}d
                </span>
              </Button>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            <Button
              variant="outline"
              onClick={handleFlip}
              className="gap-2"
            >
              {isFlipped ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {isFlipped ? 'Hide' : 'Show'} Answer
            </Button>

            <Button
              variant="outline"
              onClick={handleNext}
              disabled={currentIndex === flashcards.length - 1}
              className="gap-2"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
