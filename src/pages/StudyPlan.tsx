import { useState, useEffect, useMemo } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CalendarDays, Clock, Target, BookOpen, Sparkles, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format, addDays, differenceInDays, startOfWeek, endOfWeek, eachDayOfInterval, isToday, isBefore, isAfter, isSameDay } from 'date-fns';

interface StudyPlanData {
    exam_date: string | null;
    weekly_study_minutes: number;
    preferred_session_length: number;
}

interface DailyPlan {
    date: Date;
    sessions: { type: string; label: string; minutes: number; domain?: string }[];
    completed: boolean;
}

const SESSION_TYPES = [
    { type: 'quick_drill', label: 'Practice Questions', icon: '❓' },
    { type: 'flashcards', label: 'Flashcard Review', icon: '🃏' },
    { type: 'mixed_review', label: 'Mixed Review', icon: '🔀' },
    { type: 'exam_simulation', label: 'Exam Simulation', icon: '📝' },
];

export default function StudyPlan() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [planData, setPlanData] = useState<StudyPlanData | null>(null);
    const [loading, setLoading] = useState(true);
    const [weekOffset, setWeekOffset] = useState(0);

    useEffect(() => {
        if (user) fetchPlan();
    }, [user]);

    async function fetchPlan() {
        setLoading(true);
        try {
            const { data } = await supabase
                .from('profiles')
                .select('exam_date, weekly_study_minutes, preferred_session_length')
                .eq('user_id', user!.id)
                .single();
            if (data) setPlanData(data as StudyPlanData);
        } catch (error) {
            console.error('Error fetching plan:', error);
        } finally {
            setLoading(false);
        }
    }

    const weekStart = useMemo(() => {
        const base = startOfWeek(new Date(), { weekStartsOn: 1 });
        return addDays(base, weekOffset * 7);
    }, [weekOffset]);

    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

    const daysUntilExam = planData?.exam_date
        ? differenceInDays(new Date(planData.exam_date), new Date())
        : null;

    const sessionsPerWeek = planData
        ? Math.max(1, Math.floor(planData.weekly_study_minutes / planData.preferred_session_length))
        : 5;

    const dailyPlan: DailyPlan[] = useMemo(() => {
        if (!planData) return [];
        const sessionLen = planData.preferred_session_length;
        const STUDY_DAYS = [1, 2, 3, 4, 5, 6]; // Mon-Sat, Sun off

        return weekDays.map((date) => {
            const dayOfWeek = date.getDay(); // 0=Sun
            const isStudyDay = STUDY_DAYS.includes(dayOfWeek);
            if (!isStudyDay) return { date, sessions: [], completed: isBefore(date, new Date()) && !isToday(date) };

            const dayIndex = STUDY_DAYS.indexOf(dayOfWeek);
            const sessionType = SESSION_TYPES[dayIndex % SESSION_TYPES.length];

            return {
                date,
                sessions: [{ ...sessionType, minutes: sessionLen }],
                completed: isBefore(date, new Date()) && !isToday(date),
            };
        });
    }, [weekDays, planData]);

    if (loading) {
        return (
            <Layout showFooter={false}>
                <div className="flex min-h-[60vh] items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </Layout>
        );
    }

    return (
        <Layout showFooter={false}>
            <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5 py-10 px-4">
                <div className="container max-w-5xl mx-auto space-y-10">
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-in fade-in slide-in-from-top-4 duration-700">
                        <div className="space-y-2">
                            <Badge variant="outline" className="px-3 py-1 bg-primary/5 text-primary border-primary/10 text-[10px] uppercase font-black tracking-widest">
                                Strategic Roadmap
                            </Badge>
                            <h1 className="font-display text-4xl font-bold tracking-tight">
                                Your <span className="text-primary">Mastery Plan</span>
                            </h1>
                            <p className="text-muted-foreground text-lg max-w-md">
                                Personalized pacing to ensure you're peak-ready by your exam date.
                            </p>
                        </div>

                        {daysUntilExam !== null && (
                            <div className="flex items-center gap-4 bg-card/50 backdrop-blur-md p-4 rounded-3xl border shadow-sm">
                                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                                    <Target className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <p className="text-xs font-black uppercase tracking-widest text-muted-foreground opacity-60">The Countdown</p>
                                    <p className="text-xl font-bold">{daysUntilExam} Days Remaining</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Quick Stats Grid */}
                    {planData && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                            {[
                                { label: 'Weekly Velocity', value: `${planData.weekly_study_minutes}m`, icon: Clock, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                                { label: 'Session Depth', value: `${planData.preferred_session_length}m`, icon: BookOpen, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                                { label: 'Active Cadence', value: `${sessionsPerWeek} Slabs`, icon: Sparkles, color: 'text-purple-500', bg: 'bg-purple-500/10' },
                            ].map((stat, i) => (
                                <Card key={i} className="border-none shadow-xl bg-card/40 backdrop-blur-sm overflow-hidden group">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">{stat.label}</p>
                                                <p className="text-3xl font-black">{stat.value}</p>
                                            </div>
                                            <div className={`h-12 w-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                                <stat.icon className="h-6 w-6" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {/* Timeline Controls */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2 animate-in fade-in duration-700 delay-200">
                        <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-2xl">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setWeekOffset(w => w - 1)}
                                className="h-10 w-10 rounded-xl hover:bg-background shadow-sm"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setWeekOffset(0)}
                                className="px-4 font-bold text-xs uppercase"
                            >
                                Current Week
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setWeekOffset(w => w + 1)}
                                className="h-10 w-10 rounded-xl hover:bg-background shadow-sm"
                            >
                                <ChevronRight className="h-5 w-5" />
                            </Button>
                        </div>
                        <h2 className="font-display font-black text-sm uppercase tracking-[0.3em] text-muted-foreground">
                            {format(weekStart, 'MMM d')} <span className="mx-2 opacity-30">—</span> {format(weekEnd, 'MMM d, yyyy')}
                        </h2>
                    </div>

                    {/* Detailed Schedule Timeline */}
                    <div className="grid gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                        {dailyPlan.map((day, idx) => {
                            const active = isToday(day.date);
                            const past = day.completed;

                            return (
                                <Card
                                    key={day.date.toISOString()}
                                    className={`relative border-none overflow-hidden transition-all duration-300 group ${active ? 'bg-primary shadow-glow-primary scale-[1.02] z-10' :
                                            past ? 'opacity-40 grayscale-[0.5] bg-muted/30' :
                                                'bg-card shadow-xl hover:bg-muted/10'
                                        }`}
                                >
                                    <CardContent className="p-0">
                                        <div className="flex flex-col sm:flex-row">
                                            {/* Date Block */}
                                            <div className={`p-6 sm:w-32 flex sm:flex-col items-center justify-center gap-2 border-b sm:border-b-0 sm:border-r ${active ? 'border-white/10' : 'border-border/50'
                                                }`}>
                                                <p className={`text-[10px] font-black uppercase tracking-widest ${active ? 'text-white/60' : 'text-muted-foreground'}`}>
                                                    {format(day.date, 'EEE')}
                                                </p>
                                                <p className={`text-3xl font-black ${active ? 'text-white' : 'text-foreground'}`}>
                                                    {format(day.date, 'd')}
                                                </p>
                                            </div>

                                            {/* Content Block */}
                                            <div className="flex-1 p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
                                                <div className="flex flex-wrap items-center gap-6 text-center sm:text-left">
                                                    {day.sessions.length > 0 ? (
                                                        day.sessions.map((s, i) => (
                                                            <div key={i} className="flex items-center gap-4">
                                                                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center text-2xl ${active ? 'bg-white/10 shadow-inner' : 'bg-muted shadow-sm'
                                                                    }`}>
                                                                    {s.icon}
                                                                </div>
                                                                <div>
                                                                    <p className={`text-sm font-black uppercase tracking-widest ${active ? 'text-white' : 'text-foreground'}`}>
                                                                        {s.label}
                                                                    </p>
                                                                    <div className="flex items-center gap-2 mt-1">
                                                                        <Badge
                                                                            variant="secondary"
                                                                            className={`text-[10px] font-bold ${active ? 'bg-white/20 text-white border-none' : ''}`}
                                                                        >
                                                                            {s.minutes} MIN SLAB
                                                                        </Badge>
                                                                        <span className={`text-[10px] font-medium ${active ? 'text-white/60' : 'text-muted-foreground'}`}>
                                                                            Module Alpha
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="flex items-center gap-4 py-2">
                                                            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center bg-emerald-500/10 text-emerald-500`}>
                                                                🌴
                                                            </div>
                                                            <p className="text-sm font-bold text-muted-foreground italic uppercase tracking-widest">
                                                                Deep Rest & Recovery
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    {active && day.sessions.length > 0 && (
                                                        <Button
                                                            onClick={() => navigate('/study?mode=quick_drill')}
                                                            className="rounded-xl bg-white text-primary font-black uppercase tracking-widest text-xs h-12 px-8 hover:bg-white/90 shadow-xl active:scale-95"
                                                        >
                                                            Initiate Now
                                                        </Button>
                                                    )}
                                                    {past && day.sessions.length > 0 && (
                                                        <div className="flex items-center gap-2 text-emerald-500 font-black text-[10px] uppercase tracking-widest">
                                                            <CheckCircle2 className="h-4 w-4" />
                                                            Verified
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                    {active && (
                                        <div className="absolute top-0 right-0 p-2">
                                            <Badge className="bg-white/20 text-white text-[9px] font-black uppercase border-none backdrop-blur-md">Focus Active</Badge>
                                        </div>
                                    )}
                                </Card>
                            );
                        })}
                    </div>

                    {/* Placeholder for unset exam date */}
                    {!planData?.exam_date && (
                        <Card className="border-2 border-dashed border-border/50 bg-card/40 backdrop-blur-sm animate-in zoom-in duration-1000 delay-500">
                            <CardContent className="py-16 text-center space-y-6">
                                <div className="mx-auto h-20 w-20 rounded-3xl bg-muted flex items-center justify-center mb-4">
                                    <CalendarDays className="h-10 w-10 text-muted-foreground opacity-50" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-bold">Timeline Not Initialized</h3>
                                    <p className="text-muted-foreground max-w-sm mx-auto">
                                        Set your target exam date in <strong>Profile Settings</strong> to unlock your automated study timeline.
                                    </p>
                                </div>
                                <Button
                                    size="lg"
                                    onClick={() => navigate('/settings')}
                                    className="rounded-2xl border-2 px-10 h-14 font-black uppercase tracking-widest text-sm"
                                >
                                    Go to Settings
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </Layout>
    );
}

