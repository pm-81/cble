import { Layout } from '@/components/layout/Layout';

export default function Privacy() {
    return (
        <Layout>
            <div className="container max-w-3xl py-12 space-y-8">
                <h1 className="font-display text-3xl font-bold">Privacy Policy</h1>
                <p className="text-muted-foreground">Last updated: February 2026</p>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold">1. Information We Collect</h2>
                    <p>When you create an account, we collect your email address and optional display name. During your use of CBLETest, we collect study performance data including question attempts, accuracy, confidence ratings, and session duration to power our adaptive learning engine.</p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold">2. How We Use Your Information</h2>
                    <ul className="list-disc pl-6 space-y-2">
                        <li><strong>Adaptive Learning:</strong> Your performance data drives our SM-2 spaced repetition algorithm and domain-weakness targeting to personalize your study experience.</li>
                        <li><strong>Analytics:</strong> We aggregate your study metrics to provide readiness scores, mastery levels, and calibration insights.</li>
                        <li><strong>Account Management:</strong> Your email is used for authentication and essential account communications.</li>
                        <li><strong>Leaderboard:</strong> If you opt in, your display name and aggregate scores appear on the community leaderboard.</li>
                    </ul>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold">3. Data Storage & Security</h2>
                    <p>Your data is stored securely using Supabase (powered by PostgreSQL) with Row Level Security (RLS) policies ensuring that users can only access their own data. All data is encrypted in transit using TLS 1.2+.</p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold">4. Data Sharing</h2>
                    <p>We do not sell, rent, or share your personal information with third parties. Aggregated, anonymized analytics may be used to improve the platform.</p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold">5. Your Rights</h2>
                    <ul className="list-disc pl-6 space-y-2">
                        <li><strong>Access:</strong> You can view all your data through the Dashboard and Analytics pages.</li>
                        <li><strong>Deletion:</strong> You may request complete deletion of your account and all associated data by contacting support.</li>
                        <li><strong>Export:</strong> You may request an export of your study data at any time.</li>
                    </ul>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold">6. Cookies & Local Storage</h2>
                    <p>We use browser local storage to maintain your authentication session and theme preference. We do not use third-party tracking cookies.</p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold">7. Contact</h2>
                    <p>For privacy-related inquiries, contact us at <strong>privacy@cbletest.com</strong>.</p>
                </section>
            </div>
        </Layout>
    );
}
