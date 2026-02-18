import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
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
  Database,
  AlertTriangle,
  Rocket,
  Shield,
  Activity,
  Layers
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
              strongestDomain = domainId;
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
        // Set basic data even on error
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
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-background via-background to-primary/5 py-8 px-4">
        <div className="container max-w-7xl mx-auto space-y-8">

          {/* ALERT: SEEDING REQUIRED */}
          {data?.questionsCount === 0 && (
            <div className="rounded-2xl bg-destructive/5 border border-destructive/20 p-6 flex items-start gap-4 animate-in slide-in-from-top-4 backdrop-blur-sm">
              <div className="p-3 rounded-xl bg-destructive/10 text-destructive">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-display font-bold text-destructive flex items-center gap-2">
                  System Alert: Database Empty
                </h3>
                <p className="text-muted-foreground text-sm">
                  The tactical database has not been seeded. Please initialize content to begin training operations.
                </p>
                <div className="pt-2 flex items-center gap-2">
                  <Button variant="destructive" size="sm" asChild className="rounded-xl font-bold uppercase tracking-wider text-[10px]">
                    <Link to="/admin">Initialize via Admin</Link>
                  </Button>
                  <code className="px-2 py-1 bg-muted rounded text-[10px] font-mono">npm run seed</code>
                </div>
              </div>
            </div>
          )}

          {/* HERO: MISSION CONTROL */}
          <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6 pb-6 border-b border-border/40 animate-in fade-in duration-700">
            <div className="space-y-2">
              <Badge variant="outline" className="w-fit bg-primary/5 text-primary border-primary/20 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em]">
                Mission Control
              </Badge>
              <h1 className="font-display text-4xl md:text-5xl font-black tracking-tight text-foreground">
                Welcome back, <span className="text-primary italic">{data?.profile?.display_name || 'Candidate'}</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl">
                Your neural feedback loop is active. {daysUntilExam !== null ? `Target acquisition (Exam) in ${daysUntilExam} days.` : 'Systems nominal.'}
              </p>
            </div>

            <Button size="lg" asChild className="h-14 px-8 rounded-2xl gradient-primary shadow-glow text-background font-black uppercase tracking-widest hover:scale-105 transition-transform">
              <Link to="/study?mode=quick_drill" className="gap-2">
                <Rocket className="h-5 w-5" />
                Quick Launch
              </Link>
            </Button>
          </div>

          {/* STATS: COMMAND CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Day Streak', value: data?.streak?.current_streak || 0, icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/10' },
              { label: 'Global Accuracy', value: `${accuracyRate}%`, icon: Target, color: 'text-success', bg: 'bg-success/10' },
              { label: 'Scenarios Run', value: data?.totalAttempts || 0, icon: Activity, color: 'text-blue-500', bg: 'bg-blue-500/10' },
              { label: 'Daily Ops', value: data?.attemptsToday || 0, icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-500/10' },
            ].map((stat, i) => (
              <Card key={i} className="border-none shadow-xl bg-card/60 backdrop-blur-xl hover:bg-card/80 transition-colors group">
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">{stat.label}</p>
                    <p className="font-display text-3xl font-black">{stat.value}</p>
                  </div>
                  <div className={`h-12 w-12 rounded-2xl ${stat.bg} flex items-center justify-center ${stat.color} group-hover:scale-110 transition-transform`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* LAUNCHPAD (Left Col) */}
            <div className="lg:col-span-8 space-y-8">
              {/* Exam Readiness */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-xl font-bold flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" /> Readiness Assessment
                  </h2>
                </div>
                <ExamReadinessScore userId={user.id} />
              </div>

              {/* Strategic Modules */}
              <div className="space-y-4">
                <h2 className="font-display text-xl font-bold flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" /> Strategic Modules
                </h2>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* Card 1: Rapid Fire */}
                  <Link to="/study?mode=quick_drill" className="group block h-full">
                    <div className="relative overflow-hidden rounded-[2rem] bg-card border border-border/50 p-6 hover:border-primary/50 transition-all hover:shadow-lg h-full flex flex-col">
                      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Zap className="h-24 w-24 text-primary -rotate-12" />
                      </div>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                          <Zap className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-display font-bold text-lg">Rapid Fire</h3>
                          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Est. 15 Min</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground font-medium mt-auto">
                        High-velocity drills targeting your weakest sub-domains. Built for speed and retention.
                      </p>
                    </div>
                  </Link>

                  {/* Card 2: Knowledge Forge */}
                  <Link to="/flashcards" className="group block h-full">
                    <div className="relative overflow-hidden rounded-[2rem] bg-card border border-border/50 p-6 hover:border-secondary/50 transition-all hover:shadow-lg h-full flex flex-col">
                      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <BookOpen className="h-24 w-24 text-secondary -rotate-12" />
                      </div>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="h-12 w-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary group-hover:scale-110 transition-transform">
                          <Brain className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-display font-bold text-lg">Knowledge Forge</h3>
                          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Est. 10 Min</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground font-medium mt-auto">
                        Spaced repetition system for definitions and key legal concepts.
                      </p>
                    </div>
                  </Link>

                  {/* Card 3: Deep Dive */}
                  <Link to="/study?mode=mixed_review" className="group block h-full">
                    <div className="relative overflow-hidden rounded-[2rem] bg-card border border-border/50 p-6 hover:border-info/50 transition-all hover:shadow-lg h-full flex flex-col">
                      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <BarChart3 className="h-24 w-24 text-info -rotate-12" />
                      </div>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="h-12 w-12 rounded-2xl bg-info/10 flex items-center justify-center text-info group-hover:scale-110 transition-transform">
                          <BarChart3 className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-display font-bold text-lg">Deep Dive</h3>
                          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Est. 20 Min</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground font-medium mt-auto">
                        Interleaved practice across all 8 Customs Broker Exam domains.
                      </p>
                    </div>
                  </Link>

                  {/* Card 4: Full Sim */}
                  <Link to="/study?mode=exam_simulation" className="group block h-full">
                    <div className="relative overflow-hidden rounded-[2rem] bg-card border border-border/50 p-6 hover:border-accent/50 transition-all hover:shadow-lg h-full flex flex-col">
                      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Clock className="h-24 w-24 text-accent -rotate-12" />
                      </div>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="h-12 w-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
                          <Clock className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-display font-bold text-lg">Full Sim</h3>
                          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Est. 90 Min</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground font-medium mt-auto">
                        80-question CBLE simulation mirroring real exam conditions.
                      </p>
                    </div>
                  </Link>
                </div>
              </div>
            </div>

            {/* SIDEBAR: CAREER PROFILE (Right Col) */}
            <div className="lg:col-span-4 space-y-6">
              <Card className="border-none shadow-xl bg-card/60 backdrop-blur-xl h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-muted-foreground">
                    <Target className="h-4 w-4 text-primary" /> Career Trajectory
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-8">
                  <LevelProgress
                    totalCorrect={data?.totalCorrect || 0}
                    totalAttempts={data?.totalAttempts || 0}
                    streak={data?.streak?.current_streak || 0}
                  />

                  <div className="pt-4 border-t border-border/50">
                    <AchievementsList
                      totalCorrect={data?.totalCorrect || 0}
                      totalAttempts={data?.totalAttempts || 0}
                      streak={data?.streak?.current_streak || 0}
                      strongestDomain={data?.strongestDomain}
                    />
                  </div>

                  <div className="pt-4 border-t border-border/50">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold uppercase text-muted-foreground">Bank Coverage</span>
                      <span className="text-xs font-bold">{progressPercent}%</span>
                    </div>
                    <Progress value={Math.min(progressPercent, 100)} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
