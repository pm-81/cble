import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
    const { data, error } = await supabase.from('questions').insert({
        stem: 'Test Seed 1',
        option_a: 'A',
        option_b: 'B',
        option_c: 'C',
        option_d: 'D',
        option_e: 'E',
        correct_answer: 'A',
        domain_id: '86810f69-f831-41b3-a979-5e7e1088ce05' // Use a real ID from check_db? No, I'll fetch one.
    });

    if (error) console.error('Insert error:', error);
    else console.log('Insert success:', data);
}

testInsert();
