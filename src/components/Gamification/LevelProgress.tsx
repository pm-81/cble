import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Star, Trophy, Zap } from 'lucide-react';

interface LevelProgressProps {
    totalCorrect: number;
    totalAttempts: number;
    streak: number;
}

export function LevelProgress({ totalCorrect, totalAttempts, streak }: LevelProgressProps) {
    // Simple XP Formula
    // 10 XP per correct answer
    // 2 XP per attempt
    // 5 XP per streak day (simulate by just using streak count * 50 for now as a bonus base)
    const xp = (totalCorrect * 10) + (totalAttempts * 2) + (streak * 50);

    // Level Formula: Level 1 = 0-100xp, Level 2 = 101-300xp, etc.
    // Quadratic scaling: XP = 100 * level^1.5 approx
    // Inverse: Level = (XP / 100) ^ (1/1.5)
    const level = Math.max(1, Math.floor(Math.pow(xp / 100, 0.6)) + 1);

    // Calculate progress to next level
    const currentLevelBaseXP = 100 * Math.pow(level - 1, 1.66);
    const nextLevelBaseXP = 100 * Math.pow(level, 1.66);
    const levelProgress = Math.min(100, Math.max(0,
        ((xp - currentLevelBaseXP) / (nextLevelBaseXP - currentLevelBaseXP)) * 100
    ));

    const getLevelTitle = (lvl: number) => {
        if (lvl < 3) return 'Novice Clerk';
        if (lvl < 5) return 'Entry Writer';
        if (lvl < 10) return 'Compliance Specialist';
        if (lvl < 20) return 'Broker Candidate';
        return 'Licensed Custom Broker Master';
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400 font-bold border border-orange-200 dark:border-orange-800">
                        {level}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-bold leading-none">{getLevelTitle(level)}</span>
                        <span className="text-[10px] text-muted-foreground">{Math.floor(xp)} XP</span>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <Trophy className="h-3 w-3 text-yellow-500" />
                    <span className="text-xs font-medium text-muted-foreground">
                        Next: {getLevelTitle(level + 1)}
                    </span>
                </div>
            </div>

            <div className="relative">
                <Progress value={levelProgress} className="h-2.5 bg-muted" indicatorClassName="bg-gradient-to-r from-orange-400 to-amber-500" />
                <div className="absolute -top-1 right-0 -mr-1">
                    {levelProgress > 90 && (
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-yellow-400 text-[8px] font-bold text-yellow-900 animate-pulse">
                            <Zap className="h-2 w-2" />
                        </span>
                    )}
                </div>
            </div>

            <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>Level {level}</span>
                <span>{Math.round(levelProgress)}% to Level {level + 1}</span>
            </div>
        </div>
    );
}
