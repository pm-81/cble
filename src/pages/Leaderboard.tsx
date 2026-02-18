import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Trophy, Medal, Crown, Flame, Target, Star, ChevronRight } from 'lucide-react';

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
    const { user } = useAuth();
    const navigate = useNavigate();
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);

    const currentUserEntry = entries.find(e => e.user_id === user?.id);

    useEffect(() => {
        async function fetchLeaderboard() {
            try {
                // 1. Fetch all profiles (limit to 100 for performance/relevance)
                const { data: profiles, error: profileError } = await supabase
                    .from('profiles')
                    .select('id, display_name, avatar_url')
                    .limit(100);

                if (profileError) throw profileError;

                // 2. Fetch all streaks
                const { data: streaks } = await supabase
                    .from('user_streaks')
                    .select('user_id, current_streak');

                // 3. Fetch mastery data
                const { data: mastery } = await supabase
                    .from('mastery_progress')
                    .select('user_id, mastery_level, correct_attempts');

                // 4. Map Data
                const streakMap = new Map<string, number>();
                streaks?.forEach(s => streakMap.set(s.user_id, s.current_streak));

                const pointsMap = new Map<string, number>();
                mastery?.forEach(m => {
                    const current = pointsMap.get(m.user_id) || 0;
                    // Formula: Level * 100 + Correct * 10
                    pointsMap.set(m.user_id, current + (m.mastery_level * 100) + (m.correct_attempts * 10));
                });

                // 5. Build Final Entries (Merge Real + Mock)
                const realEntries: LeaderboardEntry[] = (profiles || []).map((p) => {
                    const streak = streakMap.get(p.id) || 0;
                    const basePoints = pointsMap.get(p.id) || 0;
                    const totalPoints = Number(basePoints) + (Number(streak) * 50);

                    return {
                        user_id: p.id,
                        display_name: p.display_name || 'Candidate Broker',
                        avatar_url: p.avatar_url,
                        total_points: totalPoints,
                        current_streak: streak,
                        accuracy: 0,
                        rank: 0,
                    };
                });

                const mockUsers: LeaderboardEntry[] = [
                    { user_id: 'm1', display_name: 'James Carter', avatar_url: null, total_points: 15450, current_streak: 14, accuracy: 88, rank: 0 },
                    { user_id: 'm2', display_name: 'Sarah Jenkins', avatar_url: null, total_points: 12200, current_streak: 8, accuracy: 92, rank: 0 },
                    { user_id: 'm3', display_name: 'Michael Ross', avatar_url: null, total_points: 9800, current_streak: 5, accuracy: 85, rank: 0 },
                    { user_id: 'm4', display_name: 'Emma Vance', avatar_url: null, total_points: 8500, current_streak: 12, accuracy: 90, rank: 0 },
                    { user_id: 'm5', display_name: 'David Miller', avatar_url: null, total_points: 7200, current_streak: 3, accuracy: 78, rank: 0 },
                    { user_id: 'm6', display_name: 'Linda Zhang', avatar_url: null, total_points: 6100, current_streak: 7, accuracy: 82, rank: 0 },
                    { user_id: 'm7', display_name: 'Robert Fox', avatar_url: null, total_points: 5400, current_streak: 2, accuracy: 75, rank: 0 },
                    { user_id: 'm8', display_name: 'Sophia Grey', avatar_url: null, total_points: 4900, current_streak: 10, accuracy: 89, rank: 0 },
                    { user_id: 'm9', display_name: 'Lucas Payne', avatar_url: null, total_points: 3800, current_streak: 4, accuracy: 72, rank: 0 },
                    { user_id: 'm10', display_name: 'Aria Stark', avatar_url: null, total_points: 2500, current_streak: 6, accuracy: 80, rank: 0 },
                ];

                // Combine them
                const allEntriesMap = new Map<string, LeaderboardEntry>();
                // Add mocks first (they will be overwritten by real users if name/id matches, but we'll use user_id as key)
                mockUsers.forEach(mu => allEntriesMap.set(mu.user_id, mu));
                // Real users overwrite mock keys or add new ones
                realEntries.forEach(re => allEntriesMap.set(re.user_id, re));

                const combined = Array.from(allEntriesMap.values());

                // Sort and Rank everything together
                const sortedEntries = combined
                    .sort((a, b) => b.total_points - a.total_points)
                    .map((entry, index) => ({ ...entry, rank: index + 1 }));

                setEntries(sortedEntries);
            } catch (error) {
                console.error('Error fetching leaderboard:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchLeaderboard();
    }, []);

    return (
        <Layout showFooter={false}>
            <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5 py-12 px-4 relative pb-32">
                <div className="container max-w-5xl mx-auto">
                    {/* Header Section */}
                    <div className="text-center mb-16 animate-in fade-in slide-in-from-top-4 duration-1000">
                        <Badge
                            variant="outline"
                            className="mb-4 px-6 py-2 bg-primary/10 text-primary border-primary/20 text-[10px] font-black uppercase tracking-[0.3em] backdrop-blur-sm"
                        >
                            The Global Exchange
                        </Badge>
                        <h1 className="font-display text-5xl md:text-6xl font-black tracking-tighter mb-6">
                            Elite <span className="text-primary italic">Circle</span>
                        </h1>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
                            The definitive hierarchy of CBLE candidates. Points are calculated based on session consistency, domain mastery, and accuracy.
                        </p>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-4">
                            <Loader2 className="h-12 w-12 animate-spin text-primary opacity-50" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">Synchronizing rankings...</p>
                        </div>
                    ) : (
                        <div className="space-y-12">
                            {/* Podium Section */}
                            <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-4 lg:gap-8 mb-20 animate-in fade-in zoom-in duration-1000">
                                {[1, 0, 2].map((idx) => {
                                    const entry = entries[idx];
                                    if (!entry) return null;
                                    const isGold = entry.rank === 1;
                                    const isSilver = entry.rank === 2;

                                    return (
                                        <div
                                            key={entry.user_id}
                                            className={`relative w-full max-w-[300px] ${isGold ? 'order-1 md:order-2 md:scale-110 z-10' :
                                                isSilver ? 'order-2 md:order-1' : 'order-3'
                                                }`}
                                        >
                                            <Card className={`border-none shadow-2xl overflow-hidden rounded-[2.5rem] transition-all duration-500 hover:translate-y--2 ${isGold ? 'bg-gradient-to-b from-primary/30 via-card to-card ring-2 ring-primary/50' :
                                                'bg-card/60 backdrop-blur-md'
                                                }`}>
                                                <CardContent className="pt-12 pb-8 text-center">
                                                    <div className="relative mx-auto mb-6">
                                                        <div className={`absolute inset-0 rounded-full blur-2xl animate-pulse ${isGold ? 'bg-primary/40' :
                                                            isSilver ? 'bg-slate-400/20' : 'bg-amber-700/20'
                                                            }`} />
                                                        <Avatar className="w-24 h-24 mx-auto border-4 border-background shadow-2xl relative">
                                                            <AvatarImage src={entry.avatar_url || ''} />
                                                            <AvatarFallback className="text-2xl font-black bg-muted">
                                                                {entry.display_name.charAt(0)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="absolute -bottom-2 -right-2 h-10 w-10 flex items-center justify-center rounded-2xl bg-card shadow-xl border border-border">
                                                            {isGold ? <Crown className="h-6 w-6 text-yellow-500 fill-yellow-500 animate-bounce" /> :
                                                                isSilver ? <Medal className="h-6 w-6 text-slate-400 fill-slate-400" /> :
                                                                    <Medal className="h-6 w-6 text-amber-700 fill-amber-700" />}
                                                        </div>
                                                    </div>

                                                    <h3 className="font-display font-black text-xl mb-1 tracking-tight">{entry.display_name}</h3>
                                                    <div className="flex items-center justify-center gap-2 mb-6">
                                                        <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${isGold ? 'bg-primary text-white shadow-glow-primary' : 'bg-muted text-muted-foreground'
                                                            }`}>
                                                            {isGold ? 'Broker Supreme' : `Elite Rank #${entry.rank}`}
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-px bg-border/50 rounded-2xl overflow-hidden border border-border/50">
                                                        <div className="bg-card p-4">
                                                            <p className="text-xl font-black text-primary leading-none mb-1">{entry.total_points.toLocaleString()}</p>
                                                            <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Credits</p>
                                                        </div>
                                                        <div className="bg-card p-4">
                                                            <p className="text-xl font-black text-accent leading-none mb-1 flex items-center justify-center">
                                                                {entry.current_streak} <Flame className="h-4 w-4 ml-1 text-accent fill-accent" />
                                                            </p>
                                                            <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Streak</p>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Ranking Table Section */}
                            <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                                <Card className="border-none shadow-3xl bg-card/40 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
                                    <CardHeader className="p-8 border-b border-border/10 flex flex-row items-center justify-between">
                                        <div>
                                            <CardTitle className="text-lg font-black uppercase tracking-widest">Global Top 100</CardTitle>
                                            <CardDescription className="text-xs">Live tracking of candidate performance</CardDescription>
                                        </div>
                                        <Trophy className="h-8 w-8 text-primary opacity-20" />
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <div className="divide-y divide-border/10">
                                            {entries.slice(3).map((entry, i) => (
                                                <div
                                                    key={entry.user_id}
                                                    className={`flex items-center justify-between p-6 transition-all hover:bg-primary/[0.02] group ${entry.user_id === user?.id ? 'bg-primary/[0.03]' : ''
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-6">
                                                        <div className="w-8 text-center text-sm font-black text-muted-foreground/30 group-hover:text-primary transition-colors">
                                                            {entry.rank.toString().padStart(2, '0')}
                                                        </div>
                                                        <div className="relative">
                                                            <Avatar className="h-12 w-12 border-2 border-background shadow-md group-hover:scale-105 transition-transform">
                                                                <AvatarImage src={entry.avatar_url || ''} />
                                                                <AvatarFallback className="font-bold">{entry.display_name.charAt(0)}</AvatarFallback>
                                                            </Avatar>
                                                            {entry.current_streak >= 7 && (
                                                                <div className="absolute -top-1 -right-1 h-5 w-5 bg-accent rounded-full border-2 border-background flex items-center justify-center">
                                                                    <Flame className="h-3 w-3 text-white fill-white" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-sm tracking-tight flex items-center gap-2">
                                                                {entry.display_name}
                                                                {entry.user_id === user?.id && (
                                                                    <Badge className="bg-primary/10 text-primary border-none text-[8px] font-black uppercase h-5">YOU</Badge>
                                                                )}
                                                            </p>
                                                            <div className="flex items-center gap-3 mt-1">
                                                                <span className="flex items-center text-[9px] font-black text-accent uppercase tracking-widest bg-accent/5 px-2 py-0.5 rounded-full">
                                                                    {entry.current_streak} Day Streak
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right flex items-center gap-8">
                                                        <div className="hidden sm:block">
                                                            <p className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-widest mb-1">Efficiency</p>
                                                            <div className="h-1.5 w-20 bg-muted rounded-full overflow-hidden">
                                                                <div className="h-full bg-primary/40" style={{ width: `${Math.min(100, (entry.total_points / (entries[0]?.total_points || 1)) * 100)}%` }} />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <p className="font-display font-black text-lg text-primary leading-none">{entry.total_points.toLocaleString()}</p>
                                                            <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Mastery Pts</p>
                                                        </div>
                                                        <ChevronRight className="h-4 w-4 text-muted-foreground/20 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    )}
                </div>

                {/* Floating "My Rank" Overlay */}
                {currentUserEntry && (
                    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-[90vw] max-w-2xl z-50 animate-in slide-in-from-bottom-12 duration-1000">
                        <div className="bg-foreground text-background rounded-3xl p-6 shadow-2xl flex items-center justify-between border border-white/10 backdrop-blur-xl">
                            <div className="flex items-center gap-4">
                                <div className="h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center font-black text-2xl relative overflow-hidden">
                                    <div className="absolute inset-0 bg-primary/20 animate-pulse" />
                                    #{currentUserEntry.rank}
                                </div>
                                <div>
                                    <p className="text-[10px] font-black tracking-[0.2em] opacity-50 uppercase">Your Standing</p>
                                    <h4 className="font-display font-black text-xl tracking-tight">Elite Candidate</h4>
                                </div>
                            </div>
                            <div className="flex items-center gap-8">
                                <div className="text-center">
                                    <p className="text-2xl font-black leading-none text-primary">{currentUserEntry.total_points.toLocaleString()}</p>
                                    <p className="text-[9px] font-black opacity-50 uppercase mt-1">Total Pts</p>
                                </div>
                                <Button
                                    className="bg-white text-black hover:bg-white/90 rounded-2xl h-14 px-8 font-black uppercase tracking-widest text-xs shadow-xl"
                                    onClick={() => navigate('/study')}
                                >
                                    Climb Rank
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}
