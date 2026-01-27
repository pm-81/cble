-- Seed Domains
INSERT INTO public.domains (name, color, icon, sort_order)
VALUES 
    ('Entry / Entry Summary / Release', 'hsl(173, 80%, 40%)', '📋', 0),
    ('Classification (HTSUS / GRIs / Notes)', 'hsl(262, 80%, 50%)', '📚', 1),
    ('Valuation (19 CFR 152)', 'hsl(25, 95%, 53%)', '💰', 2),
    ('Trade Programs / Origin', 'hsl(142, 76%, 36%)', '🌍', 3),
    ('Broker Duties / POA / Records / Bonds', 'hsl(199, 89%, 48%)', '📝', 4),
    ('Marking / COO (19 CFR 134)', 'hsl(340, 75%, 55%)', '🏷️', 5),
    ('Protests / Liquidation', 'hsl(45, 93%, 47%)', '⚖️', 6),
    ('Other (FTZ / Drawback / In-bond / AD/CVD / PGA)', 'hsl(215, 16%, 47%)', '🔧', 7)
ON CONFLICT (name) DO NOTHING;

-- Seed Questions
-- Get domain IDs locally in the script or use subqueries. Using subqueries for portability.

INSERT INTO public.questions (domain_id, stem, option_a, option_b, option_c, option_d, option_e, correct_answer, rationale, reference_cue, difficulty)
SELECT 
    id, 
    'Under 19 CFR 142.3, which of the following is NOT required to be filed as part of the entry documentation?',
    'CBP Form 3461',
    'Evidence of right to make entry',
    'Commercial invoice',
    'Packing list',
    'CBP Form 7501',
    'E',
    'Entry documentation (for release) typically includes 3461, evidence of right to make entry, and invoice. CBP Form 7501 is the Entry Summary, usually filed later.',
    '19 CFR 142.3',
    2
FROM public.domains WHERE name = 'Entry / Entry Summary / Release'
LIMIT 1;

INSERT INTO public.questions (domain_id, stem, option_a, option_b, option_c, option_d, option_e, correct_answer, rationale, reference_cue, difficulty)
SELECT 
    id, 
    'When a formal entry is required, an entry summary must be filed and estimated duties deposited within ___ working days of the time of entry.',
    '5',
    '10',
    '15',
    '30',
    '45',
    'B',
    '19 CFR 142.12 states the entry summary shall be filed within 10 working days after the time of entry.',
    '19 CFR 142.12',
    2
FROM public.domains WHERE name = 'Entry / Entry Summary / Release'
LIMIT 1;

INSERT INTO public.questions (domain_id, stem, option_a, option_b, option_c, option_d, option_e, correct_answer, rationale, reference_cue, difficulty)
SELECT 
    id, 
    'Which GRI is used to classify goods that are prima facie classifiable under two or more headings?',
    'GRI 1',
    'GRI 2',
    'GRI 3',
    'GRI 4',
    'GRI 5',
    'C',
    'GRI 3 provides rules for classification when goods consist of more than one material or are classifiable under multiple headings (Relative specificity, Essential character, Last in numerical order).',
    'GRI 3',
    3
FROM public.domains WHERE name = 'Classification (HTSUS / GRIs / Notes)'
LIMIT 1;

INSERT INTO public.questions (domain_id, stem, option_a, option_b, option_c, option_d, option_e, correct_answer, rationale, reference_cue, difficulty)
SELECT 
    id, 
    'HTSUS Chapter 98 contains provisions for which of the following?',
    'Articles exported and returned',
    'Personal exemptions',
    'Government importations',
    'Samples for soliciting orders',
    'All of the above',
    'E',
    'Chapter 98 of the HTSUS covers special classification provisions for articles returned to the US, personal effects, and specific duty-free treatment cases.',
    'HTSUS Chapter 98',
    3
FROM public.domains WHERE name = 'Classification (HTSUS / GRIs / Notes)'
LIMIT 1;

INSERT INTO public.questions (domain_id, stem, option_a, option_b, option_c, option_d, option_e, correct_answer, rationale, reference_cue, difficulty)
SELECT 
    id, 
    'Which valuation method is the primary method of appraisement for imported merchandise?',
    'Transaction Value',
    'Transaction Value of Identical Merchandise',
    'Transaction Value of Similar Merchandise',
    'Deductive Value',
    'Computed Value',
    'A',
    'Under 19 CFR 152.101, Transaction Value is the primary method of appraisement.',
    '19 CFR 152.101',
    2
FROM public.domains WHERE name = 'Valuation (19 CFR 152)'
LIMIT 1;

INSERT INTO public.questions (domain_id, stem, option_a, option_b, option_c, option_d, option_e, correct_answer, rationale, reference_cue, difficulty)
SELECT 
    id, 
    'In a transaction value appraisement, "assists" provided by the buyer must be added to the price. Which of the following is an assist?',
    'Management and accounting services performed in the US',
    'Materials, components, and parts incorporated in the imported merchandise',
    'Public domain artwork',
    'Freight from the factory to the port of exportation',
    'Selling commissions paid to the buyer''s agent',
    'B',
    'Assists include materials, tools, dies, molds, and engineering/artwork performed outside the US.',
    '19 CFR 152.102(a)',
    4
FROM public.domains WHERE name = 'Valuation (19 CFR 152)'
LIMIT 1;

