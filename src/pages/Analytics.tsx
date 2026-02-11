import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ExamReadinessScore } from '@/components/ExamReadinessScore';
import {
  Loader2,
  TrendingUp,
  Target,
  Brain,
  AlertTriangle,
  Clock,
  Award,
  Zap,
  ChevronRight,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Share2,
  Check
} from 'lucide-react';
import { toast } from 'sonner';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  AreaChart,
  Area,
  ComposedChart
} from 'recharts';

interface AnalyticsData {
  totalAttempts: number;
  correctAttempts: number;
  averageConfidence: number;
  domainStats: {
    name: string;
    attempts: number;
    correct: number;
    accuracy: number;
    shorthand: string;
  }[];
  recentTrend: {
    date: string;
    attempts: number;
    accuracy: number;
  }[];
  confidenceVsAccuracy: {
    confidence: number;
    accuracy: number;
    count: number;
  }[];
}

const COLORS = [
  'hsl(173, 80%, 40%)',
  'hsl(262, 80%, 50%)',
  'hsl(25, 95%, 53%)',
  'hsl(142, 76%, 36%)',
  'hsl(199, 89%, 48%)',
  'hsl(340, 75%, 55%)',
  'hsl(45, 93%, 47%)',
  'hsl(215, 16%, 47%)'
];

const domainShorthands: Record<string, string> = {
  'Entry / Entry Summary / Release': 'Entry',
  'Classification (HTSUS / GRIs / Notes)': 'HTSUS',
  'Valuation (19 CFR 152)': 'Valuation',
  'Trade Programs / Origin': 'Trade',
  'Broker Duties / POA / Records / Bonds': 'Broker',
  'Marking / COO (19 CFR 134)': 'Marking',
  'Protests / Liquidation': 'Protests',
  'Other (FTZ / Drawback / In-bond / AD/CVD / PGA)': 'Other'
};

