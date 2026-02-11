import { Layout } from '@/components/layout/Layout';

export default function Terms() {
    return (
        <Layout>
            <div className="container max-w-3xl py-12 space-y-8">
                <h1 className="font-display text-3xl font-bold">Terms of Service</h1>
                <p className="text-muted-foreground">Last updated: February 2026</p>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold">1. Acceptance of Terms</h2>
                    <p>By creating an account or using CBLETest.com, you agree to these Terms of Service. If you do not agree, please do not use the platform.</p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold">2. Description of Service</h2>
                    <p>CBLETest provides an online study platform for the Customs Broker License Examination (CBLE). The platform includes practice questions, flashcards, adaptive learning, analytics, and exam simulations. CBLETest is an independent study tool and is not affiliated with, endorsed by, or sponsored by U.S. Customs and Border Protection (CBP).</p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold">3. No Guarantee of Results</h2>
                    <p>While CBLETest uses evidence-based learning techniques (spaced repetition, interleaving, adaptive targeting), we do not guarantee that using the platform will result in passing the CBLE. Exam outcomes depend on many factors including individual effort, study consistency, and exam conditions.</p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold">4. Account Responsibilities</h2>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>You are responsible for maintaining the confidentiality of your login credentials.</li>
                        <li>You agree to provide accurate information during registration.</li>
                        <li>You may not share your account or use another user&apos;s account.</li>
                    </ul>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold">5. Intellectual Property</h2>
                    <p>All question content, explanations, flashcards, and learning algorithms on CBLETest are proprietary. You may not reproduce, distribute, or create derivative works from platform content without written permission.</p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold">6. Subscription & Payments</h2>
                    <ul className="list-disc pl-6 space-y-2">
                        <li><strong>Free Tier:</strong> Limited access to 20 practice questions per day.</li>
                        <li><strong>Pro Pass ($149):</strong> Lifetime access to all platform features and content.</li>
                        <li><strong>Refunds:</strong> Refund requests must be submitted within 14 days of purchase.</li>
                    </ul>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold">7. Acceptable Use</h2>
                    <p>You agree not to: attempt to reverse-engineer the adaptive algorithm; use automated tools to scrape content; share question content publicly; or engage in any activity that disrupts the platform.</p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold">8. Limitation of Liability</h2>
                    <p>CBLETest is provided &quot;as is&quot; without warranties of any kind. In no event shall CBLETest be liable for indirect, incidental, or consequential damages arising from use of the platform.</p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold">9. Changes to Terms</h2>
                    <p>We reserve the right to modify these terms at any time. Changes will be posted on this page with an updated date. Continued use after changes constitutes acceptance.</p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold">10. Contact</h2>
                    <p>For questions about these terms, contact us at <strong>legal@cbletest.com</strong>.</p>
                </section>
            </div>
        </Layout>
    );
}
