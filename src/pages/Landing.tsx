import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Layout } from '@/components/layout/Layout';
import {
  BookOpen,
  Brain,
  BarChart3,
  Clock,
  Target,
  Zap,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Trophy,
  Calendar,
  Shield,
} from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'Adaptive Learning',
    description: 'Questions adapt to your skill level, focusing on weak areas to maximize improvement.',
  },
  {
    icon: Clock,
    title: 'Spaced Repetition',
    description: 'Scientifically-proven scheduling ensures you review at optimal intervals for retention.',
  },
  {
    icon: Target,
    title: '160+ Practice Questions',
    description: 'Comprehensive question bank covering all 8 CBLE exam domains with detailed rationales.',
  },
  {
    icon: BarChart3,
    title: 'Progress Analytics',
    description: 'Track mastery by domain, identify patterns, and monitor your exam readiness.',
  },
  {
    icon: Zap,
    title: '2-Minute Save Mode',
    description: 'Ultra-short sessions for busy days that still advance your study plan.',
  },
  {
    icon: Shield,
    title: 'Exam Simulation',
    description: 'Timed 80-question blocks that mirror the real exam experience.',
  },
];

const domains = [
  'Entry / Entry Summary / Release',
  'Classification (HTSUS / GRIs / Notes)',
  'Valuation (19 CFR 152)',
  'Trade Programs / Origin',
  'Broker Duties / POA / Records / Bonds',
  'Marking / COO (19 CFR 134)',
  'Protests / Liquidation',
  'FTZ / Drawback / In-bond / AD/CVD',
];

export default function Landing() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 via-background to-background" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        
        <div className="container py-20 md:py-32">
          <div className="mx-auto max-w-4xl text-center">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              Science-backed exam preparation
            </div>
            
            {/* Headline */}
            <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Pass the{' '}
              <span className="text-gradient-primary">Customs Broker</span>{' '}
              Exam with Confidence
            </h1>
            
            {/* Subheadline */}
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
              Master the CBLE through adaptive practice, spaced repetition, and intelligent study 
              scheduling. Join candidates who've transformed their preparation.
            </p>
            
            {/* CTAs */}
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" asChild className="gradient-primary shadow-glow">
                <Link to="/auth?mode=signup" className="gap-2">
                  Start Free Trial
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/auth">Sign In</Link>
              </Button>
            </div>
            
            {/* Social proof */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-success" />
                160+ Practice Questions
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-success" />
                All 8 Exam Domains
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-success" />
                CFR Reference Cues
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t bg-muted/30 py-20 md:py-28">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold sm:text-4xl">
              Everything You Need to Succeed
            </h2>
            <p className="mt-4 text-muted-foreground">
              Built on learning science principles to maximize your study efficiency and exam readiness.
            </p>
          </div>
          
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <Card key={index} className="group relative overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 font-display text-lg font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Domains Section */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20 items-center">
            <div>
              <h2 className="font-display text-3xl font-bold sm:text-4xl">
                Comprehensive Coverage of All Exam Topics
              </h2>
              <p className="mt-4 text-muted-foreground">
                Our question bank spans all 8 domains tested on the CBLE, each with detailed 
                rationales and CFR/HTSUS reference cues to help you look up the rules quickly.
              </p>
              
              <div className="mt-8 space-y-3">
                {domains.map((domain, index) => (
                  <div key={index} className="flex items-center gap-3 text-sm">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {index + 1}
                    </div>
                    <span>{domain}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 p-8 md:p-12">
                <div className="h-full w-full rounded-2xl bg-card shadow-xl p-6 flex flex-col justify-center">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Overall Mastery</span>
                      <span className="text-2xl font-bold text-primary">72%</span>
                    </div>
                    <div className="h-3 rounded-full bg-muted overflow-hidden">
                      <div className="h-full w-[72%] rounded-full gradient-primary" />
                    </div>
                    <div className="grid grid-cols-4 gap-2 pt-4">
                      {[78, 65, 82, 70, 75, 60, 85, 68].map((val, i) => (
                        <div key={i} className="text-center">
                          <div className="mx-auto h-16 w-2 rounded-full bg-muted overflow-hidden">
                            <div 
                              className="w-full rounded-full gradient-primary transition-all" 
                              style={{ height: `${val}%`, marginTop: `${100 - val}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground mt-1">D{i + 1}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-t bg-muted/30 py-20 md:py-28">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold sm:text-4xl">
              Start Studying in Under 2 Minutes
            </h2>
            <p className="mt-4 text-muted-foreground">
              Our streamlined onboarding gets you to practice questions fast.
            </p>
          </div>
          
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {[
              {
                step: 1,
                icon: Calendar,
                title: 'Set Your Exam Date',
                description: 'Tell us when you\'re taking the exam and how much time you can study weekly.',
              },
              {
                step: 2,
                icon: Target,
                title: 'Rate Your Confidence',
                description: 'Quick self-assessment across domains helps us prioritize your weak areas.',
              },
              {
                step: 3,
                icon: Trophy,
                title: 'Start Practicing',
                description: 'Begin with your personalized daily sessions, adapted to your schedule.',
              },
            ].map((item) => (
              <div key={item.step} className="relative text-center">
                <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary text-2xl font-bold text-primary-foreground shadow-glow">
                  {item.step}
                </div>
                <h3 className="mb-2 font-display text-lg font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="relative overflow-hidden rounded-3xl gradient-primary p-8 md:p-16">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.1),_transparent_50%)]" />
            <div className="relative mx-auto max-w-2xl text-center text-primary-foreground">
              <h2 className="font-display text-3xl font-bold sm:text-4xl">
                Ready to Pass the CBLE?
              </h2>
              <p className="mt-4 text-primary-foreground/80">
                Join thousands of candidates using science-backed study methods to ace their exam.
              </p>
              <Button 
                size="lg" 
                variant="secondary" 
                asChild 
                className="mt-8 bg-white text-primary hover:bg-white/90"
              >
                <Link to="/auth?mode=signup" className="gap-2">
                  Get Started Free
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