INSERT INTO public.questions (domain_id, stem, option_a, option_b, option_c, option_d, option_e, correct_answer, rationale, reference_cue, difficulty)
SELECT 
    id, 
    'How long must a customhouse broker maintain records of their customs transactions?',
    '2 years',
    '3 years',
    '5 years',
    '7 years',
    '10 years',
    'C',
    '19 CFR 111.23(a) states that records must be retained for at least 5 years after the date of entry.',
    '19 CFR 111.23',
    3
FROM public.domains WHERE name = 'Broker Duties / POA / Records / Bonds'
LIMIT 1;

INSERT INTO public.questions (domain_id, stem, option_a, option_b, option_c, option_d, option_e, correct_answer, rationale, reference_cue, difficulty)
SELECT 
    id, 
    'A broker must exercise ___ in the conduct of customs business.',
    'Due diligence',
    'Extreme caution',
    'Strict liability',
    'Absolute authority',
    'Reasonable care',
    'A',
    '19 CFR 111.29 requires brokers to exercise due diligence in making financial settlements, answering correspondence, and preparing documents.',
    '19 CFR 111.29',
    2
FROM public.domains WHERE name = 'Broker Duties / POA / Records / Bonds'
LIMIT 1;

INSERT INTO public.questions (domain_id, stem, option_a, option_b, option_c, option_d, option_e, correct_answer, rationale, reference_cue, difficulty)
SELECT 
    id, 
    'Under the USMCA, the importer must possess a valid certificate of origin at the time of ___ if they are claiming preferential tariff treatment.',
    'Export from Mexico/Canada',
    'Arrival in the US',
    'Entry summary filing',
    'Liquidation',
    '90 days after entry',
    'C',
    'The importer must have the certificate in their possession when the claim for preference is made at the time of entry summary.',
    '19 CFR 182.12',
    3
FROM public.domains WHERE name = 'Trade Programs / Origin'
LIMIT 1;

INSERT INTO public.questions (domain_id, stem, option_a, option_b, option_c, option_d, option_e, correct_answer, rationale, reference_cue, difficulty)
SELECT 
    id, 
    'Which of the following describes the general rule for marking articles of foreign origin?',
    'Every article must be marked with the country of origin in English.',
    'Only the outermost container must be marked.',
    'Articles from Canada/Mexico are exempt from marking.',
    'Marking is only required if the duty rate is above 10%.',
    'Marking must be in the language of the country of origin.',
    'A',
    '19 CFR 134.11 requires every article of foreign origin to be marked in a conspicuous place as legibly, indelibly, and permanently as the nature of the article will permit, in English.',
    '19 CFR 134.11',
    2
FROM public.domains WHERE name = 'Marking / COO (19 CFR 134)'
LIMIT 1;

INSERT INTO public.questions (domain_id, stem, option_a, option_b, option_c, option_d, option_e, correct_answer, rationale, reference_cue, difficulty)
SELECT 
    id, 
    'How many days does an importer have to file a protest after the date of liquidation?',
    '90 days',
    '120 days',
    '180 days',
    '365 days',
    '2 years',
    'C',
    '19 CFR 174.12(e) states that a protest must be filed within 180 days of liquidation.',
    '19 CFR 174.12',
    2
FROM public.domains WHERE name = 'Protests / Liquidation'
LIMIT 1;

INSERT INTO public.questions (domain_id, stem, option_a, option_b, option_c, option_d, option_e, correct_answer, rationale, reference_cue, difficulty)
SELECT 
    id, 
    'Merchandise in a Foreign Trade Zone (FTZ) is considered to be ___ for customs purposes.',
    'Entered for consumption',
    'Outside the customs territory of the United States',
    'Subject to immediate liquidation',
    'Exempt from all PGA requirements',
    'In-bond to the next port',
    'B',
    'FTZs are areas in or near CBP ports of entry, but legally considered outside the customs territory of the US.',
    '19 CFR 146.1',
    3
FROM public.domains WHERE name = 'Other (FTZ / Drawback / In-bond / AD/CVD / PGA)'
LIMIT 1;

-- Seed Flashcards
INSERT INTO public.flashcards (domain_id, front, back, reference_cue)
SELECT 
    id, 
    'GRI 1',
    'Classification is determined by the terms of the headings and relative section or chapter notes.',
    'General Rule of Interpretation 1'
FROM public.domains WHERE name = 'Classification (HTSUS / GRIs / Notes)'
LIMIT 1;

INSERT INTO public.flashcards (domain_id, front, back, reference_cue)
SELECT 
    id, 
    'Customs Broker Record Retention Period',
    '5 years from the date of entry.',
    '19 CFR 111.23'
FROM public.domains WHERE name = 'Broker Duties / POA / Records / Bonds'
LIMIT 1;

INSERT INTO public.flashcards (domain_id, front, back, reference_cue)
SELECT 
    id, 
    'Transactional Value (Primary Appraisement)',
    'Price actually paid or payable for the merchandise when sold for exportation to the United States.',
    '19 CFR 152.103'
FROM public.domains WHERE name = 'Valuation (19 CFR 152)'
LIMIT 1;

INSERT INTO public.flashcards (domain_id, front, back, reference_cue)
SELECT 
    id, 
    'Timeframe for filing Entry Summary (7501)',
    '10 working days after the time of entry release.',
    '19 CFR 142.12'
FROM public.domains WHERE name = 'Entry / Entry Summary / Release'
LIMIT 1;
