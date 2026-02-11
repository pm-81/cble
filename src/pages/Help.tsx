import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Book,
    Settings,
    Brain,
    Target,
    Zap,
    Clock,
    Library,
    BarChart,
    Calendar,
    Smartphone,
    ChevronRight,
    HelpCircle
} from 'lucide-react';

const sections = [
    {
        id: 'getting-started',
        title: 'Getting Started',
        icon: Settings,
        articles: [
            {
                title: 'Complete Your Onboarding',
                content: 'Upon first login, the onboarding process helps CBLETest understand your current knowledge level and exam timeline. Setting your exam date is critical as it drives the Smart Study Planner.'
            },
            {
                title: 'Managing Your Profile',
                content: 'Visit the Settings page to update your exam date, change your study goals, or manage your notification preferences.'
            }
        ]
    },
    {
        id: 'study-modes',
        title: 'Mastering Study Modes',
        icon: Brain,
        articles: [
            {
                title: 'Custom Quiz Builder',
                content: 'Located in the Study tab, this tool lets you filter by specific 19 CFR domains (like Valuation or Classification), select difficulty levels, and choose between timed or untimed sessions. Pro Tip: Use "Unseen Only" to work through fresh content.'
            },
            {
                title: 'Adaptive Flashcards',
                content: 'Our flashcard system uses the SM-2 Spaced Repetition algorithm. Rate your recall (1-5) after each card. The system will show difficult cards more frequently and phase out mastered concepts, maximizing your memory retention for legal definitions.'
            },
            {
                title: 'Navigation Drills',
                content: 'A rapid-fire game designed to help you memorize CFR part numbers and Form numbers. You have 60 seconds to answer as many questions as possible. High streaks earn higher readiness scores!'
            }
        ]
    },
    {
        id: 'exam-prep',
        title: 'Exam Simulation',
        icon: Zap,
        articles: [
            {
                title: 'The Exam Timer',
                content: 'When starting a full simulation, a 4.5-hour countdown timer appears. This mirrors the official CBP testing conditions. The timer will turn yellow at 30 minutes and red at 5 minutes to help you manage your pace.'
            },
            {
                title: 'Domain Quotas',
                content: 'Official exams follow a specific blueprint (e.g., 15 questions on Classification, 10 on Broker Duties). Our "Full Simulation" mode automatically generates quizzes that match these exact ratios.'
            }
        ]
    },
    {
        id: 'advanced-tools',
        title: 'Advanced Study Tools',
        icon: Library,
        articles: [
            {
                title: 'eCFR Reference Library',
                content: 'Access the most important parts of Title 19 CFR directly. Every entry in our library includes deep links to the official ecfr.gov site, allowing you to read the full legal text alongside your practice questions.'
            },
            {
                title: 'Smart Study Planner',
                content: 'Found in your dashboard, the planner breaks down your weekly study Goal into daily sessions. It accounts for your "weakest domains" and ensures you cover every part of the syllabus before exam day.'
            },
            {
                title: 'User Notes & Mnemonics',
                content: 'Add your own cross-references or memory tricks to any question. These are stored in your personal "Notes" tab for quick review before the exam.'
            }
        ]
    },
    {
        id: 'analytics',
        title: 'Understanding Analytics',
        icon: BarChart,
        articles: [
            {
                title: 'The Confidence Gap',
                content: 'A unique CBLETest metric. If your self-rated confidence is high but your accuracy is low, we flag a "Confidence Gap." This highlights areas where you might be misinterpreting complex 19 CFR regulations.'
            },
            {
                title: 'Mastery Radar',
                content: 'Your performance profile across all 8 CBLE domains. Aim for a "balanced" radar shape to ensure you don\'t have critical failure points in high-weight topics like HTSUS or Valuation.'
            }
        ]
    },
    {
        id: 'mobile-pwa',
        title: 'PWA & Mobile Use',
        icon: Smartphone,
        articles: [
            {
                title: 'Installing the App',
                content: 'CBLETest is a Progressive Web App (PWA). On mobile, tap "Add to Home Screen" in your browser menu. This installs the platform as a native app with faster loading and offline support for your flashcard reviews.'
            }
        ]
    }
];

export default function Help() {
    return (
        <Layout>
            <div className="container py-12 max-w-5xl animate-fade-in">
                <div className="text-center mb-16">
                    <Badge className="mb-4 py-1.5 px-4 bg-primary/10 text-primary border-primary/20">
                        <HelpCircle className="w-4 h-4 mr-2" />
                        Support Center
                    </Badge>
                    <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 tracking-tight">
                        How can we help you <span className="text-primary">pass?</span>
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Everything you need to know about mastering the CBLETest platform and optimizing your study path.
                    </p>
                </div>

                <div className="grid gap-8 lg:grid-cols-12">
                    {/* Sidebar Nav */}
                    <aside className="lg:col-span-3 space-y-2">
                        <div className="sticky top-24">
                            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 px-3">Categories</p>
                            {sections.map((section) => (
                                <a
                                    key={section.id}
                                    href={`#${section.id}`}
                                    className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium hover:bg-muted transition-colors group"
                                >
                                    <section.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                                    {section.title}
                                </a>
                            ))}
                        </div>
                    </aside>

                    {/* Content */}
                    <main className="lg:col-span-9 space-y-12">
                        {sections.map((section) => (
                            <section key={section.id} id={section.id} className="scroll-mt-24 space-y-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                                        <section.icon className="w-6 h-6" />
                                    </div>
                                    <h2 className="text-2xl font-bold">{section.title}</h2>
                                </div>

                                <div className="grid gap-4">
                                    {section.articles.map((article, idx) => (
                                        <Card key={idx} className="border-none shadow-sm bg-muted/30">
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-lg flex items-center justify-between">
                                                    {article.title}
                                                    <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-muted-foreground leading-relaxed">
                                                    {article.content}
                                                </p>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </section>
                        ))}

                        {/* Final CTA */}
                        <div className="mt-20 p-8 rounded-3xl bg-gradient-to-br from-primary to-indigo-600 text-white text-center shadow-xl shadow-primary/20">
                            <h3 className="text-2xl font-bold mb-2">Still have questions?</h3>
                            <p className="text-indigo-100 mb-6">Our team of licensed brokers is here to help you navigate the prep process.</p>
                            <Button variant="secondary" className="bg-white text-primary hover:bg-white/90 font-bold px-8" asChild>
                                <a href="mailto:support@cbletest.com">Contact Support</a>
                            </Button>
                        </div>
                    </main>
                </div>
            </div>
        </Layout>
    );
}

function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <div className={`inline-flex items-center rounded-full border text-xs font-semibold transition-colors ${className}`}>
            {children}
        </div>
    );
}
