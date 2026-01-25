import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Flame, 
  Target, 
  Clock, 
  Brain, 
  TrendingUp, 
  Play,
  Calendar,
  Loader2,
  Zap,
  BookOpen,
  BarChart3,
  CheckCircle2
} from 'lucide-react';

interface DashboardData {
  profile: {
    display_name: string | null;
    exam_date: string | null;
    onboarding_completed: boolean;
  } | null;
  streak: {
    current_streak: number;
    longest_streak: number;
  } | null;
  questionsCount: number;
  attemptsToday: number;
  correctToday: number;
  totalAttempts: number;
  totalCorrect: number;
}

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    async function fetchDashboardData() {
      if (!user) return;

      try {
        const today = new Date().toISOString().split('T')[0];
        
        // Fetch profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name, exam_date, onboarding_completed')
          .eq('user_id', user.id)
          .maybeSingle();

        // Fetch streak
        const { data: streak } = await supabase
          .from('user_streaks')
          .select('current_streak, longest_streak')
          .eq('user_id', user.id)
          .maybeSingle();

        // Fetch total questions count
        const { count: questionsCount } = await supabase
          .from('questions')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true);

        // Fetch today's attempts
        const { data: todayAttempts } = await supabase
          .from('question_attempts')
          .select('is_correct')
          .eq('user_id', user.id)
          .gte('created_at', `${today}T00:00:00`);

        // Fetch all-time attempts
        const { data: allAttempts } = await supabase
          .from('question_attempts')
          .select('is_correct')
          .eq('user_id', user.id);

        setData({
          profile,
          streak,
          questionsCount: questionsCount || 0,
          attemptsToday: todayAttempts?.length || 0,
          correctToday: todayAttempts?.filter(a => a.is_correct).length || 0,
          totalAttempts: allAttempts?.length || 0,
          totalCorrect: allAttempts?.filter(a => a.is_correct).length || 0,
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [user]);

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

  const daysUntilExam = data?.profile?.exam_date 
    ? Math.ceil((new Date(data.profile.exam_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  const accuracyRate = data?.totalAttempts && data.totalAttempts > 0
    ? Math.round((data.totalCorrect / data.totalAttempts) * 100)
    : 0;

  const progressPercent = data?.questionsCount && data.questionsCount > 0
    ? Math.round((data.totalAttempts / data.questionsCount) * 100)
    : 0;

  return (
    <Layout showFooter={false}>
      <div className="container py-8">
        {/* Welcome & Quick Actions */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold">
              Welcome back{data?.profile?.display_name ? `, ${data.profile.display_name}` : ''}!
            </h1>
            <p className="mt-1 text-muted-foreground">
              {daysUntilExam !== null && daysUntilExam > 0
                ? `${daysUntilExam} days until your exam. Let's make progress today!`
                : "Ready to study? Let's keep building your mastery."}
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" asChild>
              <Link to="/study?mode=2min" className="gap-2">
                <Zap className="h-4 w-4" />
                2-Min Save
              </Link>
            </Button>
            <Button asChild className="gradient-primary shadow-glow">
              <Link to="/study" className="gap-2">
                <Play className="h-4 w-4" />
                Start Session
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
                <Flame className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">{data?.streak?.current_streak || 0}</p>
                <p className="text-sm text-muted-foreground">Day Streak</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
                <Target className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{accuracyRate}%</p>
                <p className="text-sm text-muted-foreground">Accuracy Rate</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-info/10">
                <Brain className="h-6 w-6 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold">{data?.totalAttempts || 0}</p>
                <p className="text-sm text-muted-foreground">Questions Practiced</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{data?.attemptsToday || 0}</p>
                <p className="text-sm text-muted-foreground">Today's Progress</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Today's Plan */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Today's Study Plan
              </CardTitle>
              <CardDescription>
                Recommended activities based on your progress
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Link to="/study?mode=quick_drill" className="block">
                  <div className="group rounded-xl border p-4 transition-all hover:border-primary hover:shadow-md">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Brain className="h-5 w-5" />
                      </div>
                      <span className="text-xs text-muted-foreground">~15 min</span>
                    </div>
                    <h3 className="font-semibold">Quick Drill</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Adaptive practice focusing on weak areas
                    </p>
                  </div>
                </Link>

                <Link to="/study?mode=flashcards" className="block">
                  <div className="group rounded-xl border p-4 transition-all hover:border-primary hover:shadow-md">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                        <BookOpen className="h-5 w-5" />
                      </div>
                      <span className="text-xs text-muted-foreground">~10 min</span>
                    </div>
                    <h3 className="font-semibold">Flashcard Review</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Spaced repetition for key concepts
                    </p>
                  </div>
                </Link>

                <Link to="/study?mode=mixed_review" className="block">
                  <div className="group rounded-xl border p-4 transition-all hover:border-primary hover:shadow-md">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10 text-info">
                        <BarChart3 className="h-5 w-5" />
                      </div>
                      <span className="text-xs text-muted-foreground">~20 min</span>
                    </div>
                    <h3 className="font-semibold">Mixed Review</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Interleaved practice across all domains
                    </p>
                  </div>
                </Link>

                <Link to="/study?mode=exam_simulation" className="block">
                  <div className="group rounded-xl border p-4 transition-all hover:border-primary hover:shadow-md">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                        <Clock className="h-5 w-5" />
                      </div>
                      <span className="text-xs text-muted-foreground">~90 min</span>
                    </div>
                    <h3 className="font-semibold">Exam Simulation</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Timed 80-question practice test
                    </p>
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Progress Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Progress Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span>Question Bank Coverage</span>
                  <span className="font-medium">{progressPercent}%</span>
                </div>
                <Progress value={Math.min(progressPercent, 100)} className="h-2" />
                <p className="mt-1 text-xs text-muted-foreground">
                  {data?.totalAttempts || 0} of {data?.questionsCount || 0} questions attempted
                </p>
              </div>

              {daysUntilExam !== null && daysUntilExam > 0 && (
                <div className="rounded-lg bg-muted/50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full gradient-primary text-primary-foreground font-bold">
                      {daysUntilExam}
                    </div>
                    <div>
                      <p className="font-medium">Days Until Exam</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(data?.profile?.exam_date || '').toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <h4 className="font-medium text-sm">Recent Activity</h4>
                {data?.attemptsToday && data.attemptsToday > 0 ? (
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    <span>
                      {data.correctToday}/{data.attemptsToday} correct today
                    </span>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No practice yet today. Start a session!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
