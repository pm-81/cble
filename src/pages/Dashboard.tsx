import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ExamReadinessScore } from '@/components/ExamReadinessScore';
import { LevelProgress } from '@/components/Gamification/LevelProgress';
import { AchievementsList } from '@/components/Gamification/AchievementsList';
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
  CheckCircle2,
  Database
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
  strongestDomain: string | null;
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
          .select('is_correct, domain_id')
          .eq('user_id', user.id);

        // Calculate strongest domain
        const domainPerformance = new Map<string, { correct: number, total: number }>();
        allAttempts?.forEach(a => {
          if (a.domain_id) {
            const curr = domainPerformance.get(a.domain_id) || { correct: 0, total: 0 };
            domainPerformance.set(a.domain_id, {
              correct: curr.correct + (a.is_correct ? 1 : 0),
              total: curr.total + 1
            });
          }
        });

        let strongestDomain = null;
        let maxAccuracy = -1;

        // Only consider domains with at least 5 attempts
        domainPerformance.forEach((stats, domainId) => {
          if (stats.total >= 5) {
            const acc = stats.correct / stats.total;
            if (acc > maxAccuracy) {
              maxAccuracy = acc;
              strongestDomain = domainId; // Ideally we'd map this to a name, but ID works for a boolean check in achievements 
            }
          }
        });

        setData({
          profile: profile || null,
          streak: streak || null,
          questionsCount: questionsCount || 0,
          attemptsToday: todayAttempts?.length || 0,
          correctToday: todayAttempts?.filter(a => a.is_correct).length || 0,
          totalAttempts: allAttempts?.length || 0,
          totalCorrect: allAttempts?.filter(a => a.is_correct).length || 0,
          strongestDomain,
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Set basic data even on error to prevent crash
        setData({
          profile: null,
          streak: null,
          questionsCount: 0,
          attemptsToday: 0,
          correctToday: 0,
          totalAttempts: 0,
          totalCorrect: 0,
          strongestDomain: null,
        });
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
        {/* Setup Wizard Banner */}
        {data?.questionsCount === 0 && (
          <div className="mb-8 rounded-2xl bg-amber-50 border border-amber-200 p-6 dark:bg-amber-900/20 dark:border-amber-800">
            <div className="flex gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-800/30 dark:text-amber-400">
                <Database className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-amber-900 dark:text-amber-100">Setup Required</h2>
                <p className="text-amber-700 dark:text-amber-300 mt-1">
                  It looks like your database hasn't been seeded yet. You need content to start studying!
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Button asChild size="sm" className="bg-amber-600 hover:bg-amber-700 text-white border-none">
                    <Link to="/admin">Go to Admin Portal</Link>
                  </Button>
                  <code className="px-2 py-1 bg-amber-100 dark:bg-amber-800/40 rounded text-xs flex items-center">
                    npm run seed
                  </code>
                </div>
              </div>
            </div>
          </div>
        )}

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
        <div className="mb-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="card-premium group hover:translate-y-[-4px]">
            <CardContent className="flex items-center gap-5 p-6 bg-gradient-to-br from-card to-white/5 dark:from-card dark:to-white/5">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-accent group-hover:scale-110 transition-transform">
                <Flame className="h-7 w-7" />
              </div>
              <div>
                <p className="text-3xl font-black">{data?.streak?.current_streak || 0}</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Day Streak</p>
              </div>
            </CardContent>
          </Card>

          <Card className="card-premium group hover:translate-y-[-4px]">
            <CardContent className="flex items-center gap-5 p-6 bg-gradient-to-br from-card to-white/5 dark:from-card dark:to-white/5">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-success/10 text-success group-hover:scale-110 transition-transform">
                <Target className="h-7 w-7" />
              </div>
              <div>
                <p className="text-3xl font-black">{accuracyRate}%</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Accuracy</p>
              </div>
            </CardContent>
          </Card>

          <Card className="card-premium group hover:translate-y-[-4px]">
            <CardContent className="flex items-center gap-5 p-6 bg-gradient-to-br from-card to-white/5 dark:from-card dark:to-white/5">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-info/10 text-info group-hover:scale-110 transition-transform">
                <Brain className="h-7 w-7" />
              </div>
              <div>
                <p className="text-3xl font-black">{data?.totalAttempts || 0}</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Drills</p>
              </div>
            </CardContent>
          </Card>

          <Card className="card-premium group hover:translate-y-[-4px]">
            <CardContent className="flex items-center gap-5 p-6 bg-gradient-to-br from-card to-white/5 dark:from-card dark:to-white/5">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                <TrendingUp className="h-7 w-7" />
              </div>
              <div>
                <p className="text-3xl font-black">{data?.attemptsToday || 0}</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Today's Progress</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Exam Readiness Score */}
          <ExamReadinessScore userId={user.id} />
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
                      Adaptive practice tests focusing on weak 19 CFR domains and HTSUS classification.
                    </p>
                  </div>
                </Link>

                <Link to="/flashcards" className="block">
                  <div className="group rounded-xl border p-4 transition-all hover:border-primary hover:shadow-md">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                        <BookOpen className="h-5 w-5" />
                      </div>
                      <span className="text-xs text-muted-foreground">~10 min</span>
                    </div>
                    <h3 className="font-semibold">Flashcard Review</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Spaced repetition for customs definitions and legal key terms.
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
                      Interleaved practice across all 8 Customs Broker Exam domains.
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
                      Timed 80-question CBLE simulation mirroring real exam conditions.
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

          {/* Gamification Panel */}
          <Card className="flex flex-col h-full">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Your Journey
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 space-y-6">
              <LevelProgress
                totalCorrect={data?.totalCorrect || 0}
                totalAttempts={data?.totalAttempts || 0}
                streak={data?.streak?.current_streak || 0}
              />
              <div className="border-t pt-4">
                <AchievementsList
                  totalCorrect={data?.totalCorrect || 0}
                  totalAttempts={data?.totalAttempts || 0}
                  streak={data?.streak?.current_streak || 0}
                  strongestDomain={data?.strongestDomain}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
