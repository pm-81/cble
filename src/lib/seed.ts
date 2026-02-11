import { supabase } from './supabase-node';
import { expandedQuestions, expandedFlashcards } from './questions-expanded';
import { batch2Questions } from './questions-batch2';
import { batch3Questions } from './questions-batch3';
import { batch4Questions } from './questions-batch4';
import { batch5Questions } from './questions-batch5';
import { batch6Questions } from './questions-batch6';
import { batch7Questions } from './questions-batch7';
import { batch8Questions } from './questions-batch8';
import { batch9Questions } from './questions-batch9';
import { batch10Questions } from './questions-batch10';
import { batch11Questions } from './questions-batch11';
import { batch12Questions } from './questions-batch12';
import { batch1Flashcards } from './flashcards-batch1';
import { batch2Flashcards } from './flashcards-batch2';
import { batch3Flashcards } from './flashcards-batch3';
import { domains, questions, flashcards } from './static-data';

// ... existing seed function ...

export async function seed() {
    console.log('🌱 Starting database seed...');

    try {
        // Seed Domains
        console.log('📦 Seeding domains...');
        for (let i = 0; i < domains.length; i++) {
            const domain = domains[i];

            // First check if it exists
            const { data: existing } = await supabase
                .from('domains')
                .select('id')
                .eq('name', domain.name)
                .maybeSingle();

            if (existing) {
                console.log(`ℹ️ Domain already exists: ${domain.name}`);
                continue;
            }

            const { error } = await supabase
                .from('domains')
                .insert({
                    name: domain.name,
                    color: domain.color,
                    icon: domain.icon,
                    sort_order: i
                });

            if (error) {
                console.error(`❌ Error seeding domain "${domain.name}":`, error);
            } else {
                console.log(`✅ Seeded domain: ${domain.name}`);
            }
        }

        // Get Domain IDs
        const { data: domainData, error: domainError } = await supabase
            .from('domains')
            .select('id, name')
            .order('sort_order');

        if (domainError || !domainData) {
            console.error('❌ Error fetching domains:', domainError);
            return;
        }

        // Seed Questions (merge original + expanded + batch 2 + batch 3 + batch 4)
        const allQuestions = [...questions, ...expandedQuestions, ...batch2Questions, ...batch3Questions, ...batch4Questions, ...batch5Questions, ...batch6Questions, ...batch7Questions, ...batch8Questions, ...batch9Questions, ...batch10Questions, ...batch11Questions, ...batch12Questions];
        console.log(`❓ Seeding ${allQuestions.length} questions...`);
        for (const q of allQuestions) {
            const domainId = domainData.find(d => d.name === domains[q.domain_index].name)?.id;
            if (!domainId) {
                console.error(`❌ Domain not found for index ${q.domain_index}`);
                continue;
            }

            // Check if question exists by stem
            const { data: existingQ } = await supabase
                .from('questions')
                .select('id')
                .eq('stem', q.stem)
                .maybeSingle();

            if (existingQ) {
                console.log(`ℹ️ Question already exists: ${q.stem.substring(0, 30)}...`);
                continue;
            }

            const { error } = await supabase.from('questions').insert({
                stem: q.stem,
                option_a: q.option_a,
                option_b: q.option_b,
                option_c: q.option_c,
                option_d: q.option_d,
                option_e: q.option_e,
                correct_answer: q.correct_answer,
                rationale: q.rationale,
                reference_cue: q.reference_cue,
                difficulty: q.difficulty,
                domain_id: domainId,
                is_active: true,
            });

            if (error) {
                if (error.code === '42501') {
                    console.error('❌ RLS Error seeding question. Are you logged in or use service key?');
                    break; // Stop if RLS is blocking
                }
                console.error('❌ Error seeding question:', error);
            } else {
                console.log(`✅ Seeded question: ${q.stem.substring(0, 50)}...`);
            }
        }

        // Seed Flashcards (merge original + expanded)
        const allFlashcards = [...flashcards, ...expandedFlashcards, ...batch1Flashcards, ...batch2Flashcards, ...batch3Flashcards];
        console.log(`🃏 Seeding ${allFlashcards.length} flashcards...`);
        for (const f of allFlashcards) {
            const domainId = domainData.find(d => d.name === domains[f.domain_index].name)?.id;
            if (!domainId) {
                console.error(`❌ Domain not found for index ${f.domain_index}`);
                continue;
            }

            // Check if exists
            const { data: existingF } = await supabase
                .from('flashcards')
                .select('id')
                .eq('front', f.front)
                .maybeSingle();

            if (existingF) {
                console.log(`ℹ️ Flashcard already exists: ${f.front.substring(0, 30)}...`);
                continue;
            }

            const { error } = await supabase.from('flashcards').insert({
                front: f.front,
                back: f.back,
                reference_cue: f.reference_cue,
                domain_id: domainId,
                is_active: true,
            });

            if (error) {
                console.error('❌ Error seeding flashcard:', error);
            } else {
                console.log(`✅ Seeded flashcard: ${f.front.substring(0, 50)}...`);
            }
        }

        console.log('✨ Seeding complete!');
    } catch (error) {
        console.error('❌ Unexpected error during seeding:', error);
    }
}

// Automatically run seed when script is executed via tsx
if (import.meta.url.endsWith('seed.ts') || process.argv[1]?.endsWith('seed.ts')) {
    seed();
}
