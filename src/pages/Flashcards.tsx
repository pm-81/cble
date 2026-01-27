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
  Zap
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
        // Fetch flashcards due for review
        const { data: flashcardsData, error: flashcardsError } = await supabase
          .from('flashcards')
          .select('*')
          .eq('is_active', true)
          .limit(20);

        if (flashcardsError) throw flashcardsError;

        // Fetch user's progress
        const { data: progressData, error: progressError } = await supabase
          .from('flashcard_progress')
          .select('*')
          .eq('user_id', user.id);

        if (progressError) throw progressError;

        // Create progress map
        const progressMap = new Map<string, FlashcardProgress>();
        progressData?.forEach(p => {
          progressMap.set(p.flashcard_id, {
            flashcard_id: p.flashcard_id,
            ease_factor: p.ease_factor || 2.5,
            interval_days: p.interval_days || 1,
            repetitions: p.repetitions || 0,
            due_date: p.due_date || new Date().toISOString(),
          });
        });

        // Sort flashcards - due first, then new
        const sortedFlashcards = (flashcardsData || []).sort((a, b) => {
          const progressA = progressMap.get(a.id);
          const progressB = progressMap.get(b.id);
          
          // New cards (no progress) come after due cards
          if (!progressA && progressB) return 1;
          if (progressA && !progressB) return -1;
          if (!progressA && !progressB) return 0;
          
          // Sort by due date
          return new Date(progressA!.due_date).getTime() - new Date(progressB!.due_date).getTime();
        });

        setFlashcards(sortedFlashcards);
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
      setReviewed(prev => new Set(prev).add(currentCard.id));

      // Move to next card
      if (currentIndex < flashcards.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setIsFlipped(false);
      } else {
        setSessionComplete(true);
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
        <div className="container max-w-2xl py-12">
          <Card className="text-center">
            <CardContent className="pt-8 pb-10">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full gradient-primary">
                <Zap className="h-10 w-10 text-primary-foreground" />
              </div>
              <h2 className="font-display text-2xl font-bold">Session Complete!</h2>
              <p className="mt-2 text-muted-foreground">
                Great work reviewing your flashcards.
              </p>
              
              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-muted p-4">
                  <p className="text-2xl font-bold text-primary">{reviewed.size}</p>
                  <p className="text-sm text-muted-foreground">Cards Reviewed</p>
                </div>
                <div className="rounded-lg bg-muted p-4">
                  <p className="text-2xl font-bold text-success">{flashcards.length}</p>
                  <p className="text-sm text-muted-foreground">Total Cards</p>
                </div>
              </div>

              <div className="mt-8 flex justify-center gap-4">
                <Button variant="outline" asChild>
                  <a href="/dashboard" className="gap-2">
                    <Home className="h-4 w-4" />
                    Dashboard
                  </a>
                </Button>
                <Button 
                  className="gradient-primary gap-2"
                  onClick={() => window.location.reload()}
                >
                  <RotateCcw className="h-4 w-4" />
                  New Session
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
      <div className="container max-w-2xl py-6">
        {/* Progress Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            <span>Card {currentIndex + 1} of {flashcards.length}</span>
            <span className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              {reviewed.size} reviewed
            </span>
          </div>
          <Progress value={((currentIndex + 1) / flashcards.length) * 100} className="h-2" />
        </div>

        {/* Flashcard */}
        <div 
          className="perspective-1000 cursor-pointer mb-6"
          onClick={handleFlip}
        >
          <div 
            className={`relative transition-transform duration-500 transform-style-3d ${
              isFlipped ? 'rotate-y-180' : ''
            }`}
            style={{ 
              transformStyle: 'preserve-3d',
              transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
            }}
          >
            {/* Front */}
            <Card 
              className={`min-h-[300px] ${isFlipped ? 'invisible' : 'visible'}`}
              style={{ backfaceVisibility: 'hidden' }}
            >
              <CardContent className="flex flex-col items-center justify-center min-h-[300px] p-8 text-center">
                <Badge variant="outline" className="mb-4">Question</Badge>
                <p className="text-lg font-medium leading-relaxed">
                  {currentCard?.front}
                </p>
                <p className="text-sm text-muted-foreground mt-6 flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Click to reveal answer
                </p>
              </CardContent>
            </Card>

            {/* Back */}
            <Card 
              className={`min-h-[300px] absolute top-0 left-0 w-full ${isFlipped ? 'visible' : 'invisible'}`}
              style={{ 
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)'
              }}
            >
              <CardContent className="flex flex-col items-center justify-center min-h-[300px] p-8 text-center">
                <Badge variant="secondary" className="mb-4">Answer</Badge>
                <p className="text-lg font-medium leading-relaxed">
                  {currentCard?.back}
                </p>
                {currentCard?.reference_cue && (
                  <Badge variant="outline" className="mt-4">
                    {currentCard.reference_cue}
                  </Badge>
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
    </Layout>
  );
}
