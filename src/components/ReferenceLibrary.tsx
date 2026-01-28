import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Search, ExternalLink } from 'lucide-react';

interface CFRReference {
    part: string;
    title: string;
    description: string;
    keyPoints: string[];
    examWeight: 'High' | 'Medium' | 'Low';
}

const cfrReferences: CFRReference[] = [
    // 19 CFR Part 111 - Broker Regulations
    {
        part: '19 CFR 111',
        title: 'Customs Brokers',
        description: 'Regulations governing the licensing and conduct of customs brokers.',
        keyPoints: [
            '111.1 - Definitions (customs business, responsible supervision)',
            '111.11 - Basic requirements to obtain a license',
            '111.19 - Permits (national permit, district permits)',
            '111.23 - Records must be kept for 5 years',
            '111.28 - Employee information and changes',
            '111.29 - Due diligence and reasonable care',
            '111.30 - Triennial status report due Feb 1 every 3 years',
            '111.36 - Compensation and fee sharing restrictions',
            '111.39 - Advice to client regarding errors',
            '111.45 - Revocation by operation of law',
            '111.53 - Grounds for suspension or revocation',
            '111.91 - Monetary penalty (up to $30,000 per violation)',
        ],
        examWeight: 'High',
    },
    // 19 CFR Part 113 - Bonds
    {
        part: '19 CFR 113',
        title: 'CBP Bonds',
        description: 'Requirements for customs bonds, including continuous and single entry bonds.',
        keyPoints: [
            '113.11 - Bond required for entry',
            '113.12 - Single transaction bond (STB)',
            '113.13 - Continuous bond - minimum $50,000 for importers',
            '113.62 - Basic importation and entry bond conditions',
            '113.63 - Custodian bonds (warehouses, FTZs)',
        ],
        examWeight: 'Medium',
    },
    // 19 CFR Part 134 - Marking
    {
        part: '19 CFR 134',
        title: 'Country of Origin Marking',
        description: 'Requirements for marking imported articles with country of origin.',
        keyPoints: [
            '134.1 - Definitions (ultimate purchaser, country of origin)',
            '134.11 - Marking requirements (English, conspicuous, legible, permanent)',
            '134.2 - Marking duty (10% ad valorem penalty)',
            '134.32 - General exceptions from marking',
            '134.33 - J-List articles exempt from individual marking',
            '134.35 - Articles substantially transformed in US',
        ],
        examWeight: 'High',
    },
    // 19 CFR Part 141 - Entry of Merchandise
    {
        part: '19 CFR 141',
        title: 'Entry of Merchandise',
        description: 'General rules for entering merchandise into US commerce.',
        keyPoints: [
            '141.0a - Entry types defined (consumption, warehouse, TIB, T&E)',
            '141.4 - Entry required within 15 days of arrival',
            '141.11 - Who may make entry (owner, purchaser, consignee, broker)',
            '141.46 - Power of Attorney requirements',
            '141.61 - Entry summary (Form 7501)',
            '141.68 - Time of entry (when entry documents filed/duties deposited)',
            '141.86 - Commercial invoice requirements',
            '141.89 - Special invoice requirements (textiles, etc.)',
        ],
        examWeight: 'High',
    },
    // 19 CFR Part 142 - Entry Process
    {
        part: '19 CFR 142',
        title: 'Entry Process',
        description: 'Detailed procedures for the entry process.',
        keyPoints: [
            '142.3 - Entry documentation required',
            '142.12 - Entry summary must be filed within 10 working days',
            '142.15 - Failure to file (liquidated damages)',
            '142.21 - Immediate delivery procedure',
        ],
        examWeight: 'High',
    },
    // 19 CFR Part 143 - Informal Entries
    {
        part: '19 CFR 143',
        title: 'Special Entry Procedures',
        description: 'Informal entries and mail importations.',
        keyPoints: [
            '143.21 - Informal entry limit ($2,500 for commercial shipments)',
            '143.23 - Merchandise ineligible for informal entry',
        ],
        examWeight: 'Medium',
    },
    // 19 CFR Part 144 - Warehouse Entries
    {
        part: '19 CFR 144',
        title: 'Warehouse and Rewarehouse Entries',
        description: 'Bonded warehouse procedures and time limits.',
        keyPoints: [
            '144.1 - Merchandise may remain in warehouse up to 5 years',
            '144.5 - Merchandise considered abandoned after 5 years',
            '144.36 - Transfer of goods between warehouses',
        ],
        examWeight: 'Medium',
    },
    // 19 CFR Part 152 - Valuation
    {
        part: '19 CFR 152',
        title: 'Classification and Appraisement',
        description: 'Methods for determining dutiable value of imports.',
        keyPoints: [
            '152.101 - Valuation hierarchy (Transaction → Identical → Similar → Deductive → Computed → Fallback)',
            '152.102 - Definitions (assists, related parties, identical/similar merchandise)',
            '152.103 - Transaction Value (price actually paid or payable)',
            '152.103(b) - Additions to PAPP (selling commissions, assists, royalties, packing)',
            '152.103(f) - Royalties as condition of sale',
            '152.103(l) - Related party transactions',
            '152.105 - Deductive value (superdeductive for further processed goods)',
            '152.106 - Computed value (cost of materials + profit + general expenses)',
        ],
        examWeight: 'High',
    },
    // 19 CFR Part 159 - Liquidation
    {
        part: '19 CFR 159',
        title: 'Liquidation of Duties',
        description: 'Final computation of duties and related procedures.',
        keyPoints: [
            '159.1 - Definition of liquidation',
            '159.11 - Liquidation generally within 314 days',
            '159.12 - Extension of liquidation (up to 1 additional year)',
            '159.32 - Currency conversion (rate on date of exportation)',
        ],
        examWeight: 'High',
    },
    // 19 CFR Part 163 - Recordkeeping
    {
        part: '19 CFR 163',
        title: 'Recordkeeping',
        description: 'Record retention requirements for importers and brokers.',
        keyPoints: [
            '163.4 - Records must be kept for 5 years from date of entry',
            '163.5 - Methods of storage (paper, electronic, microfiche)',
            '163.6 - Production of records within 30 days of CBP request',
            '163.11 - Failure to maintain records (penalties per entry)',
        ],
        examWeight: 'Medium',
    },
    // 19 CFR Part 174 - Protests
    {
        part: '19 CFR 174',
        title: 'Protests',
        description: 'Procedures for protesting CBP decisions.',
        keyPoints: [
            '174.11 - Matters subject to protest (classification, valuation, rate of duty)',
            '174.12 - Form 19 must be filed within 180 days of liquidation',
            '174.12(e) - Exclusion protests filed within 90 days',
            '174.21 - CBP has 2 years to decide on a protest',
            '174.22 - Accelerated disposition (request after 90 days)',
        ],
        examWeight: 'High',
    },
    // 19 CFR Part 190 - Drawback
    {
        part: '19 CFR 190',
        title: 'Modernized Drawback',
        description: 'Refund of duties on exported merchandise.',
        keyPoints: [
            '190.2 - Drawback is 99% of duties, taxes, and fees',
            '190.7 - Drawback claim must be filed within 5 years of export',
            '190.10 - Certificate of Delivery (Form 7552)',
            '190.22 - Substitution rules',
        ],
        examWeight: 'Medium',
    },
    // GRI Rules
    {
        part: 'GRI 1-6',
        title: 'General Rules of Interpretation',
        description: 'Rules for classifying goods in the HTSUS.',
        keyPoints: [
            'GRI 1 - Classification by terms of headings and Section/Chapter Notes',
            'GRI 2(a) - Incomplete/unfinished articles classified as complete if essential character',
            'GRI 2(b) - Mixtures and combinations include reference to that material',
            'GRI 3(a) - Most specific description prevails (relative specificity)',
            'GRI 3(b) - Essential character for sets and composite goods',
            'GRI 3(c) - Heading last in numerical order (tie-breaker)',
            'GRI 4 - Goods classified by most similar goods (akin)',
            'GRI 5(a) - Cases classified with the articles they contain',
            'GRI 5(b) - Packing materials classified with goods unless suitable for repetitive use',
            'GRI 6 - Subheading classification uses same rules at subheading level',
        ],
        examWeight: 'High',
    },
    // HTSUS Chapter 98
    {
        part: 'HTSUS Chapter 98',
        title: 'Special Classification Provisions',
        description: 'Special duty provisions for returned goods, repairs, and more.',
        keyPoints: [
            '9801 - American goods returned (not advanced in value)',
            '9802 - Articles assembled abroad from US components',
            '9817 - Articles for the handicapped (duty-free)',
        ],
        examWeight: 'Medium',
    },
];

