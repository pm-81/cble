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
        <Layout>
            <div className="container max-w-3xl py-8 space-y-6">
                <div className="space-y-2">
                    <h1 className="font-display text-2xl font-bold flex items-center gap-2">
                        <BookOpen className="h-6 w-6 text-primary" />
                        eCFR Reference Library
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        Direct links to Title 19 CFR sections on ecfr.gov. Use these during study to read the primary source material.
                    </p>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search by part number, section, or topic..."
                        className="pl-9"
                    />
                </div>

                <div className="space-y-3">
                    {filtered.map(ref => {
                        const isExpanded = expandedParts.has(ref.part) || search.length > 0;
                        return (
                            <Card key={ref.part} className="transition-all">
                                <CardHeader
                                    className="cursor-pointer hover:bg-muted/30 transition-colors py-3"
                                    onClick={() => togglePart(ref.part)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                            <div>
                                                <CardTitle className="text-base">{ref.part}</CardTitle>
                                                <p className="text-sm text-muted-foreground">{ref.title}</p>
                                            </div>
                                        </div>
                                        <a
                                            href={ref.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary hover:underline text-xs flex items-center gap-1"
                                            onClick={e => e.stopPropagation()}
                                        >
                                            Full Part <ExternalLink className="h-3 w-3" />
                                        </a>
                                    </div>
                                </CardHeader>
                                {isExpanded && (
                                    <CardContent className="pt-0 pb-4">
                                        <div className="space-y-1 ml-7">
                                            {ref.subsections.map(sub => (
                                                <a
                                                    key={sub.section}
                                                    href={sub.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-muted/50 transition-colors group"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="outline" className="font-mono text-xs">{sub.section}</Badge>
                                                        <span className="text-sm">{sub.title}</span>
                                                    </div>
                                                    <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
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
                    <Card>
                        <CardContent className="py-8 text-center text-muted-foreground">
                            No matching CFR references found.
                        </CardContent>
                    </Card>
                )}
            </div>
        </Layout>
    );
}
