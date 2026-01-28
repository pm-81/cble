import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
    Loader2,
    Plus,
    Save,
    Upload,
    BookOpen,
    HelpCircle,
    Database,
    Trash2,
    Edit,
    CheckCircle2,
} from 'lucide-react';

interface Domain {
    id: string;
    name: string;
    color: string;
    icon: string;
}

interface Question {
    id: string;
    stem: string;
    correct_answer: string;
    difficulty: number;
    domain_id: string;
    is_active: boolean;
}

interface Flashcard {
    id: string;
    front: string;
    back: string;
    domain_id: string;
    is_active: boolean;
}

export default function Admin() {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const [domains, setDomains] = useState<Domain[]>([]);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // New Question Form
    const [newQuestion, setNewQuestion] = useState({
        stem: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        option_e: '',
        correct_answer: 'A',
        rationale: '',
        reference_cue: '',
        difficulty: 2,
        domain_id: '',
    });

    // New Flashcard Form
    const [newFlashcard, setNewFlashcard] = useState({
        front: '',
        back: '',
        reference_cue: '',
        domain_id: '',
    });

    // Bulk Import
    const [bulkJson, setBulkJson] = useState('');

    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/auth');
        }
    }, [user, authLoading, navigate]);

    useEffect(() => {
        async function fetchData() {
            if (!user) return;

            try {
                // Fetch domains
                const { data: domainData } = await supabase
                    .from('domains')
                    .select('*')
                    .order('sort_order');

                if (domainData) setDomains(domainData);

                // Fetch questions count
                const { data: questionData } = await supabase
                    .from('questions')
                    .select('id, stem, correct_answer, difficulty, domain_id, is_active')
                    .order('created_at', { ascending: false })
                    .limit(50);

                if (questionData) setQuestions(questionData);

                // Fetch flashcards count
                const { data: flashcardData } = await supabase
                    .from('flashcards')
                    .select('id, front, back, domain_id, is_active')
                    .order('created_at', { ascending: false })
                    .limit(50);

                if (flashcardData) setFlashcards(flashcardData);
            } catch (error) {
                console.error('Error fetching admin data:', error);
                toast.error('Failed to load data');
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [user]);

    const handleAddQuestion = async () => {
        if (!newQuestion.stem || !newQuestion.domain_id) {
            toast.error('Please fill in required fields');
            return;
        }

        setSaving(true);
        try {
            const { error } = await supabase.from('questions').insert({
                ...newQuestion,
                is_active: true,
            });

            if (error) throw error;

            toast.success('Question added successfully!');
            setNewQuestion({
                stem: '',
                option_a: '',
                option_b: '',
                option_c: '',
                option_d: '',
                option_e: '',
                correct_answer: 'A',
                rationale: '',
                reference_cue: '',
                difficulty: 2,
                domain_id: '',
            });

            // Refresh questions
            const { data } = await supabase
                .from('questions')
                .select('id, stem, correct_answer, difficulty, domain_id, is_active')
                .order('created_at', { ascending: false })
                .limit(50);
            if (data) setQuestions(data);
        } catch (error) {
            console.error('Error adding question:', error);
            toast.error('Failed to add question');
        } finally {
            setSaving(false);
        }
    };

    const handleAddFlashcard = async () => {
        if (!newFlashcard.front || !newFlashcard.back || !newFlashcard.domain_id) {
            toast.error('Please fill in required fields');
            return;
        }

        setSaving(true);
        try {
            const { error } = await supabase.from('flashcards').insert({
                ...newFlashcard,
                is_active: true,
            });

            if (error) throw error;

            toast.success('Flashcard added successfully!');
            setNewFlashcard({
                front: '',
                back: '',
                reference_cue: '',
                domain_id: '',
            });

            // Refresh flashcards
            const { data } = await supabase
                .from('flashcards')
                .select('id, front, back, domain_id, is_active')
                .order('created_at', { ascending: false })
                .limit(50);
            if (data) setFlashcards(data);
        } catch (error) {
            console.error('Error adding flashcard:', error);
            toast.error('Failed to add flashcard');
        } finally {
            setSaving(false);
        }
    };

    const handleBulkImport = async () => {
        if (!bulkJson.trim()) {
            toast.error('Please paste JSON data');
            return;
        }

        setSaving(true);
        try {
            const parsed = JSON.parse(bulkJson);

            if (parsed.questions && Array.isArray(parsed.questions)) {
                for (const q of parsed.questions) {
                    // Find domain by name or index
                    let domainId = q.domain_id;
                    if (q.domain_index !== undefined && domains[q.domain_index]) {
                        domainId = domains[q.domain_index].id;
                    }

                    await supabase.from('questions').insert({
                        stem: q.stem,
                        option_a: q.option_a,
                        option_b: q.option_b,
                        option_c: q.option_c,
                        option_d: q.option_d,
                        option_e: q.option_e,
                        correct_answer: q.correct_answer,
                        rationale: q.rationale,
                        reference_cue: q.reference_cue,
                        difficulty: q.difficulty || 2,
                        domain_id: domainId,
                        is_active: true,
                    });
                }
                toast.success(`Imported ${parsed.questions.length} questions!`);
            }

            if (parsed.flashcards && Array.isArray(parsed.flashcards)) {
                for (const f of parsed.flashcards) {
                    let domainId = f.domain_id;
                    if (f.domain_index !== undefined && domains[f.domain_index]) {
                        domainId = domains[f.domain_index].id;
                    }

                    await supabase.from('flashcards').insert({
                        front: f.front,
                        back: f.back,
                        reference_cue: f.reference_cue,
                        domain_id: domainId,
                        is_active: true,
                    });
                }
                toast.success(`Imported ${parsed.flashcards.length} flashcards!`);
            }

            setBulkJson('');
        } catch (error) {
            console.error('Bulk import error:', error);
            toast.error('Invalid JSON format');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteQuestion = async (id: string) => {
        if (!confirm('Delete this question?')) return;

        try {
            await supabase.from('questions').delete().eq('id', id);
            setQuestions(prev => prev.filter(q => q.id !== id));
            toast.success('Question deleted');
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    const handleDeleteFlashcard = async (id: string) => {
        if (!confirm('Delete this flashcard?')) return;

        try {
            await supabase.from('flashcards').delete().eq('id', id);
            setFlashcards(prev => prev.filter(f => f.id !== id));
            toast.success('Flashcard deleted');
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    if (authLoading || loading) {
        return (
            <Layout showFooter={false}>
                <div className="flex min-h-[60vh] items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </Layout>
        );
    }

    if (!user) return null;

    return (
        <Layout showFooter={false}>
            <div className="container py-8">
                <div className="mb-8">
                    <h1 className="font-display text-4xl font-bold tracking-tight">Admin Portal</h1>
                    <p className="text-muted-foreground mt-2">
                        Manage CBLE content: {questions.length} questions, {flashcards.length} flashcards
                    </p>
                </div>

                {/* Stats */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                    <Card>
                        <CardContent className="flex items-center gap-4 p-6">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <HelpCircle className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{questions.length}</p>
                                <p className="text-sm text-muted-foreground">Questions</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center gap-4 p-6">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-info/10 text-info">
                                <BookOpen className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{flashcards.length}</p>
                                <p className="text-sm text-muted-foreground">Flashcards</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center gap-4 p-6">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10 text-success">
                                <Database className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{domains.length}</p>
                                <p className="text-sm text-muted-foreground">Domains</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="questions" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
                        <TabsTrigger value="questions">Questions</TabsTrigger>
                        <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
                        <TabsTrigger value="import">Bulk Import</TabsTrigger>
                    </TabsList>

                    {/* Add Question Tab */}
                    <TabsContent value="questions" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Plus className="h-5 w-5" />
                                    Add New Question
                                </CardTitle>
                                <CardDescription>Create a new CBLE practice question</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="stem">Question Stem *</Label>
                                    <Textarea
                                        id="stem"
                                        value={newQuestion.stem}
                                        onChange={(e) => setNewQuestion(prev => ({ ...prev, stem: e.target.value }))}
                                        placeholder="Enter the question here..."
                                        rows={3}
                                    />
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <Label htmlFor="domain">Domain *</Label>
                                        <Select
                                            value={newQuestion.domain_id}
                                            onValueChange={(v) => setNewQuestion(prev => ({ ...prev, domain_id: v }))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select domain" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {domains.map(d => (
                                                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="difficulty">Difficulty (1-5)</Label>
                                        <Select
                                            value={String(newQuestion.difficulty)}
                                            onValueChange={(v) => setNewQuestion(prev => ({ ...prev, difficulty: Number(v) }))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {[1, 2, 3, 4, 5].map(d => (
                                                    <SelectItem key={d} value={String(d)}>{d}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {['A', 'B', 'C', 'D', 'E'].map(letter => (
                                    <div key={letter}>
                                        <Label htmlFor={`option_${letter}`}>Option {letter}</Label>
                                        <Input
                                            id={`option_${letter}`}
                                            value={newQuestion[`option_${letter.toLowerCase()}` as keyof typeof newQuestion] as string}
                                            onChange={(e) => setNewQuestion(prev => ({
                                                ...prev,
                                                [`option_${letter.toLowerCase()}`]: e.target.value
                                            }))}
                                            placeholder={`Option ${letter}...`}
                                        />
                                    </div>
                                ))}

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <Label htmlFor="correct">Correct Answer</Label>
                                        <Select
                                            value={newQuestion.correct_answer}
                                            onValueChange={(v) => setNewQuestion(prev => ({ ...prev, correct_answer: v }))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {['A', 'B', 'C', 'D', 'E'].map(a => (
                                                    <SelectItem key={a} value={a}>{a}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="reference">Reference Cue</Label>
                                        <Input
                                            id="reference"
                                            value={newQuestion.reference_cue}
                                            onChange={(e) => setNewQuestion(prev => ({ ...prev, reference_cue: e.target.value }))}
                                            placeholder="e.g. 19 CFR 111.23"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="rationale">Rationale</Label>
                                    <Textarea
                                        id="rationale"
                                        value={newQuestion.rationale}
                                        onChange={(e) => setNewQuestion(prev => ({ ...prev, rationale: e.target.value }))}
                                        placeholder="Explain why the correct answer is correct..."
                                        rows={3}
                                    />
                                </div>

                                <Button onClick={handleAddQuestion} disabled={saving} className="gradient-primary">
                                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                                    Save Question
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Recent Questions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Questions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {questions.slice(0, 10).map(q => (
                                        <div key={q.id} className="flex items-center justify-between p-3 rounded-lg border">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm truncate">{q.stem}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Badge variant="outline" className="text-xs">Answer: {q.correct_answer}</Badge>
                                                    <Badge variant="secondary" className="text-xs">Difficulty: {q.difficulty}</Badge>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive shrink-0"
                                                onClick={() => handleDeleteQuestion(q.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Add Flashcard Tab */}
                    <TabsContent value="flashcards" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Plus className="h-5 w-5" />
                                    Add New Flashcard
                                </CardTitle>
                                <CardDescription>Create a new study flashcard</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="front">Front (Question/Term) *</Label>
                                    <Input
                                        id="front"
                                        value={newFlashcard.front}
                                        onChange={(e) => setNewFlashcard(prev => ({ ...prev, front: e.target.value }))}
                                        placeholder="e.g. GRI 1"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="back">Back (Answer/Definition) *</Label>
                                    <Textarea
                                        id="back"
                                        value={newFlashcard.back}
                                        onChange={(e) => setNewFlashcard(prev => ({ ...prev, back: e.target.value }))}
                                        placeholder="Enter the answer or definition..."
                                        rows={3}
                                    />
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <Label htmlFor="fc_domain">Domain *</Label>
                                        <Select
                                            value={newFlashcard.domain_id}
                                            onValueChange={(v) => setNewFlashcard(prev => ({ ...prev, domain_id: v }))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select domain" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {domains.map(d => (
                                                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="fc_reference">Reference Cue</Label>
                                        <Input
                                            id="fc_reference"
                                            value={newFlashcard.reference_cue}
                                            onChange={(e) => setNewFlashcard(prev => ({ ...prev, reference_cue: e.target.value }))}
                                            placeholder="e.g. 19 CFR 152.103"
                                        />
                                    </div>
                                </div>

                                <Button onClick={handleAddFlashcard} disabled={saving} className="gradient-primary">
                                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                                    Save Flashcard
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Recent Flashcards */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Flashcards</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {flashcards.slice(0, 10).map(f => (
                                        <div key={f.id} className="flex items-center justify-between p-3 rounded-lg border">
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-sm">{f.front}</p>
                                                <p className="text-xs text-muted-foreground truncate">{f.back}</p>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive shrink-0"
                                                onClick={() => handleDeleteFlashcard(f.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Bulk Import Tab */}
                    <TabsContent value="import">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Upload className="h-5 w-5" />
                                    Bulk Import
                                </CardTitle>
                                <CardDescription>
                                    Paste JSON to import multiple questions/flashcards at once
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="bulk">JSON Data</Label>
                                    <Textarea
                                        id="bulk"
                                        value={bulkJson}
                                        onChange={(e) => setBulkJson(e.target.value)}
                                        placeholder={`{
  "questions": [
    {
      "stem": "Question text...",
      "option_a": "...",
      "option_b": "...",
      "option_c": "...",
      "option_d": "...",
      "option_e": "...",
      "correct_answer": "A",
      "rationale": "...",
      "reference_cue": "19 CFR ...",
      "difficulty": 2,
      "domain_index": 0
    }
  ],
  "flashcards": [
    {
      "front": "Term",
      "back": "Definition",
      "reference_cue": "19 CFR ...",
      "domain_index": 1
    }
  ]
}`}
                                        rows={20}
                                        className="font-mono text-xs"
                                    />
                                </div>

                                <Button onClick={handleBulkImport} disabled={saving} className="gradient-primary">
                                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                                    Import Data
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </Layout>
    );
}
