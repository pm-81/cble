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
        const { data } = await supabase
            .from('profiles')
            .select('exam_date, weekly_study_minutes, preferred_session_length')
            .eq('user_id', user!.id)
            .single();
        if (data) setPlanData(data as StudyPlanData);
        setLoading(false);
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

        return weekDays.map((date, i) => {
            const dayOfWeek = date.getDay(); // 0=Sun
            const isStudyDay = STUDY_DAYS.includes(dayOfWeek);
            if (!isStudyDay) return { date, sessions: [], completed: isBefore(date, new Date()) };

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
            <Layout>
                <div className="flex min-h-[60vh] items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="container max-w-4xl py-8 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="font-display text-2xl font-bold flex items-center gap-2">
                        <CalendarDays className="h-6 w-6 text-primary" />
                        Study Plan
                    </h1>
                    {daysUntilExam !== null && daysUntilExam > 0 && (
                        <Badge variant="outline" className="text-sm px-3 py-1">
                            <Target className="h-3 w-3 mr-1" />
                            {daysUntilExam} days until exam
                        </Badge>
                    )}
                </div>

                {/* Stats */}
                {planData && (
                    <div className="grid grid-cols-3 gap-4">
                        <Card>
                            <CardContent className="pt-4 text-center">
                                <Clock className="h-5 w-5 mx-auto mb-1 text-blue-500" />
                                <p className="text-2xl font-bold">{planData.weekly_study_minutes}</p>
                                <p className="text-xs text-muted-foreground">min/week goal</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-4 text-center">
                                <BookOpen className="h-5 w-5 mx-auto mb-1 text-green-500" />
                                <p className="text-2xl font-bold">{planData.preferred_session_length}</p>
                                <p className="text-xs text-muted-foreground">min/session</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-4 text-center">
                                <Sparkles className="h-5 w-5 mx-auto mb-1 text-purple-500" />
                                <p className="text-2xl font-bold">{sessionsPerWeek}</p>
                                <p className="text-xs text-muted-foreground">sessions/week</p>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Week Navigation */}
                <div className="flex items-center justify-between">
                    <Button variant="ghost" size="sm" onClick={() => setWeekOffset(w => w - 1)}>
                        <ChevronLeft className="h-4 w-4" /> Previous
                    </Button>
                    <h2 className="font-medium text-sm text-muted-foreground">
                        {format(weekStart, 'MMM d')} – {format(weekEnd, 'MMM d, yyyy')}
                    </h2>
                    <Button variant="ghost" size="sm" onClick={() => setWeekOffset(w => w + 1)}>
                        Next <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>

                {/* Daily Schedule */}
                <div className="grid gap-3">
                    {dailyPlan.map((day) => (
                        <Card
                            key={day.date.toISOString()}
                            className={`transition-all ${isToday(day.date) ? 'border-primary ring-1 ring-primary/20' : ''} ${day.completed ? 'opacity-60' : ''}`}
                        >
                            <CardContent className="py-4 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`text-center min-w-[48px] ${isToday(day.date) ? 'text-primary font-bold' : ''}`}>
                                        <p className="text-xs uppercase text-muted-foreground">{format(day.date, 'EEE')}</p>
                                        <p className="text-lg font-bold">{format(day.date, 'd')}</p>
                                    </div>
                                    {day.sessions.length > 0 ? (
                                        <div className="space-y-1">
                                            {day.sessions.map((s, i) => (
                                                <div key={i} className="flex items-center gap-2">
                                                    <span>{s.icon}</span>
                                                    <span className="text-sm font-medium">{s.label}</span>
                                                    <Badge variant="secondary" className="text-xs">{s.minutes} min</Badge>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <span className="text-sm text-muted-foreground">Rest Day 🌴</span>
                                    )}
                                </div>
                                {isToday(day.date) && day.sessions.length > 0 && (
                                    <Button size="sm" onClick={() => navigate('/study?mode=quick_drill')}>
                                        Start Now
                                    </Button>
                                )}
                                {day.completed && day.sessions.length > 0 && (
                                    <Badge variant="default" className="bg-green-500">✓ Done</Badge>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {!planData?.exam_date && (
                    <Card className="border-dashed">
                        <CardContent className="py-8 text-center space-y-3">
                            <CalendarDays className="h-8 w-8 mx-auto text-muted-foreground" />
                            <p className="text-muted-foreground">Set your exam date in <strong>Settings</strong> to generate a personalized study plan.</p>
                            <Button variant="outline" onClick={() => navigate('/settings')}>Go to Settings</Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </Layout>
    );
}
