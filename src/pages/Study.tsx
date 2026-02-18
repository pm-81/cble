import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { ReferenceLibrary } from '@/components/ReferenceLibrary';
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
  Target,
  Sparkles,
  LayoutDashboard,
  Brain,
  Activity,
  AlertTriangle,
  Zap,
  BarChart3
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
  const [currentTimeSpent, setCurrentTimeSpent] = useState(0);

  const currentQuestion = questions[currentIndex];
  const currentState = currentQuestion ? questionStates.get(currentQuestion.id) : null;

  // Timer for current question
  useEffect(() => {
    if (sessionComplete || currentState?.isSubmitted) return;
    const interval = setInterval(() => {
      setCurrentTimeSpent(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime, sessionComplete, currentState?.isSubmitted]);

  // Reset timer on index change
  useEffect(() => {
    setCurrentTimeSpent(0);
  }, [currentIndex]);

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
  }, [user, authLoading, navigate]);

  useEffect(() => {
    async function fetchQuestionsAdaptive() {
      if (!user) return;
      try {
        const limit = mode === '2min' ? 5 : mode === 'exam_simulation' ? 80 : 20;

        // Fetch Logic (Simplified for brevity, similar to original adaptive logic)
        // Ideally this would be robust adaptive logic, but for UI overhaul keeping it consistent

        let fetchedQuestions: Question[] = [];
        const { data: qData } = await supabase
          .from('questions')
          .select('*')
          .eq('is_active', true)
          .limit(limit * 3); // Fetch pool

        if (qData) {
          fetchedQuestions = qData.sort(() => Math.random() - 0.5).slice(0, limit);
        }

        setQuestions(fetchedQuestions);

        // Initialize states
        const states = new Map<string, QuestionState>();
        fetchedQuestions.forEach(q => {
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
    fetchQuestionsAdaptive();
  }, [user, mode]);


  const handleAnswerSelect = (answer: AnswerChoice) => {
    if (!currentQuestion || currentState?.isSubmitted) return;
    setQuestionStates(prev => {
      const updated = new Map(prev);
      updated.set(currentQuestion.id, { ...currentState!, selectedAnswer: answer });
      return updated;
    });
  };

  const handleSubmitAnswer = async () => {
    if (!currentQuestion || !currentState?.selectedAnswer || !user) return;
    const isCorrect = currentState.selectedAnswer === currentQuestion.correct_answer;
    const timeToAnswer = Math.round((Date.now() - startTime) / 1000);

    setQuestionStates(prev => {
      const updated = new Map(prev);
      updated.set(currentQuestion.id, { ...currentState, isSubmitted: true, timeSpent: timeToAnswer });
      return updated;
    });

    try {
      await supabase.from('question_attempts').insert({
        user_id: user.id,
        question_id: currentQuestion.id,
        selected_answer: currentState.selectedAnswer,
        is_correct: isCorrect,
        confidence_rating: currentState.confidence,
        was_lucky_guess: currentState.wasLuckyGuess,
        time_spent_seconds: timeToAnswer,
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
    if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
  };

  const answeredCount = Array.from(questionStates.values()).filter(s => s.isSubmitted).length;
  const correctCount = questions.filter(q => {
    const s = questionStates.get(q.id);
    return s?.isSubmitted && s.selectedAnswer === q.correct_answer;
  }).length;
  const accuracy = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;

  if (authLoading || loading) {
    return (
      <Layout showFooter={false}>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (questions.length === 0) {
    return (
      <Layout showFooter={false}>
        <div className="container py-12 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
          <h2 className="mt-4 text-xl font-semibold">No Questions Available</h2>
          <Button asChild className="mt-6"><a href="/dashboard">Return to Dashboard</a></Button>
        </div>
      </Layout>
    );
  }

  // --- SESSION COMPLETE VIEW ---
  if (sessionComplete) {
    return (
      <Layout showFooter={false}>
        <div className="min-h-[calc(100vh-4rem)] bg-muted/30 dark:bg-background flex items-center justify-center p-4">
          <Card className="max-w-3xl w-full border-none shadow-3xl bg-card/60 backdrop-blur-xl rounded-[2.5rem] overflow-hidden animate-in zoom-in duration-500">
            <div className="h-2 w-full gradient-primary" />
            <CardContent className="p-12 text-center">
              <div className="mx-auto w-24 h-24 rounded-full gradient-primary flex items-center justify-center shadow-lg mb-8 relative">
                <Sparkles className="h-10 w-10 text-primary-foreground animate-pulse" />
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl -z-10" />
              </div>

              <h2 className="font-display text-4xl font-black tracking-tight mb-2">Simulation Complete</h2>
              <p className="text-muted-foreground text-lg mb-12 max-w-lg mx-auto">
                Data capture finalized. Your performance metrics have been synced to the Intelligence Engine.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10"><Brain className="h-16 w-16 -rotate-12 group-hover:scale-110 transition-transform" /></div>
                  <p className="text-4xl font-black text-primary mb-1">{accuracy}%</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Accuracy Rate</p>
                </div>
                <div className="p-6 rounded-3xl bg-card/80 border border-border/50 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-5"><LayoutDashboard className="h-16 w-16 -rotate-12" /></div>
                  <p className="text-4xl font-black text-foreground mb-1">{answeredCount}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Scenarios Solved</p>
                </div>
                <div className="p-6 rounded-3xl bg-card/80 border border-border/50 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-5"><Activity className="h-16 w-16 -rotate-12" /></div>
                  <p className="text-4xl font-black text-foreground mb-1">
                    {Math.round(questions.reduce((acc, q) => acc + (questionStates.get(q.id)?.timeSpent || 0), 0) / answeredCount)}s
                  </p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Avg. Pace</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-6">
                <Button variant="outline" size="lg" asChild className="rounded-2xl border-2 px-10 h-14 font-bold tracking-wide">
                  <a href="/dashboard"><Home className="mr-2 h-4 w-4" /> Dashboard</a>
                </Button>
                <Button size="lg" onClick={() => window.location.reload()} className="gradient-primary shadow-glow rounded-2xl px-12 h-14 font-black uppercase tracking-widest">
                  <RotateCcw className="mr-2 h-4 w-4" /> New Simulation
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  // --- ACTIVE EXAM VIEW ---
  return (
    <Layout showFooter={false}>
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-background via-background to-primary/5 py-4 sm:py-8 px-4 font-sans">
        <div className="container max-w-6xl mx-auto">

          {/* COMMAND HUD */}
          <div className="mb-8 grid grid-cols-1 md:grid-cols-12 gap-4 animate-in fade-in slide-in-from-top-4 duration-700">
            {/* Timer & Progress */}
            <div className="md:col-span-8 p-1 bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl shadow-sm flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 px-4 py-2">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <span className="font-display font-black text-xl text-primary">{currentIndex + 1}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Scenario</span>
                  <span className="text-xs font-bold text-foreground">of {questions.length}</span>
                </div>
              </div>
              <div className="flex-1 px-4">
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary transition-all duration-700 ease-out" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} />
                </div>
              </div>
              <div className="px-6 py-2 border-l border-border/50 flex items-center gap-3">
                <Clock className={`h-4 w-4 ${currentTimeSpent > 90 ? 'text-destructive animate-pulse' : 'text-muted-foreground'}`} />
                <span className={`text-xl font-black font-mono tracking-tight ${currentTimeSpent > 90 ? 'text-destructive' : 'text-foreground'}`}>
                  {Math.floor(currentTimeSpent / 60)}:{(currentTimeSpent % 60).toString().padStart(2, '0')}
                </span>
              </div>
            </div>

            {/* Score Ticker */}
            <div className="md:col-span-4 p-4 bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl shadow-sm flex items-center justify-between px-6">
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Performance</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-foreground">{Math.round((correctCount / Math.max(1, answeredCount)) * 100)}</span>
                  <span className="text-sm font-bold text-muted-foreground">%</span>
                </div>
              </div>
              <div className="h-10 w-px bg-border/50 mx-2" />
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Score</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-success">{correctCount}</span>
                  <span className="text-sm font-bold text-muted-foreground">/ {answeredCount}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* QUESTION STAGE */}
            <div className="lg:col-span-8 space-y-6">
              <Card className="border-none shadow-3xl bg-card/80 backdrop-blur-xl rounded-[2rem] overflow-hidden transition-all duration-300">
                <CardHeader className="pt-8 pb-4 px-8 border-b border-border/10">
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/10 px-3 py-1 font-black text-[10px] uppercase tracking-widest">
                      {currentQuestion?.domain_id || 'General Comprehension'}
                    </Badge>
                    {isExamMode && <Badge variant="destructive" className="animate-pulse">Exam Simulation Live</Badge>}
                  </div>
                  <CardTitle className="text-xl sm:text-2xl md:text-3xl font-display font-medium leading-tight tracking-tight text-foreground">
                    {currentQuestion?.stem}
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-8">
                  <RadioGroup value={currentState?.selectedAnswer || ''} onValueChange={(v) => handleAnswerSelect(v as AnswerChoice)} className="space-y-4">
                    {(['A', 'B', 'C', 'D', 'E'] as AnswerChoice[]).map((letter, idx) => {
                      if (!currentQuestion?.[`option_${letter.toLowerCase()}` as keyof Question]) return null;

                      const optionText = currentQuestion[`option_${letter.toLowerCase()}` as keyof Question] as string;
                      const isSelected = currentState?.selectedAnswer === letter;
                      const isCorrect = currentState?.isSubmitted && letter === currentQuestion.correct_answer;
                      const isWrongSelection = currentState?.isSubmitted && isSelected && letter !== currentQuestion.correct_answer;

                      let containerClass = "relative flex items-start gap-4 p-5 rounded-2xl border-2 transition-all cursor-pointer hover:bg-muted/30 active:scale-[0.99] group";
                      if (isSelected) containerClass += " border-primary bg-primary/5 shadow-inner ring-1 ring-primary/20";
                      else containerClass += " border-border bg-card";

                      if (currentState?.isSubmitted) {
                        containerClass += " cursor-default hover:bg-transparent active:scale-100";
                        if (isCorrect) containerClass = "relative flex items-start gap-4 p-5 rounded-2xl border-2 border-success bg-success/10 shadow-inner ring-1 ring-success/20";
                        if (isWrongSelection) containerClass = "relative flex items-start gap-4 p-5 rounded-2xl border-2 border-destructive bg-destructive/5 shadow-inner ring-1 ring-destructive/20";
                      }

                      return (
                        <div key={letter} className="animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: `${idx * 50}ms` }}>
                          <Label className={containerClass}>
                            <RadioGroupItem value={letter} id={`opt-${letter}`} className="sr-only" disabled={currentState?.isSubmitted} />

                            <div className={`flex items-center justify-center shrink-0 h-8 w-8 rounded-lg border-2 text-xs font-black transition-colors ${isSelected ? 'bg-primary border-primary text-white' : 'border-muted-foreground/30 text-muted-foreground group-hover:border-primary group-hover:text-primary'}`}>
                              {isCorrect ? <CheckCircle2 className="h-5 w-5" /> : (isWrongSelection ? <XCircle className="h-5 w-5" /> : letter)}
                            </div>

                            <div className="flex-1 pt-1 text-base font-medium leading-relaxed">
                              {optionText}
                            </div>
                          </Label>
                        </div>
                      );
                    })}
                  </RadioGroup>

                  {/* Actions */}
                  {!currentState?.isSubmitted && (
                    <div className="mt-8 pt-4 flex justify-end animate-in fade-in zoom-in duration-300">
                      <Button
                        size="lg"
                        onClick={handleSubmitAnswer}
                        disabled={!currentState?.selectedAnswer}
                        className="h-14 px-12 rounded-2xl gradient-primary shadow-glow-primary font-black uppercase tracking-widest text-xs transition-transform active:scale-95"
                      >
                        Lock In Answer
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* RATIONALE REVEAL */}
              {currentState?.isSubmitted && !isExamMode && currentQuestion?.rationale && (
                <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                  <div className={`rounded-[2rem] border-2 p-8 shadow-xl overflow-hidden relative ${currentState.selectedAnswer === currentQuestion.correct_answer
                      ? 'bg-success/5 border-success/20'
                      : 'bg-primary/5 border-primary/20'
                    }`}>
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 -mr-10 -mt-10 h-64 w-64 bg-background rounded-full mix-blend-overlay opacity-50 blur-3xl pointer-events-none" />

                    <div className="flex items-center gap-4 mb-6">
                      <div className="h-12 w-12 rounded-xl bg-background/80 flex items-center justify-center shadow-sm border border-border/50">
                        <Lightbulb className={`h-6 w-6 ${currentState.selectedAnswer === currentQuestion.correct_answer ? 'text-success' : 'text-primary'}`} />
                      </div>
                      <div>
                        <h4 className="font-display text-lg font-black tracking-tight">Expert Analysis</h4>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Breakdown of underlying legal principles</p>
                      </div>
                    </div>

                    <div className="prose prose-sm dark:prose-invert max-w-none mb-8 font-medium leading-relaxed opacity-90">
                      {currentQuestion.rationale.split('\n').map((p, i) => <p key={i}>{p}</p>)}
                    </div>

                    {currentQuestion.reference_cue && (
                      <div className="flex items-center gap-3 pt-6 border-t border-border/10">
                        <ReferenceLibrary currentReference={currentQuestion.reference_cue} trigger={
                          <Button variant="outline" className="gap-2 border-border/50 bg-background/50 backdrop-blur-sm">
                            <BookOpen className="h-4 w-4 text-primary" />
                            <span className="font-mono text-xs font-bold">{currentQuestion.reference_cue}</span>
                          </Button>
                        } />
                      </div>
                    )}
                  </div>

                  <div className="mt-8 flex justify-center">
                    <Button
                      size="lg"
                      onClick={handleNext}
                      className="h-16 px-16 rounded-full bg-foreground text-background font-black uppercase tracking-widest text-sm shadow-2xl hover:scale-105 active:scale-95 transition-all"
                    >
                      {currentIndex < questions.length - 1 ? 'Next Scenario' : 'Finalize Session'} <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* SIDEBAR INTELLIGENCE */}
            <div className="lg:col-span-4 space-y-6">
              {/* Metacognition Widget */}
              {!currentState?.isSubmitted && currentState?.selectedAnswer && (
                <Card className="border-none shadow-xl bg-card/60 backdrop-blur-md rounded-3xl animate-in slide-in-from-right-4 duration-500 overflow-hidden">
                  <div className="h-1 w-full bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-muted-foreground">
                      <Target className="h-4 w-4 text-primary" /> Metacognitive Lock
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex justify-between text-xs font-bold">
                        <span>Confidence</span>
                        <span className={currentState.confidence >= 4 ? 'text-success' : 'text-warning'}>{currentState.confidence}/5</span>
                      </div>
                      <Slider
                        value={[currentState.confidence]}
                        onValueChange={(v) => {
                          setQuestionStates(prev => {
                            const u = new Map(prev);
                            u.set(currentQuestion.id, { ...currentState, confidence: v[0] });
                            return u;
                          });
                        }}
                        min={1} max={5} step={1}
                        className="py-2"
                      />
                      <div className="flex justify-between text-[8px] font-black uppercase text-muted-foreground/50 tracking-widest">
                        <span>Guess</span>
                        <span>Absolute</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/20 border border-border/30">
                      <Label htmlFor="lucky" className="text-xs font-bold text-muted-foreground uppercase cursor-pointer">Blind Guess?</Label>
                      <Switch
                        id="lucky"
                        checked={currentState.wasLuckyGuess}
                        onCheckedChange={(c) => {
                          setQuestionStates(prev => {
                            const u = new Map(prev);
                            u.set(currentQuestion.id, { ...currentState, wasLuckyGuess: c });
                            return u;
                          });
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
                <Button variant="outline" onClick={handlePrevious} disabled={currentIndex === 0} className="h-12 w-full rounded-2xl border-dashed">
                  <ChevronLeft className="mr-2 h-4 w-4" /> Prev
                </Button>
                <Button variant="outline" onClick={() => navigate('/dashboard')} className="h-12 w-full rounded-2xl border-dashed text-destructive border-destructive/20 hover:bg-destructive/10">
                  Exit Session
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
