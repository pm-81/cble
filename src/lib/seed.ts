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
    // --- DOMAIN 0: Entry / Entry Summary ---
    {
        stem: 'Under 19 CFR 142.3, which of the following is NOT required to be filed as part of the entry documentation?',
        option_a: 'CBP Form 3461',
        option_b: 'Evidence of right to make entry',
        option_c: 'Commercial invoice',
        option_d: 'Packing list',
        option_e: 'CBP Form 7501',
        correct_answer: 'E',
        rationale: 'Entry documentation (for release) typically includes 3461, evidence of right to make entry, and invoice. CBP Form 7501 is the Entry Summary, usually filed later.',
        reference_cue: '19 CFR 142.3',
        difficulty: 2,
        domain_index: 0,
    },
    {
        stem: 'When a formal entry is required, an entry summary must be filed and estimated duties deposited within ___ working days of the time of entry.',
        option_a: '5',
        option_b: '10',
        option_c: '15',
        option_d: '30',
        option_e: '45',
        correct_answer: 'B',
        rationale: '19 CFR 142.12 states the entry summary shall be filed within 10 working days after the time of entry.',
        reference_cue: '19 CFR 142.12',
        difficulty: 2,
        domain_index: 0,
    },

    // --- DOMAIN 1: Classification ---
    {
        stem: 'Which GRI is used to classify goods that are prima facie classifiable under two or more headings?',
        option_a: 'GRI 1',
        option_b: 'GRI 2',
        option_c: 'GRI 3',
        option_d: 'GRI 4',
        option_e: 'GRI 5',
        correct_answer: 'C',
        rationale: 'GRI 3 provides rules for classification when goods consist of more than one material or are classifiable under multiple headings (Relative specificity, Essential character, Last in numerical order).',
        reference_cue: 'GRI 3',
        difficulty: 3,
        domain_index: 1,
    },
    {
        stem: 'HTSUS Chapter 98 contains provisions for which of the following?',
        option_a: 'Articles exported and returned',
        option_b: 'Personal exemptions',
        option_c: 'Government importations',
        option_d: 'Samples for soliciting orders',
        option_e: 'All of the above',
        correct_answer: 'E',
        rationale: 'Chapter 98 of the HTSUS covers special classification provisions for articles returned to the US, personal effects, and specific duty-free treatment cases.',
        reference_cue: 'HTSUS Chapter 98',
        difficulty: 3,
        domain_index: 1,
    },

    // --- DOMAIN 2: Valuation ---
    {
        stem: 'Which valuation method is the primary method of appraisement for imported merchandise?',
        option_a: 'Transaction Value',
        option_b: 'Transaction Value of Identical Merchandise',
        option_c: 'Transaction Value of Similar Merchandise',
        option_d: 'Deductive Value',
        option_e: 'Computed Value',
        correct_answer: 'A',
        rationale: 'Under 19 CFR 152.101, Transaction Value is the primary method of appraisement.',
        reference_cue: '19 CFR 152.101',
        difficulty: 2,
        domain_index: 2,
    },
    {
        stem: 'In a transaction value appraisement, "assists" provided by the buyer must be added to the price. Which of the following is an assist?',
        option_a: 'Management and accounting services performed in the US',
        option_b: 'Materials, components, and parts incorporated in the imported merchandise',
        option_c: 'Public domain artwork',
        option_d: 'Freight from the factory to the port of exportation',
        option_e: 'Selling commissions paid to the buyer\'s agent',
        correct_answer: 'B',
        rationale: 'Assists include materials, tools, dies, molds, and engineering/artwork performed outside the US.',
        reference_cue: '19 CFR 152.102(a)',
        difficulty: 4,
        domain_index: 2,
    },

    // --- DOMAIN 4: Broker Duties (19 CFR 111) ---
    {
        stem: 'How long must a customhouse broker maintain records of their customs transactions?',
        option_a: '2 years',
        option_b: '3 years',
        option_c: '5 years',
        option_d: '7 years',
        option_e: '10 years',
        correct_answer: 'C',
        rationale: '19 CFR 111.23(a) states that records must be retained for at least 5 years after the date of entry.',
        reference_cue: '19 CFR 111.23',
        difficulty: 3,
        domain_index: 4,
    },
    {
        stem: 'A broker must exercise ___ in the conduct of customs business.',
        option_a: 'Due diligence',
        option_b: 'Extreme caution',
        option_c: 'Strict liability',
        option_d: 'Absolute authority',
        option_e: 'Reasonable care',
        correct_answer: 'A',
        rationale: '19 CFR 111.29 requires brokers to exercise due diligence in making financial settlements, answering correspondence, and preparing documents.',
        reference_cue: '19 CFR 111.29',
        difficulty: 2,
        domain_index: 4,
    },
    // --- DOMAIN 3: Trade Programs ---
    {
        stem: 'Under the USMCA, the importer must possess a valid certificate of origin at the time of ___ if they are claiming preferential tariff treatment.',
        option_a: 'Export from Mexico/Canada',
        option_b: 'Arrival in the US',
        option_c: 'Entry summary filing',
        option_d: 'Liquidation',
        option_e: '90 days after entry',
        correct_answer: 'C',
        rationale: 'The importer must have the certificate in their possession when the claim for preference is made at the time of entry summary.',
        reference_cue: '19 CFR 182.12',
        difficulty: 3,
        domain_index: 3,
    },
    // --- DOMAIN 5: Marking ---
    {
        stem: 'Which of the following describes the general rule for marking articles of foreign origin?',
        option_a: 'Every article must be marked with the country of origin in English.',
        option_b: 'Only the outermost container must be marked.',
        option_c: 'Articles from Canada/Mexico are exempt from marking.',
        option_d: 'Marking is only required if the duty rate is above 10%.',
        option_e: 'Marking must be in the language of the country of origin.',
        correct_answer: 'A',
        rationale: '19 CFR 134.11 requires every article of foreign origin to be marked in a conspicuous place as legibly, indelibly, and permanently as the nature of the article will permit, in English.',
        reference_cue: '19 CFR 134.11',
        difficulty: 2,
        domain_index: 5,
    },
    // --- DOMAIN 6: Protests ---
    {
        stem: 'How many days does an importer have to file a protest after the date of liquidation?',
        option_a: '90 days',
        option_b: '120 days',
        option_c: '180 days',
        option_d: '365 days',
        option_e: '2 years',
        correct_answer: 'C',
        rationale: '19 CFR 174.12(e) states that a protest must be filed within 180 days of liquidation.',
        reference_cue: '19 CFR 174.12',
        difficulty: 2,
        domain_index: 6,
    },
    // --- DOMAIN 7: Other/FTZ ---
    {
        stem: 'Merchandise in a Foreign Trade Zone (FTZ) is considered to be ___ for customs purposes.',
        option_a: 'Entered for consumption',
        option_b: 'Outside the customs territory of the United States',
        option_c: 'Subject to immediate liquidation',
        option_d: 'Exempt from all PGA requirements',
        option_e: 'In-bond to the next port',
        correct_answer: 'B',
        rationale: 'FTZs are areas in or near CBP ports of entry, but legally considered outside the customs territory of the US.',
        reference_cue: '19 CFR 146.1',
        difficulty: 3,
        domain_index: 7,
    },
    // --- ADDITIONAL QUESTIONS ---
    {
        stem: 'What is the standard duty rate for an article classified under a heading where the "Special" sub-column is blank and the "General" sub-column says "Free"?',
        option_a: '10%',
        option_b: '0%',
        option_c: 'Depends on the country of origin',
        option_d: '35% (Column 2)',
        option_e: 'Subject to MPF only',
        correct_answer: 'B',
        rationale: 'General "Free" means the article is duty-free for Most Favored Nation (MFN) countries.',
        reference_cue: 'HTSUS General Notes',
        difficulty: 1,
        domain_index: 1,
    },
    {
        stem: 'The value of an assist includes which of the following costs?',
        option_a: 'Cost of transport to the foreign place of production',
        option_b: 'Selling commissions paid by the buyer',
        option_c: 'Marketing expenses in the US',
        option_d: 'US Customs duties paid on the assist',
        option_e: 'None of the above',
        correct_answer: 'A',
        rationale: 'The value of an assist includes the cost of parts, tools, etc., and the cost of transporting them to the producers.',
        reference_cue: '19 CFR 152.102',
        difficulty: 4,
        domain_index: 2,
    },
    {
        stem: 'Which form is used for a "Notice of Action" regarding the proposed increase in duties?',
        option_a: 'CBP Form 3461',
        option_b: 'CBP Form 7501',
        option_c: 'CBP Form 28',
        option_d: 'CBP Form 29',
        option_e: 'CBP Form 4647',
        correct_answer: 'D',
        rationale: 'CBP Form 28 is a Request for Information; CBP Form 29 is a Notice of Action.',
        reference_cue: '19 CFR 152.2',
        difficulty: 2,
        domain_index: 0,
    },
    {
        stem: 'Which GRI covers "Specific heading" versus "General description"?',
        option_a: 'GRI 1',
        option_b: 'GRI 2(a)',
        option_c: 'GRI 3(a)',
        option_d: 'GRI 3(b)',
        option_e: 'GRI 5',
        correct_answer: 'C',
        rationale: 'GRI 3(a) states that the heading which provides the most specific description shall be preferred to headings providing a more general description.',
        reference_cue: 'GRI 3(a)',
        difficulty: 3,
        domain_index: 1,
    },
    {
        stem: 'A broker who changes their business address must notify CBP within ___ days.',
        option_a: '5',
        option_b: '10',
        option_c: '15',
        option_d: '30',
        option_e: '60',
        correct_answer: 'B',
        rationale: '19 CFR 111.30(a) requires notification of address change within 10 days.',
        reference_cue: '19 CFR 111.30',
        difficulty: 2,
        domain_index: 4,
    }
];

const flashcards = [
    {
        front: 'GRI 1',
        back: 'Classification is determined by the terms of the headings and relative section or chapter notes.',
        reference_cue: 'General Rule of Interpretation 1',
        domain_index: 1,
    },
    {
        front: 'Customs Broker Record Retention Period',
        back: '5 years from the date of entry.',
        reference_cue: '19 CFR 111.23',
        domain_index: 4,
    },
    {
        front: 'Transactional Value (Primary Appraisement)',
        back: 'Price actually paid or payable for the merchandise when sold for exportation to the United States.',
        reference_cue: '19 CFR 152.103',
        domain_index: 2,
    },
    {
        front: 'Timeframe for filing Entry Summary (7501)',
        back: '10 working days after the time of entry release.',
        reference_cue: '19 CFR 142.12',
        domain_index: 0,
    }
];

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

        // Seed Questions
        console.log('❓ Seeding questions...');
        for (const q of questions) {
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

        // Seed Flashcards
        console.log('🃏 Seeding flashcards...');
        for (const f of flashcards) {
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
