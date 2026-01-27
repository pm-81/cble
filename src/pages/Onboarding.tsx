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
  
  // Form state
  const [examDate, setExamDate] = useState<Date | undefined>(undefined);
  const [weeklyMinutes, setWeeklyMinutes] = useState(120);
  const [sessionLength, setSessionLength] = useState(20);
  const [domainConfidence, setDomainConfidence] = useState<Record<string, number>>(
    Object.fromEntries(DOMAINS.map(d => [d, 3]))
  );

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
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

  const renderStep = () => {
    switch (STEPS[currentStep].id) {
      case 'welcome':
        return (
          <div className="text-center py-8">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full gradient-primary">
              <Sparkles className="h-10 w-10 text-primary-foreground" />
            </div>
            <h2 className="font-display text-2xl font-bold mb-4">Welcome to CBLETest!</h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              Let's set up your personalized study plan. This will take just a minute 
              and help us tailor your learning experience.
            </p>
            <div className="flex flex-wrap justify-center gap-2 max-w-lg mx-auto">
              <Badge variant="secondary" className="px-3 py-1">
                160+ Practice Questions
              </Badge>
              <Badge variant="secondary" className="px-3 py-1">
                Spaced Repetition
              </Badge>
              <Badge variant="secondary" className="px-3 py-1">
                Progress Tracking
              </Badge>
              <Badge variant="secondary" className="px-3 py-1">
                8 CBLE Domains
              </Badge>
            </div>
          </div>
        );

      case 'exam-date':
        return (
          <div className="py-4">
            <div className="text-center mb-6">
              <CalendarDays className="h-10 w-10 text-primary mx-auto mb-3" />
              <h2 className="font-display text-xl font-bold mb-2">When is your exam?</h2>
              <p className="text-muted-foreground text-sm">
                We'll create a study schedule leading up to your exam date.
              </p>
            </div>
            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={examDate}
                onSelect={setExamDate}
                disabled={(date) => date < new Date()}
                className="rounded-md border"
              />
            </div>
            {examDate && daysUntilExam && (
              <div className="text-center mt-4">
                <Badge variant="outline" className="text-primary">
                  {daysUntilExam} days until your exam
                </Badge>
              </div>
            )}
          </div>
        );

      case 'study-time':
        return (
          <div className="py-4 space-y-8">
            <div className="text-center mb-6">
              <Clock className="h-10 w-10 text-primary mx-auto mb-3" />
              <h2 className="font-display text-xl font-bold mb-2">How much time can you study?</h2>
              <p className="text-muted-foreground text-sm">
                Set realistic goals - consistency beats intensity!
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Weekly study time</Label>
                  <span className="text-sm font-medium text-primary">
                    {Math.floor(weeklyMinutes / 60)}h {weeklyMinutes % 60}m / week
                  </span>
                </div>
                <Slider
                  value={[weeklyMinutes]}
                  onValueChange={(v) => setWeeklyMinutes(v[0])}
                  min={30}
                  max={420}
                  step={15}
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>30 min</span>
                  <span>7 hours</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Preferred session length</Label>
                  <span className="text-sm font-medium text-primary">
                    {sessionLength} minutes
                  </span>
                </div>
                <Slider
                  value={[sessionLength]}
                  onValueChange={(v) => setSessionLength(v[0])}
                  min={5}
                  max={60}
                  step={5}
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>5 min (quick)</span>
                  <span>60 min (deep)</span>
                </div>
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground">
                That's about <span className="font-semibold text-foreground">
                  {Math.round(weeklyMinutes / sessionLength)}
                </span> study sessions per week
              </p>
            </div>
          </div>
        );

      case 'confidence':
        return (
          <div className="py-4">
            <div className="text-center mb-6">
              <Target className="h-10 w-10 text-primary mx-auto mb-3" />
              <h2 className="font-display text-xl font-bold mb-2">Rate your current knowledge</h2>
              <p className="text-muted-foreground text-sm">
                This helps us prioritize weak areas. Be honest!
              </p>
            </div>
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
              {DOMAINS.map((domain) => (
                <div key={domain} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium truncate max-w-[200px]" title={domain}>
                      {domain.split(' / ')[0]}
                    </Label>
                    <span className="text-xs text-muted-foreground w-20 text-right">
                      {domainConfidence[domain] === 1 && 'Beginner'}
                      {domainConfidence[domain] === 2 && 'Basic'}
                      {domainConfidence[domain] === 3 && 'Moderate'}
                      {domainConfidence[domain] === 4 && 'Strong'}
                      {domainConfidence[domain] === 5 && 'Expert'}
                    </span>
                  </div>
                  <Slider
                    value={[domainConfidence[domain]]}
                    onValueChange={(v) => setDomainConfidence(prev => ({
                      ...prev,
                      [domain]: v[0]
                    }))}
                    min={1}
                    max={5}
                    step={1}
                  />
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center gap-2 mb-4">
            {STEPS.map((step, index) => (
              <div
                key={step.id}
                className={`h-2 w-8 rounded-full transition-colors ${
                  index <= currentStep ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
          <CardDescription>Step {currentStep + 1} of {STEPS.length}</CardDescription>
        </CardHeader>
        <CardContent>
          {renderStep()}

          <div className="flex items-center justify-between mt-8 pt-4 border-t">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>

            {currentStep < STEPS.length - 1 ? (
              <Button onClick={handleNext} className="gradient-primary gap-2">
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button 
                onClick={handleComplete} 
                className="gradient-primary gap-2"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                Complete Setup
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
