import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import {
  Loader2,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Flag,
  RotateCcw,
  Home,
  BookOpen,
  Clock,
  Target
} from 'lucide-react';
import type { AnswerChoice } from '@/types/database';

interface Question {
  id: string;
  stem: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  option_e: string;
  correct_answer: string;
  rationale: string | null;
  reference_cue: string | null;
  difficulty: number | null;
  domain_id: string | null;
}

interface QuestionState {
  selectedAnswer: AnswerChoice | null;
  isSubmitted: boolean;
  confidence: number;
  wasLuckyGuess: boolean;
  timeSpent: number;
}

export default function Study() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'quick_drill';
  const isExamMode = mode === 'exam_simulation';

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [questionStates, setQuestionStates] = useState<Map<string, QuestionState>>(new Map());
  const [loading, setLoading] = useState(true);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    async function fetchQuestions() {
      if (!user) return;

      try {
        const limit = mode === '2min' ? 5 : mode === 'exam_simulation' ? 80 : 20;

        // Fetch random questions
        const { data, error } = await supabase
          .from('questions')
          .select('*')
          .eq('is_active', true)
          .limit(limit);

        if (error) throw error;

        // Shuffle questions
        const shuffled = (data || []).sort(() => Math.random() - 0.5);
        setQuestions(shuffled);

        // Initialize states
        const states = new Map<string, QuestionState>();
        shuffled.forEach(q => {
          states.set(q.id, {
            selectedAnswer: null,
            isSubmitted: false,
            confidence: 3,
            wasLuckyGuess: false,
            timeSpent: 0,
          });
        });
        setQuestionStates(states);
        setStartTime(Date.now());
      } catch (error) {
        console.error('Error fetching questions:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchQuestions();
  }, [user, mode]);

  const currentQuestion = questions[currentIndex];
  const currentState = currentQuestion ? questionStates.get(currentQuestion.id) : null;

  const handleAnswerSelect = (answer: AnswerChoice) => {
    if (!currentQuestion || currentState?.isSubmitted) return;

    setQuestionStates(prev => {
      const updated = new Map(prev);
      updated.set(currentQuestion.id, {
        ...currentState!,
        selectedAnswer: answer,
      });
      return updated;
    });
  };

  const handleSubmitAnswer = async () => {
    if (!currentQuestion || !currentState?.selectedAnswer || !user) return;

    const isCorrect = currentState.selectedAnswer === currentQuestion.correct_answer;
    const timeSpent = Math.round((Date.now() - startTime) / 1000);

    // Update local state
    setQuestionStates(prev => {
      const updated = new Map(prev);
      updated.set(currentQuestion.id, {
        ...currentState,
        isSubmitted: true,
        timeSpent,
      });
      return updated;
    });

    // Save attempt to database
    try {
      await supabase.from('question_attempts').insert({
        user_id: user.id,
        question_id: currentQuestion.id,
        selected_answer: currentState.selectedAnswer,
        is_correct: isCorrect,
        confidence_rating: currentState.confidence,
        was_lucky_guess: currentState.wasLuckyGuess,
        time_spent_seconds: timeSpent,
      });
    } catch (error) {
      console.error('Error saving attempt:', error);
    }

    setStartTime(Date.now());
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setStartTime(Date.now());
    } else {
      setSessionComplete(true);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleConfidenceChange = (value: number[]) => {
    if (!currentQuestion || currentState?.isSubmitted) return;

    setQuestionStates(prev => {
      const updated = new Map(prev);
      updated.set(currentQuestion.id, {
        ...currentState!,
        confidence: value[0],
      });
      return updated;
    });
  };

  const handleLuckyGuessToggle = (checked: boolean) => {
    if (!currentQuestion || currentState?.isSubmitted) return;

    setQuestionStates(prev => {
      const updated = new Map(prev);
      updated.set(currentQuestion.id, {
        ...currentState!,
        wasLuckyGuess: checked,
      });
      return updated;
    });
  };

  // Calculate session stats
  const answeredCount = Array.from(questionStates.values()).filter(s => s.isSubmitted).length;
  const correctCount = questions.filter(q => {
    const state = questionStates.get(q.id);
    return state?.isSubmitted && state.selectedAnswer === q.correct_answer;
  }).length;

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

  if (questions.length === 0) {
    return (
      <Layout showFooter={false}>
        <div className="container py-12 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
          <h2 className="mt-4 text-xl font-semibold">No Questions Available</h2>
          <p className="mt-2 text-muted-foreground">
            Questions are being loaded. Please try again later.
          </p>
          <Button asChild className="mt-6">
            <a href="/dashboard">Return to Dashboard</a>
          </Button>
        </div>
      </Layout>
    );
  }

  if (sessionComplete) {
    const accuracy = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;

    return (
      <Layout showFooter={false}>
        <div className="container max-w-2xl py-12">
          <Card className="text-center">
            <CardContent className="pt-8 pb-10">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full gradient-primary">
                <CheckCircle2 className="h-10 w-10 text-primary-foreground" />
              </div>
              <h2 className="font-display text-2xl font-bold">Session Complete!</h2>
              <p className="mt-2 text-muted-foreground">Great work on your practice session.</p>

              <div className="mt-8 grid grid-cols-3 gap-4">
                <div className="rounded-lg bg-muted p-4">
                  <p className="text-2xl font-bold text-primary">{answeredCount}</p>
                  <p className="text-sm text-muted-foreground">Questions</p>
                </div>
                <div className="rounded-lg bg-muted p-4">
                  <p className="text-2xl font-bold text-success">{correctCount}</p>
                  <p className="text-sm text-muted-foreground">Correct</p>
                </div>
                <div className="rounded-lg bg-muted p-4">
                  <p className="text-2xl font-bold">{accuracy}%</p>
                  <p className="text-sm text-muted-foreground">Accuracy</p>
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

  const isCorrect = currentState?.isSubmitted && currentState.selectedAnswer === currentQuestion?.correct_answer;
  const isIncorrect = currentState?.isSubmitted && currentState.selectedAnswer !== currentQuestion?.correct_answer;

  return (
    <Layout showFooter={false}>
      <div className="container max-w-4xl py-6">
        {/* Progress Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            <span>Question {currentIndex + 1} of {questions.length}</span>
            <span className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              {correctCount}/{answeredCount} correct
            </span>
          </div>
          <Progress value={((currentIndex + 1) / questions.length) * 100} className="h-2" />
        </div>

        {/* Question Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <Badge variant="outline" className="mb-2">
                {mode === 'exam_simulation' ? 'Exam Mode' : 'Practice'}
              </Badge>
              {currentQuestion?.reference_cue && currentState?.isSubmitted && (
                <Badge variant="secondary">{currentQuestion.reference_cue}</Badge>
              )}
            </div>
            <CardTitle className="text-lg font-medium leading-relaxed">
              {currentQuestion?.stem}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={currentState?.selectedAnswer || ''}
              onValueChange={(v) => handleAnswerSelect(v as AnswerChoice)}
              className="space-y-3"
            >
              {(['A', 'B', 'C', 'D', 'E'] as AnswerChoice[]).map((letter) => {
                const optionKey = `option_${letter.toLowerCase()}` as keyof Question;
                const optionText = currentQuestion?.[optionKey] as string;
                const isSelected = currentState?.selectedAnswer === letter;
                const isCorrectAnswer = letter === currentQuestion?.correct_answer;
                const showResult = currentState?.isSubmitted && !isExamMode;

                let bgClass = '';
                if (showResult && isCorrectAnswer) {
                  bgClass = 'bg-success/10 border-success';
                } else if (showResult && isSelected && !isCorrectAnswer) {
                  bgClass = 'bg-destructive/10 border-destructive';
                } else if (isSelected) {
                  bgClass = 'bg-primary/5 border-primary';
                }

                return (
                  <div key={letter}>
                    <Label
                      htmlFor={`option-${letter}`}
                      className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-all hover:bg-muted/50 ${bgClass} ${currentState?.isSubmitted ? 'cursor-default' : ''}`}
                    >
                      <RadioGroupItem
                        value={letter}
                        id={`option-${letter}`}
                        disabled={currentState?.isSubmitted}
                        className="mt-0.5"
                      />
                      <div className="flex-1">
                        <span className="font-medium">{letter}.</span> {optionText}
                      </div>
                      {showResult && isCorrectAnswer && (
                        <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
                      )}
                      {showResult && isSelected && !isCorrectAnswer && (
                        <XCircle className="h-5 w-5 text-destructive shrink-0" />
                      )}
                    </Label>
                  </div>
                );
              })}
            </RadioGroup>

            {/* Confidence Rating (before submit) */}
            {!currentState?.isSubmitted && currentState?.selectedAnswer && (
              <div className="mt-6 space-y-4 rounded-lg bg-muted/50 p-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm">How confident are you?</Label>
                    <span className="text-sm font-medium">{currentState.confidence}/5</span>
                  </div>
                  <Slider
                    value={[currentState.confidence]}
                    onValueChange={handleConfidenceChange}
                    min={1}
                    max={5}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Guessing</span>
                    <span>Very confident</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="lucky-guess" className="text-sm">Was this a lucky guess?</Label>
                  <Switch
                    id="lucky-guess"
                    checked={currentState.wasLuckyGuess}
                    onCheckedChange={handleLuckyGuessToggle}
                  />
                </div>
              </div>
            )}

            {/* Rationale (after submit) - hidden in exam mode */}
            {currentState?.isSubmitted && !isExamMode && currentQuestion?.rationale && (
              <div className={`mt-6 rounded-lg p-4 ${isCorrect ? 'bg-success/10' : 'bg-muted'}`}>
                <div className="flex items-start gap-3">
                  <Lightbulb className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold mb-2">
                      {isCorrect ? 'Correct!' : 'Explanation'}
                    </h4>
                    <p className="text-sm text-muted-foreground">{currentQuestion.rationale}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
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

          <div className="flex gap-3">
            {!currentState?.isSubmitted ? (
              <Button
                onClick={handleSubmitAnswer}
                disabled={!currentState?.selectedAnswer}
                className="gradient-primary"
              >
                Submit Answer
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                className="gradient-primary gap-2"
              >
                {currentIndex < questions.length - 1 ? 'Next' : 'Finish'}
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
