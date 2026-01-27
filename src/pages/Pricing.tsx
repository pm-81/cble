import { Layout } from '@/components/layout/Layout';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/card'; // Fixed import later, using standard UI components
import { Check, Sparkles, Zap, ShieldCheck, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const plans = [
    {
        name: 'Free',
        price: '$0',
        description: 'Perfect for getting started with the basics of CBLE.',
        features: [
            '20 practice questions per day',
            'Basic progress tracking',
            'Limited flashcard access',
            'Community support forum',
        ],
        cta: 'Get Started',
        popular: false,
        gradient: 'from-muted/50 to-muted',
    },
    {
        name: 'Pro Pass',
        price: '$149',
        period: 'Lifetime Access',
        description: 'The complete toolkit designed to ensure you pass on your first attempt.',
        features: [
            'Unlimited practice questions',
            'Full 19 CFR Flashcard library',
            'Real-time Exam Simulations (80-Q)',
            'Advanced Mastery Analytics',
            'Personalized Study Roadmap',
            'Priority Success Support',
        ],
        cta: 'Unlock Everything',
        popular: true,
        highlight: 'Ensures a first-time pass',
        gradient: 'from-primary/20 via-primary/5 to-transparent',
    },
    {
        name: 'Institutional',
        price: 'Custom',
        description: 'For customs brokerages and trade compliance teams.',
        features: [
            'Everything in Pro Pass',
            'Team Progress Dashboards',
            'Custom Exam Creation',
            'LMS Integration',
            'Bulk User Management',
        ],
        cta: 'Contact Sales',
        popular: false,
        gradient: 'from-secondary/20 via-secondary/5 to-transparent',
    },
];

export default function Pricing() {
    const [searchParams] = useSearchParams();
    const reason = searchParams.get('reason');

    return (
        <Layout>
            <div className="container py-20 animate-fade-in">
                {reason === 'daily_limit' && (
                    <div className="max-w-2xl mx-auto mb-12 p-6 rounded-2xl bg-accent/10 border border-accent/20 flex items-center gap-4 animate-scale-in">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/20 text-accent">
                            <Zap className="h-6 w-6 fill-accent" />
                        </div>
                        <div>
                            <p className="font-bold text-accent text-lg">Daily Limit Reached!</p>
                            <p className="text-accent/80 text-sm font-medium">
                                You've mastered 20 questions today. Unlock unlimited training and our Pass Guarantee with the Pro Pass.
                            </p>
                        </div>
                    </div>
                )}
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <Badge variant="outline" className="mb-4 px-4 py-1.5 bg-primary/5 text-primary border-primary/20 text-xs font-bold uppercase tracking-widest">
                        Simple, Transparent Pricing
                    </Badge>
                    <h1 className="font-display text-5xl md:text-6xl font-bold tracking-tight mb-6">
                        Invest in your <span className="text-gradient-primary leading-tight">Career Success</span>
                    </h1>
                    <p className="text-xl text-muted-foreground leading-relaxed">
                        Choose the plan that fits your study style. Join 5,000+ candidates who have
                        passed the CBLE using our science-backed methods.
                    </p>
                </div>

                {/* Pricing Cards */}
                <div className="grid gap-8 lg:grid-cols-3 max-w-7xl mx-auto">
                    {plans.map((plan) => (
                        <Card
                            key={plan.name}
                            className={`relative flex flex-col border-none shadow-2xl overflow-hidden transition-all hover:translate-y-[-8px] ${plan.popular ? 'ring-2 ring-primary scale-105 z-10' : ''
                                }`}
                        >
                            {/* Background Glow */}
                            <div className={`absolute inset-0 bg-gradient-to-b ${plan.gradient} pointer-events-none opacity-50`} />

                            {plan.popular && (
                                <div className="absolute top-0 right-0">
                                    <div className="bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest py-1.5 px-8 rotate-45 translate-x-10 translate-y-2">
                                        Most Popular
                                    </div>
                                </div>
                            )}

                            <CardHeader className="relative pt-10 px-8">
                                <div className="flex items-center gap-2 mb-2">
                                    {plan.name === 'Pro Pass' && <Zap className="h-5 w-5 text-primary fill-primary" />}
                                    {plan.name === 'Institutional' && <Star className="h-5 w-5 text-secondary fill-secondary" />}
                                    <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                                </div>
                                <CardDescription className="text-muted-foreground text-base">
                                    {plan.description}
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="relative flex-grow px-8 pb-8">
                                <div className="mb-8">
                                    <span className="text-5xl font-black">{plan.price}</span>
                                    {plan.period && (
                                        <span className="text-muted-foreground ml-2 text-lg">{plan.period}</span>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    {plan.features.map((feature) => (
                                        <div key={feature} className="flex items-start gap-3">
                                            <div className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary`}>
                                                <Check className="h-3 w-3 stroke-[3px]" />
                                            </div>
                                            <span className="text-sm font-medium leading-tight">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>

                            <CardFooter className="relative pt-0 px-8 pb-10 mt-auto">
                                <button
                                    className={`w-full py-4 px-6 rounded-xl font-bold transition-all shadow-lg ${plan.popular
                                        ? 'gradient-primary text-white shadow-glow hover:opacity-90'
                                        : 'bg-muted hover:bg-muted/80 text-foreground'
                                        }`}
                                >
                                    {plan.cta}
                                </button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>

                {/* Feature Comparison / Guarantee */}
                <div className="mt-24 max-w-4xl mx-auto p-12 rounded-[2rem] bg-muted/30 border border-dashed flex flex-col md:flex-row items-center gap-12">
                    <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-white shadow-xl">
                        <ShieldCheck className="h-12 w-12 text-success" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold mb-2">The CBLE Pass Guarantee</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            We're so confident in our platform that if you complete 100% of the Pro Pass curriculum
                            and don't pass the actual exam, we'll refund your entire purchase—no questions asked.
                            Your success is our only metric.
                        </p>
                    </div>
                </div>

                {/* Social Proof */}
                <div className="mt-24 text-center">
                    <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-8">Trusted by candidates at</p>
                    <div className="flex flex-wrap justify-center items-center gap-12 opacity-40 grayscale">
                        <span className="text-2xl font-black">FEDEX</span>
                        <span className="text-2xl font-black">DHL</span>
                        <span className="text-2xl font-black">EXPEDITORS</span>
                        <span className="text-2xl font-black">CH ROBINSON</span>
                        <span className="text-2xl font-black">UPS</span>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
