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
    toast.success("Scorecard copied! Ready for sharing.");
  };

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
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
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5 py-10 px-4 pb-20">
        <div className="container max-w-6xl mx-auto space-y-12">

          {/* Hero Performance Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 animate-in fade-in slide-in-from-top-4 duration-1000">
            <div className="space-y-4 text-center md:text-left">
              <Badge
                variant="outline"
                className="px-6 py-2 bg-primary/10 text-primary border-primary/20 text-[10px] font-black uppercase tracking-[0.3em] backdrop-blur-sm"
              >
                Insight Engine v2.0
              </Badge>
              <h1 className="font-display text-5xl md:text-6xl font-black tracking-tighter">
                Performance <span className="text-primary italic">Intelligence</span>
              </h1>
              <p className="text-muted-foreground text-lg max-w-xl leading-relaxed">
                Aggregated mastery metrics parsed from your <strong>{data?.totalAttempts}</strong> simulated CBLE attempts.
              </p>
            </div>
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="lg"
                className="h-14 px-8 rounded-2xl border-2 font-black uppercase tracking-widest text-xs gap-2 group shadow-xl bg-card/50 backdrop-blur-md"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4 group-hover:rotate-12 transition-transform" />
                Export Scorecard
              </Button>
              <div className="hidden sm:flex h-14 w-14 rounded-2xl bg-primary shadow-glow-primary items-center justify-center">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          {data?.totalAttempts === 0 ? (
            <Card className="border-none shadow-3xl bg-card/40 backdrop-blur-xl rounded-[2.5rem] overflow-hidden animate-in zoom-in duration-700">
              <CardContent className="py-24 text-center space-y-8">
                <div className="mx-auto h-24 w-24 rounded-3xl bg-muted flex items-center justify-center shadow-inner">
                  <Brain className="h-12 w-12 text-muted-foreground opacity-30" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-black">Data Sink Empty</h2>
                  <p className="text-muted-foreground max-w-sm mx-auto">
                    Your performance dashboard is awaiting telemetry. Complete your initial study session to unlock cognitive mapping.
                  </p>
                </div>
                <Button size="lg" asChild className="rounded-2xl gradient-primary shadow-glow h-14 px-12 font-black uppercase tracking-widest text-xs">
                  <a href="/study">Initiate First Drill</a>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Primary Stats Grid */}
              <div className="grid gap-6 lg:grid-cols-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
                <div className="lg:col-span-4 flex flex-col h-full">
                  <ExamReadinessScore userId={user.id} />
                </div>

                <div className="lg:col-span-8 grid gap-4 grid-cols-2 sm:grid-cols-4">
                  {[
                    { label: 'Precision Rate', value: `${accuracyRate}%`, icon: Target, color: 'text-primary', bg: 'bg-primary/10' },
                    { label: 'Attempts', value: data?.totalAttempts, icon: Zap, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                    { label: 'Verified', value: data?.correctAttempts, icon: Award, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                    { label: 'Cognition', value: `${overconfidenceScore > 0 ? '+' : ''}${overconfidenceScore}%`, icon: AlertTriangle, color: overconfidenceScore > 10 ? 'text-orange-500' : 'text-slate-500', bg: overconfidenceScore > 10 ? 'bg-orange-500/10' : 'bg-slate-500/10' },
                  ].map((stat, i) => (
                    <Card key={i} className="border-none shadow-xl bg-card/40 backdrop-blur-sm p-6 hover:bg-card transition-colors group">
                      <div className={`h-10 w-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        <stat.icon className="h-5 w-5" />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60 mb-1">{stat.label}</p>
                      <p className="text-3xl font-black tracking-tight">{stat.value}</p>
                    </Card>
                  ))}

                  <Card className="col-span-2 border-none shadow-xl bg-card/40 backdrop-blur-sm p-6 flex flex-row items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Elite Domain</p>
                      <p className="text-xl font-bold truncate max-w-[180px]">{strongestDomain?.shorthand}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-black text-emerald-500">{strongestDomain?.accuracy}%</p>
                      <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Mastery</p>
                    </div>
                  </Card>

                  <Card className="col-span-2 border-none shadow-xl bg-card/40 backdrop-blur-sm p-6 flex flex-row items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Friction Area</p>
                      <p className="text-xl font-bold truncate max-w-[180px]">{weakestDomain?.shorthand}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-black text-orange-500">{weakestDomain?.accuracy}%</p>
                      <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Mastery</p>
                    </div>
                  </Card>
                </div>
              </div>

              {/* Data Visualization Environment */}
              <div className="grid gap-8 lg:grid-cols-3 animate-in fade-in duration-1000 delay-500">
                {/* Domain Mastery Radar */}
                <Card className="lg:col-span-1 border-none shadow-3xl bg-card/60 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
                  <CardHeader className="p-8 border-b border-border/10">
                    <CardTitle className="text-sm font-black uppercase tracking-widest">Cognitive Map</CardTitle>
                    <CardDescription>Topic mastery distribution</CardDescription>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data?.domainStats}>
                          <PolarGrid stroke="hsl(var(--border))" strokeOpacity={0.4} />
                          <PolarAngleAxis dataKey="shorthand" tick={{ fontSize: 9, fontWeight: 900, fill: 'hsl(var(--muted-foreground))' }} />
                          <Radar
                            name="Mastery"
                            dataKey="accuracy"
                            stroke="hsl(var(--primary))"
                            fill="hsl(var(--primary))"
                            fillOpacity={0.2}
                            strokeWidth={3}
                          />
                          <Tooltip
                            contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '1rem', border: '1px solid hsl(var(--border))', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                            itemStyle={{ fontWeight: 800, color: 'hsl(var(--primary))' }}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Progress Trend Environment */}
                <Card className="lg:col-span-2 border-none shadow-3xl bg-card/60 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
                  <CardHeader className="p-8 border-b border-border/10 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-sm font-black uppercase tracking-widest">Velocity Timeline</CardTitle>
                      <CardDescription>Question volume vs implementation accuracy</CardDescription>
                    </div>
                    <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                      <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-muted" /> Volume</div>
                      <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-primary" /> Accuracy</div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div className="h-[340px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={data?.recentTrend}>
                          <defs>
                            <linearGradient id="colorAcc" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" strokeOpacity={0.2} />
                          <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fontWeight: 800, fill: 'hsl(var(--muted-foreground))' }}
                          />
                          <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                          <YAxis yAxisId="right" orientation="right" domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                          <Tooltip
                            contentStyle={{ borderRadius: '1.5rem', backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)' }}
                          />
                          <Bar
                            yAxisId="left"
                            dataKey="attempts"
                            fill="hsl(var(--muted))"
                            radius={[8, 8, 0, 0]}
                            barSize={32}
                            name="Telemetric Volume"
                          />
                          <Area
                            yAxisId="right"
                            type="monotone"
                            dataKey="accuracy"
                            stroke="hsl(var(--primary))"
                            strokeWidth={4}
                            fillOpacity={1}
                            fill="url(#colorAcc)"
                            name="Accuracy Precision"
                          />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Calibration & Strategy Row */}
              <div className="grid gap-8 lg:grid-cols-2 animate-in fade-in duration-1000 delay-700">
                <Card className="border-none shadow-3xl bg-card/60 backdrop-blur-xl rounded-[2.5rem] p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <CardTitle className="text-sm font-black uppercase tracking-widest">Calibration Metric</CardTitle>
                      <CardDescription>Correlation of confidence to success</CardDescription>
                    </div>
                    <Sparkles className="h-6 w-6 text-primary opacity-20" />
                  </div>
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data?.confidenceVsAccuracy}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.2} />
                        <XAxis dataKey="confidence" label={{ value: 'Confidence Index', position: 'bottom', fontSize: 10, offset: 0, fontWeight: 900 }} axisLine={false} tickLine={false} />
                        <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Bar dataKey="accuracy" radius={[12, 12, 0, 0]} barSize={40}>
                          {data?.confidenceVsAccuracy.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.accuracy > 70 ? 'hsl(var(--primary))' : 'hsl(var(--accent))'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  {overconfidenceScore > 10 ? (
                    <div className="mt-8 rounded-2xl bg-orange-500/10 p-6 border border-orange-500/20">
                      <div className="flex items-center gap-3 font-black text-orange-500 text-xs uppercase tracking-widest mb-2">
                        <AlertTriangle className="h-4 w-4" />
                        Risk: Metacognitive Drift
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Your confidence baseline exceeds your actual accuracy precision by {overconfidenceScore}%. This indicative of 19 CFR legal blindspots. Reduce study velocity to improve nuance detection.
                      </p>
                    </div>
                  ) : (
                    <div className="mt-8 rounded-2xl bg-emerald-500/10 p-6 border border-emerald-500/20">
                      <div className="flex items-center gap-3 font-black text-emerald-500 text-xs uppercase tracking-widest mb-2">
                        <Check className="h-4 w-4" />
                        Precision Calibrated
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Your self-assessment index is perfectly aligned with actual performance. High metacognitive awareness detected—this is a primary indicator of first-time pass success.
                      </p>
                    </div>
                  )}
                </Card>

                <Card className="border-none shadow-3xl bg-card/60 backdrop-blur-xl rounded-[2.5rem] p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <CardTitle className="text-sm font-black uppercase tracking-widest">Mastery Optimization</CardTitle>
                      <CardDescription>Strategic delta analysis</CardDescription>
                    </div>
                    <Target className="h-6 w-6 text-primary opacity-20" />
                  </div>
                  <div className="space-y-10">
                    <div className="space-y-4">
                      <div className="flex justify-between items-end">
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Max Mastery Portfolio</span>
                        <span className="text-2xl font-black">{strongestDomain?.accuracy}%</span>
                      </div>
                      <Progress value={strongestDomain?.accuracy} className="h-4 rounded-full bg-emerald-500/10" />
                      <p className="text-xs font-bold text-muted-foreground truncate">{strongestDomain?.name}</p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-end">
                        <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">Friction Points</span>
                        <span className="text-2xl font-black">{weakestDomain?.accuracy}%</span>
                      </div>
                      <Progress value={weakestDomain?.accuracy} className="h-4 rounded-full bg-orange-500/10" />
                      <p className="text-xs font-bold text-muted-foreground truncate">{weakestDomain?.name}</p>
                    </div>

                    <div className="mt-6 p-6 rounded-3xl bg-primary shadow-glow-primary text-white">
                      <h4 className="font-black text-xs uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Zap className="h-4 w-4 fill-white" />
                        Next Strategic Phase
                      </h4>
                      <p className="text-sm font-medium leading-relaxed opacity-90">
                        The engine recommends immediate interleaved practice targeting <span className="font-black underline">{weakestDomain?.shorthand}</span>. Rectifying this delta will raise your overall Exam Readiness score by an estimated 4-6 points.
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}


