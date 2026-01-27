import { supabase } from './supabase-node';

const domains = [
    { name: 'Entry / Entry Summary / Release', color: 'hsl(173, 80%, 40%)', icon: '📋' },
    { name: 'Classification (HTSUS / GRIs / Notes)', color: 'hsl(262, 80%, 50%)', icon: '📚' },
    { name: 'Valuation (19 CFR 152)', color: 'hsl(25, 95%, 53%)', icon: '💰' },
    { name: 'Trade Programs / Origin', color: 'hsl(142, 76%, 36%)', icon: '🌍' },
    { name: 'Broker Duties / POA / Records / Bonds', color: 'hsl(199, 89%, 48%)', icon: '📝' },
    { name: 'Marking / COO (19 CFR 134)', color: 'hsl(340, 75%, 55%)', icon: '🏷️' },
    { name: 'Protests / Liquidation', color: 'hsl(45, 93%, 47%)', icon: '⚖️' },
    { name: 'Other (FTZ / Drawback / In-bond / AD/CVD / PGA)', color: 'hsl(215, 16%, 47%)', icon: '🔧' },
];

const questions = [
    {
        stem: 'Which of the following documents is required to be filed with the entry summary?',
        option_a: 'Commercial Invoice',
        option_b: 'Packing List',
        option_c: 'Bill of Lading',
        option_d: 'Entry Summary (CBP Form 7501)',
        option_e: 'All of the above',
        correct_answer: 'E',
        rationale: 'All listed documents are typically required for a complete entry summary filing under 19 CFR 142.',
        reference_cue: '19 CFR 142.3',
        difficulty: 2,
        domain_index: 0,
    },
    {
        stem: 'What is the General Rule of Interpretation (GRI) 1?',
        option_a: 'Classification is determined by the terms of the headings and any relative section or chapter notes.',
        option_b: 'Any reference to an article includes a reference to that article incomplete or unfinished.',
        option_c: 'Goods put up in sets for retail sale shall be classified as if they consisted of the material or component which gives them their essential character.',
        option_d: 'Goods cannot be classified by GRI 1.',
        option_e: 'None of the above.',
        correct_answer: 'A',
        rationale: 'GRI 1 states that for legal purposes, classification shall be determined according to the terms of the headings and any relative Section or Chapter Notes.',
        reference_cue: 'GRI 1',
        difficulty: 3,
        domain_index: 1,
    },
    {
        stem: 'Under the transaction value method, which of the following is NOT added to the price actually paid or payable?',
        option_a: 'Packing costs',
        option_b: 'Selling commissions',
        option_c: 'Assists',
        option_d: 'Royalties and license fees',
        option_e: 'Proceeds of subsequent resale',
        correct_answer: 'B',
        rationale: 'Selling commissions incurred by the buyer are not added to the price actually paid or payable under 19 CFR 152.103.',
        reference_cue: '19 CFR 152.103',
        difficulty: 4,
        domain_index: 2,
    },
];

const flashcards = [
    {
        front: 'What does "entry" mean in customs terminology?',
        back: 'Entry is the process of presenting documentation and information to CBP to obtain release of imported merchandise.',
        reference_cue: '19 CFR 141.0a',
        domain_index: 0,
    },
    {
        front: 'What is the HTSUS?',
        back: 'The Harmonized Tariff Schedule of the United States - a systematic classification of goods for customs purposes.',
        reference_cue: 'HTSUS General Notes',
        domain_index: 1,
    },
];

export async function seed() {
    console.log('🌱 Starting database seed...');

    try {
        // Seed Domains
        console.log('📦 Seeding domains...');
        for (let i = 0; i < domains.length; i++) {
            const domain = domains[i];
            const { error } = await supabase
                .from('domains')
                .upsert({
                    name: domain.name,
                    color: domain.color,
                    icon: domain.icon,
                    sort_order: i
                }, { onConflict: 'name' });

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

        // Seed Questions
        console.log('❓ Seeding questions...');
        for (const q of questions) {
            const domainId = domainData[q.domain_index]?.id;
            if (!domainId) {
                console.error(`❌ Domain not found for index ${q.domain_index}`);
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
                console.error('❌ Error seeding question:', error);
            } else {
                console.log(`✅ Seeded question: ${q.stem.substring(0, 50)}...`);
            }
        }

        // Seed Flashcards
        console.log('🃏 Seeding flashcards...');
        for (const f of flashcards) {
            const domainId = domainData[f.domain_index]?.id;
            if (!domainId) {
                console.error(`❌ Domain not found for index ${f.domain_index}`);
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
