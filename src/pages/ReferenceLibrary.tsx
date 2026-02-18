import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { BookOpen, ExternalLink, Search, ChevronDown, ChevronRight } from 'lucide-react';
import { ecfrReferences } from '@/lib/ecfr-references';

export default function ReferenceLibrary() {
    const [search, setSearch] = useState('');
    const [expandedParts, setExpandedParts] = useState<Set<string>>(new Set());

    const togglePart = (part: string) => {
        const next = new Set(expandedParts);
        if (next.has(part)) next.delete(part); else next.add(part);
        setExpandedParts(next);
    };

    const filtered = ecfrReferences.filter(ref =>
        ref.part.toLowerCase().includes(search.toLowerCase()) ||
        ref.title.toLowerCase().includes(search.toLowerCase()) ||
        ref.subsections.some(s =>
            s.section.toLowerCase().includes(search.toLowerCase()) ||
            s.title.toLowerCase().includes(search.toLowerCase())
        )
    );

    return (
        <Layout showFooter={false}>
            <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5 py-10 px-4 pb-20">
                <div className="container max-w-4xl mx-auto space-y-12">
                    {/* Hero Header */}
                    <div className="text-center space-y-4 animate-in fade-in slide-in-from-top-4 duration-1000">
                        <Badge
                            variant="outline"
                            className="px-6 py-2 bg-primary/10 text-primary border-primary/20 text-[10px] font-black uppercase tracking-[0.3em] backdrop-blur-sm"
                        >
                            Legal Compendium
                        </Badge>
                        <h1 className="font-display text-5xl md:text-6xl font-black tracking-tighter">
                            CFR <span className="text-primary italic">Navigator</span>
                        </h1>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
                            A distilled index of Title 19 CFR regulations. Directly synchronized with official eCFR sources for peak accuracy.
                        </p>
                    </div>

                    {/* Search & Stats Bar */}
                    <div className="sticky top-6 z-30 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-primary/50 to-accent/50 rounded-[2rem] blur opacity-25 group-hover:opacity-40 transition-opacity" />
                            <div className="relative bg-card/80 backdrop-blur-xl border border-border/50 rounded-[2rem] p-2 flex items-center shadow-2xl">
                                <Search className="ml-4 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <Input
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder="Search by part number, section, or keyword..."
                                    className="border-none bg-transparent shadow-none focus-visible:ring-0 text-lg py-6 placeholder:text-muted-foreground/50"
                                />
                                <div className="hidden sm:flex items-center gap-2 pr-4">
                                    <Badge variant="secondary" className="bg-muted text-[10px] font-black">{filtered.length} Results</Badge>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Library Grid */}
                    <div className="grid gap-6 animate-in fade-in duration-1000 delay-400">
                        {filtered.map((ref, idx) => {
                            const isExpanded = expandedParts.has(ref.part) || search.length > 0;
                            return (
                                <Card
                                    key={ref.part}
                                    className={`border-none overflow-hidden transition-all duration-500 group ${isExpanded ? 'bg-card shadow-3xl ring-1 ring-primary/20' : 'bg-card/40 hover:bg-card shadow-xl'
                                        }`}
                                >
                                    <div
                                        className="cursor-pointer p-6 sm:p-8"
                                        onClick={() => togglePart(ref.part)}
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                                            <div className="flex items-center gap-6">
                                                <div className={`h-14 w-14 rounded-2xl flex items-center justify-center font-black text-2xl relative overflow-hidden transition-all ${isExpanded ? 'bg-primary text-white shadow-glow-primary' : 'bg-muted text-muted-foreground'
                                                    }`}>
                                                    {ref.part}
                                                </div>
                                                <div>
                                                    <h3 className="font-display font-black text-xl tracking-tight group-hover:text-primary transition-colors">
                                                        {ref.title}
                                                    </h3>
                                                    <p className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest mt-1">
                                                        Title 19 — Customs Duties
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <a
                                                    href={ref.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="h-10 px-4 rounded-xl bg-primary/5 text-primary hover:bg-primary/10 border border-primary/10 transition-all text-xs font-black uppercase tracking-widest flex items-center gap-2"
                                                    onClick={e => e.stopPropagation()}
                                                >
                                                    PART INDEX <ExternalLink className="h-3 w-3" />
                                                </a>
                                                {isExpanded ? <ChevronDown className="h-6 w-6 text-primary" /> : <ChevronRight className="h-6 w-6 text-muted-foreground" />}
                                            </div>
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <CardContent className="px-6 sm:px-8 pb-8 pt-0 animate-in slide-in-from-top-4 duration-500">
                                            <div className="grid gap-2 bg-muted/30 rounded-[1.5rem] p-2 border border-border/50">
                                                {ref.subsections.map(sub => (
                                                    <a
                                                        key={sub.section}
                                                        href={sub.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center justify-between p-4 rounded-xl bg-card border border-transparent hover:border-primary/20 hover:shadow-lg transition-all group/item"
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className="h-9 w-12 rounded-lg bg-muted flex items-center justify-center font-mono text-[10px] font-black border border-border shadow-sm group-hover/item:bg-primary group-hover/item:text-white transition-colors">
                                                                §{sub.section}
                                                            </div>
                                                            <span className="text-sm font-bold group-hover/item:text-primary transition-colors">{sub.title}</span>
                                                        </div>
                                                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-all">
                                                            <ExternalLink className="h-4 w-4 text-primary" />
                                                        </div>
                                                    </a>
                                                ))}
                                            </div>
                                        </CardContent>
                                    )}
                                </Card>
                            );
                        })}
                    </div>

                    {filtered.length === 0 && (
                        <div className="py-24 text-center animate-in zoom-in duration-500">
                            <div className="mx-auto h-20 w-20 rounded-3xl bg-muted flex items-center justify-center mb-6">
                                <Search className="h-10 w-10 text-muted-foreground opacity-20" />
                            </div>
                            <h3 className="text-2xl font-bold">No Statutes Found</h3>
                            <p className="text-muted-foreground max-w-sm mx-auto mt-2">
                                We couldn't find any CFR references matching your search term. Try a part number (e.g., "152") or keyword ("valuation").
                            </p>
                            <Button variant="ghost" className="mt-6" onClick={() => setSearch('')}>Clear Search</Button>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}

