import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Calendar } from '@/components/ui/calendar';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  CalendarDays,
  Clock,
  Target,
  ChevronRight,
  ChevronLeft,
  Loader2,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

const STEPS = [
  { id: 'welcome', title: 'Welcome', icon: Sparkles },
  { id: 'exam-date', title: 'Exam Date', icon: CalendarDays },
  { id: 'study-time', title: 'Study Time', icon: Clock },
  { id: 'confidence', title: 'Confidence', icon: Target },
];

const DOMAINS = [
  'Entry / Entry Summary / Release',
  'Classification (HTSUS / GRIs / Notes)',
  'Valuation (19 CFR 152)',
  'Trade Programs / Origin',
  'Broker Duties / POA / Records / Bonds',
  'Marking / COO (19 CFR 134)',
  'Protests / Liquidation',
  'Other (FTZ / Drawback / In-bond / AD/CVD / PGA)',
];

export default function Onboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');

  // Form state
  const [examDate, setExamDate] = useState<Date | undefined>(undefined);
  const [weeklyMinutes, setWeeklyMinutes] = useState(120);
  const [sessionLength, setSessionLength] = useState(20);
  const [domainConfidence, setDomainConfidence] = useState<Record<string, number>>(
    Object.fromEntries(DOMAINS.map(d => [d, 3]))
  );

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setDirection('next');
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setDirection('prev');
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Update profile with onboarding data
      await supabase
        .from('profiles')
        .update({
          exam_date: examDate ? format(examDate, 'yyyy-MM-dd') : null,
          weekly_study_minutes: weeklyMinutes,
          preferred_session_length: sessionLength,
          onboarding_completed: true,
        })
        .eq('user_id', user.id);

      // Fetch domains and save confidence levels
      const { data: domains } = await supabase
        .from('domains')
        .select('id, name');

      if (domains) {
        const confidenceRecords = domains.map(domain => ({
          user_id: user.id,
          domain_id: domain.id,
          confidence_level: domainConfidence[domain.name] || 3,
        }));

        await supabase
          .from('domain_confidence')
          .upsert(confidenceRecords, { onConflict: 'user_id,domain_id' });
      }

      // Create study plan if exam date is set
      if (examDate) {
        await supabase
          .from('study_plans')
          .insert({
            user_id: user.id,
            exam_date: format(examDate, 'yyyy-MM-dd'),
            weekly_minutes: weeklyMinutes,
            session_length_minutes: sessionLength,
          });
      }

      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving onboarding data:', error);
    } finally {
      setLoading(false);
    }
  };

  const progressValue = ((currentStep + 1) / STEPS.length) * 100;
  const daysUntilExam = examDate ? differenceInDays(examDate, new Date()) : null;

  const animationClass = direction === 'next'
    ? "animate-in fade-in slide-in-from-right-8 duration-500"
    : "animate-in fade-in slide-in-from-left-8 duration-500";

  const renderStep = () => {
    switch (STEPS[currentStep].id) {
      case 'welcome':
        return (
          <div className={`text-center py-6 ${animationClass}`}>
            <div className="mx-auto mb-8 relative">
              <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
              <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent shadow-xl rotate-3">
                <Sparkles className="h-12 w-12 text-white" />
              </div>
            </div>
            <h2 className="font-display text-3xl font-bold mb-4 tracking-tight">
              Invest in your <span className="text-primary">Future</span>.
            </h2>
            <p className="text-muted-foreground text-lg max-w-md mx-auto mb-10 leading-relaxed">
              You're joining hundreds of successful brokers. Let's calibrate your experience for maximum efficiency.
            </p>
            <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto">
              {[
                { label: '460+ Questions', detail: 'Actual past exams' },
                { label: 'Smart SM-2', detail: 'Adaptive memory' },
                { label: 'Readiness Score', detail: 'Predictive data' },
                { label: '8 Domain Focus', detail: 'Complete coverage' }
              ].map((item, i) => (
                <div key={i} className="p-4 rounded-xl bg-muted/40 border border-border/50 text-left hover:bg-muted/60 transition-colors">
                  <div className="font-bold text-sm text-foreground">{item.label}</div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mt-1">{item.detail}</div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'exam-date':
        return (
          <div className={`py-4 ${animationClass}`}>
            <div className="text-center mb-8">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
                <CalendarDays className="h-6 w-6" />
              </div>
              <h2 className="font-display text-2xl font-bold mb-2">Target Exam Date</h2>
              <p className="text-muted-foreground">
                We'll build your countdown and pace your study plan.
              </p>
            </div>
            <div className="flex justify-center p-2 rounded-2xl bg-muted/30 border border-border/50">
              <Calendar
                mode="single"
                selected={examDate}
                onSelect={setExamDate}
                disabled={(date) => date < new Date()}
                className="rounded-md"
              />
            </div>
            <div className="mt-8">
              {examDate ? (
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-primary uppercase tracking-widest">Countdown Active</p>
                    <p className="text-lg font-bold">{format(examDate, 'PPP')}</p>
                  </div>
                  <Badge variant="secondary" className="px-4 py-1.5 bg-primary text-white shadow-glow">
                    {daysUntilExam} Days Left
                  </Badge>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-muted/50 border border-dashed border-border text-center">
                  <p className="text-sm text-muted-foreground italic">Select a date above to initialize your timeline</p>
                </div>
              )}
            </div>
          </div>
        );

      case 'study-time':
        return (
          <div className={`py-4 space-y-10 ${animationClass}`}>
            <div className="text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-info/10 text-info mb-4">
                <Clock className="h-6 w-6" />
              </div>
              <h2 className="font-display text-2xl font-bold mb-2">Availability</h2>
              <p className="text-muted-foreground">
                Commit to a schedule that fits your current lifestyle.
              </p>
            </div>

            <div className="space-y-8">
              <div className="p-6 rounded-2xl bg-card border shadow-sm space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-base font-bold">Goal: Hours per week</Label>
                  <div className="px-3 py-1 rounded-full bg-primary/10 text-primary font-bold text-sm">
                    {Math.floor(weeklyMinutes / 60)}h {weeklyMinutes % 60}m
                  </div>
                </div>
                <Slider
                  value={[weeklyMinutes]}
                  onValueChange={(v) => setWeeklyMinutes(v[0])}
                  min={30}
                  max={420}
                  step={15}
                  className="py-4"
                />
                <div className="flex justify-between text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  <span>Casual</span>
                  <span>Deep Work</span>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-card border shadow-sm space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-base font-bold">Session Duration</Label>
                  <div className="px-3 py-1 rounded-full bg-accent/10 text-accent font-bold text-sm">
                    {sessionLength} min
                  </div>
                </div>
                <Slider
                  value={[sessionLength]}
                  onValueChange={(v) => setSessionLength(v[0])}
                  min={5}
                  max={60}
                  step={5}
                  className="py-4"
                />
                <div className="flex justify-between text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  <span>Bite-sized</span>
                  <span>Full Focus</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-6 text-center border border-primary/10">
              <p className="text-sm font-medium">
                We recommend <span className="text-primary font-bold">{Math.round(weeklyMinutes / sessionLength)} sessions</span> per week to maintain mastery.
              </p>
            </div>
          </div>
        );

      case 'confidence':
        return (
          <div className={`py-4 ${animationClass}`}>
            <div className="text-center mb-10">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-success/10 text-success mb-4">
                <Target className="h-6 w-6" />
              </div>
              <h2 className="font-display text-2xl font-bold mb-2">Experience Level</h2>
              <p className="text-muted-foreground">
                Scale your existing knowledge for each CBLE domain.
              </p>
            </div>
            <div className="space-y-6 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
              {DOMAINS.map((domain) => {
                const confidence = domainConfidence[domain];
                const colors = [
                  'bg-destructive',
                  'bg-orange-500',
                  'bg-yellow-500',
                  'bg-green-500',
                  'bg-emerald-600'
                ];

                return (
                  <div key={domain} className="p-4 rounded-xl border bg-card/50 hover:bg-card transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div className="space-y-1">
                        <Label className="text-sm font-bold leading-tight block">
                          {domain.split(' / ')[0]}
                        </Label>
                        <p className="text-[10px] text-muted-foreground line-clamp-1 italic max-w-[240px]">
                          {domain.split('(')[1]?.replace(')', '') || 'Core Concepts'}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-black border-none text-white ${colors[confidence - 1]}`}
                      >
                        {confidence === 1 && 'BEGINNER'}
                        {confidence === 2 && 'BASIC'}
                        {confidence === 3 && 'MODERATE'}
                        {confidence === 4 && 'STRONG'}
                        {confidence === 5 && 'EXPERT'}
                      </Badge>
                    </div>
                    <Slider
                      value={[confidence]}
                      onValueChange={(v) => setDomainConfidence(prev => ({
                        ...prev,
                        [domain]: v[0]
                      }))}
                      min={1}
                      max={5}
                      step={1}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-xl shadow-2xl border-none overflow-hidden bg-card/80 backdrop-blur-xl">
        <CardHeader className="text-center pb-2 pt-8">
          <div className="flex justify-center gap-1.5 mb-6">
            {STEPS.map((step, index) => (
              <div
                key={step.id}
                className={`h-1.5 rounded-full transition-all duration-500 ${index === currentStep
                    ? 'w-12 bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]'
                    : index < currentStep
                      ? 'w-4 bg-primary/60'
                      : 'w-4 bg-muted'
                  }`}
              />
            ))}
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-50">
            Step {currentStep + 1} • {STEPS[currentStep].title}
          </p>
        </CardHeader>

        <CardContent className="px-8 pb-8">
          <div className="min-h-[460px] flex flex-col">
            <div className="flex-1">
              {renderStep()}
            </div>

            <div className="flex items-center justify-between mt-12 pt-6 border-t border-border/50">
              <Button
                variant="ghost"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="gap-2 font-bold px-6"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>

              {currentStep < STEPS.length - 1 ? (
                <Button
                  onClick={handleNext}
                  className="gradient-primary hover:shadow-glow-primary transition-all px-8 gap-2 font-bold"
                  disabled={currentStep === 1 && !examDate}
                >
                  Continue
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleComplete}
                  className="gradient-primary hover:shadow-glow-primary transition-all px-8 gap-2 font-bold"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 shadow-white" />
                  )}
                  Launch Platform
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Decorative Blur Elements */}
      <div className="fixed top-1/4 -left-20 w-80 h-80 bg-primary/10 blur-[100px] -z-10 rounded-full" />
      <div className="fixed bottom-1/4 -right-20 w-80 h-80 bg-accent/10 blur-[100px] -z-10 rounded-full" />
    </div>
  );
}

