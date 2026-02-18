import { useState, useEffect, useCallback, useRef } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    Compass,
    Timer,
    CheckCircle2,
    XCircle,
    RotateCw,
    Trophy,
    Zap,
    Activity,
    Target,
    ArrowRight,
    MapPinafore as Map
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Lucide icon fix
const MapIcon = Compass; // Fallback or use Compass if MapPinafore isn't available, but standard Map is fine. 
// Actually, let's just use Compass as the main icon for "Navigation".

interface DrillItem {
    prompt: string;
    answer: string;
    hint: string;
    category: string;
}

const DRILLS: DrillItem[] = [
    { prompt: 'Which CFR part covers Customs Brokers?', answer: '111', hint: '19 CFR Part ___', category: 'Broker' },
    { prompt: 'Which CFR part covers Entry of Merchandise?', answer: '141', hint: '19 CFR Part ___', category: 'Entry' },
    { prompt: 'Which CFR part covers Entry Process?', answer: '142', hint: '19 CFR Part ___', category: 'Entry' },
    { prompt: 'Which CFR part covers Informal Entries?', answer: '143', hint: '19 CFR Part ___', category: 'Entry' },
    { prompt: 'Which CFR part covers Bonded Warehouses?', answer: '144', hint: '19 CFR Part ___', category: 'Warehouse' },
    { prompt: 'Which CFR part covers Mail Importations?', answer: '145', hint: '19 CFR Part ___', category: 'Entry' },
    { prompt: 'Which CFR part covers Foreign Trade Zones?', answer: '146', hint: '19 CFR Part ___', category: 'FTZ' },
    { prompt: 'Which CFR part covers Classification and Appraisement?', answer: '152', hint: '19 CFR Part ___', category: 'Valuation' },
    { prompt: 'Which CFR part covers Liquidation?', answer: '159', hint: '19 CFR Part ___', category: 'Liquidation' },
    { prompt: 'Which CFR part covers Penalties?', answer: '162', hint: '19 CFR Part ___', category: 'Penalties' },
    { prompt: 'Which CFR part covers Protests?', answer: '174', hint: '19 CFR Part ___', category: 'Protests' },
    { prompt: 'Which CFR part covers Rulings?', answer: '177', hint: '19 CFR Part ___', category: 'Rulings' },
    { prompt: 'Which CFR part covers Country of Origin Marking?', answer: '134', hint: '19 CFR Part ___', category: 'Marking' },
    { prompt: 'Which CFR part covers Customs Bonds?', answer: '113', hint: '19 CFR Part ___', category: 'Bonds' },
    { prompt: 'Which CFR part covers In-bond Transportation?', answer: '18', hint: '19 CFR Part ___', category: 'Transport' },
    { prompt: 'Which CFR part covers ISF (10+2)?', answer: '149', hint: '19 CFR Part ___', category: 'Security' },
    { prompt: 'Which CFR part covers Drawback?', answer: '191', hint: '19 CFR Part ___', category: 'Drawback' },
    { prompt: 'CBP Form for Entry/Immediate Delivery?', answer: '3461', hint: 'CBP Form ____', category: 'Forms' },
    { prompt: 'CBP Form for Entry Summary?', answer: '7501', hint: 'CBP Form ____', category: 'Forms' },
    { prompt: 'CBP Form for Protest?', answer: '19', hint: 'CBP Form __', category: 'Forms' },
    { prompt: 'CBP Form for Transportation Entry (In-bond)?', answer: '7512', hint: 'CBP Form ____', category: 'Forms' },
    { prompt: 'CBP Form for Request for Information?', answer: '28', hint: 'CBP Form __', category: 'Forms' },
    { prompt: 'CBP Form for Notice of Action?', answer: '29', hint: 'CBP Form __', category: 'Forms' },
    { prompt: 'CBP Form for Customs Bond?', answer: '301', hint: 'CBP Form ___', category: 'Forms' },
    { prompt: 'How many HTSUS Sections are there?', answer: '22', hint: 'Number of sections', category: 'HTSUS' },
    { prompt: 'HS codes are harmonized internationally at how many digits?', answer: '6', hint: 'Digit count', category: 'HTSUS' },
    { prompt: 'De minimis threshold (Section 321)?', answer: '800', hint: '$___', category: 'Thresholds' },
    { prompt: 'Informal entry limit for commercial goods?', answer: '2500', hint: '$____', category: 'Thresholds' },
    { prompt: 'Days to file protest after liquidation?', answer: '180', hint: '___ days', category: 'Deadlines' },
    { prompt: 'Working days to file entry summary after entry?', answer: '10', hint: '__ working days', category: 'Deadlines' },
    { prompt: 'Maximum years in a bonded warehouse?', answer: '5', hint: '_ years', category: 'Deadlines' },
    { prompt: 'Broker record retention (years)?', answer: '5', hint: '_ years', category: 'Deadlines' },
    { prompt: 'Passing score on broker exam (%)?', answer: '75', hint: '___%', category: 'Broker' },
    { prompt: 'ISF filing deadline before vessel loading (hours)?', answer: '24', hint: '__ hours', category: 'Deadlines' },
    { prompt: 'Drawback claim filing deadline (years)?', answer: '5', hint: '_ years', category: 'Deadlines' },
    { prompt: 'Country of origin marking penalty (% ad valorem)?', answer: '10', hint: '__% additional duty', category: 'Penalties' },
    { prompt: 'Min continuous bond amount?', answer: '50000', hint: '$______', category: 'Bonds' },
    { prompt: 'Days broker must notify CBP of address change?', answer: '30', hint: '__ days', category: 'Broker' },
    { prompt: 'What type of entry is Type 01?', answer: 'consumption', hint: 'C_________ entry', category: 'Entry Types' },
    { prompt: 'What type of entry is Type 21?', answer: 'warehouse', hint: 'W________ entry', category: 'Entry Types' },
];

