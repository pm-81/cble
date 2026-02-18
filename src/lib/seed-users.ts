import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const MOCK_USERS = [
    { id: 'd0e0a0a0-0000-0000-0000-000000000001', name: 'James Carter', points: 15450, streak: 14, mastery_level: 12, correct: 125 },
    { id: 'd0e0a0a0-0000-0000-0000-000000000002', name: 'Sarah Jenkins', points: 12200, streak: 8, mastery_level: 9, correct: 95 },
    { id: 'd0e0a0a0-0000-0000-0000-000000000003', name: 'Michael Ross', points: 9800, streak: 5, mastery_level: 7, correct: 75 },
    { id: 'd0e0a0a0-0000-0000-0000-000000000004', name: 'Emma Vance', points: 8500, streak: 12, mastery_level: 6, correct: 60 },
    { id: 'd0e0a0a0-0000-0000-0000-000000000005', name: 'David Miller', points: 7200, streak: 3, mastery_level: 5, correct: 55 },
    { id: 'd0e0a0a0-0000-0000-0000-000000000006', name: 'Linda Zhang', points: 6100, streak: 7, mastery_level: 4, correct: 45 },
    { id: 'd0e0a0a0-0000-0000-0000-000000000007', name: 'Robert Fox', points: 5400, streak: 2, mastery_level: 4, correct: 35 },
    { id: 'd0e0a0a0-0000-0000-0000-000000000008', name: 'Sophia Grey', points: 4900, streak: 10, mastery_level: 3, correct: 30 },
];

async function seedMockUsers() {
    console.log('🌱 Seeding mock users for leaderboard...');

    for (const user of MOCK_USERS) {
        // 1. Create Profile
        const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
                id: user.id,
                user_id: user.id,
                display_name: user.name,
                onboarding_completed: true,
                updated_at: new Date().toISOString(),
            });

        if (profileError) {
            console.error(`❌ Error seeding profile for ${user.name}:`, profileError);
            continue;
        }

        // 2. Create Streak
        await supabase
            .from('user_streaks')
            .upsert({
                user_id: user.id,
                current_streak: user.streak,
                longest_streak: user.streak,
                last_activity_date: new Date().toISOString(),
            });

        // 3. Create Mastery (use a dummy domain or multiple)
        // Since the points formula in Leaderboard.tsx sums up mastery_progress
        // we'll insert a record for the first domain found
        const { data: domains } = await supabase.from('domains').select('id').limit(1);
        if (domains && domains.length > 0) {
            await supabase
                .from('mastery_progress')
                .upsert({
                    user_id: user.id,
                    domain_id: domains[0].id,
                    mastery_level: user.mastery_level,
                    correct_attempts: user.correct,
                    total_attempts: user.correct + 20,
                    last_attempt_at: new Date().toISOString(),
                });
        }

        console.log(`✅ Seeded ${user.name}`);
    }

    console.log('✨ Mock seeding complete!');
}

seedMockUsers();
