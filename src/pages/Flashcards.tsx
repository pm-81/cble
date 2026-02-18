import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import {
  Loader2,
  RotateCcw,
  Home,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  ThumbsUp,
  ThumbsDown,
  Minus,
  Zap,
  CheckCircle2,
  Sparkles,
  Plus,
  Save,
  Layers,
  Brain,
  Pencil,
  GraduationCap
} from 'lucide-react';
import { calculateSM2, ratingToQuality } from '@/lib/spaced-repetition';
import { FALLBACK_FLASHCARDS } from '@/lib/fallback-data';

interface Flashcard {
  id: string;
  front: string;
  back: string;
  reference_cue: string | null;
  domain_id: string | null;
}

interface FlashcardProgress {
  flashcard_id: string;
  ease_factor: number;
  interval_days: number;
  repetitions: number;
  due_date: string;
}

interface Domain {
  id: string;
  name: string;
}

type Rating = 'again' | 'hard' | 'good' | 'easy';
type Mode = 'review' | 'create';

export default function Flashcards() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<Mode>('review');
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [progress, setProgress] = useState<Map<string, FlashcardProgress>>(new Map());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reviewed, setReviewed] = useState<Set<string>>(new Set());
  const [sessionComplete, setSessionComplete] = useState(false);
  const [domains, setDomains] = useState<Domain[]>([]);

  // Creator State
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');
  const [newReference, setNewReference] = useState('');
  const [newDomain, setNewDomain] = useState<string>('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
  }, [user, authLoading, navigate]);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;

      // Fetch Domains
      const { data: domainData } = await supabase.from('domains').select('id, name');
      if (domainData) setDomains(domainData);

      await fetchFlashcards();
    }
    fetchData();
  }, [user]);

  async function fetchFlashcards() {
    setLoading(true);
    try {
      let finalCards: Flashcard[] = [];
      let progressMap = new Map<string, FlashcardProgress>();
      const reviewedIds = new Set<string>();

      if (user) {
        const { data: progressData } = await supabase.from('flashcard_progress').select('*').eq('user_id', user.id);
        progressData?.forEach(p => {
          progressMap.set(p.flashcard_id, { ...p, due_date: p.due_date || new Date().toISOString() });
        });

        const now = new Date();
        const dueIds = progressData?.filter(p => new Date(p.due_date) <= now).map(p => p.flashcard_id) || [];

        if (dueIds.length > 0) {
          const { data: dueCards } = await supabase.from('flashcards').select('*, domains(name)').in('id', dueIds.slice(0, 20)).eq('is_active', true);
          if (dueCards) finalCards = [...dueCards];
        }

        if (finalCards.length < 20) {
          const limit = 20 - finalCards.length;
          const { data: newCards } = await supabase.from('flashcards').select('*, domains(name)').eq('is_active', true).limit(50);
          if (newCards) {
            const novel = newCards.filter(c => !progressMap.has(c.id)).slice(0, limit);
            finalCards = [...finalCards, ...novel];
          }
        }
      }

      if (finalCards.length === 0) {
        const shuffled = [...FALLBACK_FLASHCARDS].sort(() => 0.5 - Math.random());
        finalCards = shuffled.slice(0, 20) as unknown as Flashcard[];
      }

      setFlashcards(finalCards);
      setProgress(progressMap);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const handleCreate = async () => {
    if (!newFront || !newBack || !user) {
      toast({ title: "Incomplete Data", description: "Front and Back are required.", variant: "destructive" });
      return;
    }
    setIsCreating(true);
    try {
      const { error } = await supabase.from('flashcards').insert({
        front: newFront,
        back: newBack,
        reference_cue: newReference || null,
        domain_id: newDomain || null,
        created_by: user.id,
        is_active: true
      });

      if (error) throw error;

      toast({ title: "Card Forged", description: "New concept added to your deck." });
      setNewFront(''); setNewBack(''); setNewReference(''); setNewDomain('');
    } catch (e) {
      toast({ title: "Error", description: "Failed to create card.", variant: "destructive" });
    } finally {
      setIsCreating(false);
    }
  };

  const handleRating = async (rating: Rating) => {
    if (!flashcards[currentIndex]) return;
    const card = flashcards[currentIndex];

    // Simulate navigation for fallback/mock
    if (!user || card.id.startsWith('mock-')) {
      if (rating === 'again') {
        setFlashcards(prev => {
          const updated = [...prev];
          const [moved] = updated.splice(currentIndex, 1);
          updated.push(moved);
          return updated;
        });
      } else {
        if (currentIndex < flashcards.length - 1) setCurrentIndex(prev => prev + 1);
        else setSessionComplete(true);
      }
      setIsFlipped(false);
      return;
    }

    const currentP = progress.get(card.id) || { ease_factor: 2.5, interval_days: 0, repetitions: 0, flashcard_id: card.id, due_date: '' };
    const quality = ratingToQuality(rating);
    const sm2 = calculateSM2({
      quality,
      previousEaseFactor: currentP.ease_factor,
      previousInterval: currentP.interval_days,
      previousRepetitions: currentP.repetitions
    });

    try {
      await supabase.from('flashcard_progress').upsert({
        user_id: user.id,
        flashcard_id: card.id,
        ease_factor: sm2.easeFactor,
        interval_days: sm2.interval,
        repetitions: sm2.repetitions,
        due_date: sm2.dueDate.toISOString(),
        last_reviewed: new Date().toISOString()
      }, { onConflict: 'user_id,flashcard_id' });

      setReviewed(prev => new Set(prev).add(card.id));

      if (rating === 'again') {
        setFlashcards(prev => {
          const updated = [...prev];
          const [moved] = updated.splice(currentIndex, 1);
          updated.push(moved);
          return updated;
        });
        // index stays same
      } else {
        if (currentIndex < flashcards.length - 1) setCurrentIndex(prev => prev + 1);
        else setSessionComplete(true);
      }
      setIsFlipped(false);

    } catch (e) {
      console.error(e);
    }
  };

  const currentDomainName = (flashcards[currentIndex] as any)?.domains?.name ||
    (domains.find(d => d.id === flashcards[currentIndex]?.domain_id)?.name) ||
    'General Concept';

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
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-background via-background to-primary/5 py-8 px-4">
        <div className="container max-w-4xl mx-auto space-y-8">

          {/* Mode Toggle Header */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="flex items-center gap-2 p-1 bg-muted/50 rounded-2xl border border-border/50">
              <button
                onClick={() => setMode('review')}
                className={`px-6 py-2 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${mode === 'review' ? 'bg-primary text-white shadow-glow-primary' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Review Deck
              </button>
              <button
                onClick={() => setMode('create')}
                className={`px-6 py-2 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${mode === 'create' ? 'bg-primary text-white shadow-glow-primary' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Forge Card
              </button>
            </div>
            {mode === 'review' && (
              <Badge variant="outline" className="px-4 py-1.5 bg-background/50 backdrop-blur-md border-primary/20 text-primary text-[10px] uppercase font-black tracking-widest">
                <Zap className="h-3 w-3 mr-2 fill-primary" />
                {reviewed.size} Concepts Mastered
              </Badge>
            )}
          </div>

          {/* CREATOR MODE */}
          {mode === 'create' && (
            <Card className="border-none shadow-3xl bg-card/60 backdrop-blur-xl rounded-[2.5rem] overflow-hidden animate-in zoom-in duration-300">
              <CardHeader className="p-8 border-b border-border/10 bg-primary/5">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-lg">
                    <Pencil className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-black tracking-tight">Knowledge Forge</CardTitle>
                    <CardDescription>Create custom distillation cards for your personal deck.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">The Question (Front)</Label>
                  <Textarea
                    placeholder="e.g., What are the General Rules of Interpretation (GRIs) used for?"
                    className="min-h-[100px] rounded-2xl bg-background/50 border-border/50 resize-none font-medium text-lg p-4 focus:ring-primary"
                    value={newFront}
                    onChange={e => setNewFront(e.target.value)}
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">The Answer (Back)</Label>
                  <Textarea
                    placeholder="e.g., To classify goods in the HTSUS when the heading text alone isn't sufficient..."
                    className="min-h-[140px] rounded-2xl bg-background/50 border-border/50 resize-none font-medium text-lg p-4 focus:ring-primary"
                    value={newBack}
                    onChange={e => setNewBack(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">CBLE Domain</Label>
                    <Select value={newDomain} onValueChange={setNewDomain}>
                      <SelectTrigger className="h-12 rounded-xl bg-background/50 border-border/50 font-bold">
                        <SelectValue placeholder="Select Topic..." />
                      </SelectTrigger>
                      <SelectContent>
                        {domains.map(d => (
                          <SelectItem key={d.id} value={d.id} className="font-medium">{d.name}</SelectItem>
                        ))}
                        <SelectItem value="general" className="font-medium">General Knowledge</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Legal Reference</Label>
                    <Input
                      placeholder="e.g., 19 CFR 152.103"
                      className="h-12 rounded-xl bg-background/50 border-border/50 font-bold"
                      value={newReference}
                      onChange={e => setNewReference(e.target.value)}
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button
                    size="lg"
                    onClick={handleCreate}
                    disabled={isCreating}
                    className="h-14 px-8 rounded-2xl gradient-primary shadow-glow-primary font-black uppercase tracking-widest text-xs gap-2 transition-all active:scale-95"
                  >
                    {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save to Deck
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* REVIEW MODE */}
          {mode === 'review' && (
            <div className="relative">
              {sessionComplete ? (
                <Card className="max-w-xl mx-auto border-none shadow-3xl bg-card/60 backdrop-blur-xl rounded-[2.5rem] overflow-hidden animate-in zoom-in duration-500 text-center">
                  <CardContent className="py-20 px-8">
                    <div className="mx-auto h-24 w-24 rounded-full gradient-primary flex items-center justify-center shadow-lg mb-8">
                      <CheckCircle2 className="h-12 w-12 text-white" />
                    </div>
                    <h2 className="font-display text-3xl font-black tracking-tight mb-4">Focus Cycle Complete</h2>
                    <p className="text-muted-foreground text-lg mb-8">You've successfully reinforced {reviewed.size} neural pathways.</p>
                    <Button size="lg" onClick={() => window.location.reload()} className="h-14 px-10 rounded-2xl gradient-primary font-black uppercase tracking-widest shadow-glow">
                      <RotateCcw className="h-4 w-4 mr-2" /> Start New Cycle
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {flashcards.length > 0 ? (
                    <div className="perspective-1000 group">
                      {/* Progress HUD */}
                      <div className="absolute -top-12 left-0 right-0 flex justify-center pb-8 z-10">
                        <div className="bg-card/80 backdrop-blur-md px-6 py-2 rounded-full border border-border/50 shadow-sm flex items-center gap-4">
                          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Card {currentIndex + 1} / {flashcards.length}</span>
                          <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary transition-all duration-500" style={{ width: `${((currentIndex + 1) / flashcards.length) * 100}%` }} />
                          </div>
                        </div>
                      </div>

                      <div
                        className={`relative transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] transform-style-3d min-h-[500px] cursor-pointer`}
                        style={{ transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
                        onClick={() => setIsFlipped(!isFlipped)}
                      >
                        {/* FRONT */}
                        <div
                          className={`absolute inset-0 backface-hidden rounded-[2.5rem] bg-card border-2 border-border/50 shadow-2xl p-10 flex flex-col items-center justify-center text-center group-hover:border-primary/20 transition-colors ${isFlipped ? 'pointer-events-none' : ''}`}
                          style={{ backfaceVisibility: 'hidden' }}
                        >
                          <div className="absolute top-8 left-8">
                            <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/10 tracking-[0.2em] font-black text-[10px]">
                              {currentDomainName}
                            </Badge>
                          </div>
                          <Brain className="h-16 w-16 text-primary mb-8 opacity-20" />
                          <h3 className="text-2xl md:text-4xl font-display font-medium leading-tight">{flashcards[currentIndex].front}</h3>
                          <div className="absolute bottom-8 flex flex-col items-center animate-pulse opacity-50">
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground">Tap to Reveal</span>
                          </div>
                        </div>

                        {/* BACK */}
                        <div
                          className="absolute inset-0 backface-hidden rounded-[2.5rem] bg-gradient-to-br from-card to-primary/5 border-2 border-primary/20 shadow-glow-primary p-10 flex flex-col items-center justify-center text-center"
                          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                        >
                          <p className="text-xl md:text-2xl font-medium leading-relaxed">{flashcards[currentIndex].back}</p>
                          {flashcards[currentIndex].reference_cue && (
                            <div className="mt-8 px-4 py-2 rounded-xl bg-background/50 border border-border/50 font-mono text-xs text-muted-foreground font-bold">
                              REF: {flashcards[currentIndex].reference_cue}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* CONTROLS */}
                      <div className={`mt-8 grid grid-cols-4 gap-4 transition-all duration-500 transform ${isFlipped ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                        {[
                          { id: 'again', label: 'Again', color: 'bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20', icon: RotateCcw, sub: '< 1m' },
                          { id: 'hard', label: 'Hard', color: 'bg-warning/10 text-warning border-warning/20 hover:bg-warning/20', icon: Minus, sub: '2d' },
                          { id: 'good', label: 'Good', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20', icon: ThumbsUp, sub: '4d' },
                          { id: 'easy', label: 'Easy', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20', icon: Zap, sub: '7d' }
                        ].map((btn) => (
                          <button
                            key={btn.id}
                            onClick={(e) => { e.stopPropagation(); handleRating(btn.id as Rating); }}
                            className={`group relative flex flex-col items-center justify-center p-4 rounded-3xl border ${btn.color} transition-all active:scale-95 shadow-lg backdrop-blur-sm`}
                          >
                            <btn.icon className="h-6 w-6 mb-2" />
                            <span className="text-xs font-black uppercase tracking-wider">{btn.label}</span>
                            <span className="text-[10px] opacity-70 mt-1 font-bold">{btn.sub}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-24 animate-in fade-in zoom-in">
                      <div className="h-20 w-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Layers className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-xl font-bold">Deck Empty</h3>
                      <p className="text-muted-foreground max-w-sm mx-auto mt-2 mb-8">No cards are currently active for review.</p>
                      <Button onClick={() => setMode('create')} variant="outline" className="rounded-xl border-dashed h-12 px-8">
                        <Plus className="h-4 w-4 mr-2" />
                        Forge First Card
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
