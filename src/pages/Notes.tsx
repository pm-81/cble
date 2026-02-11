import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { StickyNote, Plus, Trash2, Lightbulb, Search, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Note {
    id: string;
    title: string | null;
    content: string;
    is_mnemonic: boolean;
    tags: string[] | null;
    created_at: string;
}

export default function Notes() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isMnemonic, setIsMnemonic] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (user) fetchNotes();
    }, [user]);

    async function fetchNotes() {
        setLoading(true);
        const { data, error } = await supabase
            .from('user_notes')
            .select('*')
            .eq('user_id', user!.id)
            .order('created_at', { ascending: false });
        if (!error && data) setNotes(data as Note[]);
        setLoading(false);
    }

    async function saveNote() {
        if (!content.trim()) return;
        setSaving(true);
        const { error } = await supabase.from('user_notes').insert({
            user_id: user!.id,
            title: title.trim() || null,
            content: content.trim(),
            is_mnemonic: isMnemonic,
        });
        setSaving(false);
        if (error) {
            toast({ title: 'Error', description: 'Failed to save note.', variant: 'destructive' });
        } else {
            toast({ title: 'Saved!', description: 'Note created successfully.' });
            setTitle(''); setContent(''); setIsMnemonic(false); setShowForm(false);
            fetchNotes();
        }
    }

    async function deleteNote(id: string) {
        await supabase.from('user_notes').delete().eq('id', id);
        setNotes(prev => prev.filter(n => n.id !== id));
        toast({ title: 'Deleted', description: 'Note removed.' });
    }

    const filtered = notes.filter(n =>
        n.content.toLowerCase().includes(search.toLowerCase()) ||
        (n.title && n.title.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <Layout>
            <div className="container max-w-3xl py-8 space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="font-display text-2xl font-bold flex items-center gap-2">
                        <StickyNote className="h-6 w-6 text-primary" />
                        My Notes & Mnemonics
                    </h1>
                    <Button onClick={() => setShowForm(!showForm)} size="sm">
                        <Plus className="h-4 w-4 mr-1" /> New Note
                    </Button>
                </div>

                {showForm && (
                    <Card>
                        <CardContent className="pt-6 space-y-4">
                            <div className="space-y-2">
                                <Label>Title (optional)</Label>
                                <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. GRI 3 mnemonic" />
                            </div>
                            <div className="space-y-2">
                                <Label>Content</Label>
                                <Textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Write your note or mnemonic here..." rows={4} />
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch checked={isMnemonic} onCheckedChange={setIsMnemonic} />
                                <Label className="flex items-center gap-1">
                                    <Lightbulb className="h-3 w-3" /> Mark as Mnemonic
                                </Label>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                                <Button onClick={saveNote} disabled={saving || !content.trim()}>
                                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                                    Save Note
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search notes..."
                        className="pl-9"
                    />
                </div>

                {loading ? (
                    <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
                ) : filtered.length === 0 ? (
                    <Card><CardContent className="py-12 text-center text-muted-foreground">
                        {notes.length === 0 ? 'No notes yet. Create your first one!' : 'No notes match your search.'}
                    </CardContent></Card>
                ) : (
                    <ScrollArea className="h-[500px]">
                        <div className="space-y-3">
                            {filtered.map(note => (
                                <Card key={note.id} className="group">
                                    <CardContent className="py-4">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1 space-y-1">
                                                {note.title && <p className="font-medium text-sm">{note.title}</p>}
                                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{note.content}</p>
                                                <div className="flex gap-2 pt-1">
                                                    {note.is_mnemonic && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            <Lightbulb className="h-3 w-3 mr-1" /> Mnemonic
                                                        </Badge>
                                                    )}
                                                    <span className="text-xs text-muted-foreground">
                                                        {new Date(note.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => deleteNote(note.id)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </ScrollArea>
                )}
            </div>
        </Layout>
    );
}
