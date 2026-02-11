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
    title: 'Adaptive Practice Tests',
    description: 'Our system learns your weak spots. The algorithm targets high-yield 19 CFR domains where you need improvement.',
  },
  {
    icon: Calendar,
    title: 'Smart Study Planner',
    description: 'Input your exam date and schedule. We generate a personalized weekly roadmap to keep you on track.',
  },
  {
    icon: Target,
    title: 'Custom Quiz Builder',
    description: 'Create tailored practice sessions by domain, difficulty, and question count. Focus exactly where you need it.',
  },
  {
    icon: BarChart3,
    title: 'Exam Readiness Analytics',
    description: 'Track mastery by 19 CFR part. Our "Confidence Gap" metric reveals where you are overconfident vs. accurate.',
  },
  {
    icon: Zap,
    title: 'Navigation Drill Games',
    description: 'Gamified rapid-fire drills to memorize 19 CFR parts, CBP Form numbers, and timelines in seconds.',
  },
  {
    icon: Shield,
    title: 'Realistic Exam Simulators',
    description: 'Full 4.5-hour timed exams with 80 questions. Simulate the pressure of test day before it counts.',
  },
];

const domains = [
  'Entry / Entry Summary / Release',
  'Classification (HTSUS / GRIs / Notes)',
  'Valuation (19 CFR 152)',
  'Trade Programs / Origin',
  'Broker Duties / POA / Records / Bonds (19 CFR 111)',
  'Marking / COO (19 CFR 134)',
  'Protests / Liquidation',
  'FTZ / Drawback / In-bond / AD/CVD / PGA',
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
              Pass Your <span className="text-gradient-primary">Customs Broker</span><br />
              License Exam with <span className="text-primary">CBLETest</span>
            </h1>

            {/* Subheadline */}
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
              The most advanced study platform for the US Customs Broker License Exam.
              Master 19 CFR regulations, HTSUS classification, and valuation rules with
              adaptive practice tests and spaced-repetition flashcards.
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" asChild className="gradient-primary shadow-glow">
                <Link to="/auth?mode=signup" className="gap-2">
                  Start Your Free Trial
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
                200+ Practice Questions
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-success" />
                Updated for 2026 Exam
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-success" />
                Detailed CFR Rationales
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
              Built on learning science and cognitive psychology principles (SM-2 Spaced Repetition)
              to maximize your study efficiency and exam readiness for the 19 CFR regulations.
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
                Our comprehensive question bank spans all 8 domains tested on the CBLE, including
                Broker Duties (19 CFR 111), Entry Requirements (19 CFR 141-142), and Valuation (19 CFR 152).
                Each question includes detailed rationales and HTSUS reference cues to help you master
                legal definitions quickly.
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
              {/* Interactive System Preview */}
              <div className="rounded-3xl border bg-card shadow-2xl overflow-hidden">
                <div className="border-b bg-muted/50 p-2 flex gap-2 overflow-x-auto">
                  <div className="flex gap-1.5 ml-2">
                    <div className="h-3 w-3 rounded-full bg-red-400/80" />
                    <div className="h-3 w-3 rounded-full bg-yellow-400/80" />
                    <div className="h-3 w-3 rounded-full bg-green-400/80" />
                  </div>
                  <div className="ml-4 flex-1 rounded-md bg-background/50 px-3 py-1 text-xs text-muted-foreground text-center font-mono">
                    app.cbletest.com/dashboard
                  </div>
                </div>

                <div className="p-6 md:p-8 bg-slate-50 dark:bg-slate-950/50 min-h-[400px]">
                  {/* Mock Dashboard View */}
                  <div className="space-y-6">
                    {/* Top Stats Row */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-xl bg-white dark:bg-slate-900 p-4 shadow-sm border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-teal-100 text-teal-600 flex items-center justify-center">
                            <Target className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-slate-900 dark:text-slate-50">72%</div>
                            <div className="text-[10px] uppercase font-bold text-slate-400">Accuracy</div>
                          </div>
                        </div>
                      </div>
                      <div className="rounded-xl bg-white dark:bg-slate-900 p-4 shadow-sm border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                            <Zap className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-slate-900 dark:text-slate-50">145</div>
                            <div className="text-[10px] uppercase font-bold text-slate-400">Drills</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Chart Area */}
                    <div className="rounded-xl bg-white dark:bg-slate-900 p-4 shadow-sm border border-slate-100 dark:border-slate-800">
                      <div className="mb-4 flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-sm">Exam Readiness</h4>
                          <p className="text-xs text-slate-400">Last 7 days performance</p>
                        </div>
                        <div className="px-2 py-1 rounded bg-green-100 text-green-700 text-xs font-bold">+12%</div>
                      </div>
                      <div className="h-24 flex items-end gap-2 px-2">
                        {[40, 65, 45, 70, 85, 60, 75].map((h, i) => (
                          <div key={i} className="flex-1 rounded-t-sm bg-indigo-500/20 hover:bg-indigo-500 transition-colors relative group">
                            <div className="absolute bottom-0 w-full bg-indigo-500 rounded-t-sm transition-all duration-500" style={{ height: `${h}%` }} />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recommended Action */}
                    <div className="rounded-xl bg-indigo-600 p-4 text-white shadow-lg shadow-indigo-500/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-sm">Daily Goal</h4>
                          <p className="text-xs text-indigo-200">20 questions on Valuation</p>
                        </div>
                        <Button size="sm" variant="secondary" className="text-xs h-8">
                          Start Now
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Badge */}
              <div className="absolute -bottom-6 -right-6 rounded-xl bg-background p-4 shadow-xl border animate-bounce-slow hidden md:block">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Concept Mastered!</p>
                    <p className="text-xs text-muted-foreground">GRI 3(b) Essential Character</p>
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

      {/* FAQ Section (SEO) */}
      <section className="bg-muted/30 py-20 md:py-28">
        <div className="container max-w-4xl">
          <h2 className="font-display text-3xl font-bold sm:text-4xl text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="grid gap-6">
            <div className="rounded-xl border bg-card p-6">
              <h3 className="font-semibold text-lg mb-2">How do I pass the US Customs Broker License Exam (CBLE)?</h3>
              <p className="text-muted-foreground text-sm">
                Passing the CBLE requires mastery of the 19 CFR regulations and the HTSUS. CBLETest uses spaced repetition
                and adaptive practice tests to help you memorize key legal definitions and classification rules efficiently.
              </p>
            </div>
            <div className="rounded-xl border bg-card p-6">
              <h3 className="font-semibold text-lg mb-2">What is the best way to study HTSUS classification?</h3>
              <p className="text-muted-foreground text-sm">
                The best way is through repetitive practice with the General Rules of Interpretation (GRIs). Our platform
                provides hundreds of HTSUS classification practice questions with detailed rationales to help you
                understand the logic behind every heading and subheading.
              </p>
            </div>
            <div className="rounded-xl border bg-card p-6">
              <h3 className="font-semibold text-lg mb-2">Are the practice questions updated for the 2026 exam?</h3>
              <p className="text-muted-foreground text-sm">
                Yes, CBLETest stays updated with the latest CBP directives and 19 CFR changes. Our question bank is
                specifically tailored for the 2026 Customs Broker License Exam cycles.
              </p>
            </div>
            <div className="rounded-xl border bg-card p-6">
              <h3 className="font-semibold text-lg mb-2">What 19 CFR domains are covered on the exam?</h3>
              <p className="text-muted-foreground text-sm">
                The exam covers 8 major domains: Entry/Entry Summary, Classification, Valuation, Trade Programs,
                Broker Duties (19 CFR 111), Marking (19 CFR 134), Drawback, and more. CBLETest provides comprehensive
                coverage and analytics for all these domains.
              </p>
            </div>
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
                Join thousands of candidates using science-backed study methods to ace their customs broker license exam.
              </p>
              <Button
                size="lg"
                variant="secondary"
                asChild
                className="mt-8 bg-white text-primary hover:bg-white/90"
              >
                <Link to="/auth?mode=signup" className="gap-2">
                  Start Your Free Trial
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