export default function Analytics() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const handleShare = () => {
    if (!data || data.totalAttempts === 0) {
      toast.error("No data to share yet! Complete some sessions first.");
      return;
    }
    const accuracy = Math.round((data.correctAttempts / data.totalAttempts) * 100);
    const topDomain = [...data.domainStats].sort((a, b) => b.accuracy - a.accuracy)[0];

    const text = `🚀 My CBLE Readiness: ${accuracy}% Accuracy | ${data.totalAttempts} Questions Done! 
🏆 Top Domain: ${topDomain.name} (${Math.round(topDomain.accuracy)}%)
Join me on CBLETest — The path to Customs Broker licensure!`;

    navigator.clipboard.writeText(text);
    toast.success("Ready to share! Copied scorecard to clipboard.");
  };

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    async function fetchAnalytics() {
      if (!user) return;

      try {
        const { data: attempts } = await supabase
          .from('question_attempts')
          .select(`
            *,
            questions (
              domain_id,
              domains (name)
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: true });

        if (!attempts || attempts.length === 0) {
          setData({
            totalAttempts: 0,
            correctAttempts: 0,
            averageConfidence: 0,
            domainStats: [],
            recentTrend: [],
            confidenceVsAccuracy: [],
          });
          setLoading(false);
          return;
        }

        const totalAttempts = attempts.length;
        const correctAttempts = attempts.filter(a => a.is_correct).length;
        const totalConfidence = attempts.reduce((sum, a) => sum + (a.confidence_rating || 3), 0);
        const averageConfidence = totalConfidence / totalAttempts;

        const domainMap = new Map<string, { attempts: number; correct: number }>();
        attempts.forEach(attempt => {
          const domainName = (attempt.questions as any)?.domains?.name || 'Unknown';
          const current = domainMap.get(domainName) || { attempts: 0, correct: 0 };
          domainMap.set(domainName, {
            attempts: current.attempts + 1,
            correct: current.correct + (attempt.is_correct ? 1 : 0),
          });
        });

        const domainStats = Array.from(domainMap.entries()).map(([name, stats]) => ({
          name,
          shorthand: domainShorthands[name] || name.substring(0, 10),
          attempts: stats.attempts,
          correct: stats.correct,
          accuracy: Math.round((stats.correct / stats.attempts) * 100),
        }));

        const last7Days = new Map<string, { attempts: number; correct: number }>();
        const now = new Date();
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          last7Days.set(dateStr, { attempts: 0, correct: 0 });
        }

        attempts.forEach(attempt => {
          const dateStr = attempt.created_at.split('T')[0];
          if (last7Days.has(dateStr)) {
            const current = last7Days.get(dateStr)!;
            last7Days.set(dateStr, {
              attempts: current.attempts + 1,
              correct: current.correct + (attempt.is_correct ? 1 : 0),
            });
          }
        });

        const recentTrend = Array.from(last7Days.entries()).map(([date, stats]) => ({
          date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
          attempts: stats.attempts,
          accuracy: stats.attempts > 0 ? Math.round((stats.correct / stats.attempts) * 100) : 0,
        }));

        const confidenceGroups = new Map<number, { correct: number; total: number }>();
        attempts.forEach(attempt => {
          const conf = attempt.confidence_rating || 3;
          const current = confidenceGroups.get(conf) || { correct: 0, total: 0 };
          confidenceGroups.set(conf, {
            correct: current.correct + (attempt.is_correct ? 1 : 0),
            total: current.total + 1,
          });
        });

        const confidenceVsAccuracy = Array.from(confidenceGroups.entries()).map(([confidence, stats]) => ({
          confidence,
          accuracy: Math.round((stats.correct / stats.total) * 100),
          count: stats.total,
        })).sort((a, b) => a.confidence - b.confidence);

        setData({
          totalAttempts,
          correctAttempts,
          averageConfidence,
          domainStats,
          recentTrend,
          confidenceVsAccuracy,
        });
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
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

  const accuracyRate = data?.totalAttempts && data.totalAttempts > 0
    ? Math.round((data.correctAttempts / data.totalAttempts) * 100)
    : 0;

  const overconfidenceScore = data?.averageConfidence && accuracyRate
    ? Math.round(((data.averageConfidence - 1) / 4 * 100) - accuracyRate)
    : 0;

  const strongestDomain = data?.domainStats.length ? [...data.domainStats].sort((a, b) => b.accuracy - a.accuracy)[0] : null;
  const weakestDomain = data?.domainStats.length ? [...data.domainStats].sort((a, b) => a.accuracy - b.accuracy)[0] : null;

  return (
    <Layout showFooter={false}>
      <div className="container py-8 space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="font-display text-4xl font-bold tracking-tight">Performance Analytics</h1>
            <p className="text-lg text-muted-foreground">
              Mastery insights from your {data?.totalAttempts} practice attempts.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="rounded-xl gap-2 shadow-sm"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4" />
              Share Readiness
            </Button>
            <Badge variant="secondary" className="px-4 py-1.5 text-sm bg-primary/10 text-primary border-primary/20">
              <TrendingUp className="h-4 w-4 mr-2" />
              Live Update
            </Badge>
          </div>
        </div>

        {data?.totalAttempts === 0 ? (
          <Card className="border-none shadow-xl bg-muted/30">
            <CardContent className="py-20 text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-card">
                <Brain className="h-10 w-10 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-bold">No Data Points Yet</h2>
              <p className="mt-2 text-muted-foreground max-w-sm mx-auto">
                Complete your first study session to unlock deep insights into your CBLE performance.
              </p>
              <Button asChild className="mt-8 gradient-primary shadow-glow">
                <a href="/study">Start First Drill</a>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Top Row: Readiness + KPI Grid - High Density Layout */}
            <div className="grid gap-6 lg:grid-cols-12">
              {/* Exam Readiness Score - Takes up 4 columns */}
              <div className="lg:col-span-4 flex flex-col h-full">
                <ExamReadinessScore userId={user.id} />
              </div>

              {/* KPI Metrics - Takes up 8 columns in a 2x2 grid */}
              <div className="lg:col-span-8 grid gap-4 grid-cols-2 sm:grid-cols-4">

                <Card className="shadow-sm border-border/50 hover:bg-muted/20 transition-colors col-span-2 sm:col-span-1">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Accuracy</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold">{accuracyRate}%</span>
                      <Target className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Overall precision</p>
                  </CardContent>
                </Card>

                <Card className="shadow-sm border-border/50 hover:bg-muted/20 transition-colors col-span-2 sm:col-span-1">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Questions</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold">{data?.totalAttempts}</span>
                      <Zap className="h-4 w-4 text-info" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Lifetime attempts</p>
                  </CardContent>
                </Card>

                <Card className="shadow-sm border-border/50 hover:bg-muted/20 transition-colors col-span-2 sm:col-span-1">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Correct</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold">{data?.correctAttempts}</span>
                      <Award className="h-4 w-4 text-success" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Valid answers</p>
                  </CardContent>
                </Card>

                <Card className="shadow-sm border-border/50 hover:bg-muted/20 transition-colors col-span-2 sm:col-span-1">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Calibration</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="flex items-baseline gap-2">
                      <span className={`text-3xl font-bold ${overconfidenceScore > 10 ? 'text-warning' : 'text-foreground'}`}>
                        {overconfidenceScore > 0 ? `+${overconfidenceScore}` : overconfidenceScore}%
                      </span>
                      <AlertTriangle className={`h-4 w-4 ${overconfidenceScore > 10 ? 'text-warning' : 'text-muted-foreground'}`} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Confidence gap</p>
                  </CardContent>
                </Card>

                {/* Secondary Stats Row within the same block for better density */}
                <Card className="col-span-2 shadow-sm border-border/50 flex flex-col justify-center p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-muted-foreground">Strongest Domain</span>
                    <Badge variant="outline" className="bg-success/5 text-success border-success/20 text-[10px]">{strongestDomain?.accuracy || 0}%</Badge>
                  </div>
                  <p className="font-bold text-sm truncate" title={strongestDomain?.name}>{strongestDomain?.shorthand || 'N/A'}</p>
                </Card>

                <Card className="col-span-2 shadow-sm border-border/50 flex flex-col justify-center p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-muted-foreground">Focus Area</span>
                    <Badge variant="outline" className="bg-destructive/5 text-destructive border-destructive/20 text-[10px]">{weakestDomain?.accuracy || 0}%</Badge>
                  </div>
                  <p className="font-bold text-sm truncate" title={weakestDomain?.name}>{weakestDomain?.shorthand || 'N/A'}</p>
                </Card>

              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {/* Domain Mastery Radar */}
              <Card className="lg:col-span-1 shadow-xl border-none overflow-hidden">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Domain Mastery</CardTitle>
                      <CardDescription>Your CBLE topic profile</CardDescription>
                    </div>
                    <Brain className="h-5 w-5 text-primary opacity-50" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data?.domainStats}>
                        <PolarGrid stroke="hsl(var(--border))" />
                        <PolarAngleAxis dataKey="shorthand" tick={{ fontSize: 10, fontWeight: 600, fill: 'hsl(var(--muted-foreground))' }} />
                        <Radar
                          name="Mastery"
                          dataKey="accuracy"
                          stroke="hsl(173, 80%, 40%)"
                          fill="hsl(173, 80%, 40%)"
                          fillOpacity={0.3}
                        />
                        <Tooltip />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between text-sm p-3 rounded-xl bg-success/5 border border-success/10">
                      <span className="text-muted-foreground">Strongest</span>
                      <span className="font-bold text-success truncate ml-2">{strongestDomain?.shorthand} ({strongestDomain?.accuracy}%)</span>
                    </div>
                    <div className="flex items-center justify-between text-sm p-3 rounded-xl bg-destructive/5 border border-destructive/10">
                      <span className="text-muted-foreground">Focus Area</span>
                      <span className="font-bold text-destructive truncate ml-2">{weakestDomain?.shorthand} ({weakestDomain?.accuracy}%)</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Progress Trend - Area Chart */}
              <Card className="lg:col-span-2 shadow-xl border-none overflow-hidden">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Consistency & Performance</CardTitle>
                      <CardDescription>Practice volume vs. accuracy over last 7 days</CardDescription>
                    </div>
                    <Calendar className="h-5 w-5 text-primary opacity-50" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-[380px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={data?.recentTrend}>
                        <defs>
                          <linearGradient id="colorAccuracy" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(173, 80%, 40%)" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(173, 80%, 40%)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                        <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                        <YAxis yAxisId="right" orientation="right" domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                        <Tooltip
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar yAxisId="left" dataKey="attempts" fill="hsl(var(--muted))" radius={[4, 4, 0, 0]} barSize={40} name="Questions" />
                        <Area
                          yAxisId="right"
                          type="monotone"
                          dataKey="accuracy"
                          stroke="hsl(173, 80%, 40%)"
                          strokeWidth={3}
                          fillOpacity={1}
                          fill="url(#colorAccuracy)"
                          name="Accuracy %"
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Calibration Chart */}
              <Card className="shadow-xl border-none">
                <CardHeader>
                  <CardTitle>Calibration Monitor</CardTitle>
                  <CardDescription>Correlation between confidence and success</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data?.confidenceVsAccuracy}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="confidence" label={{ value: 'Confidence (1-5)', position: 'bottom', fontSize: 12 }} />
                        <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} axisLine={false} tickLine={false} />
                        <Tooltip />
                        <Bar dataKey="accuracy" name="Actual Accuracy" radius={[4, 4, 0, 0]}>
                          {data?.confidenceVsAccuracy.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.accuracy > 70 ? 'hsl(173, 80%, 40%)' : 'hsl(25, 95%, 53%)'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  {overconfidenceScore > 10 ? (
                    <div className="mt-4 rounded-xl bg-warning/10 p-4 border border-warning/20">
                      <div className="flex items-center gap-2 font-bold text-warning mb-1">
                        <AlertTriangle className="h-4 w-4" />
                        Risk: Overconfidence Bias
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Your confidence ({Math.round((data?.averageConfidence || 0) * 20)}%) is significantly higher than your accuracy ({accuracyRate}%).
                        You may be overlooking subtle 19 CFR legal nuances. Slow down on questions you feel "too sure" about.
                      </p>
                    </div>
                  ) : (
                    <div className="mt-4 rounded-xl bg-success/10 p-4 border border-success/20">
                      <div className="flex items-center gap-2 font-bold text-success mb-1">
                        <Sparkles className="h-4 w-4" />
                        Excellent Calibration
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Your self-assessment matches your performance. This metacognitive awareness is key to passing the CBLE on your first attempt.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Strength/Weakness Comparison */}
              <Card className="shadow-xl border-none">
                <CardHeader>
                  <CardTitle>The 19 CFR Insight Gap</CardTitle>
                  <CardDescription>Comparison of top vs. bottom domain</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="relative pt-4 pb-2">
                    <div className="flex justify-between items-end mb-4">
                      <div className="max-w-[150px]">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Strength</p>
                        <p className="text-lg font-bold truncate">{strongestDomain?.shorthand}</p>
                      </div>
                      <p className="text-3xl font-black text-primary">{strongestDomain?.accuracy}%</p>
                    </div>
                    <Progress value={strongestDomain?.accuracy} className="h-3 rounded-full" />
                  </div>

                  <div className="relative pt-4 pb-2">
                    <div className="flex justify-between items-end mb-4">
                      <div className="max-w-[150px]">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Weakness</p>
                        <p className="text-lg font-bold truncate">{weakestDomain?.shorthand}</p>
                      </div>
                      <p className="text-3xl font-black text-destructive">{weakestDomain?.accuracy}%</p>
                    </div>
                    <Progress value={weakestDomain?.accuracy} className="h-3 rounded-full bg-destructive/10" />
                  </div>

                  <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/10">
                    <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
                      <Zap className="h-4 w-4 text-primary" />
                      Mastery Strategy
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Focus your next 3 sessions on <span className="font-bold text-foreground">{weakestDomain?.shorthand}</span>.
                      Research suggests interleaved practice here will improve your overall CBLE readiness score.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}

