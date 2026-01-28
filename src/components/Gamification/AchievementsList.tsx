import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Award, Zap, BookOpen, Target, Flame, Hash, ShieldCheck, Microscope } from 'lucide-react';

interface AchievementsListProps {
    totalCorrect: number;
    totalAttempts: number;
    streak: number;
    strongestDomain?: string | null;
}

export function AchievementsList({ totalCorrect, totalAttempts, streak, strongestDomain }: AchievementsListProps) {
    const achievements = [
        {
            id: 'first_steps',
            title: 'First Steps',
            description: 'Answer 10 questions',
            icon: <Hash className="h-4 w-4" />,
            unlocked: totalAttempts >= 10,
            color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
        },
        {
            id: 'on_fire',
            title: 'On Fire',
            description: 'Reach a 3-day streak',
            icon: <Flame className="h-4 w-4" />,
            unlocked: streak >= 3,
            color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300'
        },
        {
            id: 'accuracy_master',
            title: 'Sharpshooter',
            description: 'Get 50 correct answers',
            icon: <Target className="h-4 w-4" />,
            unlocked: totalCorrect >= 50,
            color: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300'
        },
        {
            id: 'dedicated',
            title: 'Dedicated',
            description: 'Answer 100 questions',
            icon: <BookOpen className="h-4 w-4" />,
            unlocked: totalAttempts >= 100,
            color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300'
        },
        {
            id: 'specialist',
            title: 'Domain Specialist',
            description: 'Master a specific domain',
            icon: <Microscope className="h-4 w-4" />,
            unlocked: !!strongestDomain,
            color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300'
        },
        {
            id: 'veteran',
            title: 'CBLE Veteran',
            description: 'Answer 500 questions',
            icon: <ShieldCheck className="h-4 w-4" />,
            unlocked: totalAttempts >= 500,
            color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300'
        }
    ];

    const unlockedCount = achievements.filter(a => a.unlocked).length;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    Achievements
                </h3>
                <Badge variant="outline" className="text-xs">
                    {unlockedCount} / {achievements.length}
                </Badge>
            </div>

            <ScrollArea className="h-[200px] pr-4">
                <div className="grid gap-3">
                    {achievements.map((achievement) => (
                        <div
                            key={achievement.id}
                            className={`flex items-start gap-3 rounded-lg border p-3 transition-colors ${achievement.unlocked
                                    ? 'bg-card border-border'
                                    : 'bg-muted/50 border-transparent opacity-60 grayscale'
                                }`}
                        >
                            <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${achievement.unlocked ? achievement.color : 'bg-muted text-muted-foreground'
                                }`}>
                                {achievement.icon}
                            </div>
                            <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium leading-none">
                                        {achievement.title}
                                    </p>
                                    {achievement.unlocked && (
                                        <Zap className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {achievement.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
}
