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
        <Card className="overflow-hidden border-none shadow-3xl bg-card/60 backdrop-blur-xl rounded-[2.5rem] ring-1 ring-white/5 relative h-full">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

            <CardHeader className="p-8 border-b border-white/5 relative z-10">
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 shadow-glow-primary/20">
                        <Award className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <CardTitle className="text-sm font-black uppercase tracking-widest">Readiness Score</CardTitle>
                        <CardDescription className="text-xs">Based on your study progress</CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-8 relative z-10">
                {/* Main Score */}
                <div className="text-center mb-10">
                    <div className="relative inline-block">
                        <div className={`text-7xl font-black bg-clip-text text-transparent bg-gradient-to-b ${data.overallScore >= 80 ? 'from-emerald-400 to-emerald-600' :
                                data.overallScore >= 60 ? 'from-amber-400 to-amber-600' :
                                    'from-red-400 to-red-600'
                            }`}>
                            {data.overallScore}%
                        </div>
                    </div>

                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mt-2">{getScoreLabel(data.overallScore)}</p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-2 mb-10">
                    {[
                        { label: 'Questions', value: data.totalAttempts },
                        { label: 'Study Days', value: data.studyDays },
                        { label: 'Day Streak', value: data.streakDays }
                    ].map((stat, i) => (
                        <div key={i} className="text-center p-3 rounded-2xl bg-white/5 border border-white/5">
                            <p className="text-xl font-black">{stat.value}</p>
                            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-70">{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* Domain Breakdown */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <TrendingUp className="h-3 w-3" />
                            Domain Mastery
                        </h4>
                    </div>

                    <div className="space-y-4">
                        {data.domainScores.map((domain) => (
                            <div key={domain.domainId} className="group">
                                <div className="flex items-center justify-between text-xs mb-1.5">
                                    <span className="font-bold truncate max-w-[160px]">{domain.domainName}</span>
                                    <span className={`font-black ${domain.accuracy >= 80 ? 'text-emerald-500' :
                                            domain.accuracy >= 60 ? 'text-amber-500' :
                                                'text-muted-foreground'
                                        }`}>
                                        {domain.status === 'not_started' ? '--' : `${domain.accuracy}%`}
                                    </span>
                                </div>
                                <div className="h-1.5 w-full bg-muted/20 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-1000 ${domain.accuracy >= 80 ? 'bg-emerald-500 shadow-glow-emerald' :
                                                domain.accuracy >= 60 ? 'bg-amber-500 shadow-glow-amber' :
                                                    'bg-muted-foreground/30'
                                            }`}
                                        style={{ width: `${domain.status === 'not_started' ? 0 : domain.accuracy}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
