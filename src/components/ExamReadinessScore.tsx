import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Loader2, TrendingUp, AlertTriangle, CheckCircle2, Award } from 'lucide-react';

interface DomainScore {
    domainId: string;
    domainName: string;
    correct: number;
    total: number;
    accuracy: number;
    status: 'strong' | 'moderate' | 'weak' | 'not_started';
}

interface ReadinessData {
    overallScore: number;
    totalAttempts: number;
    totalCorrect: number;
    domainScores: DomainScore[];
    studyDays: number;
    streakDays: number;
    weakestDomain: string | null;
    strongestDomain: string | null;
}

interface ExamReadinessScoreProps {
    userId: string;
}

export function ExamReadinessScore({ userId }: ExamReadinessScoreProps) {
    const [data, setData] = useState<ReadinessData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function calculateReadiness() {
            try {
                // Fetch all domains
                const { data: domains } = await supabase
                    .from('domains')
                    .select('id, name')
                    .order('sort_order');

                // Fetch user's attempts
                const { data: attempts } = await supabase
                    .from('question_attempts')
                    .select('is_correct, domain_id, created_at')
                    .eq('user_id', userId);

                // Fetch streak
                const { data: streak } = await supabase
                    .from('user_streaks')
                    .select('current_streak')
                    .eq('user_id', userId)
                    .maybeSingle();

                if (!domains) {
                    setLoading(false);
                    return;
                }

                // Calculate domain-level stats
                const domainStats = new Map<string, { correct: number; total: number }>();
                domains.forEach(d => domainStats.set(d.id, { correct: 0, total: 0 }));

                const studyDates = new Set<string>();
                let totalCorrect = 0;

                attempts?.forEach(a => {
                    if (a.domain_id && domainStats.has(a.domain_id)) {
                        const stats = domainStats.get(a.domain_id)!;
                        stats.total++;
                        if (a.is_correct) {
                            stats.correct++;
                            totalCorrect++;
                        }
                    }
                    if (a.created_at) {
                        studyDates.add(a.created_at.split('T')[0]);
                    }
                });

                // Convert to DomainScore array
                const domainScores: DomainScore[] = domains.map(d => {
                    const stats = domainStats.get(d.id) || { correct: 0, total: 0 };
                    const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;

                    let status: 'strong' | 'moderate' | 'weak' | 'not_started' = 'not_started';
                    if (stats.total >= 5) {
                        if (accuracy >= 80) status = 'strong';
                        else if (accuracy >= 60) status = 'moderate';
                        else status = 'weak';
                    } else if (stats.total > 0) {
                        status = 'moderate'; // Not enough data
                    }

                    return {
                        domainId: d.id,
                        domainName: d.name,
                        correct: stats.correct,
                        total: stats.total,
                        accuracy,
                        status,
                    };
                });

                // Calculate overall readiness score
                // Formula: 
                // - Base: Overall accuracy (40%)
                // - Domain coverage (30%) - how many domains have 5+ attempts
                // - Domain balance (20%) - penalty for very weak domains
                // - Consistency (10%) - days studied

                const totalAttempts = attempts?.length || 0;
                const overallAccuracy = totalAttempts > 0 ? (totalCorrect / totalAttempts) * 100 : 0;

                const coveredDomains = domainScores.filter(d => d.total >= 5).length;
                const domainCoverage = (coveredDomains / domains.length) * 100;

                const weakDomains = domainScores.filter(d => d.status === 'weak').length;
                const domainBalance = Math.max(0, 100 - (weakDomains * 20));

                const studyDays = studyDates.size;
                const consistency = Math.min(100, studyDays * 5); // 20 days = 100%

                const overallScore = Math.round(
                    (overallAccuracy * 0.4) +
                    (domainCoverage * 0.3) +
                    (domainBalance * 0.2) +
                    (consistency * 0.1)
                );

                // Find weakest and strongest
                const attemptedDomains = domainScores.filter(d => d.total >= 5);
                const weakest = attemptedDomains.length > 0
                    ? attemptedDomains.reduce((a, b) => a.accuracy < b.accuracy ? a : b)
                    : null;
                const strongest = attemptedDomains.length > 0
                    ? attemptedDomains.reduce((a, b) => a.accuracy > b.accuracy ? a : b)
                    : null;

                setData({
                    overallScore,
                    totalAttempts,
                    totalCorrect,
                    domainScores,
                    studyDays,
                    streakDays: streak?.current_streak || 0,
                    weakestDomain: weakest?.domainName || null,
                    strongestDomain: strongest?.domainName || null,
                });
            } catch (error) {
                console.error('Error calculating readiness:', error);
            } finally {
                setLoading(false);
            }
        }

        calculateReadiness();
    }, [userId]);

    if (loading) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        );
    }

    if (!data) {
        return null;
    }

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-success';
        if (score >= 60) return 'text-amber-500';
        return 'text-destructive';
    };

    const getScoreLabel = (score: number) => {
        if (score >= 90) return 'Exam Ready!';
        if (score >= 80) return 'Almost There';
        if (score >= 60) return 'Making Progress';
        if (score >= 40) return 'Keep Studying';
        return 'Just Started';
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'strong': return 'bg-success/10 text-success border-success/20';
            case 'moderate': return 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border-amber-200 dark:border-amber-800';
            case 'weak': return 'bg-destructive/10 text-destructive border-destructive/20';
            default: return 'bg-muted text-muted-foreground border-muted';
        }
    };

    return (
        <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-br from-primary/5 to-accent/5 dark:from-primary/10 dark:to-accent/10">
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                        <Award className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <CardTitle className="text-lg">Exam Readiness Score</CardTitle>
                        <CardDescription>Based on your study progress</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-6">
                {/* Main Score */}
                <div className="text-center mb-6">
                    <div className={`text-6xl font-black ${getScoreColor(data.overallScore)}`}>
                        {data.overallScore}%
                    </div>
                    <p className="text-muted-foreground mt-1">{getScoreLabel(data.overallScore)}</p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6 text-center">
                    <div>
                        <p className="text-2xl font-bold">{data.totalAttempts}</p>
                        <p className="text-xs text-muted-foreground">Questions</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold">{data.studyDays}</p>
                        <p className="text-xs text-muted-foreground">Study Days</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold">{data.streakDays}</p>
                        <p className="text-xs text-muted-foreground">Day Streak</p>
                    </div>
                </div>

                {/* Domain Breakdown */}
                <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        Domain Mastery
                    </h4>
                    {data.domainScores.map((domain) => (
                        <div key={domain.domainId} className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                                <span className="truncate flex-1 mr-2">{domain.domainName}</span>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className={`text-xs ${getStatusColor(domain.status)}`}>
                                        {domain.status === 'not_started' ? 'Not started' : `${domain.accuracy}%`}
                                    </Badge>
                                </div>
                            </div>
                            <Progress
                                value={domain.status === 'not_started' ? 0 : domain.accuracy}
                                className="h-1.5"
                            />
                        </div>
                    ))}
                </div>

                {/* Insights */}
                {(data.weakestDomain || data.strongestDomain) && (
                    <div className="mt-6 space-y-2">
                        {data.strongestDomain && (
                            <div className="flex items-center gap-2 text-sm text-success">
                                <CheckCircle2 className="h-4 w-4" />
                                <span>Strongest: {data.strongestDomain}</span>
                            </div>
                        )}
                        {data.weakestDomain && (
                            <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
                                <AlertTriangle className="h-4 w-4" />
                                <span>Focus on: {data.weakestDomain}</span>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