export default function NavigationDrill() {
    // Game State
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userAnswer, setUserAnswer] = useState('');
    const [showResult, setShowResult] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(15);
    const [drills, setDrills] = useState<DrillItem[]>([]);
    const [gameOver, setGameOver] = useState(false);
    const [streak, setStreak] = useState(0);
    const [bestStreak, setBestStreak] = useState(0);
    const [gameStarted, setGameStarted] = useState(false);

    // Use Compass as the icon to avoid import issues
    const NavigationIcon = Compass;

    const inputRef = useRef<HTMLInputElement>(null);

    // Initialize Drill
    const initDrill = useCallback(() => {
        const shuffled = [...DRILLS].sort(() => Math.random() - 0.5).slice(0, 20);
        setDrills(shuffled);
        setCurrentIndex(0);
        setUserAnswer('');
        setShowResult(false);
        setScore(0);
        setTimeLeft(15);
        setGameOver(false);
        setStreak(0);
        setBestStreak(0); // Reset best streak? Maybe keep it. Let's reset for now as it's a new session.
        setGameStarted(true);
        // Focus input after a brief delay to allow render
        setTimeout(() => inputRef.current?.focus(), 100);
    }, []);

    useEffect(() => {
        initDrill();
    }, [initDrill]);

    // Timer Logic
    useEffect(() => {
        if (showResult || gameOver || !gameStarted) return;

        if (timeLeft <= 0) {
            handleSubmit(true); // Auto-submit on timeout
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, showResult, gameOver, gameStarted]);

    const handleSubmit = (isTimeout = false) => {
        if (showResult) return;

        const currentDrill = drills[currentIndex];
        const correct = !isTimeout && userAnswer.trim().toLowerCase() === currentDrill.answer.toLowerCase();

        setIsCorrect(correct);
        setShowResult(true);

        if (correct) {
            setScore((s) => s + 1);
            setStreak((s) => {
                const newStreak = s + 1;
                if (newStreak > bestStreak) setBestStreak(newStreak);
                return newStreak;
            });
        } else {
            setStreak(0);
        }
    };

    const nextQuestion = () => {
        if (currentIndex >= drills.length - 1) {
            setGameOver(true);
            return;
        }

        setCurrentIndex((prev) => prev + 1);
        setUserAnswer('');
        setShowResult(false);
        setTimeLeft(15);
        setTimeout(() => inputRef.current?.focus(), 100);
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // If showing result, Enter key goes to next question
        if (showResult) {
            nextQuestion();
        } else {
            handleSubmit();
        }
    };

    if (!gameStarted && drills.length === 0) return null;

    const current = drills[currentIndex];
    const progress = ((currentIndex + 1) / drills.length) * 100;

    return (
        <Layout showFooter={false}>
            <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-background via-background to-primary/5 py-8 px-4 flex flex-col items-center">
                <div className="w-full max-w-4xl space-y-8">

                    {/* --- HUD HEADER --- */}
                    <div className="grid grid-cols-12 gap-4 animate-in fade-in slide-in-from-top-4 duration-700">
                        {/* Identify Module */}
                        <div className="col-span-12 md:col-span-4 bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
                            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                <NavigationIcon className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h1 className="font-display font-black text-lg uppercase tracking-tight">Navigation Core</h1>
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Rapid Citation Recall</p>
                            </div>
                        </div>

                        {/* Real-time Stats */}
                        <div className="col-span-12 md:col-span-8 grid grid-cols-3 gap-4">
                            <div className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl p-4 flex flex-col items-center justify-center shadow-sm">
                                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Score</div>
                                <div className="font-display text-2xl font-black">{score}/{drills.length}</div>
                            </div>
                            <div className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl p-4 flex flex-col items-center justify-center shadow-sm relative overflow-hidden">
                                {streak >= 3 && <div className="absolute inset-0 bg-orange-500/10 animate-pulse" />}
                                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1 flex items-center gap-1">
                                    Streak <Zap className={`h-3 w-3 ${streak > 0 ? 'text-orange-500 fill-orange-500' : 'text-muted'}`} />
                                </div>
                                <div className={`font-display text-2xl font-black ${streak >= 3 ? 'text-orange-500' : ''}`}>{streak}</div>
                            </div>
                            <div className={cn(
                                "bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl p-4 flex flex-col items-center justify-center shadow-sm transition-colors duration-300",
                                timeLeft <= 5 && !showResult ? "border-destructive/50 bg-destructive/5" : ""
                            )}>
                                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Timer</div>
                                <div className={cn("font-display text-2xl font-black font-mono tabular-nums", timeLeft <= 5 && !showResult ? "text-destructive animate-pulse" : "")}>
                                    {timeLeft}s
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- MAIN STAGE --- */}
                    <div className="relative min-h-[400px]">
                        {gameOver ? (
                            <Card className="border-none shadow-3xl bg-card/80 backdrop-blur-xl rounded-[2.5rem] overflow-hidden animate-in zoom-in duration-500 text-center h-full flex flex-col justify-center">
                                <CardContent className="p-12">
                                    <div className="mx-auto h-24 w-24 rounded-full gradient-primary flex items-center justify-center shadow-lg mb-8">
                                        <Trophy className="h-10 w-10 text-white" />
                                    </div>
                                    <h2 className="font-display text-4xl font-black tracking-tight mb-2">Drill Condensed</h2>
                                    <p className="text-muted-foreground text-lg mb-12">
                                        You successfully navigated {score} out of {drills.length} regulatory checkpoints.
                                    </p>

                                    <div className="flex justify-center gap-8 mb-12">
                                        <div className="text-center">
                                            <div className="text-4xl font-black text-primary mb-1">{Math.round((score / drills.length) * 100)}%</div>
                                            <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Accuracy</div>
                                        </div>
                                        <div className="w-px bg-border/50 h-16" />
                                        <div className="text-center">
                                            <div className="text-4xl font-black text-orange-500 mb-1">{bestStreak}</div>
                                            <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Best Streak</div>
                                        </div>
                                    </div>

                                    <Button size="lg" onClick={initDrill} className="rounded-2xl gradient-primary shadow-glow h-14 px-12 font-black uppercase tracking-widest text-sm">
                                        <RotateCw className="mr-2 h-4 w-4" /> Restart Drill
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card className="border-none shadow-3xl bg-card/80 backdrop-blur-xl rounded-[2.5rem] overflow-hidden relative transition-all duration-300">
                                {/* Progress Bar Top */}
                                <div className="absolute top-0 left-0 right-0 h-1.5 bg-muted">
                                    <div className="h-full bg-primary transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
                                </div>

                                <CardHeader className="pt-12 pb-6 px-8 md:px-12 text-center md:text-left">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                                        <Badge variant="outline" className="w-fit px-4 py-1.5 bg-primary/5 text-primary border-primary/20 text-[10px] font-black uppercase tracking-[0.2em] rounded-lg">
                                            Sector: {current.category}
                                        </Badge>
                                        <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest opacity-50">
                                            Checkpoint {currentIndex + 1} / {drills.length}
                                        </div>
                                    </div>
                                    <CardTitle className="text-3xl md:text-5xl font-display font-medium leading-tight tracking-tight text-foreground">
                                        {current.prompt}
                                    </CardTitle>
                                    <CardDescription className="text-lg font-medium text-muted-foreground mt-4 flex items-center gap-2">
                                        <Target className="h-4 w-4 text-primary" />
                                        Target: <span className="text-foreground font-mono bg-muted/50 px-2 py-0.5 rounded">{current.hint}</span>
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className="px-8 md:px-12 pb-12">
                                    <form onSubmit={handleFormSubmit} className="max-w-xl">
                                        <div className="relative">
                                            {/* Status Icon Overlay - Positioned absolutely within the input container */}
                                            {showResult && (
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10 animate-in zoom-in spin-in-12 duration-300 pointer-events-none">
                                                    {isCorrect ? (
                                                        <CheckCircle2 className="h-8 w-8 text-success fill-success/20" />
                                                    ) : (
                                                        <XCircle className="h-8 w-8 text-destructive fill-destructive/20" />
                                                    )}
                                                </div>
                                            )}

                                            <Input
                                                ref={inputRef}
                                                value={userAnswer}
                                                onChange={(e) => setUserAnswer(e.target.value)}
                                                disabled={showResult}
                                                placeholder="Type citation..."
                                                className={cn(
                                                    "h-20 text-3xl md:text-4xl font-mono tracking-tight font-bold rounded-2xl border-2 px-6 transition-all shadow-inner bg-background/50",
                                                    showResult
                                                        ? (isCorrect
                                                            ? "border-success text-success bg-success/5"
                                                            : "border-destructive text-destructive bg-destructive/5")
                                                        : "border-border/50 focus:border-primary focus:ring-4 focus:ring-primary/10"
                                                )}
                                                autoComplete="off"
                                                autoFocus
                                            />
                                        </div>

                                        {showResult && !isCorrect && (
                                            <div className="mt-4 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive flex items-center gap-3 animate-in slide-in-from-top-2">
                                                <Activity className="h-5 w-5" />
                                                <span className="font-bold">Correct Vector: <span className="font-mono text-lg">{current.answer}</span></span>
                                            </div>
                                        )}

                                        <div className="mt-8">
                                            {!showResult ? (
                                                <Button
                                                    type="submit"
                                                    size="lg"
                                                    className="w-full md:w-auto h-14 px-10 rounded-2xl gradient-primary font-black uppercase tracking-widest shadow-glow hover:scale-[1.02] active:scale-[0.98] transition-all"
                                                >
                                                    Lock In
                                                </Button>
                                            ) : (
                                                <Button
                                                    type="submit"
                                                    size="lg"
                                                    autoFocus
                                                    className="w-full md:w-auto h-14 px-10 rounded-2xl bg-foreground text-background font-black uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all gap-2"
                                                >
                                                    {currentIndex >= drills.length - 1 ? 'Finish' : 'Next Target'}
                                                    <ArrowRight className="h-5 w-5" />
                                                </Button>
                                            )}
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}