interface ReferenceLibraryProps {
    currentReference?: string; // e.g., "19 CFR 111.23"
    trigger?: React.ReactNode;
}

export function ReferenceLibrary({ currentReference, trigger }: ReferenceLibraryProps) {
    const [searchQuery, setSearchQuery] = useState(currentReference || '');
    const [isOpen, setIsOpen] = useState(false);

    const filteredReferences = cfrReferences.filter(ref => {
        const query = searchQuery.toLowerCase();
        return (
            ref.part.toLowerCase().includes(query) ||
            ref.title.toLowerCase().includes(query) ||
            ref.description.toLowerCase().includes(query) ||
            ref.keyPoints.some(point => point.toLowerCase().includes(query))
        );
    });

    const getWeightColor = (weight: string) => {
        switch (weight) {
            case 'High': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
            case 'Medium': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
            case 'Low': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                {trigger || (
                    <Button variant="outline" size="sm" className="gap-2">
                        <BookOpen className="h-4 w-4" />
                        Reference Library
                    </Button>
                )}
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-lg">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-primary" />
                        CFR Reference Library
                    </SheetTitle>
                    <SheetDescription>
                        Quick lookup of 19 CFR regulations and HTSUS rules commonly tested on the CBLE.
                    </SheetDescription>
                </SheetHeader>

                <div className="mt-6 space-y-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search references (e.g., '111.23', 'protest', 'GRI')"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    {/* Results */}
                    <ScrollArea className="h-[calc(100vh-250px)]">
                        <Accordion type="single" collapsible className="w-full">
                            {filteredReferences.map((ref, index) => (
                                <AccordionItem key={index} value={`item-${index}`}>
                                    <AccordionTrigger className="hover:no-underline">
                                        <div className="flex items-center gap-3 text-left">
                                            <div>
                                                <div className="font-semibold">{ref.part}</div>
                                                <div className="text-sm text-muted-foreground">{ref.title}</div>
                                            </div>
                                            <Badge className={`ml-auto shrink-0 ${getWeightColor(ref.examWeight)}`}>
                                                {ref.examWeight}
                                            </Badge>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <div className="space-y-3 pt-2">
                                            <p className="text-sm text-muted-foreground">{ref.description}</p>
                                            <div className="space-y-1.5">
                                                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                                    Key Points
                                                </h4>
                                                <ul className="space-y-1">
                                                    {ref.keyPoints.map((point, i) => (
                                                        <li key={i} className="text-sm flex items-start gap-2">
                                                            <span className="text-primary mt-1">•</span>
                                                            <span>{point}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <a
                                                href={`https://www.ecfr.gov/current/title-19`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                                            >
                                                View on eCFR <ExternalLink className="h-3 w-3" />
                                            </a>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>

                        {filteredReferences.length === 0 && (
                            <div className="py-8 text-center text-muted-foreground">
                                <p>No references found for "{searchQuery}"</p>
                                <p className="text-sm mt-1">Try a different search term</p>
                            </div>
                        )}
                    </ScrollArea>
                </div>
            </SheetContent>
        </Sheet>
    );
}
