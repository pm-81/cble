import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { count: dCount } = await supabase.from('domains').select('*', { count: 'exact', head: true });
    const { count: qCount } = await supabase.from('questions').select('*', { count: 'exact', head: true });
    const { count: fCount } = await supabase.from('flashcards').select('*', { count: 'exact', head: true });

    console.log('--- Database Status ---');
    console.log(`Domains: ${dCount}`);
    console.log(`Questions: ${qCount}`);
    console.log(`Flashcards: ${fCount}`);
}

check();
