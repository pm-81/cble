import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Loader2, TrendingUp, Target, Brain, AlertTriangle, Clock, Award } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

interface AnalyticsData {
  totalAttempts: number;
  correctAttempts: number;
  averageConfidence: number;
  domainStats: {
    name: string;
    attempts: number;
    correct: number;
    accuracy: number;
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

const COLORS = ['hsl(173, 80%, 40%)', 'hsl(262, 80%, 50%)', 'hsl(25, 95%, 53%)', 'hsl(142, 76%, 36%)', 'hsl(199, 89%, 48%)', 'hsl(340, 75%, 55%)', 'hsl(45, 93%, 47%)', 'hsl(215, 16%, 47%)'];

export default function Analytics() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    async function fetchAnalytics() {
      if (!user) return;

      try {
        // Fetch all attempts with question domain info
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

        // Calculate basic stats
        const totalAttempts = attempts.length;
        const correctAttempts = attempts.filter(a => a.is_correct).length;
        const totalConfidence = attempts.reduce((sum, a) => sum + (a.confidence_rating || 3), 0);
        const averageConfidence = totalConfidence / totalAttempts;

        // Calculate domain stats
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
          name: name.length > 20 ? name.substring(0, 20) + '...' : name,
          attempts: stats.attempts,
          correct: stats.correct,
          accuracy: Math.round((stats.correct / stats.attempts) * 100),
        }));

        // Calculate recent trend (last 7 days)
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

        // Calculate confidence vs accuracy
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

  return (
    <Layout showFooter={false}>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold">Analytics</h1>
          <p className="mt-1 text-muted-foreground">
            Track your progress and identify areas for improvement
          </p>
        </div>

        {data?.totalAttempts === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Brain className="mx-auto h-12 w-12 text-muted-foreground" />
              <h2 className="mt-4 text-xl font-semibold">No Data Yet</h2>
              <p className="mt-2 text-muted-foreground">
                Start practicing to see your analytics and progress!
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Summary Stats */}
            <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{accuracyRate}%</p>
                    <p className="text-sm text-muted-foreground">Overall Accuracy</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-info/10">
                    <Brain className="h-6 w-6 text-info" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{data?.totalAttempts}</p>
                    <p className="text-sm text-muted-foreground">Total Questions</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
                    <Award className="h-6 w-6 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{data?.correctAttempts}</p>
                    <p className="text-sm text-muted-foreground">Correct Answers</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center gap-4 p-6">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${overconfidenceScore > 10 ? 'bg-warning/10' : 'bg-muted'}`}>
                    <AlertTriangle className={`h-6 w-6 ${overconfidenceScore > 10 ? 'text-warning' : 'text-muted-foreground'}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{overconfidenceScore > 0 ? `+${overconfidenceScore}` : overconfidenceScore}%</p>
                    <p className="text-sm text-muted-foreground">Confidence Gap</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Domain Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance by Domain</CardTitle>
                  <CardDescription>Accuracy across different exam topics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data?.domainStats} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" domain={[0, 100]} />
                        <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                        <Tooltip formatter={(value) => [`${value}%`, 'Accuracy']} />
                        <Bar dataKey="accuracy" fill="hsl(173, 80%, 40%)" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Trend */}
              <Card>
                <CardHeader>
                  <CardTitle>7-Day Activity</CardTitle>
                  <CardDescription>Your practice sessions this week</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={data?.recentTrend}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
                        <Tooltip />
                        <Bar yAxisId="left" dataKey="attempts" fill="hsl(var(--muted))" name="Questions" />
                        <Line yAxisId="right" type="monotone" dataKey="accuracy" stroke="hsl(173, 80%, 40%)" strokeWidth={2} name="Accuracy %" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Confidence vs Accuracy */}
              <Card>
                <CardHeader>
                  <CardTitle>Confidence vs Accuracy</CardTitle>
                  <CardDescription>How well-calibrated is your confidence?</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data?.confidenceVsAccuracy}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="confidence" label={{ value: 'Confidence Level', position: 'bottom' }} />
                        <YAxis domain={[0, 100]} label={{ value: 'Accuracy %', angle: -90, position: 'insideLeft' }} />
                        <Tooltip formatter={(value, name) => [name === 'accuracy' ? `${value}%` : value, name === 'accuracy' ? 'Accuracy' : 'Count']} />
                        <Bar dataKey="accuracy" fill="hsl(173, 80%, 40%)" name="accuracy" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  {overconfidenceScore > 10 && (
                    <div className="mt-4 rounded-lg bg-warning/10 p-3 text-sm">
                      <p className="flex items-center gap-2 font-medium text-warning">
                        <AlertTriangle className="h-4 w-4" />
                        Overconfidence Detected
                      </p>
                      <p className="mt-1 text-muted-foreground">
                        Your confidence tends to exceed your accuracy. Focus on careful analysis before answering.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Domain Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Practice Distribution</CardTitle>
                  <CardDescription>Questions attempted per domain</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data?.domainStats}
                          dataKey="attempts"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                        >
                          {data?.domainStats.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
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
