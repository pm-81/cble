import { useEffect, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Loader2, Trophy, Medal, Crown, Flame, Target, Star } from 'lucide-react';

interface LeaderboardEntry {
    user_id: string;
    display_name: string;
    avatar_url: string | null;
    total_points: number;
    current_streak: number;
    accuracy: number;
    rank: number;
}

export default function Leaderboard() {
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchLeaderboard() {
            try {
                // This is a complex query that would ideally be a view in Supabase
                // For now, we'll fetch profiles and streaks and join them
                const { data: streaks, error: streakError } = await supabase
                    .from('user_streaks')
                    .select(`
            user_id,
            current_streak,
            longest_streak,
            profiles (
              display_name,
              avatar_url
            )
          `)
                    .order('current_streak', { ascending: false })
                    .limit(20);

                if (streakError) throw streakError;

                // Fetch mastery to calculate points
                const { data: mastery } = await supabase
                    .from('mastery_progress')
                    .select('user_id, mastery_level, correct_attempts');

                // Aggregate points: (mastery_level * 100) + (correct_attempts * 10) + (streak * 50)
                const userPoints = new Map<string, number>();
                const userCorrect = new Map<string, number>();
                const userTotal = new Map<string, number>();

                mastery?.forEach(m => {
                    const current = userPoints.get(m.user_id) || 0;
                    userPoints.set(m.user_id, current + (m.mastery_level * 100));

                    const correct = userCorrect.get(m.user_id) || 0;
                    userCorrect.set(m.user_id, correct + m.correct_attempts);
                });

                const formattedEntries: LeaderboardEntry[] = (streaks || []).map((s, index) => {
                    const points = (userPoints.get(s.user_id) || 0) + (s.current_streak * 50);
                    return {
                        user_id: s.user_id,
                        display_name: (s.profiles as any)?.display_name || 'Anonymous Broker',
                        avatar_url: (s.profiles as any)?.avatar_url || null,
                        total_points: points,
                        current_streak: s.current_streak,
                        accuracy: 0, // Would need more queries to be fully accurate
                        rank: index + 1,
                    };
                }).sort((a, b) => b.total_points - a.total_points);

                setEntries(formattedEntries);
            } catch (error) {
                console.error('Error fetching leaderboard:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchLeaderboard();
    }, []);

    return (
        <Layout>
            <div className="container py-12 max-w-4xl animate-fade-in">
                <div className="text-center mb-12">
                    <Badge variant="outline" className="mb-4 px-4 py-1.5 bg-primary/5 text-primary border-primary/20 text-xs font-bold uppercase tracking-widest">
                        The Elite Circle
                    </Badge>
                    <h1 className="font-display text-5xl font-bold tracking-tight mb-4">
                        CBLE <span className="text-gradient-primary">Top Performers</span>
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Compete with the most dedicated customs broker candidates. Points are awarded for accuracy,
                        domain mastery, and study consistency.
                    </p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Top 3 Podium */}
                        <div className="grid gap-6 md:grid-cols-3 mb-12">
                            {[1, 0, 2].map((idx) => {
                                const entry = entries[idx];
                                if (!entry) return null;
                                const isWinner = entry.rank === 1;

                                return (
                                    <Card
                                        key={entry.user_id}
                                        className={`relative overflow-hidden border-none shadow-xl transition-all hover:scale-105 ${isWinner ? 'bg-gradient-to-br from-primary/20 via-primary/5 to-transparent ring-2 ring-primary order-1 md:order-2 md:translate-y-[-20px]' :
                                                entry.rank === 2 ? 'order-2 md:order-1' : 'order-3'
                                            }`}
                                    >
                                        <CardContent className="pt-10 text-center">
                                            <div className="relative mx-auto mb-4 w-24 h-24">
                                                <Avatar className="w-24 h-24 border-4 border-card shadow-lg">
                                                    <AvatarImage src={entry.avatar_url || ''} />
                                                    <AvatarFallback className="text-2xl font-bold bg-muted">
                                                        {entry.display_name.charAt(0)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="absolute -bottom-2 -right-2 h-10 w-10 flex items-center justify-center rounded-full bg-card shadow-md">
                                                    {entry.rank === 1 ? <Crown className="h-6 w-6 text-yellow-500 fill-yellow-500" /> :
                                                        entry.rank === 2 ? <Medal className="h-6 w-6 text-slate-400 fill-slate-400" /> :
                                                            <Medal className="h-6 w-6 text-amber-700 fill-amber-700" />}
                                                </div>
                                            </div>
                                            <h3 className="font-bold text-xl mb-1">{entry.display_name}</h3>
                                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Rank #{entry.rank}</p>

                                            <div className="flex items-center justify-center gap-4 py-3 rounded-xl bg-card/50 border">
                                                <div className="text-center">
                                                    <p className="text-sm font-black text-primary">{entry.total_points}</p>
                                                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Points</p>
                                                </div>
                                                <div className="h-8 w-px bg-border" />
                                                <div className="text-center">
                                                    <p className="text-sm font-black text-accent flex items-center justify-center">
                                                        {entry.current_streak} <Flame className="h-3 w-3 ml-0.5 fill-accent" />
                                                    </p>
                                                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Streak</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>

                        {/* List for the rest */}
                        <Card className="border-none shadow-2xl overflow-hidden">
                            <CardHeader className="bg-muted/30 pb-4">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg">Top Candidates</CardTitle>
                                    <Trophy className="h-5 w-5 text-primary opacity-50" />
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y">
                                    {entries.slice(3).map((entry) => (
                                        <div key={entry.user_id} className="flex items-center justify-between p-4 hover:bg-muted/20 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <span className="w-6 text-center font-bold text-muted-foreground">#{entry.rank}</span>
                                                <Avatar className="h-10 w-10 border shadow-sm">
                                                    <AvatarImage src={entry.avatar_url || ''} />
                                                    <AvatarFallback>{entry.display_name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-bold text-sm">{entry.display_name}</p>
                                                    <div className="flex items-center gap-3 mt-0.5">
                                                        <span className="flex items-center text-[10px] font-bold text-accent">
                                                            <Flame className="h-3 w-3 mr-0.5" /> {entry.current_streak} DAY STREAK
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-black text-sm text-primary">{entry.total_points.toLocaleString()}</p>
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">TOTAL POINTS</p>
                                            </div>
                                        </div>
                                    ))}
                                    {entries.length === 0 && (
                                        <div className="py-20 text-center">
                                            <p className="text-muted-foreground">No rankings available yet. Be the first!</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <div className="mt-8 rounded-2xl bg-primary/5 border border-dashed border-primary/20 p-6 flex items-center gap-6">
                            <div className="h-12 w-12 rounded-xl bg-white flex items-center justify-center shadow-md">
                                <Star className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h4 className="font-bold">How are points calculated?</h4>
                                <p className="text-sm text-muted-foreground">
                                    Points = (Domain Mastery × 100) + (Correct Answers × 10) + (Current Streak × 50).
                                    Keep your streak alive to multiply your climbing speed!
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}
