import { useState, useEffect, useCallback } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Compass, Timer, CheckCircle2, XCircle, RotateCw, Trophy, Zap } from 'lucide-react';

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
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userAnswer, setUserAnswer] = useState('');
    const [showResult, setShowResult] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [score, setScore] = useState(0);
    const [total, setTotal] = useState(0);
    const [timeLeft, setTimeLeft] = useState(15);
    const [drills, setDrills] = useState<DrillItem[]>([]);
    const [gameOver, setGameOver] = useState(false);
    const [streak, setStreak] = useState(0);
    const [bestStreak, setBestStreak] = useState(0);

    useEffect(() => {
        // Shuffle drills
        const shuffled = [...DRILLS].sort(() => Math.random() - 0.5).slice(0, 20);
        setDrills(shuffled);
    }, []);

    useEffect(() => {
        if (showResult || gameOver || drills.length === 0) return;
        if (timeLeft <= 0) { handleSubmit(); return; }
        const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
        return () => clearTimeout(timer);
    }, [timeLeft, showResult, gameOver, drills]);

    const handleSubmit = useCallback(() => {
        const correct = userAnswer.trim().toLowerCase() === drills[currentIndex].answer.toLowerCase();
        setIsCorrect(correct);
        setShowResult(true);
        setTotal(t => t + 1);
        if (correct) {
            setScore(s => s + 1);
            setStreak(s => { const n = s + 1; if (n > bestStreak) setBestStreak(n); return n; });
        } else {
            setStreak(0);
        }
    }, [userAnswer, currentIndex, drills, bestStreak]);

    const nextQuestion = () => {
        if (currentIndex >= drills.length - 1) {
            setGameOver(true);
            return;
        }
        setCurrentIndex(i => i + 1);
        setUserAnswer('');
        setShowResult(false);
        setTimeLeft(15);
    };

    const restart = () => {
        const shuffled = [...DRILLS].sort(() => Math.random() - 0.5).slice(0, 20);
        setDrills(shuffled);
        setCurrentIndex(0);
        setUserAnswer('');
        setShowResult(false);
        setScore(0);
        setTotal(0);
        setTimeLeft(15);
        setGameOver(false);
        setStreak(0);
        setBestStreak(0);
    };

    if (drills.length === 0) return null;

    const current = drills[currentIndex];
    const pct = (score / Math.max(total, 1)) * 100;

    return (
        <Layout>
            <div className="container max-w-xl py-8 space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="font-display text-2xl font-bold flex items-center gap-2">
                        <Compass className="h-6 w-6 text-primary" />
                        Navigation Drill
                    </h1>
                    <div className="flex gap-2">
                        <Badge variant="secondary">{score}/{total}</Badge>
                        {streak >= 3 && <Badge className="bg-orange-500">🔥 {streak} streak</Badge>}
                    </div>
                </div>

                <Progress value={((currentIndex + 1) / drills.length) * 100} />

                {gameOver ? (
                    <Card>
                        <CardContent className="py-12 text-center space-y-4">
                            <Trophy className="h-12 w-12 mx-auto text-yellow-500" />
                            <h2 className="text-2xl font-bold">Drill Complete!</h2>
                            <p className="text-lg">{score}/{total} correct ({Math.round(pct)}%)</p>
                            <p className="text-sm text-muted-foreground">Best streak: {bestStreak}</p>
                            <Button onClick={restart}><RotateCw className="h-4 w-4 mr-2" /> Play Again</Button>
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <Badge variant="outline">{current.category}</Badge>
                                <div className="flex items-center gap-1 text-sm">
                                    <Timer className={`h-4 w-4 ${timeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-muted-foreground'}`} />
                                    <span className={timeLeft <= 5 ? 'text-red-500 font-bold' : ''}>{timeLeft}s</span>
                                </div>
                            </div>
                            <CardTitle className="text-lg mt-2">{current.prompt}</CardTitle>
                            <CardDescription>{current.hint}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {!showResult ? (
                                <form onSubmit={e => { e.preventDefault(); handleSubmit(); }} className="flex gap-2">
                                    <Input
                                        value={userAnswer}
                                        onChange={e => setUserAnswer(e.target.value)}
                                        placeholder="Type your answer..."
                                        autoFocus
                                        className="text-lg font-mono"
                                    />
                                    <Button type="submit">Submit</Button>
                                </form>
                            ) : (
                                <div className="space-y-3">
                                    <div className={`flex items-center gap-2 p-3 rounded-lg ${isCorrect ? 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400'}`}>
                                        {isCorrect ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                                        <span className="font-medium">
                                            {isCorrect ? 'Correct!' : `Incorrect. Answer: ${current.answer}`}
                                        </span>
                                    </div>
                                    <Button onClick={nextQuestion} className="w-full">
                                        {currentIndex >= drills.length - 1 ? 'See Results' : 'Next Question'}
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </Layout>
    );
}
