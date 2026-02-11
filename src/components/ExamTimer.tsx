import { useState, useEffect, useCallback } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExamTimerProps {
    /** Duration in minutes */
    durationMinutes: number;
    isRunning: boolean;
    onTimeUp?: () => void;
    className?: string;
}

export function ExamTimer({ durationMinutes, isRunning, onTimeUp, className }: ExamTimerProps) {
    const [secondsRemaining, setSecondsRemaining] = useState(durationMinutes * 60);

    useEffect(() => {
        setSecondsRemaining(durationMinutes * 60);
    }, [durationMinutes]);

    useEffect(() => {
        if (!isRunning || secondsRemaining <= 0) return;

        const interval = setInterval(() => {
            setSecondsRemaining(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    onTimeUp?.();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isRunning, secondsRemaining, onTimeUp]);

    const hours = Math.floor(secondsRemaining / 3600);
    const minutes = Math.floor((secondsRemaining % 3600) / 60);
    const seconds = secondsRemaining % 60;

    const totalSeconds = durationMinutes * 60;
    const pct = (secondsRemaining / totalSeconds) * 100;
    const isLow = pct < 10;
    const isWarning = pct < 25;

    const formatNum = (n: number) => String(n).padStart(2, '0');

    return (
        <div className={cn(
            'flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-mono transition-colors',
            isLow ? 'border-red-500 bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400 animate-pulse'
                : isWarning ? 'border-yellow-500 bg-yellow-50 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400'
                    : 'border-border bg-card text-foreground',
            className
        )}>
            {isLow ? <AlertTriangle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
            <span>{formatNum(hours)}:{formatNum(minutes)}:{formatNum(seconds)}</span>
        </div>
    );
}
