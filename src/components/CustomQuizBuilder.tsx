import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Play, Settings2 } from 'lucide-react';

interface Domain {
    id: string;
    name: string;
    color: string;
}

interface CustomQuizBuilderProps {
    onClose: () => void;
}

export function CustomQuizBuilder({ onClose }: CustomQuizBuilderProps) {
    const navigate = useNavigate();
    const [domains, setDomains] = useState<Domain[]>([]);
    const [selectedDomains, setSelectedDomains] = useState<Set<string>>(new Set());
    const [questionCount, setQuestionCount] = useState(20);
    const [difficultyRange, setDifficultyRange] = useState<[number, number]>([1, 5]);
    const [timedMode, setTimedMode] = useState(false);
    const [unseenOnly, setUnseenOnly] = useState(false);

    useEffect(() => {
        async function fetchDomains() {
            const { data } = await supabase.from('domains').select('id, name, color').order('sort_order');
            if (data) setDomains(data);
        }
        fetchDomains();
    }, []);

    const toggleDomain = (id: string) => {
        const next = new Set(selectedDomains);
        if (next.has(id)) next.delete(id); else next.add(id);
        setSelectedDomains(next);
    };

    const startQuiz = () => {
        const params = new URLSearchParams();
        params.set('mode', 'custom');
        params.set('count', String(questionCount));
        params.set('minDiff', String(difficultyRange[0]));
        params.set('maxDiff', String(difficultyRange[1]));
        if (timedMode) params.set('timed', '1');
        if (unseenOnly) params.set('unseen', '1');
        if (selectedDomains.size > 0) params.set('domains', Array.from(selectedDomains).join(','));
        navigate(`/study?${params.toString()}`);
        onClose();
    };

    return (
        <Card className="w-full max-w-lg mx-auto shadow-xl border-2">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Settings2 className="h-5 w-5 text-primary" />
                    Custom Quiz Builder
                </CardTitle>
                <CardDescription>Configure your practice session</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Domain Selection */}
                <div className="space-y-3">
                    <Label className="text-sm font-medium">Select Domains (leave empty for all)</Label>
                    <div className="flex flex-wrap gap-2">
                        {domains.map(d => (
                            <Badge
                                key={d.id}
                                variant={selectedDomains.has(d.id) ? 'default' : 'outline'}
                                className="cursor-pointer transition-all hover:scale-105"
                                onClick={() => toggleDomain(d.id)}
                            >
                                {d.name}
                            </Badge>
                        ))}
                    </div>
                </div>

                {/* Question Count */}
                <div className="space-y-3">
                    <div className="flex justify-between">
                        <Label className="text-sm font-medium">Number of Questions</Label>
                        <span className="text-sm text-muted-foreground font-mono">{questionCount}</span>
                    </div>
                    <Slider
                        value={[questionCount]}
                        onValueChange={([v]) => setQuestionCount(v)}
                        min={5}
                        max={80}
                        step={5}
                    />
                </div>

                {/* Difficulty Range */}
                <div className="space-y-3">
                    <div className="flex justify-between">
                        <Label className="text-sm font-medium">Difficulty Range</Label>
                        <span className="text-sm text-muted-foreground font-mono">{difficultyRange[0]}–{difficultyRange[1]}</span>
                    </div>
                    <Slider
                        value={difficultyRange}
                        onValueChange={(v) => setDifficultyRange(v as [number, number])}
                        min={1}
                        max={5}
                        step={1}
                    />
                </div>

                {/* Toggles */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-sm font-medium">Timed Mode</Label>
                            <p className="text-xs text-muted-foreground">90 seconds per question</p>
                        </div>
                        <Switch checked={timedMode} onCheckedChange={setTimedMode} />
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-sm font-medium">Unseen Questions Only</Label>
                            <p className="text-xs text-muted-foreground">Only show questions you haven&apos;t attempted</p>
                        </div>
                        <Switch checked={unseenOnly} onCheckedChange={setUnseenOnly} />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                    <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
                    <Button onClick={startQuiz} className="flex-1 gradient-primary">
                        <Play className="h-4 w-4 mr-2" />
                        Start Quiz
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
